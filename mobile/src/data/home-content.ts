/**
 * Mirrors the inline phaseThemes / PHASE_SNAPSHOTS / PHASE_KEYWORDS / PHASE_EXPLAINERS
 * constants in frontend/src/app/cycle-sync/page.tsx. Kept as a local copy (not moved to
 * shared/) because the web version isn't exported/reusable there either — this is
 * screen-local presentation data, not shared business logic.
 */

export type PhaseThemeTokens = {
  color: string;
  iconColor: string;
  iconBg: string;
  badgeBorder: string;
  ringFrom: string;
  ringTo: string;
};

export const phaseThemes: Record<string, PhaseThemeTokens> = {
  Menstrual: {
    color: '#AF6B6B',
    iconColor: '#AF6B6B',
    iconBg: 'rgba(175,107,107,0.1)',
    badgeBorder: 'rgba(175,107,107,0.3)',
    ringFrom: 'rgba(175,107,107,0.6)',
    ringTo: 'rgba(175,107,107,0.2)',
  },
  Follicular: {
    color: '#8DAA9D',
    iconColor: '#8DAA9D',
    iconBg: 'rgba(141,170,157,0.2)',
    badgeBorder: 'rgba(141,170,157,0.3)',
    ringFrom: 'rgba(141,170,157,0.6)',
    ringTo: 'rgba(141,170,157,0.3)',
  },
  Ovulatory: {
    color: '#D4A25F',
    iconColor: '#D4A25F',
    iconBg: 'rgba(212,162,95,0.2)',
    badgeBorder: 'rgba(212,162,95,0.3)',
    ringFrom: 'rgba(212,162,95,0.6)',
    ringTo: 'rgba(212,162,95,0.3)',
  },
  Luteal: {
    color: '#7B82A8',
    iconColor: '#7B82A8',
    iconBg: 'rgba(123,130,168,0.2)',
    badgeBorder: 'rgba(123,130,168,0.3)',
    ringFrom: 'rgba(123,130,168,0.6)',
    ringTo: 'rgba(123,130,168,0.4)',
  },
};

export const PHASE_KEYWORDS: Record<string, string> = {
  Menstrual: 'Winter • Rest & Reset',
  Follicular: 'Spring • Energy Rising',
  Ovulatory: 'Performer • Peak Confidence',
  Luteal: 'Reflective Phase',
};

export const PHASE_EXPLAINERS: Record<string, string> = {
  Menstrual: "Why Red? 🌹 Honoring your body's sacred reset.",
  Follicular: 'Why Green? 🌱 Just like spring, your energy is blooming!',
  Ovulatory: "Why Gold? ✨ You're glowing with peak summer vibes!",
  Luteal: 'Why Indigo? 🌙 Deep colors for deep thoughts & reflection.',
};

type SnapshotEntry = { title: string; desc: string; detail: string; protocol: string };
type PhaseSnapshot = { hormones: SnapshotEntry; mind: SnapshotEntry; body: SnapshotEntry; skin: SnapshotEntry };

