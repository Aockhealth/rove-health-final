import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2, Droplets } from "lucide-react";

interface SymptomRiverProps {
    symptoms: {
        id: string;
        name: string;
        cause: string;
        fix: string;
        foods: string[];
        deficiency: string; // "Fact about the deficiency"
    }[];
}

export function SymptomRiver({ symptoms }: SymptomRiverProps) {
    const scrollRef = useRef(null);

    if (!symptoms || symptoms.length === 0) return null;

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="font-heading text-lg text-rove-charcoal">Symptom & Solution</h3>
                <span className="text-xs text-rove-stone">Scroll for fixes →</span>
            </div>

            <div className="relative -mx-4 px-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar" ref={scrollRef}>
                <div className="flex gap-4 w-max">
                    {symptoms.map((symptom, idx) => (
                        <motion.div
                            key={symptom.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="snap-center w-[300px] bg-white rounded-[1.5rem] p-5 border border-rove-stone/10 shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-heading text-base text-rove-charcoal">{symptom.name}</h4>
                                </div>

                                <p className="text-xs text-rove-stone leading-relaxed mb-4">
                                    <span className="font-semibold text-rove-charcoal">Why: </span>
                                    {symptom.cause}
                                </p>

                                {/* Deficiency Fact - Highlighted Feature */}
                                <div className="mb-4 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Droplets className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-600 uppercase">Deficiency Insight</span>
                                    </div>
                                    <p className="text-[11px] text-amber-900/80 leading-snug">
                                        {symptom.deficiency}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-semibold text-emerald-700">The Fix: {symptom.fix}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {symptom.foods.map((food, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 bg-rove-light-gray rounded-full text-rove-stone border border-rove-stone/10">
                                            {food}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
