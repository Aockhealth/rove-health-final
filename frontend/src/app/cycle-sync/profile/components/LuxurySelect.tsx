import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxurySelectProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    icon?: any;
    label: string;
    tooltip?: string;
}

export function LuxurySelect({ value, options, onChange, icon: Icon, label, tooltip }: LuxurySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const selectedOption = options.find(o => o.value === value) || options[0];

    return (
        <div className="relative z-20">
            <div className="flex items-center gap-1.5 mb-2">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    {Icon && <Icon className="w-3 h-3" />} {label}
                </label>

                {tooltip && (
                    <div
                        className="relative cursor-help"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <HelpCircle className="w-3 h-3 text-stone-300 hover:text-stone-500 transition-colors" />
                        <AnimatePresence>
                            {showTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-800 text-white text-[10px] p-2 rounded-lg z-[60] w-48 font-normal shadow-xl pointer-events-none text-center leading-relaxed"
                                >
                                    {tooltip}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-stone-50/50 border border-stone-100 hover:border-stone-300 rounded-xl px-4 py-3 flex items-center justify-between transition-all group"
                >
                    <span className="font-heading text-lg text-stone-700">{selectedOption.label}</span>
                    <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full mt-2 left-0 right-0 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                            >
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => { onChange(option.value); setIsOpen(false); }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left flex items-center justify-between text-sm hover:bg-stone-50 transition-colors",
                                            option.value === value ? "font-bold text-stone-800" : "font-medium text-stone-500"
                                        )}
                                    >
                                        {option.label}
                                        {option.value === value && <Check className="w-3 h-3 text-stone-800" />}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
