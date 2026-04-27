"use client";

import { motion } from "framer-motion";
import { Utensils, Activity, Sparkles, Heart, AlertCircle, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface StructuredResponseRendererProps {
    payload: any;
    narrative: string;
}

export function StructuredResponseRenderer({ payload, narrative }: StructuredResponseRendererProps) {
    if (!payload) return <p>{narrative}</p>;

    const {
        nutrition,
        movement,
        lifestyle,
        supplement_spotlight,
        check_in_question,
        missing_data,
        safety,
        phase_context
    } = payload;

    // Filter out the narrative if it's just a placeholder like "Structured response generated."
    const displayNarrative = narrative !== "Structured response generated." ? narrative : phase_context || "";

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Narrative */}
            {displayNarrative && (
                <div className="text-sm prose prose-stone max-w-none">
                    <ReactMarkdown
                        components={{
                            h3: ({ node, ...props }) => <h3 className="font-serif text-base font-semibold mt-4 mb-2 first:mt-0 tracking-tight" style={{ color: '#2D2420' }} {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed mb-3 last:mb-0" style={{ color: '#2D2420' }} {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-4 space-y-1.5 mt-2 mb-3 last:mb-0" style={{ color: '#2D2420' }} {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: '#1A1A1A' }} {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-[0.95em]" style={{ color: '#A8A29E' }} {...props} />,
                            hr: ({ node, ...props }) => <hr className="my-4" style={{ borderColor: 'rgba(45, 36, 32, 0.08)' }} {...props} />,
                        }}
                    >
                        {displayNarrative}
                    </ReactMarkdown>
                </div>
            )}

            {/* Structured Cards */}
            <div className="grid grid-cols-1 gap-3">
                {nutrition && (
                    <Card
                        icon={<Utensils className="w-4 h-4" />}
                        title="Nutrition Highlight"
                        subtitle={nutrition.meal}
                        content={nutrition.reason}
                        color="bg-orange-50/50 border-orange-100"
                        iconColor="text-orange-500"
                    />
                )}

                {movement && (
                    <Card
                        icon={<Activity className="w-4 h-4" />}
                        title="Movement Recommendation"
                        subtitle={movement.activity}
                        content={movement.reason}
                        color="bg-blue-50/50 border-blue-100"
                        iconColor="text-blue-500"
                    />
                )}

                {lifestyle && (
                    <Card
                        icon={<Sparkles className="w-4 h-4" />}
                        title="Lifestyle Tip"
                        subtitle={lifestyle.habit}
                        content={lifestyle.reason}
                        color="bg-purple-50/50 border-purple-100"
                        iconColor="text-purple-500"
                    />
                )}

                {supplement_spotlight && (
                    <Card
                        icon={<Info className="w-4 h-4" />}
                        title="Supplement Spotlight"
                        subtitle={supplement_spotlight.nutrient_or_herb}
                        content={supplement_spotlight.reason}
                        footer={supplement_spotlight.safety_note}
                        color="bg-green-50/50 border-green-100"
                        iconColor="text-green-600"
                    />
                )}
            </div>

            {/* Safety Note */}
            {safety && safety.status !== "normal" && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-800 leading-relaxed font-medium">
                        {safety.message}
                    </p>
                </div>
            )}
        </div>
    );
}

function Card({ icon, title, subtitle, content, footer, color, iconColor }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    content: string;
    footer?: string;
    color: string;
    iconColor: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("p-4 rounded-2xl border flex flex-col gap-2 shadow-sm transition-all hover:shadow-md", color)}
        >
            <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg bg-white/80 shadow-sm", iconColor)}>
                    {icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {title}
                </span>
            </div>
            <div>
                <h4 className="text-sm font-bold text-stone-800 mb-0.5">
                    {subtitle}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                    {content}
                </p>
            </div>
            {footer && (
                <div className="mt-1 pt-2 border-t border-black/5 flex items-start gap-1.5">
                    <Heart className="w-3 h-3 text-stone-400 mt-0.5" />
                    <p className="text-[10px] text-stone-400 italic leading-tight">
                        {footer}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
