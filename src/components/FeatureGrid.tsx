"use client";

import { motion } from "framer-motion";
import { Activity, Brain, Utensils, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const features = [
    {
        title: "Track Your Rhythm",
        description: "Understand where you are in your cycle and what it means for your body.",
        icon: Calendar,
        color: "text-rove-red",
        bg: "bg-rove-red/10",
        colSpan: "md:col-span-1",
    },
    {
        title: "Plan Your Life",
        description: "Daily recommendations for nutrition, movement, and productivity based on your phase.",
        icon: Brain,
        color: "text-rove-charcoal",
        bg: "bg-rove-cream",
        colSpan: "md:col-span-2",
    },
    {
        title: "Nourish Your Body",
        description: "Clinical-grade supplements that adapt to your changing hormonal needs.",
        icon: Utensils,
        color: "text-rove-green",
        bg: "bg-rove-green/10",
        colSpan: "md:col-span-2",
    },
    {
        title: "Sync Your Fitness",
        description: "Workouts that match your energy levels, from HIIT to restorative yoga.",
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-50",
        colSpan: "md:col-span-1",
    },
];

export function FeatureGrid() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-heading text-4xl md:text-5xl mb-6 text-rove-charcoal">
                        A Complete Operating System <br />
                        <span className="text-rove-stone/60">For Your Biology.</span>
                    </h2>
                    <p className="text-lg text-rove-stone leading-relaxed">
                        Rove isn't just a tracker. It's a proactive guide that helps you live in alignment with your physiology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            className={`group relative overflow-hidden rounded-3xl p-8 border border-rove-stone/10 hover:shadow-xl hover:shadow-rove-stone/5 transition-all duration-500 ${feature.colSpan}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${feature.bg}`} />

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>

                            <h3 className="text-2xl font-heading text-rove-charcoal mb-3">{feature.title}</h3>
                            <p className="text-rove-stone mb-8 max-w-sm">{feature.description}</p>

                            <div className="flex items-center text-sm font-bold text-rove-charcoal group-hover:translate-x-2 transition-transform">
                                Learn more <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
