/**
 * Per-goal supplementary content for the Plan screen's "Focus For You" section.
 * Goal ids match GOALS in mobile/src/components/onboarding/StepGoals.tsx and
 * mobile/src/components/profile/FocusGoals.tsx. "syncing"/"tracking" are
 * intentionally omitted — they describe the app's default behavior, not
 * anything extra to surface.
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
        body: "Pairing your cycle phase with a weight target helps pace expectations — energy and appetite naturally shift phase to phase. Set or update yours from your Plan setup.",
        icon: 'trending-down',
    },
    pcos: {
        title: 'PCOS Guidance',
        body: 'Irregular cycles are common with PCOS. Consistent logging helps us tailor nutrition and movement guidance to what your body actually needs.',
        icon: 'heart',
    },
    other: {
        title: 'General Wellness',
        body: "Small, steady habits — hydration, sleep, movement — compound more than any single big change. We'll keep surfacing the ones that fit your current phase.",
        icon: 'sun',
    },
    learn_body: {
        title: 'Learn My Body',
        body: 'Want the deeper science behind what you\'re feeling this phase? The Learn tab has bite-sized reads on hormones, symptoms, and cycle patterns.',
        icon: 'book-open',
        cta: { label: 'Explore Learn', target: 'learn' },
    },
};
