export const BLUEPRINTS: any = {
    "Menstrual": {
        color: "bg-phase-menstrual",
        hormones: {
            title: "Hormones Now",
            summary: "Estrogen & progesterone are lowest.",
            desc: "Your body is shedding & renewing. Treat this phase like your 'inner winter'.",
            symptoms: ["Energy Dips", "Cramps", "Mood Sensitivity", "Inflammation"]
        },
        rituals: {
            focus: "Rest & Restore",
            practices: [
                { title: "Journaling", desc: "Reflect on the past month", icon: "Book" },
                { title: "Yoga Nidra", desc: "Deep conscious rest", icon: "Moon" },
                { title: "Salt Bath", desc: "Magnesium absorption & relaxation", icon: "Waves" },
                { title: "Phone Detox", desc: "Reduce sensory input", icon: "Ban" }
            ],
            symptom_relief: [
                { symptom: "Cramps", remedy: "Castor Oil Pack" },
                { symptom: "Fatigue", remedy: "Legs Up The Wall" }
            ]
        },
        diet: {
            core_needs: [
                { id: "iron", title: "Iron-Rich", desc: "Restore blood loss", icon: "Droplets" },
                { id: "magnesium", title: "Magnesium", desc: "Reduce cramps", icon: "Pill" },
                { id: "omega", title: "Omega-3", desc: "Reduce pain", icon: "Fish" },
                { id: "warm", title: "Warm Foods", desc: "Support digestion", icon: "Soup" }
            ],
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
            time: "20",
            unit: "mins",
            intensity: "Low",
            type: "Restorative movement",
            best: [
                { title: "Gentle Yoga", desc: "Focuses on opening the hips and releasing lower back tension. Poses like Child's Pose and Butterfly help alleviate uterine cramping and soothe the nervous system.", time: "10–20 mins" },
                { title: "Walking", desc: "Light, unhurried walking promotes gentle blood circulation without spiking cortisol. It naturally reduces pelvic congestion and clears mental fog.", time: "20–30 mins" },
                { title: "Breathwork", desc: "Deep diaphragmatic breathing activates the parasympathetic nervous system. This direct relaxation response reduces pain perception and stress hormones.", time: "5 mins" },
                { title: "Stretching", desc: "Targeted holds for the lower back, hamstrings, and hip flexors. Relieves the referred pain and muscle tightness often associated with menstruation.", time: "10 mins" }
            ],
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 1800, protein: 60, fats: 65, carbs: 220,
                proteinLabel: "60g", fatsLabel: "High (Support)", carbsLabel: "Comfort (Mod)",
                proteinDesc: "Protein (Blood Replenishment)",
                fatsDesc: "Healthy Fats (Block Cramps)",
                carbsDesc: "Complex Carbs (Comfort)"
            },
            symptom_decoder: {
                title: "Period Symptoms",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Cramps", condition: "Lower abdominal pain", biology: "Prostaglandins trigger uterine contractions to shed lining", diet: "Ginger tea, dark chocolate, salmon, turmeric" },
                    { title: "Fatigue", condition: "Feeling drained", biology: "Iron loss from bleeding + low estrogen & progesterone", diet: "Spinach, red meat, lentils, pumpkin seeds" },
                    { title: "Headaches", condition: "Throbbing pain", biology: "Sudden estrogen drop affects blood vessels in brain", diet: "Magnesium-rich foods, almonds, avocado, water" },
                    { title: "Lower Back Pain", condition: "Aching back", biology: "Prostaglandins cause contractions that radiate to lower back", diet: "Anti-inflammatory foods, fatty fish, walnuts" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Warm Foods", "Iron", "Rest"] },
                avoid: { title: "What to Limit", items: ["Cold Salads", "Caffeine", "Refined Sugar"] }
            }
        }
    },
    "Follicular": {
        color: "bg-phase-follicular",
        hormones: {
            title: "Hormones Rising",
            summary: "Estrogen is rising, boosting energy.",
            desc: "Your 'inner spring'. Creativity and energy are increasing as follicles mature.",
            symptoms: ["Increasing Energy", "Better Mood", "Curiosity", "Lightness"]
        },
        rituals: {
            focus: "Rising Energy",
            practices: [
                { title: "Vision Boarding", desc: "Plan your month ahead", icon: "Sun" },
                { title: "Morning Pages", desc: "Brain dump ideas", icon: "Book" },
                { title: "Social Planning", desc: "Book friend dates", icon: "Users" },
                { title: "Learn Skill", desc: "Try something new", icon: "Brain" }
            ],
            symptom_relief: [
                { symptom: "Restlessness", remedy: "Dancing/Shaking" },
                { symptom: "Overthinking", remedy: "Brain Dump Journaling" }
            ]
        },
        diet: {
            core_needs: [
                { id: "fresh", title: "Fresh Veggies", desc: "Support liver detox", icon: "Leaf" },
                { id: "probiotic", title: "Probiotics", desc: "Gut health", icon: "Beaker" },
                { id: "protein", title: "Lean Protein", desc: "Muscle repair", icon: "Drumstick" },
                { id: "hydration", title: "Hydration", desc: "Support fluid balance", icon: "Droplets" }
            ],
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
            time: "45",
            unit: "mins",
            intensity: "Moderate",
            type: "Cardio",
            best: [
                { title: "Cardio / Hikes", desc: "Rising estrogen boosts your stamina and pain tolerance. This is the perfect time to push your cardiovascular endurance with running, cycling, or brisk outdoor hikes.", time: "30-45 mins" },
                { title: "Flow Yoga", desc: "Dynamic, faster-paced Vinyasa flows match your increasing energy levels. Great for building heat, flexibility, and mind-body connection.", time: "45 mins" },
                { title: "Strength", desc: "Your muscles recover faster in this phase. Incorporate light to moderate weights and resistance bands to build lean muscle tone efficiently.", time: "30 mins" },
                { title: "Try New Things", desc: "High neuroplasticity and confidence make this the optimal time to learn complex motor skills. Try a new dance class, boxing, or bouldering.", time: "Variable" }
            ],
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 2000, protein: 75, fats: 55, carbs: 260,
                proteinLabel: "75g", fatsLabel: "Low (Light)", carbsLabel: "High (Energy)",
                proteinDesc: "Protein (Muscle Repair)",
                fatsDesc: "Healthy Fats (Hormone Synthesis)",
                carbsDesc: "Complex Carbs (Building Energy)"
            },
            symptom_decoder: {
                title: "Rising Energy",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Energy Surge", condition: "Feeling motivated", biology: "Rising estrogen boosts dopamine & serotonin levels", diet: "Lean protein, fresh fruits, green smoothies" },
                    { title: "Clear Skin", condition: "Glowing complexion", biology: "Estrogen promotes collagen & reduces sebum production", diet: "Berries, citrus fruits, leafy greens, water" },
                    { title: "Increased Focus", condition: "Mental clarity", biology: "Estrogen enhances cognitive function & memory", diet: "Omega-3s, walnuts, blueberries, eggs" },
                    { title: "Light Cervical Mucus", condition: "Vaginal changes", biology: "Estrogen starts producing cervical fluid for fertility", diet: "Hydrating foods, cucumber, watermelon" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Fresh Veggies", "Probiotics", "Lean Protein"] },
                avoid: { title: "What to Limit", items: ["Heavy Oils", "Processed Sugar"] }
            }
        }
    },
    "Ovulatory": {
        color: "bg-phase-ovulatory",
        hormones: {
            title: "Peak Hormones",
            summary: "Estrogen at peak, testosterone surge.",
            desc: "Your 'inner summer'. You are magnetic, verbal, and energetic.",
            symptoms: ["Peak Energy", "High Libido", "Confidence", "Social Buzz"]
        },
        rituals: {
            focus: "Peak Performance",
            practices: [
                { title: "Community", desc: "Host a gathering", icon: "Users" },
                { title: "Gratitude", desc: "Express appreciation", icon: "Heart" },
                { title: "Date Night", desc: "Romantic or self-date", icon: "Heart" },
                { title: "Public Speaking", desc: "Pitch ideas now", icon: "Mic" }
            ],
            symptom_relief: [
                { symptom: "Overstimulation", remedy: "Dim Lighting" },
                { symptom: "Skin Breakout", remedy: "Ice Roller" }
            ]
        },
        diet: {
            core_needs: [
                { id: "fiber", title: "Fiber", desc: "Bind excess estrogen", icon: "Wheat" },
                { id: "antiox", title: "Antioxidants", desc: "Cell protection", icon: "Shield" },
                { id: "cruciferous", title: "Cruciferous", desc: "Detox support", icon: "Leaf" },
                { id: "cooling", title: "Cooling Foods", desc: "Balance body heat", icon: "Wind" }
            ],
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
            time: "60",
            unit: "mins",
            intensity: "High",
            type: "HIIT",
            best: [
                { title: "HIIT", desc: "Estrogen and testosterone are at their absolute peak, giving you maximum power output. High-intensity intervals and bootcamps yield the best results right now.", time: "20-30 mins" },
                { title: "Spin Class", desc: "Capitalize on your peak cardiovascular capacity and high energy. Fast-paced, music-driven spin classes perfectly match your social and physical buzz.", time: "45 mins" },
                { title: "Heavy Lifting", desc: "Testosterone spikes make this your strongest phase of the month. Focus on heavy compound lifts and aim for new personal records.", time: "45 mins" },
                { title: "Group Sports", desc: "Your verbal and social skills are peaking alongside your physical energy. Team sports or group fitness classes will feel highly rewarding.", time: "Variable" }
            ],
            avoid: ["Explosive/high-impact moves without a proper warm-up — ligaments are looser this week", "Overheating without hydration", "Sleep deprivation"]
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 2100, protein: 80, fats: 60, carbs: 280,
                proteinLabel: "80g", fatsLabel: "Low (Digestion)", carbsLabel: "Peak (Fuel)",
                proteinDesc: "Protein (Support)",
                fatsDesc: "Healthy Fats (Anti-Inflammatory)",
                carbsDesc: "Complex Carbs (Peak Fuel)"
            },
            symptom_decoder: {
                title: "Peak Performance",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Ovulation Pain", condition: "One-sided pelvic twinge", biology: "Egg releasing from ovary can cause mild pain (Mittelschmerz)", diet: "Anti-inflammatory foods, turmeric, ginger" },
                    { title: "Increased Libido", condition: "Heightened desire", biology: "Peak estrogen & testosterone boost sex drive", diet: "Zinc-rich foods, oysters, pumpkin seeds" },
                    { title: "Breast Tenderness", condition: "Sensitive chest", biology: "Hormonal surge causes breast tissue swelling", diet: "Low-sodium foods, flaxseeds, evening primrose" },
                    { title: "Light Spotting", condition: "Minor bleeding", biology: "Estrogen dip during ovulation can cause spotting", diet: "Iron-rich foods, beets, leafy greens" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Fiber", "Cruciferous Veg", "Antioxidants"] },
                avoid: { title: "What to Limit", items: ["Alcohol", "Heavy Carbs"] }
            }
        }
    },
    "Luteal": {
        color: "bg-phase-luteal",
        hormones: {
            title: "Progesterone Rise",
            summary: "Progesterone rises, then drops.",
            desc: "Your 'inner autumn'. Winding down, focusing on completion and detail.",
            symptoms: ["PMS Possible", "Bloating", "Cravings", "Introversion"]
        },
        rituals: {
            focus: "Winding Down",
            practices: [
                { title: "Declutter", desc: "Organize your space", icon: "Home" },
                { title: "Boundaries", desc: "Say no to extra plans", icon: "Shield" },
                { title: "Budgeting", desc: "Review finances", icon: "FileText" },
                { title: "Self-Care", desc: "Spa night at home", icon: "Flower2" }
            ],
            symptom_relief: [
                { symptom: "PMS", remedy: "Magnesium Spray" },
                { symptom: "Anxiety", remedy: "Box Breathing" }
            ]
        },
        diet: {
            core_needs: [
                { id: "complex_carbs", title: "Complex Carbs", desc: "Mood stability", icon: "Wheat" },
                { id: "b6", title: "Vitamin B6", desc: "Reduce PMS", icon: "Pill" },
                { id: "magnesium", title: "Magnesium", desc: "Relaxation", icon: "Pill" },
                { id: "fiber", title: "Fiber", desc: "Prevent bloating", icon: "Leaf" }
            ],
            ideal_meals: [
                { time: "Morning", title: "Stable Carbs", items: ["Oatmeal w/ seeds", "Sweet potato hash", "Avocado toast", "Herbal tea"], icon: "Sunrise" },
                { time: "Lunch", title: "Grain Bowl", items: ["Brown rice + Beans", "Roasted root veggies", "Chickpea curry", "Soup"], icon: "Sun" },
                { time: "Snack", title: "Cravings Fix", items: ["Dark chocolate", "Apple + Nut butter", "Roasted chickpeas"], icon: "Coffee" },
                { time: "Dinner", title: "Comforting", items: ["Baked potato", "Turkey/Tofu stir fry", "Warm golden milk"], icon: "Moon" }
            ],
            cramp_relief: ["Sweet potato", "Dark chocolate (>70%)", "Walnuts", "Sunflower seeds", "Chickpeas"],
            avoid: ["Excess salt", "Refined sugar", "Alcohol", "Caffeine (increases anxiety)"]
        },
        exercise: {
            summary: "Scale back intensity. Focus on strength maintenance and steady state cardio.",
            time: "40",
            unit: "mins",
            intensity: "Mod-High",
            type: "Strength",
            best: [
                { title: "Pilates", desc: "As energy begins to taper, shift focus to core control, alignment, and stability. Pilates provides a deep burn without drastically spiking cortisol.", time: "30-40 mins" },
                { title: "Strength", desc: "Maintain your muscle mass with moderate weights and lower reps. Avoid training to failure, focusing instead on form and steady progression.", time: "30 mins" },
                { title: "Hiking/Walking", desc: "Steady-state, low-impact cardio in nature helps manage PMS symptoms and stabilizes mood by naturally boosting serotonin levels.", time: "45 mins" },
                { title: "Gentle/Restorative", desc: "In the late luteal phase (days right before your period), scale back to gentle stretching to manage pre-menstrual fatigue and bloating.", time: "20 mins" }
            ],
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
        ],
        nutrition_guide: {
            macro_fuel: {
                calories: 1900, protein: 70, fats: 70, carbs: 240,
                proteinLabel: "70g", fatsLabel: "High (Satiety)", carbsLabel: "Low (Stable)",
                proteinDesc: "Protein (Stabilize)",
                fatsDesc: "Healthy Fats (Mood Stability)",
                carbsDesc: "Complex Carbs (Fight Cravings)"
            },
            symptom_decoder: {
                title: "PMS Decoder",
                subtitle: "Body Literacy",
                cards: [
                    { title: "Bloating", condition: "Puffy/swollen feeling", biology: "Progesterone slows digestion & causes water retention", diet: "Potassium-rich bananas, asparagus, cucumber" },
                    { title: "Mood Swings", condition: "Emotional ups & downs", biology: "Progesterone drop affects serotonin & GABA levels", diet: "Complex carbs, oatmeal, sweet potato" },
                    { title: "Cravings", condition: "Sugar/carb hunger", biology: "Serotonin dip triggers comfort food cravings", diet: "Dark chocolate, dates, whole grains" },
                    { title: "Acne Breakouts", condition: "Skin flare-ups", biology: "Rising testosterone increases sebum production", diet: "Zinc, probiotics, low-glycemic foods" },
                    { title: "Breast Tenderness", condition: "Sore/heavy feeling", biology: "Progesterone causes fluid retention in breast tissue", diet: "Reduce caffeine, add vitamin E, flaxseeds" },
                    { title: "Insomnia", condition: "Trouble sleeping", biology: "Progesterone (a sedative) drops before period", diet: "Magnesium, chamomile tea, tart cherry" }
                ]
            },
            cheat_sheet: {
                focus: { title: "What to Eat", items: ["Complex Carbs", "Magnesium", "Healthy Fats"] },
                avoid: { title: "What to Limit", items: ["Salt", "Sugar", "Caffeine"] }
            }
        }
    }
};
