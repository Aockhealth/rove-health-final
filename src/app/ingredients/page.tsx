"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Droplets, Sun, Moon, Activity, Clock, Calendar, ChevronDown, ArrowLeft, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HormoneFlowBackground } from "@/components/HormoneFlowBackground";

// Updated Image Paths (served from public/images)
const images = {
    menses: "/images/menses_phase_art_1764264983187.png",
    follicular: "/images/follicular_phase_art_1764265020039.png",
    luteal: "/images/luteal_phase_art_1764265039590.png",
    hormoneBalance: "/images/hormone_balance_art_1764265060774.png",
};

export default function IngredientsPage() {
    return (
        <div className="min-h-screen bg-white relative">
            {/* Cellular Background Animation */}
            <HormoneFlowBackground variant="cellular" className="fixed inset-0 pointer-events-none" />

            {/* Assuming Header is a component you have defined elsewhere */}
            {/* <Header /> */}
            <main className="min-h-screen text-rove-charcoal font-sans selection:bg-rove-red/20 pb-24 relative z-10">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-rove-charcoal text-rove-cream">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rove-charcoal z-10" />
                        <img src={images.hormoneBalance} alt="Science Art" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 container mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge variant="luxury" className="mb-6 px-4 py-1 text-sm tracking-wider uppercase bg-white/10 text-white border-white/20">
                                Transparent Science
                            </Badge>
                            <h1 className="font-heading text-5xl md:text-7xl font-medium tracking-tight mb-6">
                                The Science Inside.
                            </h1>
                            <p className="text-lg md:text-xl text-rove-stone max-w-2xl mx-auto font-light leading-relaxed">
                                Every ingredient has a purpose. No fillers, no compromises.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <div className="container mx-auto px-6 -mt-20 relative z-20 space-y-8">

                    {/* Phase 1: Menses */}
                    <PhaseSection
                        id="menses"
                        title="Phase 1: Menses"
                        subtitle="Replenish & Relief • Days 1-7"
                        icon={Droplets}
                        iconColor="text-rove-red"
                        iconBg="bg-rove-red/10"
                        image={images.menses}
                        ingredients={[
                            { name: "Iron (Ferrous Bisglycinate)", amount: "18 mg", desc: "Highly bioavailable iron to replenish blood loss without causing nausea." },
                            { name: "Magnesium Glycinate", amount: "350 mg", desc: "Clinical dose to soothe uterine cramping and relax muscles." },
                            { name: "Ginger Extract", amount: "50 mg", desc: "Potent anti-inflammatory to reduce prostaglandin production and pain." },
                            { name: "Curcumin (Bioavailable)", amount: "50 mg", desc: "Reduces systemic inflammation and supports period comfort." },
                            { name: "Viburnum Opulus", amount: "300 mg", desc: "Traditionally used as 'Cramp Bark' to relieve smooth muscle tension." },
                            { name: "Vitamin C", amount: "65 mg", desc: "Enhances iron absorption and supports immune health." },
                            { name: "Vitamin B12", amount: "2.2 mcg", desc: "Supports red blood cell formation and energy levels." }
                        ]}
                    />

                    {/* Phase 2: Follicular */}
                    <PhaseSection
                        id="follicular"
                        title="Phase 2: Follicular"
                        subtitle="Energy & Quality • Days 8-17"
                        icon={Sun}
                        iconColor="text-rove-charcoal"
                        iconBg="bg-rove-stone/10"
                        image={images.follicular}
                        ingredients={[
                            { name: "Coenzyme Q10", amount: "50-100 mg", desc: "Mitochondrial support to improve egg quality and cellular energy." },
                            { name: "NAC (N-Acetyl Cysteine)", amount: "125-200 mg", desc: "Powerful antioxidant that supports ovulation and cervical health." },
                            { name: "Shatavari", amount: "250-500 mg", desc: "Adaptogenic herb to support estrogen balance and reproductive vitality." },
                            { name: "Omega 3 (EPA/DHA)", amount: "250 mg", desc: "Reduces inflammation and supports hormonal signaling." },
                            { name: "Zinc", amount: "10 mg", desc: "Crucial for follicle maturation and immune function." },
                            { name: "Vitamin D3", amount: "600 IU", desc: "Supports ovarian reserve and overall hormonal health." },
                            { name: "Blueberry Extract", amount: "50-200 mg", desc: "Rich in antioxidants to protect developing follicles." }
                        ]}
                    />

                    {/* Phase 3: Luteal */}
                    <PhaseSection
                        id="luteal"
                        title="Phase 3: Luteal"
                        subtitle="Mood & Stability • Days 18-32"
                        icon={Moon}
                        iconColor="text-rove-green"
                        iconBg="bg-rove-green/10"
                        image={images.luteal}
                        ingredients={[
                            { name: "Magnesium (Glycinate)", amount: "200-300 mg", desc: "Calms the nervous system and reduces PMS anxiety." },
                            { name: "Saffron Extract", amount: "30 mg", desc: "Clinically shown to boost serotonin and improve mood." },
                            { name: "Ashwagandha", amount: "300 mg", desc: "Reduces cortisol and stress-induced PMS symptoms." },
                            { name: "Vitamin B6 (Pyridoxine)", amount: "2.4 mg", desc: "Essential for progesterone production and mood regulation." },
                            { name: "Chasteberry (Vitex)", amount: "20 mg", desc: "Supports healthy progesterone levels and cycle regularity." },
                            { name: "5-HTP", amount: "50 mg", desc: "Precursor to serotonin, supporting sleep and emotional stability." },
                            { name: "Calcium", amount: "25 mg", desc: "Helps reduce physical PMS symptoms like bloating." }
                        ]}
                    />

                    {/* Hormone Balance */}
                    <PhaseSection
                        id="hormone-balance"
                        title="Hormone Balance"
                        subtitle="Metabolic Foundation • Daily Support"
                        icon={Activity}
                        iconColor="text-rove-charcoal"
                        iconBg="bg-rove-charcoal/10"
                        image={images.hormoneBalance}
                        ingredients={[
                            { name: "Myo-Inositol", amount: "500 mg", desc: "Improves insulin sensitivity and supports ovarian function." },
                            { name: "Berberine", amount: "50 mg", desc: "Regulates blood sugar and supports metabolic health." },
                            { name: "Chromium", amount: "50 mcg", desc: "Enhances insulin action and glucose metabolism." },
                            { name: "NAC", amount: "150 mg", desc: "Supports detoxification and reduces oxidative stress." },
                            { name: "Vitamin D3", amount: "150 IU", desc: "Foundational support for hormonal balance." },
                            { name: "Vitamin K2", amount: "13.75 µg", desc: "Directs calcium to bones and supports heart health." },
                            { name: "Zinc", amount: "3.3 mg", desc: "Supports skin health and hormonal regulation." }
                        ]}
                    />

                    {/* How to Use / Protocol */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="py-16 bg-white rounded-3xl shadow-sm border border-rove-stone/10 p-8 md:p-12 mt-16"
                    >
                        <h2 className="font-heading text-3xl md:text-4xl text-rove-charcoal text-center mb-12">The Rove Protocol</h2>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* The Foundation */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Badge className="bg-rove-charcoal text-rove-cream">1. The Foundation</Badge>
                                    <h3 className="font-heading text-2xl">Hormone Balance</h3>
                                </div>
                                <p className="text-rove-stone">Designed for consistent metabolic and hormonal baseline support. This is your Daily Driver.</p>

                                <div className="bg-rove-cream p-6 rounded-xl space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-rove-charcoal" />
                                        <span className="font-medium">Take 4 tablets daily</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-rove-charcoal" />
                                        <span className="font-medium">Every day, regardless of cycle day</span>
                                    </div>
                                    <p className="text-sm text-rove-stone italic mt-2">
                                        Best taken with a meal to maximize absorption of fat-soluble vitamins.
                                    </p>
                                </div>
                            </div>

                            {/* The Rhythm */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Badge variant="luxury" className="bg-rove-red/10 text-rove-red border-rove-red/20">2. The Rhythm</Badge>
                                    <h3 className="font-heading text-2xl">Cycle Sync</h3>
                                </div>
                                <p className="text-rove-stone">Designed to match your body’s shifting chemistry. You switch bottles based on your cycle day.</p>

                                <div className="space-y-3">
                                    <PhaseRow phase="Phase 1: The Reset" days="Days 1-7" color="bg-rove-red" desc="Replenish iron & soothe inflammation." />
                                    <PhaseRow phase="Phase 2: The Rise" days="Days 8-17" color="bg-rove-stone" desc="Boost energy & egg quality." />
                                    <PhaseRow phase="Phase 3: The Balance" days="Days 18-32" color="bg-rove-green" desc="Stabilize mood & reduce PMS." />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center bg-rove-charcoal/5 p-6 rounded-xl">
                            <p className="font-heading text-xl text-rove-charcoal">
                                "Every day, you take your Hormone Balance. But the 'Partner' bottle changes depending on the week."
                            </p>
                        </div>
                    </motion.section>

                </div>
            </main>
        </div>
    );
}

interface PhaseSectionProps {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    image: string;
    ingredients: { name: string; amount: string; desc: string }[];
}

function PhaseSection({ id, title, subtitle, icon: Icon, iconColor, iconBg, image, ingredients }: PhaseSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.section
            id={id}
            className="scroll-mt-24 bg-white rounded-3xl shadow-sm border border-rove-stone/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div
                className="p-6 md:p-8 cursor-pointer hover:bg-rove-cream/30 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={cn("p-3 rounded-full", iconBg)}>
                            <Icon className={cn("w-8 h-8", iconColor)} />
                        </div>
                        <div>
                            <h2 className="font-heading text-2xl md:text-3xl text-rove-charcoal">{title}</h2>
                            <p className={cn("font-medium text-sm md:text-base opacity-80", iconColor)}>{subtitle}</p>
                        </div>
                    </div>
                    <div className={cn("transform transition-transform duration-300", isOpen ? "rotate-180" : "")}>
                        <ChevronDown className="w-6 h-6 text-rove-stone" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 md:p-8 pt-0 border-t border-rove-stone/10">
                            <div className="grid md:grid-cols-2 gap-8 mt-6">
                                <div className="rounded-2xl overflow-hidden h-64 md:h-auto shadow-lg relative group">
                                    <img src={image} alt={`${title} Art`} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {ingredients.map((ing, i) => (
                                        <motion.div
                                            key={ing.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <IngredientCard name={ing.name} amount={ing.amount} desc={ing.desc} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}

function IngredientCard({ name, amount, desc }: { name: string; amount: string; desc: string }) {
    return (
        <div className="flex items-start justify-between p-4 bg-rove-cream/50 rounded-xl border border-rove-stone/10 hover:border-rove-stone/30 transition-colors">
            <div>
                <h4 className="font-medium text-rove-charcoal text-sm md:text-base">{name}</h4>
                <p className="text-xs md:text-sm text-rove-stone mt-1 leading-relaxed">{desc}</p>
            </div>
            <Badge variant="secondary" className="ml-4 shrink-0 bg-white text-rove-charcoal font-mono text-[10px] md:text-xs border border-rove-stone/10">
                {amount}
            </Badge>
        </div>
    );
}

function PhaseRow({ phase, days, color, desc }: { phase: string; days: string; color: string; desc: string }) {
    return (
        <div className="flex items-center p-3 bg-white rounded-lg border border-rove-stone/10">
            <div className={cn("w-3 h-3 rounded-full mr-3 shrink-0", color)} />
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-rove-charcoal text-sm">{phase}</span>
                    <span className="text-[10px] font-mono text-rove-stone bg-rove-cream px-2 py-0.5 rounded">{days}</span>
                </div>
                <p className="text-xs text-rove-stone">{desc}</p>
            </div>
        </div>
    );
}
