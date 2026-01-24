"use server";

import { openai, OPENAI_MODEL } from "@/lib/ai/openai";

export interface GeneratedPlate {
    description: string;
    protein: { item: string; why: string };
    carb: { item: string; why: string };
    fat: { item: string; why: string };
    vegetable: { item: string; why: string };
    spice: { item: string; benefit: string };
}

export async function generatePlateAction(
    phase: string,
    meal: string,
    cuisine: string,
    region: string
): Promise<GeneratedPlate | null> {
    try {
        const prompt = `
        Act as an expert clinical nutritionist and chef specializing in authentic ${cuisine} (${region}) cuisine.
        Generate a single perfect ${meal} meal that is strictly aligned with the ${phase} phase of the menstrual cycle.

        Context:
        - Cuisine: ${cuisine} (Region: ${region})
        - Meal Type: ${meal}
        - Cycle Phase: ${phase}
        
        Phase Rules:
        - Menstrual: Focus on warm, iron-rich, comfort foods. Avoid raw/cold.
        - Follicular: Focus on fresh, fermented, sprouted, high protein.
        - Ovulatory: Focus on cooling, lighter foods, fiber.
        - Luteal: Focus on complex carbs, magnesium-rich, grounding foods.

        Output Requirements:
        - Return ONLY valid JSON.
        - Structure:
        {
            "description": "A 1-sentence appetizing description of the dish.",
            "protein": { "item": "Name of protein component", "why": "Why specifically for ${phase}" },
            "carb": { "item": "Name of carb component", "why": "Why specifically for ${phase}" },
            "fat": { "item": "Name of fat component", "why": "Why specifically for ${phase}" },
            "vegetable": { "item": "Name of veg component", "why": "Why specifically for ${phase}" },
            "spice": { "item": "Name of key spice/herb", "benefit": "Specific health benefit" }
        }
        `;

        const response = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are a helpful nutrition AI. Output only JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }, // Enforce JSON mode
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;

        if (!content) throw new Error("No content returned from OpenAI");

        return JSON.parse(content) as GeneratedPlate;

    } catch (error) {
        console.error("OpenAI Plate Generation Error:", error);

        // Fallback Mock Data if AI fails
        return {
            description: `A delicious ${cuisine} ${meal} optimized for your ${phase} phase (AI Offline - Simulated Mode).`,
            protein: { item: cuisine === "Indian" ? "Sprouted Moong Dal" : "Grilled Chicken", why: "High digestibility for Follicular phase." },
            carb: { item: cuisine === "Indian" ? "Red Rice Poha" : "Quinoa", why: "Complex carbs for sustained energy." },
            fat: { item: cuisine === "Indian" ? "Ghee & Coconut" : "Avocado", why: "Healthy hormone production." },
            vegetable: { item: cuisine === "Indian" ? "Sautéed Spinach" : "Asparagus", why: "Iron rich for replenishment." },
            spice: { item: "Turmeric", benefit: "Anti-inflammatory support." }
        };
    }
}
