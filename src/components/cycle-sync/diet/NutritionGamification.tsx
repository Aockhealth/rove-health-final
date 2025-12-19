import { motion } from "framer-motion";
import { Zap, TrendingUp, Sparkles } from "lucide-react";

interface NutritionGamificationProps {
    data: {
        title: string;
        desc: string;
        metabolic_tip: string;
    };
    color: string;
}

export function NutritionGamification({ data, color }: NutritionGamificationProps) {
    if (!data) return null;

    // Extract base color (e.g., "bg-red-500" -> "text-red-500") for icons
    const iconColor = color.replace('bg-', 'text-');
    const borderColor = color.replace('bg-', 'border-').replace('500', '200');

    return (
        <section className="mb-10">
            <h3 className="font-heading text-lg text-rove-charcoal mb-4 px-2">Maximize Your Potential</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Superpower Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-[1.5rem] bg-white border ${borderColor} shadow-sm relative overflow-hidden`}
                >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 ${iconColor}`}>
                        <Sparkles className="w-12 h-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className={`w-4 h-4 ${iconColor}`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-rove-stone">Current Superpower</span>
                        </div>
                        <h4 className="font-heading text-lg text-rove-charcoal mb-2">{data.title}</h4>
                        <p className="text-sm text-rove-stone leading-relaxed">
                            {data.desc}
                        </p>
                    </div>
                </motion.div>

                {/* Metabolic Reality Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-[1.5rem] bg-rove-charcoal text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                        <TrendingUp className="w-12 h-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Metabolic Shift</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            {data.metabolic_tip}
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
