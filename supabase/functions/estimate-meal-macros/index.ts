// Estimate Meal Macros Edge Function
// Turns a free-text meal description ("Dal, rice & curd") into an approximate
// calorie/macro breakdown, so she isn't forced to already know the numbers
// before logging a meal. Manual entry stays available — this only fills in a
// starting estimate she can edit before saving.
//
// Backed by a shared cache (see meal_macro_cache migration) so repeat/scaled
// requests for the same food skip the AI call entirely:
//   - "1 plate dal" -> AI call, cached as per-100g macros for "dal"
//   - "2 plate dal" or "1 katori dal" -> same cache row, scaled by grams, no AI
//   - "1 piece gulab jamun" -> AI call, cached per-piece (no gram equivalent
//     for "piece" — too food-dependent to convert across units)
//   - "3 piece gulab jamun" -> same cache row, scaled by count, no AI

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EstimateRequest {
    description: string;
}

interface MacroEstimate {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sugarG: number;
    /** 0-100 glucose=100 scale, null if the meal has negligible carbohydrate. */
    glycemicIndex: number | null;
    confidence: "low" | "medium" | "high";
    source: "cache" | "ai";
}

// meal_macro_cache.gi didn't exist before this migration — a row written
// earlier has gi=NULL not because the food is genuinely GI-negligible, but
// because the column didn't exist yet to record it. Only trust a NULL gi
// from a row written on/after this date; older rows must fall through to a
// fresh AI call so GI actually gets backfilled instead of reading as
// permanently unknown. See 20260824000000_add_meal_glycemic_index.sql.
const GI_COLUMN_ADDED_AT = Date.parse("2026-08-24T00:00:00Z");

function cachedGiIsTrustworthy(cached: { gi: number | null; updated_at: string }): boolean {
    return cached.gi !== null || Date.parse(cached.updated_at) >= GI_COLUMN_ADDED_AT;
}

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const BOUNDS = {
    calories: { min: 0, max: 3000 },
    proteinG: { min: 0, max: 300 },
    carbsG: { min: 0, max: 400 },
    fatG: { min: 0, max: 250 },
    sugarG: { min: 0, max: 400 },
    glycemicIndex: { min: 0, max: 100 },
};

const PER_100G_UNIT = "__per_100g__";
const NO_UNIT = "__none__";

// Standard Indian-kitchen approximations — good enough for a starting
// estimate she can still edit, not a lab measurement.
const UNIT_GRAMS: Record<string, number> = {
    katori: 150, katoris: 150,
    bowl: 200, bowls: 200,
    plate: 300, plates: 300,
    cup: 200, cups: 200,
    glass: 250, glasses: 250,
    tbsp: 15, tablespoon: 15, tablespoons: 15,
    tsp: 5, teaspoon: 5, teaspoons: 5,
    scoop: 30, scoops: 30,
    g: 1, gm: 1, gms: 1, gram: 1, grams: 1,
    kg: 1000, kgs: 1000, kilogram: 1000, kilograms: 1000,
    ml: 1, l: 1000, litre: 1000, liter: 1000, litres: 1000, liters: 1000,
};

const UNIT_WORDS = Object.keys(UNIT_GRAMS).concat([
    "piece", "pieces", "slice", "slices", "serving", "servings",
]);

interface ParsedMeal {
    quantity: number;
    unit: string | null; // normalized unit word, or null if none found
    foodName: string;
}

function parseQuantityUnitFood(description: string): ParsedMeal {
    const unitAlternation = UNIT_WORDS.join("|");
    const re = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${unitAlternation})?\\s*(?:of\\s+)?(.+)$`, "i");
    const match = description.trim().match(re);

    if (match) {
        const quantity = parseFloat(match[1]);
        const unit = match[2] ? match[2].toLowerCase() : null;
        const foodName = match[3].trim();
        if (foodName) return { quantity: quantity || 1, unit, foodName };
    }

    return { quantity: 1, unit: null, foodName: description.trim() };
}

function normalizeFoodKey(foodName: string): string {
    return foodName.toLowerCase().trim().replace(/\s+/g, " ");
}

function clamp(value: unknown, bounds: { min: number; max: number }): number | null {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.min(bounds.max, Math.max(bounds.min, n));
}

function buildPrompt(description: string): string {
    return `You are a nutrition estimator for an Indian meal-logging app. A user typed this free-text description of what they ate:

