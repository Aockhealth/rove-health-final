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
        <section className="mb-10">
            <h3 className="font-heading text-lg text-rove-charcoal mb-4 px-2">Cheat Sheet</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Focus Column */}
                <div className="bg-white/40 border border-emerald-100/50 p-6 rounded-[2.5rem] backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <Check className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm uppercase text-emerald-900 tracking-widest">{data.focus.title}</h4>
                    </div>
                    <ul className="space-y-4">
                        {data.focus.items.map((item, i) => (
                            <li key={i} className="text-sm text-rove-charcoal/90 flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-white/50">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span className="font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Avoid Column */}
                <div className="bg-white/40 border border-rose-100/50 p-6 rounded-[2.5rem] backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-100">
                            <X className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm uppercase text-rose-900 tracking-widest">{data.avoid.title}</h4>
                    </div>
                    <ul className="space-y-4">
                        {data.avoid.items.map((item, i) => (
                            <li key={i} className="text-sm text-rove-charcoal/90 flex items-start gap-2 p-3 bg-white/60 rounded-xl border border-white/50">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <span className="font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