export const PHASE_SNAPSHOTS: Record<string, PhaseSnapshot> = {
  Menstrual: {
    hormones: {
      title: 'The Great Reset',
      desc: 'Biological baseline reached.',
      detail: "Estrogen and progesterone hit their monthly nadir to trigger the shed. This 'biological winter' is a vital system reboot—not a shutdown.",
      protocol: 'Protect your energy. Magnesium glycinate (200-400mg) can soothe cramps and support deep restorative sleep tonight.',
    },
    mind: {
      title: 'Intuitive Clarity',
      desc: 'Left & right brain sync.',
      detail: 'Communication between brain hemispheres is strongest now. It’s the perfect time for evaluating your path and setting intentions.',
      protocol: 'Journaling tonight is non-negotiable. Your intuition is louder than logic right now—listen to it.',
    },
    body: {
      title: 'Active Recovery',
      desc: 'Inflammation peaks slightly.',
      detail: 'Your body is working hard to release. High intensity will backfire by spiking cortisol when resilience is low.',
      protocol: 'Focus on Gentle Yoga or a slow 20-minute walk. Keep your lower back and feet warm to support circulation.',
    },
    skin: {
      title: 'Hydration Barrier',
      desc: 'Skin is driest now.',
      detail: 'Low estrogen means less natural oil and moisture retention. Your skin barrier is more permeable and sensitive.',
      protocol: 'Skip the harsh exfoliants. Layer a hydrating serum with a rich ceramide moisturizer to lock in water.',
    },
  },
  Follicular: {
    hormones: {
      title: 'The Awakening',
      desc: 'Estrogen begins its climb.',
      detail: 'FSH stimulates new follicles, and estrogen begins to climb. This neuro-stimulant hormone lifts your mood, energy, and mental speed.',
      protocol: 'Capitalize on this rising energy. Schedule your most demanding creative work for the morning hours.',
    },
    mind: {
      title: 'Architect Mode',
      desc: 'Pattern recognition peaks.',
      detail: 'You are primed for learning and complex problem solving. Brain fog clears as you become open to new ideas and social connection.',
      protocol: "Tackle that complex project you've been putting off. Your brain is hungry for challenge.",
    },
    body: {
      title: 'Building Power',
      desc: 'Insulin sensitivity rises.',
      detail: 'Your body is ready to burn carbs for fuel and build muscle. Recovery time is faster now than at any other time.',
      protocol: 'Increase cardio intensity or heavy lifting. Your body can handle the stress and bounce back stronger.',
    },
    skin: {
      title: 'Collagen Bloom',
      desc: 'Natural plumpness returns.',
      detail: 'Rising estrogen boosts collagen and hyaluronic acid production. Your skin is naturally more resilient and glowing.',
      protocol: 'A great time for a vitamin C serum to amplify that natural glow. You can tolerate more active treatments now.',
    },
  },
  Ovulatory: {
    hormones: {
      title: 'The Main Event',
      desc: 'Peak estrogen & testosterone.',
      detail: 'The biological zenith. Estrogen peaks to trigger ovulation, while testosterone gives you a surge of confidence and libido.',
      protocol: 'You are magnetic. Schedule dates, pitches, or difficult conversations. You are chemically wired to persuade.',
    },
    mind: {
      title: 'Social Butterfly',
      desc: 'Verbal centers light up.',
      detail: 'Your verbal skills and emotional intelligence are at their height. You are more articulate and persuasive.',
      protocol: 'Network, present, or record content. Your ability to connect with others is at its peak.',
    },
    body: {
      title: 'Peak Performance',
      desc: 'Maximum power output.',
      detail: 'Testosterone adds a strength boost. You are at your strongest, but your ligaments are also looser (higher injury risk).',
      protocol: 'Go for a PR in the gym, but watch your form. High-intensity interval training (HIIT) is highly effective now.',
    },
    skin: {
      title: 'Radiant but Oily',
      desc: "The 'glow' is real.",
      detail: 'Sebum production increases slightly. You look vibrant, but pores may be more visible due to the surge.',
      protocol: 'Double cleanse in the evenings. Using a clay mask can help manage the extra oil without stripping your glow.',
    },
  },
  Luteal: {
    hormones: {
      title: 'The Shift',
      desc: 'Progesterone takes over.',
      detail: 'Estrogen drops and progesterone rises. This has a sedative, calming effect, but withdrawal later triggers PMS.',
      protocol: 'Prioritize stability. Eat regular meals with protein to stabilize blood sugar and combat mood swings.',
    },
    mind: {
      title: 'Deep Focus',
      desc: 'Detail-oriented brain.',
      detail: 'Brain chemistry shifts from social/expansive to internal/analytical. You notice things you missed before.',
      protocol: "Edit, organize, and wrap up loose ends. It's the best time for administrative tasks and deep work.",
    },
    body: {
      title: 'Metabolic Burn',
      desc: 'Calorie burn increases.',
      detail: 'Your metabolism speeds up (burning ~100-300 more calories), but endurance drops. Heat tolerance is lower.',
      protocol: 'Switch to strength training with longer rests. Honor your hunger with complex carbs to boost serotonin.',
    },
    skin: {
      title: 'Congestion Alert',
      desc: 'Pores are prone to clogging.',
      detail: 'Progesterone stimulates oil production while pores tighten, leading to trapped bacteria and breakouts.',
      protocol: 'Use salicylic acid (BHA) to keep pores clear. Avoid heavy, pore-clogging makeup if possible.',
    },
  },
};