"${description}"

Estimate the total calories and macros for this meal/quantity as described (assume typical Indian home-cooking serving sizes unless the text specifies amounts). If the text lists multiple items (e.g. "dal, rice & curd"), sum across all of them.

Also estimate the meal's overall glycemic index (GI) on the standard glucose=100 scale, the way published international GI tables report it for a mixed dish — weighted toward whichever component contributes most of the available carbohydrate. Use null for glycemicIndex if the meal has negligible carbohydrate (e.g. plain meat, eggs, cheese, oil, or a plain vegetable/salad).

Also estimate total sugar in grams (sugarG) — naturally occurring plus added sugar, a subset of carbsG (so sugarG should never exceed carbsG). Use 0 if the meal has no meaningful sugar content.

Respond with ONLY valid JSON in this exact shape, no other text:
{
  "calories": <integer kcal>,
  "proteinG": <integer grams>,
  "carbsG": <integer grams>,
  "fatG": <integer grams>,
  "sugarG": <integer grams>,
  "glycemicIndex": <integer 0-100> | null,
  "confidence": "low" | "medium" | "high"
}

Use "low" confidence if the description is vague or you're guessing portion size, "high" if it's a specific, common, well-known dish or an item with a label-level known composition.`;
}

async function callGemini(description: string, apiKey: string): Promise<MacroEstimate | { error: string; status: number }> {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(description) }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
    });

    if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error(`Gemini API Error (${geminiRes.status}): ${errText}`);
        return { error: "Estimation failed", status: 502 };
    }

    const geminiData = await geminiRes.json();
    const rawText: string | undefined = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return { error: "Empty estimate", status: 502 };

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        return { error: "Malformed estimate", status: 502 };
    }

    const calories = clamp(parsed.calories, BOUNDS.calories);
    const proteinG = clamp(parsed.proteinG, BOUNDS.proteinG);
    const carbsG = clamp(parsed.carbsG, BOUNDS.carbsG);
    const fatG = clamp(parsed.fatG, BOUNDS.fatG);
    let sugarG = clamp(parsed.sugarG, BOUNDS.sugarG);
    if (calories === null || proteinG === null || carbsG === null || fatG === null || sugarG === null) {
        return { error: "Incomplete estimate", status: 502 };
    }
    // sugarG is a subset of carbsG by definition — clamp down rather than
    // trust a model slip that puts it slightly over.
    if (sugarG > carbsG) sugarG = carbsG;
    // Unlike the macros above, null is a valid answer here (negligible-carb
    // meal) rather than a failed estimate — only clamp when a number came back.
    const glycemicIndex = parsed.glycemicIndex === null || parsed.glycemicIndex === undefined
        ? null
        : clamp(parsed.glycemicIndex, BOUNDS.glycemicIndex);

    const confidence: MacroEstimate["confidence"] =
        parsed.confidence === "high" || parsed.confidence === "medium" ? parsed.confidence : "low";

    return { calories, proteinG, carbsG, fatG, sugarG, glycemicIndex, confidence, source: "ai" };
}

function roundEstimate(e: Omit<MacroEstimate, "source">, source: MacroEstimate["source"]): MacroEstimate {
    return {
        calories: Math.round(e.calories),
        proteinG: Math.round(e.proteinG),
        carbsG: Math.round(e.carbsG),
        fatG: Math.round(e.fatG),
        sugarG: Math.round(e.sugarG),
        glycemicIndex: e.glycemicIndex === null ? null : Math.round(e.glycemicIndex),
        confidence: e.confidence,
        source,
    };
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        const body: EstimateRequest = await req.json();
        const description = (body.description ?? "").trim();

        if (!description) {
            return new Response(JSON.stringify({ error: "Missing meal description" }), {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }
        if (description.length > 300) {
            return new Response(JSON.stringify({ error: "Description too long" }), {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { quantity, unit, foodName } = parseQuantityUnitFood(description);
        const foodKey = normalizeFoodKey(foodName);
        const gramsPerUnit = unit ? UNIT_GRAMS[unit] : undefined;

        // --- Gram-convertible tier: scale off a per-100g cache row ---
        if (gramsPerUnit) {
            const totalGrams = quantity * gramsPerUnit;

            const { data: cached } = await supabase
                .from("meal_macro_cache")
                .select("calories, protein_g, carbs_g, fat_g, sugar_g, gi, confidence, updated_at")
                .eq("food_key", foodKey)
                .eq("unit", PER_100G_UNIT)
                .maybeSingle();

            // sugar_g is a required field going forward (never legitimately
            // null, unlike gi) — a null here means this row predates the
            // sugar column, same staleness problem cachedGiIsTrustworthy
            // solves for gi. Either miss forces a fresh AI call below.
            if (cached && cached.sugar_g !== null && cachedGiIsTrustworthy(cached)) {
                const scale = totalGrams / 100;
                const estimate = roundEstimate(
                    {
                        calories: cached.calories * scale,
                        proteinG: cached.protein_g * scale,
                        carbsG: cached.carbs_g * scale,
                        fatG: cached.fat_g * scale,
                        sugarG: cached.sugar_g * scale,
                        // GI is intrinsic to the food, not the portion — read back
                        // unscaled, unlike the fields above.
                        glycemicIndex: cached.gi === null ? null : cached.gi,
                        confidence: cached.confidence as MacroEstimate["confidence"],
                    },
                    "cache"
                );
                return new Response(JSON.stringify(estimate), {
                    status: 200,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" },
                });
            }

            const apiKey = Deno.env.get("GEMINI_API_KEY");
            if (!apiKey) {
                return new Response(JSON.stringify({ error: "Estimator not configured" }), {
                    status: 500,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                });
            }

            const result = await callGemini(description, apiKey);
            if ("error" in result) {
                return new Response(JSON.stringify({ error: result.error }), {
                    status: result.status,
                    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
                });
            }

            const per100 = {
                calories: (result.calories / totalGrams) * 100,
                protein_g: (result.proteinG / totalGrams) * 100,
                carbs_g: (result.carbsG / totalGrams) * 100,
                fat_g: (result.fatG / totalGrams) * 100,
                sugar_g: (result.sugarG / totalGrams) * 100,
                // Not divided by grams — GI doesn't scale with portion size.
                gi: result.glycemicIndex,
            };
            await supabase.from("meal_macro_cache").upsert(
                {
                    food_key: foodKey,
                    unit: PER_100G_UNIT,
                    ...per100,
                    confidence: result.confidence,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "food_key,unit" }
            );

            return new Response(JSON.stringify(roundEstimate(result, "ai")), {
                status: 200,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" },
            });
        }

        // --- Freeform tier: scale off a per-single-unit cache row (same unit only) ---
        const unitToken = unit ?? NO_UNIT;

        const { data: cached } = await supabase
            .from("meal_macro_cache")
            .select("calories, protein_g, carbs_g, fat_g, sugar_g, gi, confidence, updated_at")
            .eq("food_key", foodKey)
            .eq("unit", unitToken)
            .maybeSingle();

        if (cached && cached.sugar_g !== null && cachedGiIsTrustworthy(cached)) {
            const estimate = roundEstimate(
                {
                    calories: cached.calories * quantity,
                    proteinG: cached.protein_g * quantity,
                    carbsG: cached.carbs_g * quantity,
                    fatG: cached.fat_g * quantity,
                    sugarG: cached.sugar_g * quantity,
                    // GI is intrinsic to the food, not the portion — read back
                    // unscaled, unlike the fields above.
                    glycemicIndex: cached.gi === null ? null : cached.gi,
                    confidence: cached.confidence as MacroEstimate["confidence"],
                },
                "cache"
            );
            return new Response(JSON.stringify(estimate), {
                status: 200,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" },
            });
        }

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Estimator not configured" }), {
                status: 500,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const result = await callGemini(description, apiKey);
        if ("error" in result) {
            return new Response(JSON.stringify({ error: result.error }), {
                status: result.status,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            });
        }

        const perUnit = {
            calories: result.calories / quantity,
            protein_g: result.proteinG / quantity,
            carbs_g: result.carbsG / quantity,
            fat_g: result.fatG / quantity,
            sugar_g: result.sugarG / quantity,
            // Not divided by quantity — GI doesn't scale with portion size.
            gi: result.glycemicIndex,
        };
        await supabase.from("meal_macro_cache").upsert(
            {
                food_key: foodKey,
                unit: unitToken,
                ...perUnit,
                confidence: result.confidence,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "food_key,unit" }
        );

        return new Response(JSON.stringify(roundEstimate(result, "ai")), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("Error in estimate-meal-macros:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }
});
