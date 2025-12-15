
export type PhaseContent = {
    river: string[];
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
        fuel: [
            // VEGAN
            { title: "Garden Cress (Halim)", desc: "Iron Bomb", icon: "Leaf", category: "vegan", scientific_benefit: "Richest plant source of iron; traditionally used to recover from blood loss." },
            { title: "Beetroot", desc: "Blood Builder", icon: "Carrot", category: "vegan", scientific_benefit: "High nitrates improve blood flow; betalains support liver detox of hormones." },
            { title: "Spinach (Palak)", desc: "Iron Refresh", icon: "Leaf", category: "vegan", scientific_benefit: "Essential non-heme iron to combat fatigue from menstruation." },
            { title: "Black Raisins (Munakka)", desc: "Hemoglobin", icon: "Cherry", category: "vegan", scientific_benefit: "Soaked raisins purify blood and boost hemoglobin levels." },
            { title: "Ginger", desc: "Pain Killer", icon: "Coffee", category: "vegan", scientific_benefit: "Gingerols inhibit inflammatory prostaglandins, reducing cramp pain." },
            { title: "Turmeric (Haldi)", desc: "Anti-Inflammatory", icon: "Sun", category: "vegan", scientific_benefit: "Curcumin dramatically lowers CRP (inflammation markers) during menses." },
            { title: "Dark Chocolate", desc: "Magnesium", icon: "Cookie", category: "vegan", scientific_benefit: "High magnesium content relaxes uterine muscle contractions." },
            { title: "Sesame Seeds (Til)", desc: "Period Regulator", icon: "Divide", category: "vegan", scientific_benefit: "Lignans help balance hormones; rich in calcium for cramps." },
            { title: "Jaggery (Gud)", desc: "Iron & Cleanse", icon: "Cookie", category: "vegan", scientific_benefit: "Provides immediate iron and aids in flushing out clots/toxins." },
            { title: "Curry Leaves", desc: "Folate", icon: "Leaf", category: "vegan", scientific_benefit: "Extremely dense in iron and folate; prevents anemia." },
            { title: "Fenugreek (Methi)", desc: "Uterine Cleanse", icon: "Leaf", category: "vegan", scientific_benefit: "Helps uterus contract efficiently to expel lining; improves insulin." },
            { title: "Papaya (Raw/Ripe)", desc: "Flow Regulator", icon: "Apple", category: "vegan", scientific_benefit: "Carotene stimulates estrogen to induce/regulate proper flow." },
            { title: "Ajwain (Carom)", desc: "Anti-Spasmodic", icon: "Star", category: "vegan", scientific_benefit: "Thymol relieves uterine spasms and bloating instantly." },
            { title: "Cumin (Jeera)", desc: "Water Retention", icon: "Droplets", category: "vegan", scientific_benefit: "Natural diuretic that reduces period bloating." },
            { title: "Pumpkin Seeds", desc: "Zinc", icon: "Circle", category: "vegan", scientific_benefit: "Zinc reduces prostaglandin production (less pain)." },
            { title: "Flax Seeds", desc: "Hormone Mop", icon: "Divide", category: "vegan", scientific_benefit: "Fiber binds to old estrogen to ensure it leaves the body." },
            { title: "Kidney Beans (Rajma)", desc: "Iron & Fiber", icon: "Bean", category: "vegan", scientific_benefit: "Replenishes iron; fiber stabilizes blood sugar to prevent mood swings." },
            { title: "Brown Rice", desc: "Serotonin", icon: "Wheat", category: "vegan", scientific_benefit: "Complex carbs boost serotonin levels which drop during menses." },
            { title: "Sweet Potato", desc: "B6 Boost", icon: "Carrot", category: "vegan", scientific_benefit: "Rich in Vitamin B6 which specifically targets PMS mood drops." },
            { title: "Walnuts", desc: "Brain Fog", icon: "Nut", category: "vegan", scientific_benefit: "Omega-3s reduce brain inflammation and period pain." },
            { title: "Amla", desc: "Iron Absorption", icon: "Cherry", category: "vegan", scientific_benefit: "Vitamin C is mandatory to absorb iron from plant sources." },
            { title: "Moringa", desc: "Multivitamin", icon: "Leaf", category: "vegan", scientific_benefit: "Combats fatigue with high Iron, Vitamin A, and C." },
            { title: "Buckwheat (Kuttu)", desc: "Magnesium", icon: "Wheat", category: "vegan", scientific_benefit: "Gluten-free grain high in magnesium for cramps." },
            { title: "Fennel (Saunf)", desc: "Cramp Relief", icon: "Leaf", category: "vegan", scientific_benefit: "Clinically shown to be as effective as ibuprofen for cramps." },
            { title: "Dates", desc: "Energy", icon: "Cookie", category: "vegan", scientific_benefit: "Quick source of iron and glucose for period fatigue." },
            { title: "Black Gram (Kala Chana)", desc: "Protein", icon: "Bean", category: "vegan", scientific_benefit: "High protein aids tissue repair of the uterine lining." },
            { title: "Mustard Greens (Sarson)", desc: "Warming", icon: "Leaf", category: "vegan", scientific_benefit: "Warming nature improves circulation to the pelvic area." },
            { title: "Almonds", desc: "Vitamin E", icon: "Nut", category: "vegan", scientific_benefit: "Vitamin E reduces the severity of period pain and soreness." },
            { title: "Chamomile", desc: "Sleep", icon: "Moon", category: "vegan", scientific_benefit: "Increases glycine (muscle relaxant) to help sleep through cramps." },
            { title: "Pomegranate", desc: "Blood Tonic", icon: "Cherry", category: "vegan", scientific_benefit: "Traditionally used to support healthy blood levels." },

            // VEGETARIAN
            { title: "Warm Milk", desc: "Relaxant", icon: "Droplets", category: "vegetarian", scientific_benefit: "Calcium and tryptophan aid sleep and reduce muscle tension." },
            { title: "Ghee", desc: "Lubrication", icon: "Droplets", category: "vegetarian", scientific_benefit: "Essential fatty acids support hormone synthesis and cellular repair." },
            { title: "Paneer", desc: "Recovery", icon: "Cheese", category: "vegetarian", scientific_benefit: "Casein protein provides slow-release amino acids for overnight repair." },
            { title: "Edible Gum (Gond)", desc: "Strengthening", icon: "Star", category: "vegetarian", scientific_benefit: "Traditionally used to strengthen the back and uterus." },
            { title: "Yogurt (Probiotic)", desc: "Estrobolome", icon: "Beaker", category: "vegetarian", scientific_benefit: "Gut bacteria (estrobolome) are crucial for processing hormones." },
            { title: "Ragi (Finger Millet)", desc: "Calcium", icon: "Wheat", category: "vegetarian", scientific_benefit: "Highest non-dairy calcium source; prevents bone ache during menses." },
            { title: "Bajra (Pearl Millet)", desc: "Heat", icon: "Sun", category: "vegetarian", scientific_benefit: "Thermal effect keeps the body warm and flow regular." },
            { title: "Moong Dal", desc: "Light Protein", icon: "Bean", category: "vegetarian", scientific_benefit: "Lowest inflammatory potential; easiest to digest when energy is low." },
            { title: "Amaranth (Rajgira)", desc: "Iron + Lysine", icon: "Wheat", category: "vegetarian", scientific_benefit: "Lysine helps absorb calcium; iron prevents fatigue." },
            { title: "Ashwagandha", desc: "Cortisol Control", icon: "Leaf", category: "vegetarian", scientific_benefit: "Lowers cortisol, which can otherwise worsen period pain." },
            { title: "Masoor Dal", desc: "Iron", icon: "Bean", category: "vegetarian", scientific_benefit: "Red lentils are rich in iron and cook quickly (less effort)." },
            { title: "Makhana (Fox Nuts)", desc: "Low GI", icon: "Circle", category: "vegetarian", scientific_benefit: "Magnesium-rich snack that doesn't spike insulin." },
            { title: "Buttermilk (Chaas)", desc: "Cooling/Gut", icon: "CupSoda", category: "vegetarian", scientific_benefit: "Probiotic that settles acidity often triggered during menses." },
            { title: "Shatavari", desc: "Reproductive Tonic", icon: "Leaf", category: "vegetarian", scientific_benefit: "Specific herb for nourishing female reproductive tissues." },
            { title: "Nutmeg (Jaiphal)", desc: "Sedative", icon: "Moon", category: "vegetarian", scientific_benefit: "Small amounts act as a natural sleep aid for insomnia." },
            { title: "Cinnamon", desc: "Flow Control", icon: "Coffee", category: "vegetarian", scientific_benefit: "Helps reduce heavy menstrual bleeding (menorrhagia)." },
            { title: "Bathua (Chenopodium)", desc: "Blood Purifier", icon: "Leaf", category: "vegetarian", scientific_benefit: "Traditional green used to clear blood and improve flow." },
            { title: "Colocasia (Arbi)", desc: "Energy", icon: "Carrot", category: "vegetarian", scientific_benefit: "Resistant starch provides sustained energy without crashes." },
            { title: "Yam (Jimikand)", desc: "Hormone Precursor", icon: "Carrot", category: "vegetarian", scientific_benefit: "Contains diosgenin, which supports progesterone production." },
            { title: "Sunflower Seeds", desc: "Breast Pain", icon: "Sun", category: "vegetarian", scientific_benefit: "Vitamin E reduces breast tenderness associated with menses." },
            { title: "Clove", desc: "Numbing", icon: "Star", category: "vegetarian", scientific_benefit: "Eugenol acts as a natural analgesic for pain." },
            { title: "Wild Rice", desc: "Zinc", icon: "Wheat", category: "vegetarian", scientific_benefit: "Higher zinc content than white rice for skin and immunity." },
            { title: "Tulsi (Holy Basil)", desc: "Adaptogen", icon: "Leaf", category: "vegetarian", scientific_benefit: "Helps body adapt to the physical stress of menstruation." },
            { title: "Red Rice", desc: "Antioxidant", icon: "Wheat", category: "vegetarian", scientific_benefit: "Anthocyanins reduce inflammation and cellular stress." },
            { title: "Parsley/Coriander", desc: "Diuretic", icon: "Leaf", category: "vegetarian", scientific_benefit: "Helps kidneys flush out excess water weight (bloat)." },
            { title: "Dill Leaves (Suva)", desc: "Flow Regulation", icon: "Leaf", category: "vegetarian", scientific_benefit: "Traditionally used to regulate scanty or irregular flow." },
            { title: "Dried Apricots", desc: "Concentrated Iron", icon: "Apple", category: "vegetarian", scientific_benefit: "Easy snack to boost iron levels quickly." },
            { title: "Banana", desc: "Potassium", icon: "Banana", category: "vegetarian", scientific_benefit: "Potassium helps stop muscle cramps and fluid retention." },
            { title: "Pistachios", desc: "B6", icon: "Nut", category: "vegetarian", scientific_benefit: "Rich in B6 to help with mood stability." },
            { title: "Oats", desc: "Fiber", icon: "Wheat", category: "vegetarian", scientific_benefit: "Beta-glucan helps clear hormones via the gut." },
            { title: "Barley Water", desc: "Flush", icon: "Droplets", category: "vegetarian", scientific_benefit: "Reduces water retention and supports kidney function." },
            { title: "Soaked Almonds", desc: "Nutrients", icon: "Nut", category: "vegetarian", scientific_benefit: "Peeling almonds makes nutrients more bioavailable for digestion." },
            { title: "Cardamom", desc: "Mood Lifter", icon: "Star", category: "vegetarian", scientific_benefit: "Aromatic compounds help alleviate low mood/depression." },
            { title: "Besan (Gram Flour)", desc: "Protein", icon: "Wheat", category: "vegetarian", scientific_benefit: "Gluten-free protein source good for PCOS insulin management." },
            { title: "Peanuts", desc: "Resveratrol", icon: "Nut", category: "vegetarian", scientific_benefit: "Contains resveratrol which helps hormonal balance." },
            { title: "Sabudana", desc: "Easy Energy", icon: "Circle", category: "vegetarian", scientific_benefit: "Simple starch that is very easy to digest during nausea." },
            { title: "Semolina (Suji)", desc: "Comfort", icon: "Wheat", category: "vegetarian", scientific_benefit: "Warm, soft texture is comforting for sensitive stomachs." },
            { title: "Coconut Water", desc: "Electrolytes", icon: "Waves", category: "vegetarian", scientific_benefit: "Replenishes minerals lost through sweat and stress." },
            { title: "Lemongrass", desc: "Analgesic", icon: "Leaf", category: "vegetarian", scientific_benefit: "Tea reduces pain and bloating." },

            // NON-VEGETARIAN
            { title: "Bone Broth", desc: "Collagen", icon: "Soup", category: "non_vegetarian", scientific_benefit: "Rich in glycine and collagen for uterine tissue repair." },
            { title: "Mutton/Lamb", desc: "Heme Iron", icon: "Utensils", category: "non_vegetarian", scientific_benefit: "The most absorbable form of iron to fix menstrual fatigue." },
            { title: "Chicken Liver", desc: "Superfood", icon: "Sparkles", category: "non_vegetarian", scientific_benefit: "Dense in Vitamin A and Iron for reproductive health." },
            { title: "Salmon/Fish", desc: "Omega-3", icon: "Fish", category: "non_vegetarian", scientific_benefit: "Potent anti-inflammatory that significantly reduces pain." },
            { title: "Eggs (Whole)", desc: "Choline", icon: "Egg", category: "non_vegetarian", scientific_benefit: "Choline and fats support hormone synthesis and brain health." },
            { title: "Sardines", desc: "Calcium", icon: "Fish", category: "non_vegetarian", scientific_benefit: "High calcium content (bones) supports muscle function." },
            { title: "Chicken Soup", desc: "Immunity", icon: "Soup", category: "non_vegetarian", scientific_benefit: "Contains cysteine which thins mucus and supports immunity." },
            { title: "Oysters/Shellfish", desc: "Zinc", icon: "Fish", category: "non_vegetarian", scientific_benefit: "Highest natural zinc source; vital for cycle regularity." },
            { title: "Paya (Trotters)", desc: "Joints", icon: "Soup", category: "non_vegetarian", scientific_benefit: "Collagen and gelatin soothe joints that ache during periods." },
            { title: "Anchovies", desc: "Omega-3", icon: "Fish", category: "non_vegetarian", scientific_benefit: "Small fish with high omega-3s and low mercury." }
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
        fuel: [
            { title: "Fermented Foods", desc: "Gut Health", icon: "Beaker" },
            { title: "Avocado", desc: "Healthy Fats", icon: "Leaf" },
            { title: "Oats", desc: "Energy", icon: "Wheat" },
            { title: "Pumpkin Seeds", desc: "Zinc", icon: "Circle" },
            { title: "Green Smoothie", desc: "Fresh", icon: "CupSoda" },
            { title: "Citrus", desc: "Vitamin C", icon: "Sun" },
            { title: "Sprouts", desc: "Living Food", icon: "Leaf" },
            { title: "Pomegranate", desc: "Antioxidants", icon: "Cherry" },
            { title: "Lentils", desc: "Protein", icon: "Bean" },
            { title: "Chia Pudding", desc: "Omega 3", icon: "Bowl" }
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
        fuel: [
            { title: "Raw Salads", desc: "Fiber", icon: "Carrot" },
            { title: "Berries", desc: "Antioxidants", icon: "Cherry" },
            { title: "Quinoa", desc: "Protein", icon: "Wheat" },
            { title: "Almonds", desc: "Energy", icon: "Nut" },
            { title: "Spinach", desc: "Iron", icon: "Leaf" },
            { title: "Salmon", desc: "Omegas", icon: "Fish" },
            { title: "Red Pepper", desc: "Vitamin C", icon: "Pepper" },
            { title: "Cucumber", desc: "Cooling", icon: "Droplets" },
            { title: "Coconut water", desc: "Electrolytes", icon: "Waves" }
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
        fuel: [
            { title: "Sweet Potato", desc: "Carbs", icon: "Carrot" },
            { title: "Brown Rice", desc: "Stability", icon: "Soup" },
            { title: "Walnuts", desc: "Omega-3", icon: "Nut" },
            { title: "Dark Leafy Greens", desc: "Magnesium", icon: "Leaf" },
            { title: "Chickpeas", desc: "B6", icon: "Bean" },
            { title: "Banana", desc: "Potassium", icon: "Banana" },
            { title: "Dark Chocolate", desc: "Cravings", icon: "Cookie" },
            { title: "Peppermint Tea", desc: "Bloat", icon: "Leaf" },
            { title: "Apple", desc: "Fiber", icon: "Apple" }
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
