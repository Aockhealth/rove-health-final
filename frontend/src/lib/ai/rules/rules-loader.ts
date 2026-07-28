import nutritionRulesFile from "./nutrition-rules.json";
import exerciseRulesFile from "./exercise-rules.json";
import type {
    ExerciseRuleContext,
    NutritionRuleContext,
    RuleEntry,
    RuleEquipmentBucket,
    RulesFile,
} from "./types";

const NUTRITION_RULES: RuleEntry[] = (nutritionRulesFile as RulesFile).rules;
const EXERCISE_RULES: RuleEntry[] = (exerciseRulesFile as RulesFile).rules;

function normalizePhase(phase: string | undefined): string {
    return (phase || "").toLowerCase();
}

export function normalizeEquipment(equipment: string | undefined): RuleEquipmentBucket {
    return (equipment || "").toLowerCase().includes("bodyweight") ? "bodyweight" : "gym";
}

// A rule matches if every non-empty appliesTo array either is absent/empty (wildcard)
// or contains the current context value (case-insensitive).
function matchesList(list: string[] | undefined, value: string | undefined): boolean {
    if (!list || list.length === 0) return true;
    if (!value) return false;
    const normalized = value.toLowerCase();
    return list.some((entry) => entry.toLowerCase() === normalized);
}

export function getNutritionRules(ctx: NutritionRuleContext): RuleEntry[] {
    const mealType = (ctx.mealType || "").toLowerCase();
    const phase = normalizePhase(ctx.phase);

    return NUTRITION_RULES.filter((rule) => {
        const applies = rule.appliesTo;
        if (!matchesList(applies.mealTypes, mealType)) return false;
        if (!matchesList(applies.phases, phase)) return false;
        if (applies.metabolicFlag && !ctx.hasMetabolicFlag) return false;
        // Rules that are documentation-only cross-references to existing hard-coded
        // checks (marked with _enforcement in the JSON) are never injected into the
        // prompt or checked here — they exist for engineers reading the file, not
        // for the model or the quality gate.
        if ((rule as unknown as { _enforcement?: string })._enforcement) return false;
        return true;
    });
}

export function getExerciseRules(ctx: ExerciseRuleContext): RuleEntry[] {
    const phase = normalizePhase(ctx.phase);
    const equipmentBucket = normalizeEquipment(ctx.equipment);
    const hasLimitations = !!(ctx.limitations && ctx.limitations.trim().length > 0);

    return EXERCISE_RULES.filter((rule) => {
        const applies = rule.appliesTo;
        if ((rule as unknown as { _enforcement?: string })._enforcement) return false;
        if (!matchesList(applies.exercisePhases, phase)) return false;
        if (!matchesList(applies.equipment, equipmentBucket)) return false;
        // injury-avoidance-swap only makes sense (and only gets checked) when the
        // user actually reported a limitation.
        if (rule.id === "injury-avoidance-swap" && !hasLimitations) return false;
        return true;
    });
}

export function formatRulesForPrompt(rules: RuleEntry[]): string {
    if (rules.length === 0) return "";
    return rules
        .map((rule) => {
            if (rule.severity === "soft" && rule.rationale) {
                return `- ${rule.statement} (why: ${rule.rationale})`;
            }
            return `- ${rule.statement}`;
        })
        .join("\n");
}

// injury phrase -> movement keywords that would load the injured area. Shared by
// the prompt-text formatter (implicitly, via the rule's static statement) and the
// quality-gate detection check (explicitly, via this lookup).
const INJURY_MOVEMENT_MAP: Array<{ injuryTerms: string[]; bannedMovementTerms: string[] }> = [
    { injuryTerms: ["knee"], bannedMovementTerms: ["lunge", "squat", "jump"] },
    { injuryTerms: ["back", "spine"], bannedMovementTerms: ["deadlift", "good morning", "overhead press"] },
    { injuryTerms: ["shoulder"], bannedMovementTerms: ["overhead press", "pull-up", "pullup"] },
    { injuryTerms: ["wrist"], bannedMovementTerms: ["push-up", "pushup", "plank"] },
    { injuryTerms: ["ankle"], bannedMovementTerms: ["jump", "sprint", "lunge"] },
];

export function getInjuryContraindicationTerms(limitations: string | undefined): string[] {
    const text = (limitations || "").toLowerCase();
    if (!text.trim()) return [];

    const terms = new Set<string>();
    for (const entry of INJURY_MOVEMENT_MAP) {
        if (entry.injuryTerms.some((term) => text.includes(term))) {
            entry.bannedMovementTerms.forEach((term) => terms.add(term));
        }
    }
    return Array.from(terms);
}
