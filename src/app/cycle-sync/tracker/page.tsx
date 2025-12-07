"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms } from "@/app/actions/cycle-sync";

export default function TrackerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isPeriodMode, setIsPeriodMode] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Mock calendar generation (current week)
    const generateWeek = () => {
        const today = new Date();
        const week = [];
        for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            week.push(date);
        }
        return week;
    };

    const weekDates = generateWeek();

    const symptomCategories = [
        {
            name: "Flow",
            items: ["Spotting", "Light", "Medium", "Heavy"],
            color: "bg-rove-red/10 border-rove-red/20 text-rove-red",
            visible: isPeriodMode
        },
        {
            name: "Mood",
            items: ["Calm", "Anxious", "Irritable", "Energetic", "Weepy"],
            color: "bg-rove-red/10 border-rove-red/20 text-rove-red"
        },
        {
            name: "Body",
            items: ["Bloating", "Cramps", "Headache", "Acne", "Breast Tenderness"],
            color: "bg-rove-green/10 border-rove-green/20 text-rove-green"
        },
        {
            name: "Digestion",
            items: ["Normal", "Constipation", "Diarrhea", "Cravings"],
            color: "bg-amber-500/10 border-amber-500/20 text-amber-600"
        }
    ];

    // Reorder categories if period mode is on
    const sortedCategories = isPeriodMode
        ? [...symptomCategories].sort((a, b) => a.name === "Flow" ? -1 : 1)
        : symptomCategories.filter(c => c.name !== "Flow").concat(symptomCategories.filter(c => c.name === "Flow"));


    const toggleSymptom = (symptom: string) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
          
            await logDailySymptoms({
            date: selectedDate,
            symptoms: selectedSymptoms,
            isPeriod: isPeriodMode,
            flowIntensity: selectedSymptoms.find(s => ["Spotting","Light","Medium","Heavy"].includes(s)) // optional
            });

            // Show success via toast or UI state in real app
            alert("Entry Saved!");
        });
    }



    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            {/* Immersive Background Gradient - Optimized */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={cn("absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[80px] animate-pulse transition-colors duration-1000 will-change-[opacity,background-color]", isPeriodMode ? "bg-rove-red/20" : "bg-rove-red/5")} style={{ animationDuration: "8s" }} />
                <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-rove-green/5 rounded-full blur-[60px] animate-pulse will-change-[opacity]" style={{ animationDuration: "12s" }} />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 p-4 md:p-8 space-y-8 pb-32"
            >
                <motion.header variants={itemVariants} className="flex justify-between items-center">
                    <div>
                        <h1 className="font-heading text-3xl text-rove-charcoal mb-1">Log Symptoms</h1>
                        <p className="text-rove-stone text-sm">Track your daily rhythm.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-rove-charcoal border border-white/50 flex items-center justify-center shadow-sm">
                        <Droplets className="w-5 h-5" />
                    </div>
                </motion.header>

                {/* Calendar Strip */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-sm p-4"
                >
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="font-heading text-lg text-rove-charcoal">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/50"><ChevronLeft className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/50"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {weekDates.map((date, i) => {
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <motion.button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    whileTap={{ scale: 0.9 }}
                                    whileHover={{ scale: 1.05 }}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all border",
                                        isSelected
                                            ? "bg-rove-charcoal text-white border-rove-charcoal shadow-lg shadow-rove-charcoal/20"
                                            : "bg-white/50 border-white/50 text-rove-stone hover:bg-white"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                                    <span className={cn("text-xl font-heading", isSelected ? "text-white" : "text-rove-charcoal")}>
                                        {date.getDate()}
                                    </span>
                                    {isToday && !isSelected && (
                                        <span className="w-1 h-1 rounded-full bg-rove-red mt-1" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Period Toggle */}
                <motion.div
                    variants={itemVariants}
                    className={cn(
                        "relative overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer group",
                        isPeriodMode
                            ? "bg-gradient-to-r from-rove-red/10 to-rove-red/5 border-rove-red/20 shadow-[0_8px_32px_rgba(220,38,38,0.1)]"
                            : "bg-white/30 border-white/40 hover:bg-white/40 shadow-sm"
                    )}
                    onClick={() => setIsPeriodMode(!isPeriodMode)}
                    whileTap={{ scale: 0.98 }}
                >
                    {isPeriodMode && (
                        <div className="absolute inset-0 bg-rove-red/5 blur-xl" />
                    )}

                    <div className="relative z-10 flex items-center justify-between p-1.5 pl-5">
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5 transition-colors",
                                isPeriodMode ? "text-rove-red/60" : "text-rove-charcoal/40"
                            )}>
                                Status
                            </span>
                            <span className={cn(
                                "font-heading text-lg transition-colors flex items-center gap-2",
                                isPeriodMode ? "text-rove-red" : "text-rove-charcoal"
                            )}>
                                {isPeriodMode ? "Period Started" : "Log Period"}
                                {isPeriodMode && <span className="flex h-2 w-2 rounded-full bg-rove-red animate-pulse" />}
                            </span>
                        </div>

                        <div className={cn(
                            "h-12 px-6 rounded-[1.5rem] flex items-center gap-2 transition-all duration-500",
                            isPeriodMode ? "bg-rove-red text-white shadow-lg shadow-rove-red/20" : "bg-white/50 text-rove-charcoal/60"
                        )}>
                            <Droplets className={cn("w-4 h-4 transition-transform duration-500", isPeriodMode && "scale-110")} />
                            <span className="text-xs font-medium tracking-wide">
                                {isPeriodMode ? "Active" : "Start"}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Symptom Logging */}
                <div className="space-y-6">
                    {sortedCategories.map((category, idx) => (
                        <motion.section
                            key={category.name}
                            variants={itemVariants}
                            layout // Animate layout changes when reordering
                        >
                            <h3 className="font-heading text-lg text-rove-charcoal mb-3 px-2">{category.name}</h3>
                            <div className="flex flex-wrap gap-3">
                                {category.items.map((item) => {
                                    const isActive = selectedSymptoms.includes(item);
                                    return (
                                        <motion.button
                                            key={item}
                                            onClick={() => toggleSymptom(item)}
                                            whileTap={{ scale: 0.9 }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className={cn(
                                                "px-5 py-2.5 rounded-[1.5rem] text-sm font-medium border transition-all flex items-center gap-2 shadow-sm backdrop-blur-sm",
                                                isActive
                                                    ? "bg-rove-charcoal text-white border-rove-charcoal shadow-md"
                                                    : "bg-white/60 text-rove-charcoal/80 border-white/60 hover:bg-white hover:border-white"
                                            )}
                                        >
                                            {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-3 h-3" /></motion.div>}
                                            {item}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Save Button */}
                <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent md:static md:bg-none md:p-0 z-20">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleSave} size="lg" className="w-full max-w-md mx-auto rounded-full h-14 text-lg font-heading shadow-xl shadow-rove-charcoal/20 bg-rove-charcoal text-white hover:bg-rove-charcoal/90" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Daily Log"}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
