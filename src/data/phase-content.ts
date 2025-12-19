
export type PhaseContent = {
    river: string[];
    nutrition_guide?: {
        header: {
            title: string;
            hormone_insight: string;
            narrative: string;
            goal: string;
            color: string;
        };
        nutrition_modules: {
            title: string;
            goal: string;
            science: string;
            key_ingredients: string[];
            food_sources: { name: string; amount?: string; note?: string }[];
        }[];
        symptoms?: {
            id: string;
            name: string;
            cause: string;
            fix: string;
            foods: string[];
            deficiency: string;
        }[];
        superpowers: {
            title: string;
            desc: string;
            metabolic_tip: string;
        };
        plate_ratios: {
            protein: number;
            fat: number;
            carb: number;
            veg: number;
        };
        quick_guide: {
            focus: string[];
            limit: string[];
        };
    };
    fuel: {
        title: string;
        desc: string;
        icon: string;
        category?: "vegan" | "vegetarian" | "non_vegetarian";
        scientific_benefit?: string;
        tags?: { condition: string[] };
    }[];
    move: { title: string; desc: string; icon: string }[];
    rituals: { title: string; desc: string; icon: string }[];
    snapshot: {
        hormones: { title: string; desc: string };
        mind: { title: string; desc: string };
        body: { title: string; desc: string };
        skin: { title: string; desc: string };
    }[];
    plan: {
        hormones: { summary: string; symptoms: string[] };
        diet: {
            ideal_meals: { time: string; title: string; items: string[]; icon: string }[];
            cramp_relief: string[];
            avoid: string[];
        };
        exercise: {
            summary: string;
            avoid: string[];
        };
        supplements: { name: string; dose: string; why: string }[];
        daily_flow: { time: string; activity: string }[];
    };
};

