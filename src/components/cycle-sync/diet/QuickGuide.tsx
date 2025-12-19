import { Check, X } from "lucide-react";

interface QuickGuideProps {
    data: {
        focus: string[];
        limit: string[];
    };
}

export function QuickGuide({ data }: QuickGuideProps) {
    if (!data) return null;

    return (
        <section className="mb-8">
            <h3 className="font-heading text-lg text-rove-charcoal mb-4 px-2">Quick Reference</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Focus List */}
                <div className="p-5 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-4">Focus On</h4>
                    <ul className="space-y-3">
                        {data.focus.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-2.5 h-2.5 text-emerald-700" />
                                </div>
                                <span className="text-sm text-rove-charcoal">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Limit List */}
                <div className="p-5 rounded-[1.5rem] bg-rose-50/50 border border-rose-100">
                    <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wide mb-4">Limit / Avoid</h4>
                    <ul className="space-y-3">
                        {data.limit.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0">
                                    <X className="w-2.5 h-2.5 text-rose-700" />
                                </div>
                                <span className="text-sm text-rove-charcoal">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
