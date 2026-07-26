export type RuleMealType = "snack" | "smoothie" | "salad";
export type RulePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";
export type RuleEquipmentBucket = "bodyweight" | "gym";

export interface NutritionAppliesTo {
    mealTypes?: RuleMealType[];
    phases?: RulePhase[];
    cuisines?: string[];
    metabolicFlag?: boolean;
}

export interface ExerciseAppliesTo {
    exercisePhases?: RulePhase[];
    energyLevels?: ("Low" | "Medium" | "High")[];
    equipment?: RuleEquipmentBucket[];
    goals?: string[];
}

export interface RuleDetection {
    kind: "banned_pair_in_field" | "banned_keyword_in_field";
    // nutrition options use "key_ingredients"; exercise main_set items use "name".
    field: "key_ingredients" | "name";
    // nutrition only — which of the 4 chef options to check.
    scope?: "any_option" | "protein_category_options";
    termsA?: string[];
    termsB?: string[];
    terms?: string[];
    failReason: string;
}

export interface RuleEntry {
    id: string;
    domain: "nutrition" | "exercise";
    appliesTo: NutritionAppliesTo & ExerciseAppliesTo;
    ruleType:
        | "avoid_combination"
        | "prefer_combination"
        | "nutrient_tradeoff"
        | "contraindication"
        | "equipment_mismatch"
        | "programming_constraint";
    statement: string;
    rationale?: string;
    severity: "hard" | "soft";
    detection?: RuleDetection;
}

export interface RulesFile {
    rules: RuleEntry[];
}

export interface NutritionRuleContext {
    mealType: string;
    phase: string;
    cuisine?: string;
    hasMetabolicFlag?: boolean;
}

export interface ExerciseRuleContext {
    phase: string;
    energyLevel?: string;
    equipment?: string;
    goalFocus?: string;
    limitations?: string;
}