export const PHASE_CONTENT: Record<string, PhaseContent> = {
    "Menstrual": {
        river: [
            "Rest • Restore • Reload", "Pause • Breathe • Heal", "Turn Inward • Release",
            "Slow • Soft • Gentle", "Winter • Quiet • Deep", "Release • Renew • Reset",
            "Solitude • Silence • Peace", "Healing • Comfort • Warmth", "Drifting • Dreaming • Being"
        ],
        nutrition_guide: {
            header: {
                title: "Menstrual Phase",
                hormone_insight: "Progesterone & Estrogen at lowest point.",
                narrative: "Your lining is shedding, which requires energy and nutrients.",
                goal: "Replenish iron and warm your body to ease flow.",
                color: "bg-red-500" // Optional accent
            },
            nutrition_modules: [
                {
                    title: "The Fatigue Fighters",
                    goal: "Replenish Blood Loss & Boost Energy",
                    science: "Menstrual bleeding depletes your iron stores, reducing oxygen flow to muscles and the brain. This is the primary cause of tiredness and brain fog.",
                    key_ingredients: ["Iron (>70% deficient)", "Vitamin C (Absorption)"],
                    food_sources: [
                        { name: "Pumpkin Seeds", amount: "15 mg Iron", note: "Easy snack" },
                        { name: "Dark Chocolate", amount: "12 mg Iron", note: "Magnesium boost" },
                        { name: "Daal", amount: "3.3 mg", note: "Daily staple" },
                        { name: "Spinach (Palak)", amount: "2.7 mg", note: "Cooked is better" },
                        { name: "Guava", amount: "228 mg Vit C", note: "Absorption booster" },
                        { name: "Capsicum", amount: "190 mg Vit C", note: "Raw in salad" }
                    ]
                },
                {
                    title: "The Natural Painkillers",
                    goal: "Soothe Cramps & Backache",
                    science: "Cramps are caused by inflammatory chemicals called prostaglandins. Omega-3s block these chemicals, while Magnesium physically relaxes the uterine muscles to stop spasms.",
                    key_ingredients: ["Magnesium (>60% insufficient)", "Omega-3s"],
                    food_sources: [
                        { name: "Pumpkin Seeds", amount: "592 mg Mg", note: "Muscle relaxant powerhouse" },
                        { name: "Flaxseeds", amount: "392 mg Mg", note: "Double-action pain relief" },
                        { name: "Dark Chocolate 70%", amount: "228 mg Mg", note: "Mood + muscle support" },
                        { name: "Walnuts", amount: "9g Omega-3", note: "Anti-inflammatory" },
                        { name: "Almonds", amount: "270 mg Mg", note: "Easy snacking" }
                    ]
                },
                {
                    title: "The Mood Stabilizers",
                    goal: "Combat Low Mood & Irritability",
                    science: "As estrogen bottoms out, so do your 'happy hormones' (serotonin). Vitamin B6 is essential for the body to synthesize new serotonin to lift your mood.",
                    key_ingredients: ["Vitamin B6"],
                    food_sources: [
                        { name: "Sunflower Seeds", amount: "1.35 mg", note: "Hits daily RDA in 100g" },
                        { name: "Pistachios", amount: "1.7 mg", note: "Highest nut source" },
                        { name: "Banana", amount: "0.4 mg", note: "Quick mood snack" },
                        { name: "Chickpeas (Chole)", amount: "0.5 mg", note: "Sustained energy" }
                    ]
                }
            ],
            superpowers: {
                title: "Deep Intuition",
                desc: "Your connection to your inner self is strongest. Trust your gut.",
                metabolic_tip: "Your metabolism is at its baseline. You need fewer calories but higher nutrient density (iron/zinc)."
            },
            plate_ratios: {
                protein: 25,
                fat: 35,
                carb: 10,
                veg: 30
            },
            quick_guide: {
                focus: ["Warm Soups", "Cooked Veggies", "Iron-rich grains", "Ginger/Turmeric"],
                limit: ["Cold Smoothies", "Raw Salads (hard to digest)", "Caffeine", "Sugar"]
            }
        },
        fuel: [
            { title: "Iron-Rich Sources", desc: "Blood Replenishment", icon: "Droplets", scientific_benefit: "Crucial to replenish hemoglobin lost during menstruation and prevent fatigue." },
            { title: "Magnesium", desc: "Muscle Relaxation", icon: "Sparkles", scientific_benefit: "Natural muscle relaxant that reduces uterine contractions (cramps) and promotes sleep." },
            { title: "Omega-3 Fatty Acids", desc: "Anti-Inflammatory", icon: "Fish", scientific_benefit: "Inhibits prostaglandin production to significantly lower inflammation and pain sensitivity." },
            { title: "Warming Foods", desc: "Circulation", icon: "Soup", scientific_benefit: "Improves pelvic blood flow and prevents stagnation-related clotting and pain." }
        ],
        move: [
            { title: "Yin Yoga", desc: "Stretch", icon: "Moon" },
            { title: "Walking", desc: "Light", icon: "Footprints" },
            { title: "Rest Day", desc: "Recovery", icon: "Bed" },
            { title: "Stretching", desc: "Gentle", icon: "Activity" },
            { title: "Meditation", desc: "Stillness", icon: "Brain" },
            { title: "Breathwork", desc: "Calm", icon: "Wind" },
            { title: "Savasana", desc: "Deep Rest", icon: "Moon" },
            { title: "Slow Flow", desc: "Gentle Move", icon: "Waves" }
        ],
        rituals: [
            { title: "Warm Bath", desc: "Evening", icon: "Waves" },
            { title: "Journaling", desc: "Reflect", icon: "Book" },
            { title: "Nap", desc: "Rest", icon: "Moon" },
            { title: "Early Bedtime", desc: "Sleep", icon: "Clock" },
            { title: "Reading", desc: "Quiet", icon: "BookOpen" },
            { title: "Audiobook", desc: "Relax", icon: "Headphones" },
            { title: "Phone Putaway", desc: "Detox", icon: "Smartphone" },
            { title: "Face Mask", desc: "Self Care", icon: "Sparkles" }
        ],
        snapshot: [
            {
                hormones: { title: "Low Levels", desc: "Baseline state." },
                mind: { title: "Reflective", desc: "Introspective mood." },
                body: { title: "Recharging", desc: "Low energy." },
                skin: { title: "Sensitive", desc: "Dryness prone." }
            },
            {
                hormones: { title: "Resetting", desc: "Shedding lining." },
                mind: { title: "Intuitive", desc: "Trust gut." },
                body: { title: "Cleansing", desc: "Detox mode." },
                skin: { title: "Fragile", desc: "Hydrate well." }
            },
            {
                hormones: { title: "Quiet", desc: "Hormonal winter." },
                mind: { title: "Dreamy", desc: "Deep thoughts." },
                body: { title: "Slow", desc: "Honoring rest." },
                skin: { title: "Clear", desc: "Less oil." }
            }
        ],
        plan: {
            hormones: {
                summary: "Estrogen & progesterone are at their lowest.",
                symptoms: ["Energy Dips", "Cramps", "Mood Sensitivity", "Inflammation"]
            },
            diet: {
                ideal_meals: [
                    { time: "Morning", title: "Warm & Grounding", items: ["Jeera-ajwain warm water", "Moong dal / Veg poha", "Ragi porridge w/ jaggery", "Ginger/Tulsi tea"], icon: "Sunrise" },
                    { time: "Lunch", title: "Iron & Mineral Rich", items: ["Moong dal khichdi w/ ghee", "Spinach/Methi dal", "Brown rice / Soft phulkas", "Beet-carrot salad"], icon: "Sun" },
                    { time: "Snack", title: "Magnesium Boost", items: ["Roasted makhana", "Walnuts + Fruit", "Turmeric latte"], icon: "Coffee" },
                    { time: "Dinner", title: "Light & Soothing", items: ["Veg daliya / thin dal soup", "Palak tofu / Bottle gourd", "Steamed sweet potato"], icon: "Moon" }
                ],
                cramp_relief: ["Ginger & Turmeric", "Sesame Seeds", "Bananas", "Jaggery", "Miso / Soups"],
                avoid: ["Cold foods (smoothies)", "Fried foods", "Excess caffeine", "Refined sugar"]
            },
            exercise: {
                summary: "Low-intensity restorative movement improves wellbeing without stressing the system.",
                avoid: ["HIIT", "Running", "Heavy Strength", "Intense Core"]
            },
            supplements: [
                { name: "Magnesium Glycinate", dose: "200–350 mg", why: "Reduce cramps & sleep" },
                { name: "Iron", dose: "Low dose", why: "Restore blood loss" },
                { name: "Vitamin C", dose: "With iron", why: "Absorption" },
                { name: "B12", dose: "Daily", why: "Energy support" }
            ],
            daily_flow: [
                { time: "Morning", activity: "Warm ginger water → Light breakfast → Yoga" },
                { time: "Afternoon", activity: "Khichdi + Greens → 15min Walk" },
                { time: "Evening", activity: "Warm snack → Stretching" },
                { time: "Night", activity: "Light soup → Magnesium → Early sleep" }
            ]
        }
    },

    "Follicular": {
        river: [
            "Dream • Plan • Initiate", "Spark • Begin • Rise", "Fresh • New • Start",
            "Bloom • Open • Grow", "Energy • Ideas • Action", "Spring • Awakening • Light"
        ],
        nutrition_guide: {
            header: {
                title: "Follicular Phase",
                hormone_insight: "Estrogen is rising, energy is climbing.",
                narrative: "Your body is preparing to release an egg. Energy is returning.",
                goal: "Fuel rising energy with fresh, light, fermented foods.",
                color: "bg-pink-400"
            },
            symptom_decoder: {
                title: "Follicular Phase",
                subtitle: "Dream, Plan, Initiate",
                cards: [
                    { title: "Restless Energy", condition: "Anxiety", biology: "Estrogen rising rapidly.", fix: "Clean Protein stabilizes blood sugar." },
                    { title: "Histamine Flare", condition: "Allergies", biology: "Estrogen triggers mast cells.", fix: "Vitamin C to stabilize cells." },
                    { title: "Sluggish Gut", condition: "Bloat", biology: "Hormone shift.", fix: "Probiotics to support estrobolome." }
                ]
            },
            macro_fuel: {
                title: "Today's Fuel Mix",
                protein: 30, fats: 20, carbs: 50
            },
            cheat_sheet: {
                focus: { title: "FOCUS ON", items: ["Sprouted Grains", "Fermented Foods", "Fresh Fruit"] },
                avoid: { title: "AVOID", items: ["Heavy Fats", "Alcohol", "Processed Food"] }
            },
            ai_chef: {
                prompt: "👩‍🍳 Tap your goal:",
                options: [
                    { label: "⚡ Energy", meal_name: "The Power Bowl", ingredients: "Quinoa + Chicken + Kimchi", why: "Sustained energy for rising hormones." },
                    { label: "🤧 Clear Skin", meal_name: "The Glow Salad", ingredients: "Spinach + Citrus + Salmon", why: "Vitamin C fights histamine." },
                    { label: "🧠 Focus", meal_name: "Brain Breakfast", ingredients: "Oats + Berries + Walnuts", why: "Complex carbs for ideation." }
                ]
            }
        },
        fuel: [
            { title: "Probiotic Foods", desc: "Gut Health", icon: "Beaker", scientific_benefit: "Optimizes the gut estrobolome to metabolize rising estrogen efficiently." },
            { title: "Healthy Fats", desc: "Hormone Synthesis", icon: "Leaf", scientific_benefit: "Provides cholesterol, the primary building block for steroid hormones." },
            { title: "Lean Protein", desc: "Follicle Structure", icon: "Bean", scientific_benefit: "Essential amino acids support the structural development of the dominant follicle." },
            { title: "Zinc-Rich Foods", desc: "Cell Division", icon: "Circle", scientific_benefit: "Supports rapid cell division and maturation of the egg before ovulation." }
        ],
        move: [
            { title: "Cardio Run", desc: "Endurance", icon: "Wind" },
            { title: "Dance", desc: "Fun", icon: "Music" },
            { title: "Hiking", desc: "Nature", icon: "Mountain" },
            { title: "Zumba", desc: "Rhythm", icon: "Music" },
            { title: "Running", desc: "Stamina", icon: "Footprints" },
            { title: "Vinyasa Yoga", desc: "Flow", icon: "Sun" },
            { title: "Cycling", desc: "Cardio", icon: "Bike" }
        ],
        rituals: [
            { title: "Goal Setting", desc: "Plan", icon: "Target" },
            { title: "Socializing", desc: "Connect", icon: "Users" },
            { title: "Vision Board", desc: "Create", icon: "Image" },
            { title: "Brainstorming", desc: "Ideas", icon: "Lightbulb" },
            { title: "Trying New", desc: "Novelty", icon: "Star" }
        ],
        snapshot: [
            {
                hormones: { title: "Estrogen Rising", desc: "Energy climbing." },
                mind: { title: "Creative", desc: "Idea generation." },
                body: { title: "Light", desc: "High stamina." },
                skin: { title: "Glowing", desc: "Collagen up." }
            },
            {
                hormones: { title: "Optimistic", desc: "Mood lifting." },
                mind: { title: "Curious", desc: "Want to learn." },
                body: { title: "Active", desc: "Ready to move." },
                skin: { title: "Bright", desc: "Radiance returns." }
            }
        ],
        plan: {
            hormones: {
                summary: "Estrogen is rising, boosting energy.",
                symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
            },
            diet: {
                ideal_meals: [
                    { time: "Morning", title: "Fresh & Light", items: ["Green smoothie", "Oats with berries", "Avocado toast", "Lemon water"], icon: "Sunrise" },
                    { time: "Lunch", title: "Energizing Bowl", items: ["Quinoa salad", "Grilled chicken/tofu", "Kimchi/Sauerkraut", "Fresh fruits"], icon: "Sun" },
                    { time: "Snack", title: "Crunchy & Fresh", items: ["Apple slices", "Carrot sticks + Hummus", "Pumpkin seeds"], icon: "Coffee" },
                    { time: "Dinner", title: "Balanced", items: ["Stir-fried veggies", "Lean fish/paneer", "Wild rice"], icon: "Moon" }
                ],
                cramp_relief: ["Flax seeds", "Leafy greens", "Citrus fruits", "Berries", "Clean protein"],
                avoid: ["Heavy oils", "Processed snacks", "Alcohol (moderation)", "Excess dairy"]
            },
            exercise: {
                summary: "Ramp up intensity. Try new classes and build cardio endurance.",
                avoid: ["Overtraining (rest days still needed)", "Heavy lifting without warmup"]
            },
            supplements: [
                { name: "Probiotics", dose: "Daily", why: "Gut health & estrogen metabolism" },
                { name: "B-Complex", dose: "Daily", why: "Energy production" },
                { name: "Zinc", dose: "15-30mg", why: "Follicle health" },
                { name: "Vitamin E", dose: "Daily", why: "Skin & inflammation" }
            ],
            daily_flow: [
                { time: "Morning", activity: "Lemon water → Cardio/Run → Fresh Breakfast" },
                { time: "Afternoon", activity: "Salad/Grain Bowl → Creative Work" },
                { time: "Evening", activity: "Socializing → Light Dinner" },
                { time: "Night", activity: "Reading → Planning tomorrow" }
            ]
        }
    },

    "Ovulatory": {
        river: [
            "Connect • Shine • Magnetize", "Peak • Power • Glow", "Yes • Open • Receive",
            "Fire • Passion • Express", "Radiate • Attract • Be"
        ],
        nutrition_guide: {
            header: {
                title: "Ovulatory Phase",
                hormone_insight: "Peak Estrogen & Testosterone.",
                narrative: "You are at your most magnetic and energetic.",
                goal: "Support liver detox and cool down high internal heat.",
                color: "bg-purple-500"
            },
            symptom_decoder: {
                title: "Ovulatory Phase",
                subtitle: "Connect, Shine, Magnetize",
                cards: [
                    { title: "Hormonal Acne", condition: "Breakouts", biology: "Peak testosterone leads to oil.", fix: "Zinc to regulate oil production." },
                    { title: "Ovulation Bloat", condition: "Puffy", biology: "Egg release is inflammatory.", fix: "Anti-inflammatory foods." },
                    { title: "High Body Heat", condition: "Hot Flashes", biology: "Metabolic peak.", fix: "Cooling hydrating foods." }
                ]
            },
            macro_fuel: {
                title: "Today's Fuel Mix",
                protein: 25, fats: 25, carbs: 50
            },
            cheat_sheet: {
                focus: { title: "FOCUS ON", items: ["Raw Veggies", "Cruciferous Veg", "Berries"] },
                avoid: { title: "AVOID", items: ["Red Meat", "Fried Food", "Sugar"] }
            },
            ai_chef: {
                prompt: "👩‍🍳 Tap for support:",
                options: [
                    { label: "✨ Glow", meal_name: "Skin Clearing Salad", ingredients: "Chickpeas + Pumpkin Seeds + Greens", why: "Zinc clears skin congestion." },
                    { label: "🧊 Cool Down", meal_name: "Hydration Bowl", ingredients: "Cucumber + Melon + Mint", why: "Cools internal body heat." },
                    { label: "🎈 De-Bloat", meal_name: "Anti-Inflammatory Wrap", ingredients: "Turmeric Tofu + Lettuce Wrap", why: "Reduces ovulation inflammation." }
                ]
            }
        },
        fuel: [
            { title: "High Fiber", desc: "Estrogen Detox", icon: "Wheat", scientific_benefit: "Binds to excess estrogen in the gut to prevent dominance symptoms like acne." },
            { title: "Antioxidants", desc: "Cell Protection", icon: "Shield", scientific_benefit: "Protects the ovum from oxidative damage during the inflammatory process of ovulation." },
            { title: "Glutathione Support", desc: "Liver Health", icon: "Beaker", scientific_benefit: "Supports the liver's phase 2 detoxification pathway to clear hormones." },
            { title: "Cooling Foods", desc: "Thermoregulation", icon: "Droplets", scientific_benefit: "Balances the natural spike in basal body temperature post-ovulation." }
        ],
        move: [
            { title: "HIIT", desc: "Intensity", icon: "Zap" },
            { title: "Spin Class", desc: "Power", icon: "Bike" },
            { title: "Boxing", desc: "Strength", icon: "Sword" },
            { title: "Power Yoga", desc: "Heat", icon: "Sun" },
            { title: "Sprinting", desc: "Speed", icon: "Wind" },
            { title: "Group Class", desc: "Social", icon: "Users" }
        ],
        rituals: [
            { title: "Networking", desc: "Speak", icon: "Mic" },
            { title: "Date Night", desc: "Fun", icon: "Heart" },
            { title: "Hosting", desc: "Community", icon: "Home" },
            { title: "Presentation", desc: "Lead", icon: "Briefcase" },
            { title: "Volunteering", desc: "Give", icon: "HeartHandshake" }
        ],
        snapshot: [
            {
                hormones: { title: "Peak Estro", desc: "Magnetic vibe." },
                mind: { title: "Sharp", desc: "Clear thoughts." },
                body: { title: "Strong", desc: "Peak performance." },
                skin: { title: "Radiant", desc: "Natural glow." }
            },
            {
                hormones: { title: "Testosterone", desc: "Libido high." },
                mind: { title: "Confident", desc: "Take risks." },
                body: { title: "Resilient", desc: "Max endurance." },
                skin: { title: "Clear", desc: "Small pores." }
            }
        ],
        plan: {
            hormones: {
                summary: "Estrogen at peak, testosterone surge.",
                symptoms: ["Peak Energy", "High Libido", "Confidence", "Social Buzz"]
            },
            diet: {
                ideal_meals: [
                    { time: "Morning", title: "Fiber Start", items: ["Chia pudding", "Fruit salad", "Smoothie bowl", "Cool water"], icon: "Sunrise" },
                    { time: "Lunch", title: "Raw & Fresh", items: ["Huge raw salad", "Sprouts", "Lentils", "Cucumber juice"], icon: "Sun" },
                    { time: "Snack", title: "Energy", items: ["Almonds", "Dark chocolate", "Berries"], icon: "Coffee" },
                    { time: "Dinner", title: "Light Fiber", items: ["Steamed broccoli", "Fish/Tofu", "Quinoa"], icon: "Moon" }
                ],
                cramp_relief: ["Raw carrots", "Brussels sprouts", "Berries", "Turmeric", "Green tea"],
                avoid: ["Heavy carbs", "Red meat (limit)", "Excess heat/spice", "Alcohol"]
            },
            exercise: {
                summary: "Peak performance. Go for your PRs and high-intensity workouts.",
                avoid: ["Overheating without hydration", "Sleep deprivation"]
            },
            supplements: [
                { name: "NAC", dose: "600mg", why: "Liver support (estrogen detox)" },
                { name: "Glutathione", dose: "Optional", why: "Antioxidant support" },
                { name: "Magnesium", dose: "Daily", why: "Recovery" },
                { name: "Zinc", dose: "Daily", why: "Immunity" }
            ],
            daily_flow: [
                { time: "Morning", activity: "HIIT Workout → High Fiber Breakfast" },
                { time: "Afternoon", activity: "Raw Lunch → Important Meetings" },
                { time: "Evening", activity: "Social Event / Date Night" },
                { time: "Night", activity: "Wind down routine → Sleep mask" }
            ]
        }
    },

    "Luteal": {
        river: [
            "Organize • Nest • Complete", "Focus • Finish • Ground", "Settle • Sort • Slow",
            "Root • Anchor • Hold", "Detail • Depth • Clarity"
        ],
        nutrition_guide: {
            header: {
                title: "Luteal Phase",
                hormone_insight: "Progesterone rises, then drops.",
                narrative: "Your body is winding down. Cravings signal energy needs.",
                goal: "Stabilize blood sugar and boost mood with complex carbs.",
                color: "bg-orange-400"
            },
            symptom_decoder: {
                title: "Luteal Phase",
                subtitle: "Organize, Nest, Complete",
                cards: [
                    { title: "PMS Moodiness", condition: "Irritable", biology: "Serotonin dropping.", fix: "B6 for mood boost." },
                    { title: "Sugar Cravings", condition: "Hungry", biology: "Blood sugar unstable.", fix: "Complex carbs stabilize." },
                    { title: "Water Retention", condition: "Bloated", biology: "Progesterone spike.", fix: "Potassium flushes sodium." }
                ]
            },
            macro_fuel: {
                title: "Today's Fuel Mix",
                protein: 25, fats: 35, carbs: 40
            },
            cheat_sheet: {
                focus: { title: "FOCUS ON", items: ["Roasted Root Veggies", "Wholegrains", "Magnesium Foods"] },
                avoid: { title: "AVOID", items: ["Salt", "Raw Salads", "Caffeine"] }
            },
            ai_chef: {
                prompt: "👩‍🍳 Tap for support:",
                options: [
                    { label: "🍫 Cravings", meal_name: "Comfort Cacao Oats", ingredients: "Oats + Cacao + Walnuts", why: "Magnesium fights cravings." },
                    { label: "😭 PMS", meal_name: "Happy Hummus Toast", ingredients: "Chickpeas + Toast + Seeds", why: "B6 boosts serotonin." },
                    { label: "🎈 Bloat", meal_name: "Flush Smoothie", ingredients: "Banana + Coconut Water", why: "Potassium reduces retention." }
                ]
            }
        },
        fuel: [
            { title: "Sweet Potato", desc: "Carbs", icon: "Carrot", scientific_benefit: "Promotes serotonin production to combat PMS mood dips and irritability." },
            { title: "Brown Rice", desc: "Stability", icon: "Soup", scientific_benefit: "Vitamin B6 helps liver metabolize estrogen, reducing breast tenderness." },
            { title: "Walnuts", desc: "Omega-3", icon: "Nut", scientific_benefit: "Essential fatty acids reduce prostaglandin production and pre-period cramping." },
            { title: "Dark Leafy Greens", desc: "Magnesium", icon: "Leaf", scientific_benefit: "Magnesium is critical for preventing water retention and sugar cravings." },
            { title: "Chickpeas", desc: "B6", icon: "Bean", scientific_benefit: "Vitamin B6 helps synthesize neurotransmitters like dopamine to improve focus." },
            { title: "Banana", desc: "Potassium", icon: "Banana", scientific_benefit: "Reduces water retention and bloating by balancing sodium levels." },
            { title: "Dark Chocolate", desc: "Cravings", icon: "Cookie", scientific_benefit: "Magnesium content relaxes muscles and reduces anxiety." },
            { title: "Peppermint Tea", desc: "Bloat", icon: "Leaf", scientific_benefit: "Antispasmodic properties soothe the digestive tract and reduce bloating." },
            { title: "Apple", desc: "Fiber", icon: "Apple", scientific_benefit: "Pectin fiber aids in elimination, preventing constipation common in luteal phase." }
        ],
        move: [
            { title: "Pilates", desc: "Core", icon: "Activity" },
            { title: "Strength", desc: "Slow Burn", icon: "Dumbbell" },
            { title: "Yoga Sculpt", desc: "Tone", icon: "Sun" },
            { title: "Walking", desc: "Steady", icon: "Footprints" },
            { title: "Barre", desc: "Control", icon: "Music" },
            { title: "Swimming", desc: "Low Impact", icon: "Waves" }
        ],
        rituals: [
            { title: "Decluttering", desc: "Clean", icon: "Home" },
            { title: "Epsom Soak", desc: "Relax", icon: "Droplets" },
            { title: "Budgeting", desc: "Plan", icon: "DollarSign" },
            { title: "Cooking", desc: "Nourish", icon: "Utensils" },
            { title: "Organizing", desc: "Order", icon: "Folder" }
        ],
        snapshot: [
            {
                hormones: { title: "Progesterone", desc: "Calming." },
                mind: { title: "Detailed", desc: "Focus mode." },
                body: { title: "Heavy", desc: "Slow down." },
                skin: { title: "Oily", desc: "Congestion." }
            },
            {
                hormones: { title: "Winding Down", desc: "PMS check." },
                mind: { title: "Analytical", desc: "Problem solving." },
                body: { title: "Warm", desc: "Temp rises." },
                skin: { title: "Hydrate", desc: "Prevent breakout." }
            }
        ],
        plan: {
            hormones: {
                summary: "Progesterone rises, then drops.",
                symptoms: ["PMS Possible", "Bloating", "Cravings", "Introversion"]
            },
            diet: {
                ideal_meals: [
                    { time: "Morning", title: "Stable Cabs", items: ["Oatmeal w/ seeds", "Sweet potato hash", "Avocado toast", "Herbal tea"], icon: "Sunrise" },
                    { time: "Lunch", title: "Grain Bowl", items: ["Brown rice + Beans", "Roasted root veggies", "Chickpea curry", "Soup"], icon: "Sun" },
                    { time: "Snack", title: "Cravings Fix", items: ["Dark chocolate", "Apple + Nut butter", "Roasted chickpeas"], icon: "Coffee" },
                    { time: "Dinner", title: "Comforting", items: ["Baked potato", "Turkey/Tofu stir fry", "Warm golden milk"], icon: "Moon" }
                ],
                cramp_relief: ["Sweet potato", "Dark chocolate (>70%)", "Walnuts", "Sunflower seeds", "Chickpeas"],
                avoid: ["Excess salt", "Refined sugar", "Alcohol", "Caffeine (increases anxiety)"]
            },
            exercise: {
                summary: "Scale back intensity. Focus on strength maintenance and steady state cardio.",
                avoid: ["Heavy HIIT (late phase)", "Jumping/Plyometrics", "Overexertion"]
            },
            supplements: [
                { name: "Vitamin B6", dose: "50-100mg", why: "Mood & PMS" },
                { name: "Magnesium", dose: "300mg+", why: "Bloating & Anxiety" },
                { name: "Omega-3", dose: "Daily", why: "Inflammation" },
                { name: "Ashwagandha", dose: "Optional", why: "Stress reduction" }
            ],
            daily_flow: [
                { time: "Morning", activity: "Gentle stretch → Complex Carb Breakfast" },
                { time: "Afternoon", activity: "Focus Work → Roasted Snack" },
                { time: "Evening", activity: "Pilates/Strength → Warm Dinner" },
                { time: "Night", activity: "Journaling → Tea → Early Bed" }
            ]
        }
    }
};
