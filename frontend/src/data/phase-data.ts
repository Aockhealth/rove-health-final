// Comprehensive Phase Data with Indianized Diet & Exercise Recommendations
// Each phase contains detailed, culturally relevant guidance for Indian users

export interface PhaseCore {
    id: string;
    name: string;
    altName: string; // Indian/Ayurvedic reference
    duration: string;
    color: string;
    badgeColor: string;
    season: string; // Inner season metaphor
    icon: string;
}

export interface HormoneInfo {
    title: string;
    summary: string;
    description: string;
    estrogen: "Low" | "Rising" | "Peak" | "Moderate" | "Falling";
    progesterone: "Low" | "Rising" | "Peak" | "Moderate" | "Falling";
    symptoms: string[];
    energyLevel: number; // 1-10
    moodPatterns: string[];
}

export interface DietCore {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface MealPlan {
    time: "Morning" | "Mid-Morning" | "Lunch" | "Evening Snack" | "Dinner" | "Before Bed";
    title: string;
    icon: string;
    items: string[];
    tip?: string;
}

export interface DietInfo {
    principles: string[];
    coreNeeds: DietCore[];
    meals: MealPlan[];
    superfoods: string[];
    avoid: string[];
    hydration: string;
    ayurvedicTip: string;
}

export interface ExerciseItem {
    title: string;
    description: string;
    duration: string;
    intensity: "Low" | "Moderate" | "High";
    benefits: string[];
}

export interface ExerciseInfo {
    summary: string;
    philosophy: string;
    recommended: ExerciseItem[];
    yoga: {
        asanas: string[];
        pranayama: string[];
    };
    avoid: string[];
    restDays: string;
}

export interface Supplement {
    name: string;
    indianName?: string;
    dose: string;
    reason: string;
    source?: string;
}

export interface DailyRoutine {
    time: string;
    activity: string;
    tip?: string;
}

export interface PhaseData {
    core: PhaseCore;
    hormones: HormoneInfo;
    diet: DietInfo;
    exercise: ExerciseInfo;
    supplements: Supplement[];
    dailyRoutine: DailyRoutine[];
    affirmation: string;
    selfCareTips: string[];
}

// ===========================================
// PHASE 1: MENSTRUAL PHASE (Days 1-5)
// ===========================================
const menstrualPhase: PhaseData = {
    core: {
        id: "menstrual",
        name: "Menstrual",
        altName: "Rajaswala Kala",
        duration: "Days 1-5",
        color: "bg-rose-500",
        badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
        season: "Inner Winter",
        icon: "Moon"
    },
    hormones: {
        title: "Hormones at Rest",
        summary: "Estrogen & Progesterone are at their lowest",
        description: "Your body is shedding the uterine lining and renewing itself. This is your 'inner winter' - a time for rest, introspection, and gentle nurturing. Honor this phase by slowing down.",
        estrogen: "Low",
        progesterone: "Low",
        symptoms: ["Fatigue", "Cramps", "Lower back pain", "Mood sensitivity", "Bloating", "Headaches"],
        energyLevel: 3,
        moodPatterns: ["Introspective", "Need for solitude", "Emotional sensitivity", "Desire for comfort"]
    },
    diet: {
        principles: [
            "Focus on warm, cooked, easily digestible foods",
            "Increase iron-rich foods to replenish blood loss",
            "Avoid cold, raw foods that can worsen cramps",
            "Stay well-hydrated with warm beverages"
        ],
        coreNeeds: [
            { id: "iron", title: "Iron-Rich Foods", description: "Restore blood loss", icon: "Droplets" },
            { id: "magnesium", title: "Magnesium", description: "Reduce cramps & pain", icon: "Sparkles" },
            { id: "omega3", title: "Omega-3 Fats", description: "Anti-inflammatory", icon: "Fish" },
            { id: "warmfoods", title: "Warm Foods", description: "Support digestion", icon: "Soup" }
        ],
        meals: [
            {
                time: "Morning",
                title: "Warm & Grounding Start",
                icon: "Sunrise",
                items: [
                    "Warm water with jeera (cumin) & ajwain",
                    "Moong dal cheela with green chutney",
                    "Ragi (finger millet) porridge with jaggery & ghee",
                    "Tulsi-adrak chai (no milk) or warm turmeric water"
                ],
                tip: "Start slow - your digestive fire (Agni) is low"
            },
            {
                time: "Mid-Morning",
                title: "Iron Boost",
                icon: "Coffee",
                items: [
                    "Dates stuffed with ghee & nuts",
                    "Amla juice or murabba",
                    "Handful of roasted chana with jaggery"
                ]
            },
            {
                time: "Lunch",
                title: "Nourishing & Iron-Rich",
                icon: "Sun",
                items: [
                    "Palak (spinach) dal or methi dal with ghee tadka",
                    "Beetroot-carrot sabzi",
                    "Soft phulkas or brown rice",
                    "Buttermilk (chaas) with roasted jeera",
                    "Moong dal khichdi with mixed vegetables"
                ],
                tip: "Add a squeeze of lemon to increase iron absorption"
            },
            {
                time: "Evening Snack",
                title: "Magnesium & Comfort",
                icon: "Coffee",
                items: [
                    "Roasted makhana (fox nuts) with rock salt",
                    "Warm turmeric milk (haldi doodh)",
                    "Banana with a pinch of cinnamon",
                    "Homemade til (sesame) laddoo"
                ]
            },
            {
                time: "Dinner",
                title: "Light & Soothing",
                icon: "Moon",
                items: [
                    "Lauki (bottle gourd) sabzi or soup",
                    "Thin moong dal or vegetable daliya",
                    "Steamed sweet potato (shakarkandi)",
                    "Khichdi with extra ghee",
                    "Palak paneer (light preparation)"
                ],
                tip: "Eat dinner early (before 7:30 PM) for better digestion"
            },
            {
                time: "Before Bed",
                title: "Relaxation",
                icon: "Moon",
                items: [
                    "Warm milk with nutmeg (jaiphal) & saffron",
                    "Ashwagandha churna with warm water",
                    "Fennel seed (saunf) tea"
                ]
            }
        ],
        superfoods: [
            "Ragi (Finger Millet) - Iron & Calcium",
            "Palak & Methi - Iron & Folate",
            "Beetroot - Blood building",
            "Dates (Khajoor) - Natural iron",
            "Sesame seeds (Til) - Calcium & warmth",
            "Jaggery (Gud) - Iron & minerals",
            "Ghee - Supports absorption",
            "Moong dal - Easy protein"
        ],
        avoid: [
            "Cold drinks & ice cream",
            "Raw salads & smoothies",
            "Fried & oily foods",
            "Excess caffeine",
            "Refined sugar & maida",
            "Spicy pickle & chaat",
            "Heavy non-veg (especially red meat)"
        ],
        hydration: "Drink warm water throughout the day. Add jeera, ajwain, or saunf for digestive support. Aim for 8-10 glasses of warm fluids.",
        ayurvedicTip: "This is a Vata-aggravating time. Counter it with warm, grounding, unctuous (oily) foods. Ghee is your best friend during this phase."
    },
    exercise: {
        summary: "Rest is productive. Low-intensity, restorative movement supports healing without stressing your system.",
        philosophy: "In Ayurveda, the menstrual phase is considered sacred rest time. Avoid heavy exercise that can increase Vata and worsen symptoms.",
        recommended: [
            {
                title: "Gentle Yoga",
                description: "Restorative poses like Child's pose, Cat-cow, Butterfly, and Legs up the wall",
                duration: "15-20 mins",
                intensity: "Low",
                benefits: ["Relieves cramps", "Calms nervous system", "Reduces bloating"]
            },
            {
                title: "Slow Walking",
                description: "Gentle walks in nature or around your home",
                duration: "15-20 mins",
                intensity: "Low",
                benefits: ["Improves circulation", "Mood boost", "Low impact"]
            },
            {
                title: "Deep Breathing",
                description: "Pranayama focusing on slow, diaphragmatic breathing",
                duration: "5-10 mins",
                intensity: "Low",
                benefits: ["Reduces pain", "Calms mind", "Improves oxygenation"]
            },
            {
                title: "Stretching",
                description: "Gentle stretches for lower back, hips, and hamstrings",
                duration: "10-15 mins",
                intensity: "Low",
                benefits: ["Relieves tension", "Improves flexibility", "Reduces stiffness"]
            }
        ],
        yoga: {
            asanas: [
                "Balasana (Child's Pose)",
                "Marjaryasana-Bitilasana (Cat-Cow)",
                "Supta Baddha Konasana (Reclining Butterfly)",
                "Viparita Karani (Legs Up Wall)",
                "Savasana (Corpse Pose)",
                "Supta Matsyendrasana (Supine Twist)"
            ],
            pranayama: [
                "Anulom Vilom (Alternate Nostril Breathing)",
                "Bhramari (Bee Breath)",
                "Deep Belly Breathing",
                "4-7-8 Breathing for relaxation"
            ]
        },
        avoid: [
            "High-Intensity Interval Training (HIIT)",
            "Running or jogging",
            "Heavy weight lifting",
            "Intense core exercises",
            "Hot yoga or Bikram",
            "Inversions (headstand, shoulderstand)",
            "Jumping exercises"
        ],
        restDays: "Days 1-2 can be complete rest days. Listen to your body - if you're exhausted, rest completely."
    },
    supplements: [
        { name: "Magnesium Glycinate", dose: "200-350 mg", reason: "Reduces cramps, supports sleep", source: "Also in bananas, dark chocolate" },
        { name: "Iron", indianName: "Lohasava", dose: "Low dose/food-based", reason: "Replenish blood loss", source: "Ragi, dates, jaggery" },
        { name: "Vitamin C", dose: "With iron-rich foods", reason: "Enhances iron absorption", source: "Amla, lemon, orange" },
        { name: "Vitamin B12", dose: "As per deficiency", reason: "Energy support", source: "Dairy, fortified foods" },
        { name: "Ashwagandha", indianName: "Ashwagandha", dose: "300-500 mg at night", reason: "Stress relief, sleep support" }
    ],
    dailyRoutine: [
        { time: "6:00 AM", activity: "Wake up gently, drink warm water with lemon", tip: "No rushing - let your body wake up slowly" },
        { time: "7:00 AM", activity: "Light stretching or gentle yoga (15 mins)" },
        { time: "8:00 AM", activity: "Warm, nourishing breakfast" },
        { time: "10:00 AM", activity: "Iron-rich snack (dates, amla)" },
        { time: "1:00 PM", activity: "Wholesome lunch with dal, sabzi, roti" },
        { time: "4:00 PM", activity: "Warm turmeric milk or herbal tea with makhana" },
        { time: "6:00 PM", activity: "5-10 min walk if energy permits" },
        { time: "7:00 PM", activity: "Light, early dinner" },
        { time: "9:00 PM", activity: "Warm milk with nutmeg, relaxation" },
        { time: "10:00 PM", activity: "Early sleep with heat pad if needed" }
    ],
    affirmation: "I honor my body's need for rest. My energy will return, and this pause is productive.",
    selfCareTips: [
        "Use a hot water bottle or heating pad on lower abdomen",
        "Take warm baths with Epsom salts",
        "Journal your thoughts and feelings",
        "Minimize social obligations if possible",
        "Practice self-massage (Abhyanga) with warm sesame oil",
        "Listen to calming music or nature sounds"
    ]
};

// ===========================================
// PHASE 2: FOLLICULAR PHASE (Days 6-13)
// ===========================================
const follicularPhase: PhaseData = {
    core: {
        id: "follicular",
        name: "Follicular",
        altName: "Ritu Kala",
        duration: "Days 6-13",
        color: "bg-teal-500",
        badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
        season: "Inner Spring",
        icon: "Zap"
    },
    hormones: {
        title: "Hormones Rising",
        summary: "Estrogen is steadily increasing, bringing renewed energy",
        description: "Your 'inner spring' has arrived! As estrogen rises, you'll feel more energetic, creative, and optimistic. Follicles are maturing in your ovaries, and your body is building towards ovulation.",
        estrogen: "Rising",
        progesterone: "Low",
        symptoms: ["Increasing energy", "Clearer skin", "Better mood", "Mental clarity", "Increased motivation"],
        energyLevel: 7,
        moodPatterns: ["Optimistic", "Creative", "Social", "Curious", "Adventurous"]
    },
    diet: {
        principles: [
            "Eat fresh, light, and colorful foods",
            "Focus on probiotics and fermented foods for gut health",
            "Include lean proteins for muscle repair and energy",
            "Support liver detoxification with cruciferous vegetables"
        ],
        coreNeeds: [
            { id: "fresh", title: "Fresh Vegetables", description: "Support liver detox", icon: "Leaf" },
            { id: "probiotic", title: "Probiotics", description: "Gut health & estrogen metabolism", icon: "Beaker" },
            { id: "protein", title: "Lean Protein", description: "Muscle repair & energy", icon: "Drumstick" },
            { id: "hydration", title: "Hydration", description: "Support fluid balance", icon: "Droplets" }
        ],
        meals: [
            {
                time: "Morning",
                title: "Fresh & Energizing",
                icon: "Sunrise",
                items: [
                    "Warm lemon water to kickstart metabolism",
                    "Poha with vegetables, peanuts & curry leaves",
                    "Besan chilla with mint chutney",
                    "Upma with mixed vegetables",
                    "Idli-sambar (fermented, probiotic)",
                    "Green smoothie with spinach, banana & curd"
                ],
                tip: "Your digestion is strong - you can handle lighter, fresher foods now"
            },
            {
                time: "Mid-Morning",
                title: "Protein Boost",
                icon: "Coffee",
                items: [
                    "Chana chaat with lemon & onions",
                    "Roasted makhana with herbs",
                    "Sprouts salad",
                    "Buttermilk (chaas)"
                ]
            },
            {
                time: "Lunch",
                title: "Colorful & Balanced",
                icon: "Sun",
                items: [
                    "Quinoa pulao or brown rice",
                    "Dal tadka with fresh coriander",
                    "Bhindi (okra) or turai sabzi",
                    "Fresh salad with cucumber, tomato, carrot",
                    "Curd rice with pickle",
                    "Paneer tikka or grilled chicken"
                ],
                tip: "Add fermented foods like pickle, curd, or kanji for probiotics"
            },
            {
                time: "Evening Snack",
                title: "Crunchy & Fresh",
                icon: "Coffee",
                items: [
                    "Apple slices with peanut butter",
                    "Carrot & cucumber sticks with hummus",
                    "Roasted pumpkin seeds (kaddu ke beej)",
                    "Fresh fruit chaat",
                    "Murmura (puffed rice) bhel"
                ]
            },
            {
                time: "Dinner",
                title: "Light & Protein-Rich",
                icon: "Moon",
                items: [
                    "Grilled fish (Indian spiced) or paneer",
                    "Stir-fried vegetables with garlic",
                    "Masoor dal soup",
                    "Vegetable daliya",
                    "Moong sprouts salad"
                ],
                tip: "Keep dinner lighter as metabolism slows in the evening"
            }
        ],
        superfoods: [
            "Sprouts - Enzyme-rich, protein",
            "Fermented foods - Idli, dosa, curd, kanji",
            "Leafy greens - Palak, methi, sarson",
            "Citrus fruits - Vitamin C, immunity",
            "Pumpkin seeds - Zinc for follicle health",
            "Flax seeds (Alsi) - Omega-3, lignans",
            "Amla - Vitamin C powerhouse",
            "Green vegetables - Detox support"
        ],
        avoid: [
            "Heavy fried foods",
            "Excess oil and ghee",
            "Processed snacks",
            "Alcohol (limit significantly)",
            "Excess dairy (can be congesting)",
            "White bread and maida products"
        ],
        hydration: "Drink plenty of water - 10-12 glasses. Coconut water, fresh juices, and herbal teas are excellent. Try jeera water or coriander water for detox.",
        ayurvedicTip: "This is a Kapha-dominant time transitioning to balanced energy. Favor light, dry foods and reduce heavy, oily preparations. Ginger and warming spices support metabolism."
    },
    exercise: {
        summary: "Your energy is building - this is the time to try new things, increase intensity, and build cardio endurance!",
        philosophy: "As estrogen rises, so does your muscle recovery ability and pain tolerance. Take advantage of this phase to push a little harder.",
        recommended: [
            {
                title: "Cardio & Running",
                description: "Jogging, cycling, dancing, or brisk walking",
                duration: "30-45 mins",
                intensity: "Moderate",
                benefits: ["Builds endurance", "Boosts mood", "Weight management"]
            },
            {
                title: "Vinyasa/Flow Yoga",
                description: "Dynamic, flowing yoga sequences",
                duration: "45-60 mins",
                intensity: "Moderate",
                benefits: ["Flexibility", "Strength", "Mind-body connection"]
            },
            {
                title: "Strength Training",
                description: "Light to moderate weights, bodyweight exercises",
                duration: "30-40 mins",
                intensity: "Moderate",
                benefits: ["Muscle building", "Bone health", "Metabolism boost"]
            },
            {
                title: "Try New Activities",
                description: "Swimming, Zumba, martial arts, hiking",
                duration: "Variable",
                intensity: "Moderate",
                benefits: ["Mental stimulation", "Skill learning", "Fun & variety"]
            }
        ],
        yoga: {
            asanas: [
                "Surya Namaskar (Sun Salutation) - 12 rounds",
                "Virabhadrasana I, II, III (Warrior poses)",
                "Trikonasana (Triangle Pose)",
                "Utkatasana (Chair Pose)",
                "Navasana (Boat Pose)",
                "Bhujangasana (Cobra Pose)"
            ],
            pranayama: [
                "Kapalabhati (Skull Shining Breath)",
                "Bhastrika (Bellows Breath)",
                "Surya Bhedana (Right Nostril Breathing)"
            ]
        },
        avoid: [
            "Overtraining without rest days",
            "Heavy lifting without proper warm-up",
            "Exercising on empty stomach for too long"
        ],
        restDays: "Include 1-2 rest days per week, but active recovery (walking, stretching) is encouraged."
    },
    supplements: [
        { name: "Probiotics", dose: "Daily", reason: "Gut health & estrogen metabolism", source: "Curd, idli, dosa, kanji" },
        { name: "Vitamin B Complex", dose: "Daily", reason: "Energy production, mood support" },
        { name: "Zinc", indianName: "Jasad Bhasma", dose: "15-30 mg", reason: "Follicle development, immunity" },
        { name: "Vitamin E", dose: "Daily", reason: "Skin health, antioxidant", source: "Almonds, sunflower seeds" },
        { name: "Omega-3 (Fish Oil/Flax)", indianName: "Alsi", dose: "1000 mg", reason: "Inflammation, brain health" }
    ],
    dailyRoutine: [
        { time: "5:30 AM", activity: "Wake up early - energy is high!", tip: "Great time for morning workout" },
        { time: "6:00 AM", activity: "Warm lemon water, light cardio or yoga" },
        { time: "7:30 AM", activity: "Energizing breakfast - poha, upma, or smoothie" },
        { time: "10:00 AM", activity: "Healthy snack - sprouts or fruit" },
        { time: "1:00 PM", activity: "Balanced lunch with protein and vegetables" },
        { time: "4:00 PM", activity: "Light snack - nuts, seeds, or fruit chaat" },
        { time: "5:30 PM", activity: "Evening workout - strength or cardio" },
        { time: "7:30 PM", activity: "Light, protein-rich dinner" },
        { time: "9:00 PM", activity: "Planning, creative projects, socializing" },
        { time: "10:30 PM", activity: "Wind down, prepare for restful sleep" }
    ],
    affirmation: "I am full of creative energy. I embrace new beginnings and trust my capabilities.",
    selfCareTips: [
        "Start new projects or learn new skills",
        "Plan social activities and networking",
        "Set intentions and goals for the month",
        "Experiment with new recipes and foods",
        "Schedule important meetings and presentations",
        "Journal about your dreams and aspirations"
    ]
};

// ===========================================
// PHASE 3: OVULATORY PHASE (Days 14-16)
// ===========================================
const ovulatoryPhase: PhaseData = {
    core: {
        id: "ovulatory",
        name: "Ovulatory",
        altName: "Rutukala Peak",
        duration: "Days 14-16",
        color: "bg-amber-500",
        badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
        season: "Inner Summer",
        icon: "Sparkles"
    },
    hormones: {
        title: "Peak Hormones",
        summary: "Estrogen at peak, testosterone surges briefly",
        description: "Your 'inner summer' is here! This is your most radiant, magnetic, and energetic phase. Estrogen peaks, triggering ovulation. You're at your most confident and communicative.",
        estrogen: "Peak",
        progesterone: "Low",
        symptoms: ["Peak energy", "Glowing skin", "High libido", "Confidence boost", "Sharp communication"],
        energyLevel: 10,
        moodPatterns: ["Confident", "Magnetic", "Social", "Optimistic", "Expressive"]
    },
    diet: {
        principles: [
            "Focus on fiber to help metabolize excess estrogen",
            "Eat raw, cooling foods to balance body heat",
            "Include cruciferous vegetables for liver support",
            "Stay well-hydrated - you may feel warmer"
        ],
        coreNeeds: [
            { id: "fiber", title: "High Fiber", description: "Bind excess estrogen", icon: "Wheat" },
            { id: "antioxidants", title: "Antioxidants", description: "Cell protection", icon: "Shield" },
            { id: "cruciferous", title: "Cruciferous Veggies", description: "Detox support", icon: "Leaf" },
            { id: "cooling", title: "Cooling Foods", description: "Balance body heat", icon: "Wind" }
        ],
        meals: [
            {
                time: "Morning",
                title: "Light & Fiber-Rich",
                icon: "Sunrise",
                items: [
                    "Chia pudding with fresh fruits (overnight)",
                    "Fresh fruit bowl with seeds",
                    "Smoothie bowl with spinach, mango, chia",
                    "Oats with berries and flax seeds",
                    "Fresh vegetable juice"
                ],
                tip: "Your body can handle raw foods well during this phase"
            },
            {
                time: "Mid-Morning",
                title: "Hydrating Snack",
                icon: "Coffee",
                items: [
                    "Coconut water",
                    "Fresh cucumber slices with chaat masala",
                    "Watermelon cubes with mint",
                    "Sabja (basil seeds) sharbat"
                ]
            },
            {
                time: "Lunch",
                title: "Raw & Fresh",
                icon: "Sun",
                items: [
                    "Large raw vegetable salad with chickpeas",
                    "Sprouts chaat with lemon dressing",
                    "Grilled paneer or fish with vegetables",
                    "Quinoa tabbouleh Indian style",
                    "Kachumber salad",
                    "Light rasam with rice"
                ],
                tip: "This is the best time for raw salads - your digestion is strongest"
            },
            {
                time: "Evening Snack",
                title: "Energy Sustaining",
                icon: "Coffee",
                items: [
                    "Almonds and dark chocolate (2-3 pieces)",
                    "Fresh berries",
                    "Green tea with roasted chana",
                    "Fruit smoothie"
                ]
            },
            {
                time: "Dinner",
                title: "Light & Clean",
                icon: "Moon",
                items: [
                    "Steamed broccoli and cauliflower sabzi",
                    "Grilled fish with Indian spices or tofu",
                    "Vegetable soup with quinoa",
                    "Tandoori vegetables",
                    "Light moong dal with jeera rice"
                ],
                tip: "Keep portions moderate - metabolism is high but don't overeat"
            }
        ],
        superfoods: [
            "Raw carrots - Help clear excess estrogen",
            "Broccoli & Cauliflower - Cruciferous detox",
            "Berries - Antioxidant power",
            "Leafy greens - Folate, fiber",
            "Flax seeds - Lignans, omega-3",
            "Green tea - Antioxidants, metabolism",
            "Sabja seeds - Cooling, fiber",
            "Coconut water - Hydrating, cooling"
        ],
        avoid: [
            "Heavy carbohydrates (limit rotis, rice)",
            "Red meat (limit)",
            "Excess heat-producing foods (too much spice)",
            "Alcohol (affects hormone balance)",
            "Fried foods",
            "Excess caffeine"
        ],
        hydration: "Stay very hydrated! 12+ glasses of water. Include coconut water, sabja water, cucumber juice, and cooling herbal teas like peppermint.",
        ayurvedicTip: "Pitta energy is high during ovulation. Favor cooling foods and avoid excess heat. Rose water, coconut, and mint are your allies."
    },
    exercise: {
        summary: "This is your PEAK performance time! Go for personal records, high-intensity workouts, and challenging activities.",
        philosophy: "Your body is at its strongest, most resilient phase. Testosterone surge enhances muscle power. Push your limits!",
        recommended: [
            {
                title: "HIIT Training",
                description: "Sprints, Tabata, bootcamp-style workouts",
                duration: "20-30 mins",
                intensity: "High",
                benefits: ["Maximum calorie burn", "Strength gains", "Endurance boost"]
            },
            {
                title: "Spin/Cycling",
                description: "High-energy cycling classes or outdoor rides",
                duration: "45 mins",
                intensity: "High",
                benefits: ["Cardio endurance", "Leg strength", "Mood elevation"]
            },
            {
                title: "Heavy Strength Training",
                description: "Work towards your personal bests",
                duration: "45-60 mins",
                intensity: "High",
                benefits: ["Muscle building", "Bone density", "Metabolism boost"]
            },
            {
                title: "Group Sports",
                description: "Tennis, badminton, basketball, dance classes",
                duration: "Variable",
                intensity: "High",
                benefits: ["Social connection", "Team building", "Competition"]
            }
        ],
        yoga: {
            asanas: [
                "Power Yoga sequences",
                "Handstand practice (Adho Mukha Vrksasana)",
                "Arm balances (Bakasana, Parsva Bakasana)",
                "Advanced Sun Salutations",
                "Intense hip openers"
            ],
            pranayama: [
                "Kapalabhati (vigorous)",
                "Bhastrika (intense)",
                "Breath of Fire"
            ]
        },
        avoid: [
            "Overheating without proper hydration",
            "Sleep deprivation (recovery is still important)",
            "Ignoring warm-up/cool-down"
        ],
        restDays: "You may feel you don't need rest, but 1 rest day is still wise. Use it for active recovery like swimming or light yoga."
    },
    supplements: [
        { name: "NAC (N-Acetyl Cysteine)", dose: "600 mg", reason: "Liver support for estrogen detox" },
        { name: "Glutathione", dose: "As needed", reason: "Antioxidant master", source: "Found in fresh vegetables" },
        { name: "Vitamin D", dose: "1000-2000 IU", reason: "Immunity, mood, bone health" },
        { name: "Zinc", dose: "15-30 mg", reason: "Immunity, skin health" },
        { name: "Magnesium", dose: "200-300 mg", reason: "Muscle recovery, sleep" }
    ],
    dailyRoutine: [
        { time: "5:00 AM", activity: "Early rise - you'll wake up naturally energized!" },
        { time: "5:30 AM", activity: "Morning workout - HIIT, run, or strength training" },
        { time: "7:00 AM", activity: "Light, fiber-rich breakfast" },
        { time: "10:00 AM", activity: "Coconut water or fresh juice break" },
        { time: "1:00 PM", activity: "Large, colorful salad-based lunch" },
        { time: "4:00 PM", activity: "Light snack - berries, nuts" },
        { time: "6:00 PM", activity: "Social activities, networking, presentations" },
        { time: "8:00 PM", activity: "Light dinner" },
        { time: "9:00 PM", activity: "Date night, social events, or creative pursuits" },
        { time: "11:00 PM", activity: "Wind down - you may need less sleep but prioritize it" }
    ],
    affirmation: "I am radiant, confident, and magnetic. I shine my brightest light into the world.",
    selfCareTips: [
        "Schedule important presentations and meetings",
        "Network and make new connections",
        "Go on dates or plan romantic activities",
        "Tackle challenging conversations",
        "Express yourself creatively",
        "Wear that outfit that makes you feel amazing"
    ]
};

// ===========================================
// PHASE 4: LUTEAL PHASE (Days 17-28)
// ===========================================
const lutealPhase: PhaseData = {
    core: {
        id: "luteal",
        name: "Luteal",
        altName: "Ritusrava Kala",
        duration: "Days 17-28",
        color: "bg-indigo-500",
        badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
        season: "Inner Autumn",
        icon: "Brain"
    },
    hormones: {
        title: "Progesterone Rising",
        summary: "Progesterone rises, then falls; PMS may appear",
        description: "Your 'inner autumn' - a time for completion, detail work, and nesting. Progesterone rises to prepare for potential pregnancy, then drops, which can trigger PMS symptoms in the last days.",
        estrogen: "Moderate",
        progesterone: "Peak",
        symptoms: ["PMS possible", "Bloating", "Cravings", "Mood swings", "Breast tenderness", "Fatigue (late phase)"],
        energyLevel: 5,
        moodPatterns: ["Introspective", "Detail-oriented", "Need for comfort", "Emotional sensitivity"]
    },
    diet: {
        principles: [
            "Focus on complex carbohydrates for mood stability",
            "Include B6-rich foods to combat PMS",
            "Eat magnesium-rich foods for relaxation",
            "Avoid excess salt to prevent bloating"
        ],
        coreNeeds: [
            { id: "carbs", title: "Complex Carbs", description: "Stabilize mood & blood sugar", icon: "Wheat" },
            { id: "b6", title: "Vitamin B6", description: "Reduce PMS symptoms", icon: "Pill" },
            { id: "magnesium", title: "Magnesium", description: "Relaxation & cramp prevention", icon: "Sparkles" },
            { id: "fiber", title: "Fiber", description: "Prevent constipation & bloating", icon: "Leaf" }
        ],
        meals: [
            {
                time: "Morning",
                title: "Steady Energy Start",
                icon: "Sunrise",
                items: [
                    "Oatmeal (daliya) with banana and walnuts",
                    "Sweet potato paratha with curd",
                    "Ragi dosa with coconut chutney",
                    "Multigrain toast with peanut butter",
                    "Scrambled eggs (anda bhurji) with multigrain bread"
                ],
                tip: "Complex carbs help maintain serotonin levels and prevent mood dips"
            },
            {
                time: "Mid-Morning",
                title: "Craving-Buster",
                icon: "Coffee",
                items: [
                    "Handful of roasted chickpeas (chana)",
                    "Dark chocolate (2-3 squares, 70%+ cocoa)",
                    "Apple with almond butter",
                    "Trail mix with dried fruits and nuts"
                ]
            },
            {
                time: "Lunch",
                title: "Comforting & Balanced",
                icon: "Sun",
                items: [
                    "Rajma (kidney bean) curry with brown rice",
                    "Chole (chickpea) curry with phulka",
                    "Sabzi with roti and dal",
                    "Vegetable biryani (brown rice)",
                    "Kadhi pakora with jeera rice",
                    "Paneer bhurji with paratha"
                ],
                tip: "Legumes provide B6 and fiber - essential for this phase"
            },
            {
                time: "Evening Snack",
                title: "Healthy Cravings",
                icon: "Coffee",
                items: [
                    "Roasted chana or makhana",
                    "Dark chocolate with almonds",
                    "Banana with cinnamon",
                    "Homemade ladoo (besan or til)",
                    "Dates with ghee"
                ]
            },
            {
                time: "Dinner",
                title: "Warm & Comforting",
                icon: "Moon",
                items: [
                    "Baked sweet potato with dal",
                    "Palak paneer with multigrain roti",
                    "Vegetable khichdi with ghee",
                    "Tofu/paneer stir-fry with brown rice",
                    "Comfort soup - tomato, dal, or mixed veg"
                ],
                tip: "Warm, comforting foods soothe the nervous system"
            },
            {
                time: "Before Bed",
                title: "Relaxing Ritual",
                icon: "Moon",
                items: [
                    "Golden milk (turmeric + saffron + warm milk)",
                    "Chamomile tea",
                    "Warm milk with nutmeg and jaggery",
                    "Saunf (fennel) water"
                ]
            }
        ],
        superfoods: [
            "Sweet potato (Shakarkandi) - Complex carbs, fiber",
            "Dark chocolate - Magnesium, mood",
            "Walnuts (Akhrot) - Omega-3, B vitamins",
            "Sunflower seeds - B6, magnesium",
            "Chickpeas (Chana) - B6, protein, fiber",
            "Banana (Kela) - Potassium, B6",
            "Leafy greens - Magnesium",
            "Sesame seeds (Til) - Calcium, warmth"
        ],
        avoid: [
            "Excess salt (namkeen, chips) - causes bloating",
            "Refined sugar - mood swings",
            "Alcohol - worsens PMS",
            "Caffeine excess - increases anxiety",
            "Very spicy food - can increase irritability",
            "Processed foods"
        ],
        hydration: "Drink 8-10 glasses of warm water. Reduce caffeine. Try fennel tea, ginger tea, or warm lemon water to reduce bloating.",
        ayurvedicTip: "Both Vata and Pitta can be aggravated. Favor warm, grounding, mildly sweet foods. Avoid very cold, very spicy, and stimulating foods."
    },
    exercise: {
        summary: "Scale back intensity gradually. Focus on strength maintenance and steady, calming exercises. Listen to your body more.",
        philosophy: "Your body is conserving energy for potential pregnancy. Respect this by not overexerting. Quality over intensity.",
        recommended: [
            {
                title: "Pilates",
                description: "Core stability, controlled movements",
                duration: "30-40 mins",
                intensity: "Moderate",
                benefits: ["Core strength", "Posture", "Mind-body connection"]
            },
            {
                title: "Moderate Strength",
                description: "Lighter weights, maintenance focus",
                duration: "30 mins",
                intensity: "Moderate",
                benefits: ["Maintain muscle", "Bone health", "Metabolism support"]
            },
            {
                title: "Walking/Hiking",
                description: "Steady-paced walks in nature",
                duration: "30-45 mins",
                intensity: "Low",
                benefits: ["Mood boost", "Reduces PMS", "Fresh air"]
            },
            {
                title: "Yin/Restorative Yoga",
                description: "Especially in the last days of this phase",
                duration: "20-30 mins",
                intensity: "Low",
                benefits: ["Relaxation", "Stress relief", "Prepares for menstruation"]
            }
        ],
        yoga: {
            asanas: [
                "Supported Bridge Pose",
                "Pigeon Pose (Eka Pada Rajakapotasana)",
                "Seated Forward Fold (Paschimottanasana)",
                "Reclined Bound Angle (Supta Baddha Konasana)",
                "Child's Pose variations"
            ],
            pranayama: [
                "Nadi Shodhana (Alternate Nostril Breathing)",
                "Chandra Bhedana (Left Nostril Breathing)",
                "Deep relaxation breathing"
            ]
        },
        avoid: [
            "Heavy HIIT (especially late luteal)",
            "Jumping and high-impact exercises",
            "Overexertion when fatigued",
            "New, strenuous activities"
        ],
        restDays: "Take 2-3 rest days per week, especially in the final days before menstruation. Active recovery is ideal."
    },
    supplements: [
        { name: "Vitamin B6", dose: "50-100 mg", reason: "Mood support, reduces PMS" },
        { name: "Magnesium", dose: "300-400 mg", reason: "Reduces bloating, anxiety, cramps" },
        { name: "Omega-3", indianName: "Alsi/Fish Oil", dose: "1000-2000 mg", reason: "Anti-inflammatory, mood" },
        { name: "Ashwagandha", indianName: "Ashwagandha", dose: "300-500 mg", reason: "Stress reduction, cortisol balance" },
        { name: "Evening Primrose Oil", dose: "500-1000 mg", reason: "Breast tenderness, hormonal balance" }
    ],
    dailyRoutine: [
        { time: "6:30 AM", activity: "Gentle wake-up, warm water" },
        { time: "7:00 AM", activity: "Light yoga or stretching (15-20 mins)" },
        { time: "8:00 AM", activity: "Complex carb breakfast - oatmeal or paratha" },
        { time: "10:30 AM", activity: "Healthy snack to prevent cravings" },
        { time: "1:00 PM", activity: "Comforting, balanced lunch" },
        { time: "4:00 PM", activity: "Dark chocolate + nuts for energy" },
        { time: "5:30 PM", activity: "Moderate workout - Pilates, walk, or strength" },
        { time: "7:00 PM", activity: "Warm, early dinner" },
        { time: "8:30 PM", activity: "Journaling, reflection, completing projects" },
        { time: "9:30 PM", activity: "Golden milk, relaxation routine" },
        { time: "10:00 PM", activity: "Early to bed - prioritize sleep" }
    ],
    affirmation: "I honor my body's wisdom. I complete what I've started and prepare for renewal.",
    selfCareTips: [
        "Complete projects and tie loose ends",
        "Declutter and organize your space",
        "Meal prep for the week ahead",
        "Practice saying 'no' to avoid overcommitting",
        "Take warm baths with Epsom salts",
        "Journal about accomplishments and learnings",
        "Reduce social obligations if feeling introverted"
    ]
};

// ===========================================
// EXPORT ALL PHASE DATA
// ===========================================
export const PHASE_DATABASE: Record<string, PhaseData> = {
    "Menstrual": menstrualPhase,
    "Follicular": follicularPhase,
    "Ovulatory": ovulatoryPhase,
    "Luteal": lutealPhase
};

export const PHASES_LIST = [
    menstrualPhase,
    follicularPhase,
    ovulatoryPhase,
    lutealPhase
];

// Helper to get phase by name
export function getPhaseData(phaseName: string): PhaseData {
    return PHASE_DATABASE[phaseName] || PHASE_DATABASE["Menstrual"];
}

// Get all phase summaries for card display
export function getPhaseSummaries() {
    return PHASES_LIST.map(phase => ({
        id: phase.core.id,
        name: phase.core.name,
        altName: phase.core.altName,
        duration: phase.core.duration,
        season: phase.core.season,
        icon: phase.core.icon,
        color: phase.core.color,
        badgeColor: phase.core.badgeColor,
        summary: phase.hormones.summary,
        energyLevel: phase.hormones.energyLevel,
        keySymptoms: phase.hormones.symptoms.slice(0, 3),
        topFoods: phase.diet.superfoods.slice(0, 3),
        exerciseSummary: phase.exercise.summary
    }));
}
