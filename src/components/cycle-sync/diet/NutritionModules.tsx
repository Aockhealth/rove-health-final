import { motion } from "framer-motion";
import { Beaker, ArrowRight, Zap, Target } from "lucide-react";

interface NutritionModulesProps {
    modules: {
        title: string;
        goal: string;
        science: string;
        key_ingredients: string[];
        food_sources: { name: string; amount?: string; note?: string }[];
    }[];
}

export function NutritionModules({ modules }: NutritionModulesProps) {
    if (!modules || modules.length === 0) return null;

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="font-heading text-lg text-rove-charcoal">Clinical Nutrition Modules</h3>
                <span className="text-xs text-rove-stone">Swipe for more →</span>
            </div>

            <div className="relative -mx-4 px-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                <div className="flex gap-4 w-max">
                    {modules.map((mod, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="snap-center w-[340px] md:w-[400px] bg-white rounded-[2rem] p-6 border border-rove-stone/10 shadow-sm flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Header */}
                            <div className="mb-4">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/60 mb-1">
                                    Module {idx + 1}
                                </div>
                                <h4 className="font-heading text-xl text-rove-charcoal mb-1">{mod.title}</h4>
                                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                                    <Target className="w-3.5 h-3.5" />
                                    {mod.goal}
                                </div>
                            </div>

                            {/* Science Block */}
                            <div className="bg-rove-light-gray/50 p-4 rounded-xl border border-rove-stone/5 mb-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Beaker className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-bold uppercase text-purple-700">The Science</span>
                                </div>
                                <p className="text-xs text-rove-stone leading-relaxed">
                                    {mod.science}
                                </p>
                            </div>

                            {/* Key Ingredients */}
                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase text-rove-stone block mb-2">Key Ingredients Focus</span>
                                <div className="flex flex-wrap gap-2">
                                    {mod.key_ingredients.map((ing, i) => (
                                        <span key={i} className="px-3 py-1 bg-rove-charcoal text-white text-xs font-bold rounded-lg shadow-sm">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Food Sources List */}
                            <div className="mt-auto">
                                <span className="text-[10px] font-bold uppercase text-rove-stone block mb-2">Top Food Sources</span>
                                <ul className="space-y-2">
                                    {mod.food_sources.map((food, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-rove-charcoal">{food.name}</span>
                                                <span className="text-[10px] text-rove-stone">{food.note}</span>
                                            </div>
                                            {food.amount && (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                    {food.amount}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
