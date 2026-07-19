export type DietType = 'jain' | 'vegan' | 'vegetarian' | 'non_veg';

export const DIET_RECOMMENDATIONS = {
    phases: {
        menstrual: {
            phase_name: "Menstrual Phase",
            days: "1-5",
            focus: "Iron Restoration & Inflammation Control",
            diet_types: {
                jain: [
                    {
                        title: "Spinach & Methi",
                        description: "Iron & Magnesium to replenish blood loss",
                        icon: "Leaf"
                    },
                    {
                        title: "Pumpkin Seeds",
                        description: "Zinc for anti-inflammatory support",
                        icon: "Sprout"
                    },
                    {
                        title: "Flax Seeds",
                        description: "Omega-3s to reduce uterine contraction",
                        icon: "CircleDot"
                    },
                    {
                        title: "Dark Chocolate (70%)",
                        description: "Magnesium for cramp relief",
                        icon: "Cookie"
                    },
                    {
                        title: "Walnuts",
                        description: "Omega-3s for pain reduction",
                        icon: "Nut"
                    },
                    {
                        title: "Amaranth/Rajgira",
                        description: "Easy-to-digest Iron & Fiber",
                        icon: "Wheat"
                    },
                    {
                        title: "Green Tea",
                        description: "Warm anti-inflammatory hydration",
                        icon: "Coffee"
                    }
                ],
                vegan: [
                    {
                        title: "Spinach & Methi",
                        description: "Iron & Magnesium to replenish blood loss",
                        icon: "Leaf"
                    },
                    {
                        title: "Ginger Tea",
                        description: "Inhibits prostaglandins to relieve pain",
                        icon: "CupSoda"
                    },
                    {
                        title: "Turmeric (Haldi)",
                        description: "Potent anti-inflammatory agent",
                        icon: "Sun"
                    },
                    {
                        title: "Dark Chocolate",
                        description: "Magnesium for cramp relief",
                        icon: "Cookie"
                    },
                    {
                        title: "Flax Seeds",
                        description: "Omega-3s to reduce uterine contraction",
                        icon: "CircleDot"
                    },
                    {
                        title: "Garlic",
                        description: "Immune system support",
                        icon: "Shield"
                    }
                ],
                vegetarian: [
                    {
                        title: "Warm Milk with Haldi",
                        description: "Calcium & comfort for better sleep",
                        icon: "Moon"
                    },
                    {
                        title: "Spinach & Methi",
                        description: "Iron & Magnesium to replenish blood loss",
                        icon: "Leaf"
                    },
                    {
                        title: "Ginger Tea",
                        description: "Pain relief & digestion",
                        icon: "CupSoda"
                    }
                ],
                non_veg: [
                    {
                        title: "Bone Broth / Soup",
                        description: "Collagen & hydration for recovery",
                        icon: "Soup"
                    },
                    {
                        title: "Mutton / Liver",
                        description: "Heme Iron for fastest absorption",
                        icon: "Drumstick"
                    },
                    {
                        title: "Rawas / Salmon",
                        description: "High Omega-3s to lower inflammation",
                        icon: "Fish"
                    }
                ]
            }
        },
        follicular: {
            phase_name: "Follicular Phase",
            days: "6-11",
            focus: "Rising Estrogen & Building Lining",
            diet_types: {
                jain: [
                    {
                        title: "Pumpkin Seeds",
                        description: "Zinc supports follicle development",
                        icon: "Sprout"
                    },
                    {
                        title: "Flax Seeds",
                        description: "Lignans modulate rising estrogen",
                        icon: "CircleDot"
                    },
                    {
                        title: "Broccoli & Cauliflower",
                        description: "DIM helps liver process estrogen",
                        icon: "TreeDeciduous"
                    },
                    {
                        title: "Pomegranate",
                        description: "Nitrates improve blood flow to uterus",
                        icon: "Cherry"
                    },
                    {
                        title: "Brazil Nuts",
                        description: "Selenium for egg quality support",
                        icon: "Nut"
                    },
                    {
                        title: "Curd / Yogurt",
                        description: "Probiotics for gut & estrobolome health",
                        icon: "Milk"
                    },
                    {
                        title: "Moong Dal",
                        description: "Light protein for tissue building",
                        icon: "Bean"
                    }
                ],
                vegan: [
                    {
                        title: "Sauerkraut / Pickles",
                        description: "Fermented foods for gut health",
                        icon: "Jar"
                    },
                    {
                        title: "Soybean / Edamame",
                        description: "Phytoestrogens & Folate",
                        icon: "Bean"
                    },
                    {
                        title: "Pumpkin Seeds",
                        description: "Zinc supports follicle development",
                        icon: "Sprout"
                    },
                    {
                        title: "Broccoli",
                        description: "DIM helps liver process estrogen",
                        icon: "TreeDeciduous"
                    }
                ],
                vegetarian: [
                    {
                        title: "Paneer / Cottage Cheese",
                        description: "Protein building blocks for cells",
                        icon: "Cheese"
                    },
                    {
                        title: "Yogurt",
                        description: "Probiotics for gut health",
                        icon: "Milk"
                    },
                    {
                        title: "Pomegranate",
                        description: "Nitrates improve blood flow",
                        icon: "Cherry"
                    }
                ],
                non_veg: [
                    {
                        title: "Eggs",
                        description: "Choline for cell membrane health",
                        icon: "Egg"
                    },
                    {
                        title: "Chicken Breast",
                        description: "Lean protein for energy",
                        icon: "Drumstick"
                    },
                    {
                        title: "Broccoli",
                        description: "Estrogen balance support",
                        icon: "TreeDeciduous"
                    }
                ]
            }
        },
        ovulatory: {
            phase_name: "Ovulation Phase",
            days: "12-16",
            focus: "Peak Energy & Cooling Body Heat",
            diet_types: {
                jain: [
                    {
                        title: "Quinoa / Amaranth",
                        description: "Fiber binds excess estrogen",
                        icon: "Wheat"
                    },
                    {
                        title: "Sunflower Seeds",
                        description: "Vitamin E prepares for progesterone",
                        icon: "Sun"
                    },
                    {
                        title: "Watermelon & Cucumber",
                        description: "Cooling hydration for high body heat",
                        icon: "Droplets"
                    },
                    {
                        title: "Almonds",
                        description: "Vitamin E for skin glow & fluids",
                        icon: "Nut"
                    },
                    {
                        title: "Bhindi (Okra)",
                        description: "Soluble fiber aids gut motility",
                        icon: "Leaf"
                    },
                    {
                        title: "Coconut Water",
                        description: "Electrolytes for peak activity",
                        icon: "Palmtree"
                    }
                ],
                vegan: [
                    {
                        title: "Corn",
                        description: "Vitamin B6 supports progesterone",
                        icon: "Corn"
                    },
                    {
                        title: "Strawberries",
                        description: "Antioxidants for liver support",
                        icon: "Cherry"
                    },
                    {
                        title: "Sunflower Seeds",
                        description: "Vitamin E prepares for progesterone",
                        icon: "Sun"
                    },
                    {
                        title: "Cucumber",
                        description: "Cooling hydration",
                        icon: "Droplets"
                    }
                ],
                vegetarian: [
                    {
                        title: "Chaas (Buttermilk)",
                        description: "Probiotic & Cooling effect",
                        icon: "Milk"
                    },
                    {
                        title: "Quinoa",
                        description: "Fiber binds excess estrogen",
                        icon: "Wheat"
                    },
                    {
                        title: "Watermelon",
                        description: "Cooling hydration",
                        icon: "Droplets"
                    }
                ],
                non_veg: [
                    {
                        title: "Tuna / Mackerel",
                        description: "Fatty acids support follicle rupture",
                        icon: "Fish"
                    },
                    {
                        title: "Shellfish",
                        description: "Zinc boost for reproductive health",
                        icon: "Anchor"
                    },
                    {
                        title: "Coconut Water",
                        description: "Electrolytes for hydration",
                        icon: "Palmtree"
                    }
                ]
            }
        },
        luteal: {
            phase_name: "Luteal Phase",
            days: "17-28",
            focus: "Progesterone Support & PMS Management",
            diet_types: {
                jain: [
                    {
                        title: "Sunflower Seeds",
                        description: "Vitamin E boosts Progesterone",
                        icon: "Sun"
                    },
                    {
                        title: "Sesame Seeds (Til)",
                        description: "Calcium & Zinc block excess estrogen",
                        icon: "CircleDot"
                    },
                    {
                        title: "Chana / Chickpea",
                        description: "Vitamin B6 for mood & serotonin",
                        icon: "Smile"
                    },
                    {
                        title: "Sweet Potato",
                        description: "Slow carbs stabilize blood sugar",
                        icon: "Carrot"
                    },
                    {
                        title: "Banana",
                        description: "Potassium reduces water retention",
                        icon: "Banana"
                    },
                    {
                        title: "Dark Chocolate",
                        description: "Magnesium reduces anxiety",
                        icon: "Heart"
                    },
                    {
                        title: "Makhana",
                        description: "Low calorie Magnesium snack",
                        icon: "Star"
                    }
                ],
                vegan: [
                    {
                        title: "Brown Rice",
                        description: "B-Complex vitamins for energy",
                        icon: "Wheat"
                    },
                    {
                        title: "Ginger",
                        description: "Relief from bloating",
                        icon: "Wind"
                    },
                    {
                        title: "Sunflower Seeds",
                        description: "Vitamin E boosts Progesterone",
                        icon: "Sun"
                    },
                    {
                        title: "Chickpeas",
                        description: "Vitamin B6 for mood stabilization",
                        icon: "Smile"
                    }
                ],
                vegetarian: [
                    {
                        title: "Warm Milk / Paneer",
                        description: "Calcium proven to reduce PMS",
                        icon: "Milk"
                    },
                    {
                        title: "Sweet Potato",
                        description: "Slow carbs stabilize cravings",
                        icon: "Carrot"
                    },
                    {
                        title: "Dark Chocolate",
                        description: "Magnesium for mood",
                        icon: "Heart"
                    }
                ],
                non_veg: [
                    {
                        title: "Whole Eggs",
                        description: "Cholesterol builds hormones",
                        icon: "Egg"
                    },
                    {
                        title: "Mutton",
                        description: "Iron top-up before cycle begins",
                        icon: "Drumstick"
                    },
                    {
                        title: "Banana",
                        description: "Potassium reduces bloating",
                        icon: "Banana"
                    }
                ]
            }
        }
    }
};
