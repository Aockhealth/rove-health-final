"use client";
import { Check, X } from "lucide-react";

interface DietCheatSheetProps {
    data: {
        focus: { title: string; items: string[] };
        avoid: { title: string; items: string[] };
    };
    theme: any;
}

export function DietCheatSheet({ data, theme }: DietCheatSheetProps) {
    if (!data) return null;

    return (
        <section className="mb-6">
            <h3 className="font-heading text-lg text-rove-charcoal mb-4 px-2">One-Glance Strategy</h3>

            <div className="bg-white/40 border border-white/60 p-5 rounded-[2rem] backdrop-blur-md shadow-sm space-y-6">

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

                <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent" />

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
