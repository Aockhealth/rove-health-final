"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Loader2, Calendar as CalendarIcon, Lock } from "lucide-react";
// 1. Import Variants type here
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog } from "@/app/actions/cycle-sync";

export default function TrackerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isPeriodMode, setIsPeriodMode] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isLoadingData, setIsLoadingData] = useState(false);

    const dateInputRef = useRef<HTMLInputElement>(null);

    const isFutureDate = (dateToCheck: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(dateToCheck);
        selected.setHours(0, 0, 0, 0);
        return selected > today;
    };

    const isFuture = isFutureDate(selectedDate);

    useEffect(() => {
        let isMounted = true;
        const loadLogForDate = async () => {
            setIsLoadingData(true);
            try {
                const log = await getDailyLog(selectedDate);
                if (isMounted) {
                    if (log) {
                        setSelectedSymptoms(log.symptoms || []);
                        setIsPeriodMode(log.is_period || false);
                    } else {
                        setSelectedSymptoms([]);
                        setIsPeriodMode(false);
                    }
                }
            } catch (e) {
                console.error("Failed to load daily log", e);
            } finally {
                if (isMounted) setIsLoadingData(false);
            }
        };
        loadLogForDate();
        return () => { isMounted = false; };
    }, [selectedDate]);

    const handleDateChange = (newDate: Date) => {
        setSelectedSymptoms([]);
        setIsPeriodMode(false);
        setSelectedDate(newDate);
    };

    const generateWeek = () => {
        const anchorDate = new Date(selectedDate);
        const week = [];
        for (let i = -3; i <= 3; i++) {
            const date = new Date(anchorDate);
            date.setDate(anchorDate.getDate() + i);
            week.push(date);
        }
        return week;
    };
    const weekDates = generateWeek();

    const navigateWeek = (direction: "prev" | "next") => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
        handleDateChange(newDate);
    };

    const handleDateJump = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return;
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        handleDateChange(newDate);
    };

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
            color: "bg-rove-red/10 border-rove-red/20 text-rove-red",
            visible: true
        },
        {
            name: "Body",
            items: ["Bloating", "Cramps", "Headache", "Acne", "Breast Tenderness"],
            color: "bg-rove-green/10 border-rove-green/20 text-rove-green",
            visible: true
        },
        {
            name: "Digestion",
            items: ["Normal", "Constipation", "Diarrhea", "Cravings"],
            color: "bg-amber-500/10 border-amber-500/20 text-amber-600",
            visible: true
        }
    ];

    const activeCategories = symptomCategories.filter(cat => cat.visible);

    const toggleSymptom = (symptom: string) => {
        if (isFuture) return; 
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const handleSave = () => {
        if (isFuture) return;
        startTransition(async () => {
            await logDailySymptoms({
                date: selectedDate,
                symptoms: selectedSymptoms,
                isPeriod: isPeriodMode,
                flowIntensity: selectedSymptoms.find(s => ["Spotting","Light","Medium","Heavy"].includes(s))
            });
            alert("Entry Saved!");
        });
    }

    // 2. Explicitly type the variants to fix the TypeScript error
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-rove-cream/20">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={cn("absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[80px] animate-pulse transition-colors duration-1000", isPeriodMode ? "bg-rove-red/20" : "bg-rove-red/5")} />
                <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-rove-green/5 rounded-full blur-[60px] animate-pulse" />
            </div>

            {/* 3. Added containerVariants here so staggering works */}
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
                    {isLoadingData && <Loader2 className="w-5 h-5 animate-spin text-rove-stone" />}
                </motion.header>

                <motion.div variants={itemVariants} className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4 px-2">
                         <div 
                            onClick={() => dateInputRef.current?.showPicker()}
                            className="flex items-center gap-2 cursor-pointer group rounded-lg hover:bg-white/50 px-2 py-1 -ml-2 transition-colors"
                        >
                            <h2 className="font-heading text-lg text-rove-charcoal">
                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <CalendarIcon className="w-4 h-4 text-rove-stone group-hover:text-rove-charcoal transition-colors" />
                            <input type="date" ref={dateInputRef} className="invisible absolute w-0 h-0" onChange={handleDateJump} />
                        </div>

                        <div className="flex gap-1">
                            <Button onClick={() => navigateWeek("prev")} size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/50"><ChevronLeft className="w-4 h-4" /></Button>
                            <Button onClick={() => navigateWeek("next")} size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white/50"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {weekDates.map((date, i) => {
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <motion.button
                                    key={i}
                                    onClick={() => handleDateChange(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all border",
                                        isSelected
                                            ? "bg-rove-charcoal text-white border-rove-charcoal shadow-lg"
                                            : "bg-white/50 border-white/50 text-rove-stone hover:bg-white"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                                    <span className={cn("text-xl font-heading", isSelected ? "text-white" : "text-rove-charcoal")}>{date.getDate()}</span>
                                    {isToday && !isSelected && <span className="w-1 h-1 rounded-full bg-rove-red mt-1" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className={cn(
                        "relative overflow-hidden rounded-[2rem] border transition-all duration-500",
                        isPeriodMode
                            ? "bg-gradient-to-r from-rove-red/10 to-rove-red/5 border-rove-red/20 shadow-[0_8px_32px_rgba(220,38,38,0.1)]"
                            : "bg-white/30 border-white/40 shadow-sm",
                        isFuture ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer hover:bg-white/40 group"
                    )}
                    onClick={() => !isFuture && setIsPeriodMode(!isPeriodMode)}
                >
                    <div className="relative z-10 flex items-center justify-between p-1.5 pl-5">
                        <div className="flex flex-col">
                            <span className={cn("text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5", isPeriodMode ? "text-rove-red/60" : "text-rove-charcoal/40")}>Status</span>
                            <span className={cn("font-heading text-lg transition-colors flex items-center gap-2", isPeriodMode ? "text-rove-red" : "text-rove-charcoal")}>
                                {isFuture ? "Future Date" : (isPeriodMode ? "Period Started" : "Log Period")}
                            </span>
                        </div>
                        <div className={cn("h-12 px-6 rounded-[1.5rem] flex items-center gap-2 transition-all duration-500", 
                            isPeriodMode ? "bg-rove-red text-white" : "bg-white/50 text-rove-charcoal/60"
                        )}>
                            {isFuture ? <Lock className="w-4 h-4" /> : <Droplets className={cn("w-4 h-4 transition-transform duration-500", isPeriodMode && "scale-110")} />}
                            <span className="text-xs font-medium tracking-wide">
                                {isFuture ? "Locked" : (isPeriodMode ? "Active" : "Start")}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className={cn("space-y-6 transition-opacity duration-300", isFuture && "opacity-40 pointer-events-none")}>
                    {activeCategories.map((category) => (
                        <motion.section key={category.name} variants={itemVariants} layout>
                            <h3 className="font-heading text-lg text-rove-charcoal mb-3 px-2">{category.name}</h3>
                            <div className="flex flex-wrap gap-3">
                                {category.items.map((item) => {
                                    const isActive = selectedSymptoms.includes(item);
                                    return (
                                        <motion.button
                                            key={item}
                                            onClick={() => toggleSymptom(item)}
                                            whileTap={{ scale: 0.9 }}
                                            className={cn(
                                                "px-5 py-2.5 rounded-[1.5rem] text-sm font-medium border transition-all flex items-center gap-2 shadow-sm backdrop-blur-sm",
                                                isActive
                                                    ? "bg-rove-charcoal text-white border-rove-charcoal shadow-md"
                                                    : "bg-white/60 text-rove-charcoal/80 border-white/60 hover:bg-white"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {item}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.section>
                    ))}
                </div>

                <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent md:static md:bg-none md:p-0 z-20">
                    <Button 
                        onClick={handleSave} 
                        size="lg" 
                        className={cn(
                            "w-full max-w-md mx-auto rounded-full h-14 text-lg font-heading transition-all",
                            isFuture 
                                ? "bg-rove-stone/20 text-rove-stone cursor-not-allowed hover:bg-rove-stone/20 shadow-none" 
                                : "bg-rove-charcoal text-white hover:bg-rove-charcoal/90 shadow-xl"
                        )}
                        disabled={isPending || isFuture}
                    >
                        {isPending ? "Saving..." : (isFuture ? "Cannot Log Future Dates" : "Save Daily Log")}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}