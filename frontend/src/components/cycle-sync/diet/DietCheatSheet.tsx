"use client";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DietCheatSheetProps {
    data: {
        focus: { title: string; items: string[] };
        avoid: { title: string; items: string[] };
    };
    theme?: any;
    phase?: string;
}

export function DietCheatSheet({ data, theme, phase }: DietCheatSheetProps) {
    if (!data) return null;

    // Organic Chromatics Styling
    const currentPhase = phase || "Menstrual";
    const themes: Record<string, any> = {
        "Menstrual": { border: "border-phase-menstrual/20", shadow: "shadow-phase-menstrual/5" },
        "Follicular": { border: "border-phase-follicular/20", shadow: "shadow-phase-follicular/5" },
        "Ovulatory": { border: "border-phase-ovulatory/20", shadow: "shadow-phase-ovulatory/5" },
        "Luteal": { border: "border-phase-luteal/20", shadow: "shadow-phase-luteal/5" }
    };
    const currentTheme = themes[currentPhase] || themes["Menstrual"];

    return (
        <section className="mb-6">
            <h3 className="font-heading text-lg text-gray-800 mb-4 px-2">One-Glance Strategy</h3>

            <div className={cn(
                "bg-white/60 backdrop-blur-md rounded-[2rem] p-5 transition-all text-sm",
                currentTheme.border,
                currentTheme.shadow,
                "border shadow-sm"
            )}>

                {/* Focus Row */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Check className="w-3 h-3" />
                        </div>
                        <h4 className="font-bold text-xs uppercase text-emerald-900 tracking-widest leading-none mt-0.5">{data.focus.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.focus.items.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-900 text-xs font-bold shadow-sm backdrop-blur-sm">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />

                {/* Avoid Row */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <X className="w-3 h-3" />
                        </div>
                        <h4 className="font-bold text-xs uppercase text-rose-900 tracking-widest leading-none mt-0.5">{data.avoid.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.avoid.items.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-rose-50/50 border border-rose-100 text-rose-900 text-xs font-medium shadow-sm opacity-80 decoration-rose-300/50 line-through decoration-2">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
