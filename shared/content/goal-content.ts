/**
 * Per-goal supplementary content for the Plan screen's "Focus For You" section.
 *
 * Goal ids must match GOALS in mobile/src/components/onboarding/StepGoals.tsx
 * and mobile/src/components/profile/FocusGoals.tsx exactly — those are the
 * only three ids `goals` can ever contain ('syncing', 'tracking',
 * 'weight_loss'). This file used to also define 'pcos' / 'other' /
 * 'learn_body', none of which exist as a selectable goal anywhere, so those
 * entries could never render; removed rather than left as dead content.
 *
 * 'syncing' and 'tracking' still have no entry here — they describe the
 * app's default behavior, not anything extra to surface.
 */

export type GoalContentCta = {
    label: string;
    /** Only 'learn' has a real destination (the Learn tab) today. Weight goal
     * creation isn't a standalone flow anywhere in the app yet — it only
     * happens via first-time Plan setup — so that goal stays CTA-less rather
     * than linking to something that doesn't exist. */
    target: 'learn';
};

export type GoalContentEntry = {
    title: string;
    body: string;
    icon: string; // Feather icon name, matches SectionHeader's icon prop
    cta?: GoalContentCta;
};

export const GOAL_CONTENT: Record<string, GoalContentEntry> = {
    weight_loss: {
        title: 'Weight Goal',
        // Names what actually happens once she sets it up, rather than the
        // vaguer "pace expectations" this used to say — Nourish really does
        // recompute her calorie and macro targets from cycle phase, activity
        // level and this goal (see mobile/src/lib/calorieCalculator.ts).
        body: "Once you set a target weight in Plan setup, your Nourish tab's calorie and macro numbers adjust to it automatically — recalculated for your cycle phase and activity level, not one fixed number all month.",
        icon: 'trending-down',
    },
};
