"use client";

import { useEffect, useState } from "react";
import { fetchCycleIntelligence } from "@/app/actions/cycle-sync";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
    Moon, Zap, Sparkles, Brain, ChevronRight, Utensils, Dumbbell
} from "lucide-react";
import { getPhaseSummaries } from "@/data/phase-data";
import Link from "next/link";

// --- Icon Mapping ---
const iconMap: Record<string, any> = {
    "Moon": Moon,
    "Zap": Zap,
    "Sparkles": Sparkles,
    "Brain": Brain,
};

// Sleek Phase Card Component
function PhaseCard({
    phase,
    isCurrentPhase
}: {
    phase: any;
    isCurrentPhase: boolean;
}) {
    const Icon = iconMap[phase.icon] || Sparkles;

    return (
        <Link href={`/cycle-sync/plan/${phase.id}`}>
            <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative overflow-hidden p-4 rounded-[1.25rem] cursor-pointer transition-all group",
                    isCurrentPhase
                        ? "bg-white shadow-md border-2 border-rove-charcoal"
                        : "bg-white/60 backdrop-blur-sm border border-rove-stone/10 hover:bg-white hover:shadow-sm"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        phase.color + "/10"
                    )}>
                        <Icon className={cn("w-4 h-4", phase.color.replace("bg-", "text-"))} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-heading text-sm text-rove-charcoal truncate">
                                {phase.name}
                            </h3>
                            {isCurrentPhase && (
                                <Badge className="bg-rove-charcoal text-white text-[8px] px-1.5 py-0 h-4">
                                    NOW
                                </Badge>
                            )}
                        </div>
                        <p className="text-[10px] text-rove-stone truncate">
                            {phase.duration}
                        </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-rove-stone/40 group-hover:text-rove-charcoal group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
            </motion.div>
        </Link>
    );
}

export default function PlanPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const res = await fetchCycleIntelligence();
            if (res) {
                setData(res);
            }
        };
        load();
    }, []);

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-rove-cream/20">
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-rove-charcoal border-t-transparent" />
        </div>
    );

    const currentPhaseName = data.phase || "Menstrual";
    const phaseSummaries = getPhaseSummaries();
    const currentPhaseData = phaseSummaries.find(p => p.name === currentPhaseName);

    return (
        <div className="min-h-screen bg-rove-cream/20 pt-24 pb-32 px-4 md:px-8">
            <div className="max-w-lg mx-auto space-y-6">

                {/* Header */}
                <header className="text-center">
                    <Badge className="bg-rove-charcoal text-white px-3 py-1 mb-3">Day {data.day || "?"}</Badge>
                    <h1 className="text-2xl md:text-3xl font-heading text-rove-charcoal leading-tight mb-2">
                        Your Cycle Plan
                    </h1>
                    <p className="text-rove-stone text-sm">
                        Personalized guidance for each phase
                    </p>
                </header>

                {/* Current Phase Hero Card */}
                <Link href={`/cycle-sync/plan/${currentPhaseData?.id || 'menstrual'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        className={cn(
                            "relative overflow-hidden p-5 rounded-[1.5rem] cursor-pointer transition-all",
                            "bg-gradient-to-br from-rove-charcoal to-gray-800 text-white shadow-lg"
                        )}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    You're in
                                </p>
                                <h2 className="text-2xl font-heading">{currentPhaseName} Phase</h2>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl">
                                {currentPhaseData && (() => {
                                    const Icon = iconMap[currentPhaseData.icon] || Sparkles;
                                    return <Icon className="w-5 h-5" />;
                                })()}
                            </div>
                        </div>

                        <p className="text-sm text-white/70 mb-4 leading-relaxed">
                            {currentPhaseData?.summary || "Tap to see your personalized recommendations"}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-xs text-white/60">
                                    <Utensils className="w-3.5 h-3.5" />
                                    <span>Diet</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-white/60">
                                    <Dumbbell className="w-3.5 h-3.5" />
                                    <span>Exercise</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-white/80">
                                View Plan
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* All Phases Section */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-rove-stone mb-3 px-1">
                        All Phases
                    </h3>
                    <div className="space-y-2">
                        {phaseSummaries.map((phase) => (
                            <PhaseCard
                                key={phase.id}
                                phase={phase}
                                isCurrentPhase={phase.name === currentPhaseName}
                            />
                        ))}
                    </div>
                </section>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/50 border border-rove-stone/10 text-center"
                >
                    <p className="text-xs text-rove-stone">
                        Tap any phase to see detailed diet & exercise recommendations tailored for that time of your cycle.
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
