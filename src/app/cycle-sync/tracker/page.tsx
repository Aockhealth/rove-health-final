"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Check, Droplets, Calendar, Edit2, X, Info, Waves, Shield, Dumbbell, Clock, Plus, Minus, Droplet, Heart, Moon, ZapOff, Smile, Activity, PenLine, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logDailySymptoms, getDailyLog, fetchUserCycleSettings, updateLastPeriodDate, updateCycleLength, fetchMonthLogs } from "@/app/actions/cycle-sync";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";

type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

// MPIQ Options & Types
type Consistency = "Tacky" | "Creamy" | "Stretchy" | "Bloody";
type Appearance = "White/Yellow" | "Clear" | "Red";
type Sensation = "Dry" | "Moist" | "Wet" | "Slippery";

const consistencyOptions: { label: Consistency; score: number; desc: string; type: "video" | "image"; src: string }[] = [
    { label: "Tacky", score: 4, desc: "Sticky, glue-like", type: "video", src: "/images/gifs/tacky.mp4" },
    { label: "Creamy", score: 3, desc: "Lotion-like, smooth", type: "video", src: "/images/gifs/creamy.mp4" },
    { label: "Stretchy", score: 2, desc: "Raw egg white, elastic", type: "video", src: "/images/gifs/stretchy.mp4" },
    { label: "Bloody", score: 1, desc: "Red/brown tint", type: "video", src: "/images/gifs/bloody.mp4" },
];

const appearanceOptions: { label: Appearance; score: number; desc: string; type: "video" | "image"; src: string }[] = [
    { label: "White/Yellow", score: 3, desc: "Cloudy or cream colored", type: "image", src: "/images/gifs/white yellow appearance.jpeg" },
    { label: "Clear", score: 2, desc: "Transparent like glass", type: "image", src: "/images/gifs/clear appearance.jpeg" },
    { label: "Red", score: 1, desc: "Pink to bright red", type: "image", src: "/images/gifs/red appearance.jpeg" },
];

const sensationOptions: { label: Sensation; score: number; desc: string }[] = [
    { label: "Dry", score: 4, desc: "No fluid felt" },
    { label: "Moist", score: 3, desc: "Slightly damp" },
    { label: "Wet", score: 2, desc: "Distinctly wet" },
    { label: "Slippery", score: 1, desc: "Lubricated, sliding" },
];

export default function TrackerPageRedesigned() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Standard Tracker State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string[]>([]);
    const [exerciseMinutes, setExerciseMinutes] = useState<string>("");
    const [waterIntake, setWaterIntake] = useState<number>(0);
    const [isPouring, setIsPouring] = useState(false);
    const [selectedSelfLove, setSelectedSelfLove] = useState<string[]>([]);
    const [selfLoveOther, setSelfLoveOther] = useState<string>("");
    const [selectedSleepQuality, setSelectedSleepQuality] = useState<string[]>([]);
    const [sleepHours, setSleepHours] = useState<string>("");
    const [sleepMinutes, setSleepMinutes] = useState<string>("");
    const [selectedDisruptors, setSelectedDisruptors] = useState<string[]>([]);
    const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
    const [cervicalDischarge, setCervicalDischarge] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [trackMode, setTrackMode] = useState<"period" | "discharge">("discharge");
    const [isEditingCycle, setIsEditingCycle] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [monthLogs, setMonthLogs] = useState<Record<string, any>>({});

    // MPIQ Specific State - Removed mpiqLastPeriod (using cycleSettings directly)
    const [mpiqConsistency, setMpiqConsistency] = useState<Consistency | null>(null);
    const [mpiqAppearance, setMpiqAppearance] = useState<Appearance | null>(null);
    const [mpiqSensation, setMpiqSensation] = useState<Sensation | null>(null);
    const [isDischargeExpanded, setIsDischargeExpanded] = useState(false);

    const [cycleSettings, setCycleSettings] = useState({
        last_period_start: "", // Loaded from DB
        cycle_length_days: 28,
        period_length_days: 5
    });

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Load cycle settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            const settings = await fetchUserCycleSettings();
            if (settings) {
                setCycleSettings({
                    last_period_start: settings.last_period_start,
                    cycle_length_days: settings.cycle_length_days || 28,
                    period_length_days: settings.period_length_days || 5
                });

                // ⚠️ AUTO-PROMPT: If no period start date, force modal open
                if (!settings.last_period_start) {
                    setIsEditingCycle(true);
                    toast.info("Welcome back! Please set your last period date to sync your cycle.", {
                        duration: 6000
                    });
                }
            } else {
                // If settings completely missing, also prompt (though likely user is new)
                setIsEditingCycle(true);
            }
        };
        loadSettings();
    }, []);


    // Fetch month logs for calendar persistence (including adjacent months for padding days)
    // this code is calling actions/cycle-sync.ts - to return all coluns when you fetchMonthLogs
    useEffect(() => {
        const loadMonthLogs = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            // Fetch logs for current month and adjacent months (for padding days)
            const monthsToFetch = [
                new Date(year, month - 1, 1), // Previous month
                new Date(year, month, 1),     // Current month
                new Date(year, month + 1, 1)  // Next month
            ];

            const allLogs: any[] = [];
            for (const monthDate of monthsToFetch) {
                const monthYear = monthDate.getFullYear();
                const monthNum = String(monthDate.getMonth() + 1).padStart(2, '0');
                const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                allLogs.push(...logs);
            }

            const logMap: Record<string, any> = {};
            allLogs.forEach((l: any) => {
                logMap[l.date] = l;
            });
            setMonthLogs(logMap);
        };
        loadMonthLogs();
    }, [currentMonth]);

    // Fetch existing log when date changes
    useEffect(() => {
        const fetchLog = async () => {
            const data = await getDailyLog(formatDate(selectedDate));
            if (data) {
                setSelectedSymptoms(data.symptoms || []);
                setSelectedMoods(data.moods || []);
                setSelectedExercise(data.exercise_types || []);
                setExerciseMinutes(data.exercise_minutes ? String(data.exercise_minutes) : "");
                setWaterIntake(data.water_intake || 0);
                setSelectedSelfLove(data.self_love_tags || []);
                setSelfLoveOther(data.self_love_other || "");
                setSelectedSleepQuality(data.sleep_quality || []);
                if (data.sleep_minutes) {
                    setSleepHours(Math.floor(data.sleep_minutes / 60).toString());
                    setSleepMinutes((data.sleep_minutes % 60).toString());
                } else {
                    setSleepHours("");
                    setSleepMinutes("");
                }
                setFlowIntensity(data.flow_intensity || null);
                setSelectedDisruptors(data.disruptors || []);
                // Handle Cervical Discharge (Parse JSON if applicable)
                if (data.cervical_discharge) {
                    try {
                        // Check if it looks like JSON structure
                        if (data.cervical_discharge.startsWith('[')) {
                            // Format: ["Consistency", "Appearance", "Sensation"]
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (Array.isArray(parsed) && parsed.length >= 3) {
                                setMpiqConsistency(parsed[0]);
                                setMpiqAppearance(parsed[1]);
                                setMpiqSensation(parsed[2]);
                                // derived cervicalDischarge string will adjust via its own useEffect
                            }
                        } else if (data.cervical_discharge.startsWith('{')) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (parsed.type === 'MPIQ') {
                                setMpiqConsistency(parsed.consistency || null);
                                setMpiqAppearance(parsed.appearance || null);
                                setMpiqSensation(parsed.sensation || null);
                                setCervicalDischarge(parsed.legacyLabel || null);
                            } else {
                                setCervicalDischarge(data.cervical_discharge);
                            }
                        } else {
                            // Legacy string format
                            setCervicalDischarge(data.cervical_discharge);
                            setMpiqConsistency(null);
                            setMpiqAppearance(null);
                            setMpiqSensation(null);
                        }
                    } catch (e) {
                        // Fallback if parse fails
                        setCervicalDischarge(data.cervical_discharge);
                        setMpiqConsistency(null);
                        setMpiqAppearance(null);
                        setMpiqSensation(null);
                    }
                } else {
                    setCervicalDischarge(null);
                    setMpiqConsistency(null);
                    setMpiqAppearance(null);
                    setMpiqSensation(null);
                }

                setNote(data.notes || "");

                // Set initial toggle state based on data
                if (data.flow_intensity || data.is_period) {
                    setTrackMode('period');
                } else {
                    setTrackMode('discharge');
                }
            } else {
                setSelectedSymptoms([]);
                setSelectedMoods([]);
                setSelectedExercise([]);
                setExerciseMinutes("");
                setWaterIntake(0);
                setSelectedSelfLove([]);
                setSelfLoveOther("");
                setSelectedSleepQuality([]);
                setSleepHours("");
                setSleepMinutes("");
                setSelectedDisruptors([]);
                setFlowIntensity(null);
                setCervicalDischarge(null);
                setNote("");
                setTrackMode('discharge');
                // Reset MPIQ partials
                setMpiqConsistency(null);
                setMpiqAppearance(null);
                setMpiqSensation(null);
            }
        };
        fetchLog();
    }, [selectedDate]);

    // Update derived cervical discharge based on MPIQ (Only when user is actively changing MPIQ inputs)
    useEffect(() => {
        if (trackMode === 'discharge') {
            // Simple mapping from MPIQ to legacy list for consistency
            // "Dry", "Sticky", "Creamy", "Watery", "Egg White"
            if (mpiqConsistency === "Stretchy" || mpiqSensation === "Slippery") {
                setCervicalDischarge("Egg White");
            } else if (mpiqSensation === "Wet" || mpiqAppearance === "Clear") {
                setCervicalDischarge("Watery");
            } else if (mpiqConsistency === "Creamy") {
                setCervicalDischarge("Creamy");
            } else if (mpiqConsistency === "Tacky") {
                setCervicalDischarge("Sticky");
            } else if (mpiqSensation === "Dry") {
                setCervicalDischarge("Dry");
            }
        }
    }, [mpiqConsistency, mpiqAppearance, mpiqSensation, trackMode]);

    // Confetti Effect for Water Goal
    useEffect(() => {
        if (waterIntake === 8) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#60A5FA', '#3B82F6', '#93C5FD', '#FFFFFF'] // Blue/Water theme
            });
        }
    }, [waterIntake]);

    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    // Helper to check if date is in the past (midnight safe)
    const isPastDate = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const days = [];
        const startPadding = firstDayOfMonth.getDay();

        for (let i = 0; i < startPadding; i++) {
            const d = new Date(year, month, 0 - i);
            days.unshift({ date: d, isPadding: true });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isPadding: false });
        }

        return days;
    };

    /*    const getRelevantPeriodStart = (targetDate: Date) => {
           const dateStr = formatDate(targetDate);
   
           // STRICT: For past dates, ONLY use logged data, never predictions
           if (isPastDate(targetDate)) {
               // 1. Check if the target day itself is logged as period
               if (monthLogs[dateStr]?.is_period) {
                   // Find the start of this specific streak
                   let current = new Date(targetDate);
                   let firstDay = dateStr;
   
                   while (true) {
                       current.setDate(current.getDate() - 1);
                       const prevStr = formatDate(current);
                       if (monthLogs[prevStr]?.is_period) {
                           firstDay = prevStr;
                       } else {
                           break;
                       }
                   }
                   return firstDay;
               }
   
               // 2. Look for the most recent logged period BEFORE targetDate
               const logDates = Object.keys(monthLogs).sort().reverse();
               for (const d of logDates) {
                   if (d < dateStr && monthLogs[d]?.is_period) {
                       // Found a period day before target. Find its start.
                       let current = new Date(d);
                       let firstDay = d;
                       while (true) {
                           current.setDate(current.getDate() - 1);
                           const prevStr = formatDate(current);
                           if (monthLogs[prevStr]?.is_period) {
                               firstDay = prevStr;
                           } else {
                               break;
                           }
                       }
                       return firstDay;
                   }
               }
   
               // 3. For past dates with no logged data, return null (no prediction)
               return null;
           }
   
           // For current/future dates: Check logged data first, then use global settings for prediction
           // 1. Check if the target day itself is logged as period
           if (monthLogs[dateStr]?.is_period) {
               let current = new Date(targetDate);
               let firstDay = dateStr;
   
               while (true) {
                   current.setDate(current.getDate() - 1);
                   const prevStr = formatDate(current);
                   if (monthLogs[prevStr]?.is_period) {
                       firstDay = prevStr;
                   } else {
                       break;
                   }
               }
               return firstDay;
           }
   
           // 2. Look for most recent logged period
           const logDates = Object.keys(monthLogs).sort().reverse();
           for (const d of logDates) {
               if (d < dateStr && monthLogs[d]?.is_period) {
                   let current = new Date(d);
                   let firstDay = d;
                   while (true) {
                       current.setDate(current.getDate() - 1);
                       const prevStr = formatDate(current);
                       if (monthLogs[prevStr]?.is_period) {
                           firstDay = prevStr;
                       } else {
                           break;
                       }
                   }
                   return firstDay;
               }
           }
   
           // 3. Use global settings for future prediction only
           if (cycleSettings.last_period_start) {
               return cycleSettings.last_period_start;
           }
   
           return null;
       }; */
    const getRelevantPeriodStart = (targetDate: Date) => {
        const dateStr = formatDate(targetDate);

        const safeGlobalStart = (() => {
            if (!cycleSettings.last_period_start) return null;

            const last = new Date(cycleSettings.last_period_start);
            last.setHours(0, 0, 0, 0);

            const check = new Date(targetDate);
            check.setHours(0, 0, 0, 0);

            return last <= check ? cycleSettings.last_period_start : null;
        })();

        // ===== PAST DATES =====
        if (isPastDate(targetDate)) {

            if (monthLogs[dateStr]?.is_period) {
                let current = new Date(targetDate);
                let firstDay = dateStr;

                while (true) {
                    current.setDate(current.getDate() - 1);
                    const prevStr = formatDate(current);
                    if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
                    else break;
                }
                return firstDay;
            }

            const logDates = Object.keys(monthLogs).sort().reverse();
            for (const d of logDates) {
                if (d < dateStr && monthLogs[d]?.is_period) {
                    let current = new Date(d);
                    let firstDay = d;

                    while (true) {
                        current.setDate(current.getDate() - 1);
                        const prevStr = formatDate(current);
                        if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
                        else break;
                    }
                    return firstDay;
                }
            }

            // If no log found, use BACKCASTING from global start
            if (cycleSettings.last_period_start) {
                const globalStart = new Date(cycleSettings.last_period_start);
                globalStart.setHours(0, 0, 0, 0);
                const cycleLen = cycleSettings.cycle_length_days || 28;

                // If target is BEFORE global start, project backwards
                if (targetDate < globalStart) {
                    const diffTime = globalStart.getTime() - targetDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const cyclesBack = Math.ceil(diffDays / cycleLen);

                    const simulatedStart = new Date(globalStart);
                    simulatedStart.setDate(globalStart.getDate() - (cyclesBack * cycleLen));
                    return formatDate(simulatedStart);
                }
            }

            return null;
        }

        // ===== TODAY / FUTURE =====
        if (monthLogs[dateStr]?.is_period) {
            let current = new Date(targetDate);
            let firstDay = dateStr;

            while (true) {
                current.setDate(current.getDate() - 1);
                const prevStr = formatDate(current);
                if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
                else break;
            }
            return firstDay;
        }

        const logDates = Object.keys(monthLogs).sort().reverse();
        for (const d of logDates) {
            if (d < dateStr && monthLogs[d]?.is_period) {
                let current = new Date(d);
                let firstDay = d;

                while (true) {
                    current.setDate(current.getDate() - 1);
                    const prevStr = formatDate(current);
                    if (monthLogs[prevStr]?.is_period) firstDay = prevStr;
                    else break;
                }
                return firstDay;
            }
        }

        return safeGlobalStart;
    };


    // Calculate current day of cycle: date - startDate
    const getCurrentDay = (date: Date): number => {
        const startStr = getRelevantPeriodStart(date);
        if (!startStr) return 1;

        const start = new Date(startStr);
        start.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const diffTime = checkDate.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // For past dates: return actual days since start (no modulo)
        if (isPastDate(date)) {
            return diffDays + 1;
        }

        // For future dates: use modulo for cycle prediction
        const cycleLength = cycleSettings.cycle_length_days || 28;
        let dayInCycle = (diffDays % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;
        return dayInCycle;
    };

    //changed getphase
    /* const getPhaseForDate = (date: Date): Phase => {

        console.log("Phase debug", {
            date: formatDate(date),
            relevantStart: getRelevantPeriodStart(date),
            lastStart: cycleSettings.last_period_start,
            hasLog: monthLogs[formatDate(date)]
        });

        const dateStr = formatDate(date);

        if (monthLogs[dateStr]?.is_period) return "Menstrual";

        const startStr = getRelevantPeriodStart(date);
        if (!startStr) return "Follicular";

        const currentDay = getCurrentDay(date);

        const cycleLength = cycleSettings.cycle_length_days || 28;
        const periodLength = cycleSettings.period_length_days || 5;

        const ovulationDay = cycleLength - 14;

        if (currentDay <= periodLength) return "Menstrual";

        if (currentDay >= ovulationDay - 2 && currentDay <= ovulationDay + 2)
            return "Ovulatory";

        if (currentDay > ovulationDay + 2) return "Luteal";

        return "Follicular";
    };
 */
    const getPhaseForDate = (date: Date): Phase => {
        const dateStr = formatDate(date);
        const log = monthLogs[dateStr];

        // 🔹 1️⃣ Explicit Period Log always wins
        if (log?.is_period) return "Menstrual";

        // 🔹 2️⃣ Calculate Phase based on Cycle Day (even if logged!)
        const startStr = getRelevantPeriodStart(date);

        // If we can't find ANY start date (global or logged), default to Follicular
        if (!startStr) return "Follicular";

        // Use modulo logic for ALL dates to ensure consistent 4-phase cycles (Past & Future)
        const start = new Date(startStr);
        start.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const diffTime = checkDate.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const cycleLength = cycleSettings.cycle_length_days || 28;
        let dayInCycle = (diffDays % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;

        const periodLength = cycleSettings.period_length_days || 5;
        const ovulationDay = cycleLength - 14;

        if (dayInCycle <= periodLength) return "Menstrual";
        if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) return "Ovulatory"; // 3-day fertile window
        if (dayInCycle > ovulationDay + 1) return "Luteal";

        return "Follicular";
    };


    const calendarDays = getCalendarDays();

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(prev);
    };

    const flowOptions = ["Spotting", "Low", "Normal", "High", "Heavy"];
    // Legacy mapping support
    // const cervicalDischargeOptions = ["Dry", "Sticky", "Creamy", "Watery", "Egg White"];
    const symptomOptions = ["Headache", "Cramps", "Bloating", "Acne", "Backache", "Fatigue", "Breast Pain", "Nausea"];

    const moodsList = [
        { label: "Energetic", type: "blue" },
        { label: "Calm", type: "blue" },
        { label: "Anxious", type: "orange" },
        { label: "Unfocused", type: "orange" },
        { label: "Irritable", type: "negative" },
        { label: "Low mood", type: "negative" },
        { label: "Overwhelmed", type: "negative" },
    ];


    const exerciseOptions = ["Rest Day", "Light (Walk, Yoga)", "Moderate (Gym, Pilates)", "Intense (HIIT, Run)"];
    const selfLoveOptions = ["Travel", "Meditation", "Journal", "Hobbies"];
    const sleepOptions = [
        { label: "Restful", type: "positive" },
        { label: "Light/Broken", type: "negative" },
        { label: "Vivid dreams", type: "orange" },
        { label: "Insomnia", type: "negative" },
        { label: "Night sweats", type: "negative" },
    ];

    const disruptorsList = [
        { label: "Alcohol", type: "negative" },
        { label: "Caffeine overload", type: "orange" },
        { label: "High sugar", type: "orange" },
        { label: "Travel/Jet lag", type: "orange" },
        { label: "Illness", type: "negative" },
        { label: "High stress event", type: "negative" },
        { label: "Painkillers", type: "orange" },
        { label: "Contraceptive", type: "orange" },
    ];

    const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            const isPeriodMode = trackMode === "period";

            // Prepare Initial Payload Variables
            let finalCervicalDischarge = !isPeriodMode ? (cervicalDischarge || null) : null;
            let finalNotes = note;

            // 1. MPIQ LOGIC: Save as ["Consistency", "Appearance", "Sensation"]
            // We check if ANY option is selected to save meaningful data
            if (!isPeriodMode && (mpiqConsistency || mpiqAppearance || mpiqSensation)) {
                // Construct the array the user requested
                const mpiqArray = [
                    mpiqConsistency || "",
                    mpiqAppearance || "",
                    mpiqSensation || ""
                ];
                finalCervicalDischarge = JSON.stringify(mpiqArray);
            }

            // Prepare Final Payload
            const payload = {
                date: formatDate(selectedDate),
                symptoms: selectedSymptoms,
                moods: selectedMoods,
                exerciseTypes: selectedExercise,
                exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
                waterIntake: waterIntake,
                selfLoveTags: selectedSelfLove,
                selfLoveOther: selfLoveOther,
                sleepQuality: selectedSleepQuality,
                sleepMinutes: (sleepHours || sleepMinutes) ? (parseInt(sleepHours || "0") * 60 + parseInt(sleepMinutes || "0")) : null,
                disruptors: selectedDisruptors,
                isPeriod: isPeriodMode,
                flowIntensity: isPeriodMode ? flowIntensity || "Normal" : undefined,
                cervicalDischarge: finalCervicalDischarge || undefined,
                notes: finalNotes
            };

            const result = await logDailySymptoms(payload);
            if (!result.success) {
                toast.error("Failed to save entry", {
                    description: result.error,
                    duration: 5000
                });
                return;
            }

            // Update period start date ONLY if logging a period start and no start date exists yet
            // DO NOT update cycle length or period length - those should be derived, not mutated
            if (isPeriodMode && !cycleSettings.last_period_start) {
                await updateLastPeriodDate(formatDate(selectedDate));
                setCycleSettings(prev => ({
                    ...prev,
                    last_period_start: formatDate(selectedDate)
                }));
            }

            toast.success("Entry Saved!", {
                description: "Your daily log has been updated.",
                duration: 3000
            });

            // Refresh month logs to reflect changes (including adjacent months for padding days)
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const monthsToFetch = [
                new Date(year, month - 1, 1),
                new Date(year, month, 1),
                new Date(year, month + 1, 1)
            ];

            const allLogs: any[] = [];
            for (const monthDate of monthsToFetch) {
                const monthYear = monthDate.getFullYear();
                const monthNum = String(monthDate.getMonth() + 1).padStart(2, '0');
                const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                allLogs.push(...logs);
            }

            const logMap: Record<string, any> = {};
            allLogs.forEach((l: any) => {
                logMap[l.date] = l;
            });
            setMonthLogs(logMap);
        });
    };


    const handlePeriodToggle = async () => {
        const dateStr = formatDate(selectedDate);
        const globalStart = cycleSettings.last_period_start;
        const hasGlobalStart = !!globalStart;

        startTransition(async () => {
            try {
                if (!showEndButton) {
                    // START PERIOD: Only set is_period = true for selected date, no ranges

                    // Warn about future dates
                    if (isFutureDate(selectedDate)) {
                        toast.warning("Logging future period", {
                            description: "You're logging a period for a future date. Make sure this is intentional.",
                            duration: 4000
                        });
                    }

                    // Check if there's an existing period start that might conflict
                    if (hasGlobalStart && !isPastDate(selectedDate)) {
                        const start = new Date(globalStart);
                        start.setHours(0, 0, 0, 0);
                        const current = new Date(selectedDate);
                        current.setHours(0, 0, 0, 0);
                        const daysSinceStart = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                        // Warn if starting new period very close to existing one
                        if (daysSinceStart >= 0 && daysSinceStart < 14) {
                            toast.warning("Unusually short cycle", {
                                description: `Less than 14 days since last period start. Make sure this is intentional.`,
                                duration: 4000
                            });
                        }
                    }

                    // Update period start date if this is a new period start
                    if (!hasGlobalStart || !isPastDate(selectedDate)) {
                        const result = await updateLastPeriodDate(dateStr);
                        if (result.success) {
                            setCycleSettings(prev => ({
                                ...prev,
                                last_period_start: dateStr
                            }));
                            const freshSettings = await fetchUserCycleSettings();
                            if (freshSettings) {
                                setCycleSettings({
                                    last_period_start: freshSettings.last_period_start,
                                    cycle_length_days: freshSettings.cycle_length_days || 28,
                                    period_length_days: freshSettings.period_length_days || 5
                                });
                            }
                        }
                    }

                    // Log ONLY the selected date as period
                    await logDailySymptoms({
                        date: dateStr,
                        symptoms: selectedSymptoms,
                        isPeriod: true,
                        flowIntensity: flowIntensity || "Normal",
                        moods: selectedMoods,
                        notes: note,
                        waterIntake
                    });

                    // 🔥 REFRESH: Only fetch months affected by the new period start
                    const affectedMonths = new Set<string>();
                    const dt = new Date(dateStr);
                    affectedMonths.add(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);

                    const allLogs: any[] = [];
                    for (const ym of affectedMonths) {
                        const logs = await fetchMonthLogs(ym);
                        allLogs.push(...logs);
                    }

                    const logMap: Record<string, any> = {};
                    allLogs.forEach((l: any) => {
                        logMap[l.date] = l;
                    });
                    setMonthLogs(prev => ({
                        ...prev,
                        ...logMap
                    }));

                    confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.8 },
                        colors: ['#FDA4AF', '#F43F5E', '#FFFFFF']
                    });

                    toast.success("Period started!", {
                        description: `Started on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                        duration: 3000
                    });
                } else {
                    // END PERIOD: Mark all dates from start to selected date as period
                    if (!globalStart) {
                        toast.error("No period start found", {
                            description: "Please start a period first.",
                            duration: 3000
                        });
                        return;
                    }

                    const start = new Date(globalStart);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(selectedDate);
                    end.setHours(0, 0, 0, 0);
                    const diffTime = end.getTime() - start.getTime();
                    const length = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    // Warn about long periods if applicable
                    if (length > 10) {
                        toast.warning("Long period (>10 days)", {
                            description: `This period is ${length} days. Make sure this is correct.`,
                            duration: 5000
                        });
                    }

                    // 🔥 FIX: ONLY clear days between globalStart and selectedDate that need updating
                    // Do NOT touch other period ranges
                    const startDate = new Date(globalStart);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(selectedDate);
                    endDate.setHours(0, 0, 0, 0);

                    // Find days that are marked as period but fall WITHIN the current range
                    // and need to be set (we'll overwrite them all anyway in the next step)
                    // DO NOT clear days outside this range

                    try {
                        const logsToUpdate = [];
                        for (let i = 0; i < length; i++) {
                            const d = new Date(start);
                            d.setDate(start.getDate() + i);
                            const dStr = formatDate(d);

                            // Use selected date's data for the end date, preserve existing data for other dates
                            logsToUpdate.push(logDailySymptoms({
                                date: dStr,
                                symptoms: dStr === dateStr ? selectedSymptoms : (monthLogs[dStr]?.symptoms || []),
                                isPeriod: true,
                                flowIntensity: dStr === dateStr ? (flowIntensity || "Normal") : (monthLogs[dStr]?.flow_intensity || "Normal"),
                                moods: dStr === dateStr ? selectedMoods : (monthLogs[dStr]?.moods || []),
                                notes: dStr === dateStr ? note : (monthLogs[dStr]?.notes || ""),
                                waterIntake: dStr === dateStr ? waterIntake : (monthLogs[dStr]?.water_intake || 0)
                            }));
                        }

                        await Promise.all(logsToUpdate);
                        await updateLastPeriodDate("");
                        setCycleSettings(prev => ({ ...prev, last_period_start: "" }));

                        // 🔥 REFRESH: Only fetch months affected by this period range
                        const affectedMonths = new Set<string>();
                        for (let i = 0; i < length; i++) {
                            const d = new Date(start);
                            d.setDate(start.getDate() + i);
                            affectedMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                        }

                        const allLogs: any[] = [];
                        for (const ym of affectedMonths) {
                            const logs = await fetchMonthLogs(ym);
                            allLogs.push(...logs);
                        }

                        const logMap: Record<string, any> = {};
                        allLogs.forEach((l: any) => {
                            logMap[l.date] = l;
                        });
                        setMonthLogs(prev => ({
                            ...prev,
                            ...logMap
                        }));

                        toast.success("Period ended!", {
                            description: `${length} day period from ${globalStart} to ${dateStr}`,
                            duration: 3000
                        });
                    } catch (error) {
                        toast.error("Failed to update period days", {
                            description: "Please try again or refresh the page.",
                            duration: 5000
                        });
                    }
                }
            } catch (error) {
                toast.error("An error occurred", {
                    description: "Please try again or refresh the page.",
                    duration: 5000
                });
            }
        });
    };

    const handleUpdatePeriod = (showAlert = true) => {
        startTransition(async () => {
            const dateStr = formatDate(selectedDate);
            const result = await updateLastPeriodDate(dateStr);

            if (result.success) {
                setCycleSettings({
                    ...cycleSettings,
                    last_period_start: dateStr
                });
                setIsEditingCycle(false);
                if (showAlert) {
                    alert(`Cycle updated! Period start date set to ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
                }
                window.location.reload();
            } else {
                alert("Failed to update cycle: " + result.error);
            }
        });
    };

    const getPhaseColor = (p: Phase) => {
        switch (p) {
            case "Menstrual":
                return "bg-rose-200/40 text-gray-900 hover:bg-rose-200/60";
            case "Follicular":
                return "bg-teal-200/40 text-gray-900 hover:bg-teal-200/60";
            case "Ovulatory":
                return "bg-amber-200/40 text-gray-900 hover:bg-amber-200/60";
            case "Luteal":
                return "bg-indigo-200/40 text-gray-900 hover:bg-indigo-200/60";
            default:
                return "bg-gray-100/50 text-gray-400";
        }
    };

    const getPhaseDot = (p: Phase) => {
        switch (p) {
            case "Menstrual": return "bg-rose-400";
            case "Follicular": return "bg-teal-400";
            case "Ovulatory": return "bg-amber-400";
            case "Luteal": return "bg-indigo-400";
            default: return "bg-gray-400";
        }
    };

    const currentPhase = getPhaseForDate(selectedDate);
    // Use cycleSettings for progress bar check (strictly bound to db)
    const mpiqLastPeriodDB = getRelevantPeriodStart(selectedDate);
    const waveProgress = [!!mpiqLastPeriodDB, !!mpiqConsistency, !!mpiqAppearance, !!mpiqSensation].filter(Boolean).length * 25;

    // Compute showEndButton for UI (used in both render and handler)
    // Simplified: showEndButton is strictly derived from whether the selected date is already a period day
    // const showEndButton = monthLogs[formatDate(selectedDate)]?.is_period === true;
    const showEndButton = !!cycleSettings.last_period_start;

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-orange-50/20">
            <Toaster position="top-center" richColors />
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Tracker</h1>
                            <p className="text-xs text-gray-500">Log your daily rhythm</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditingCycle(!isEditingCycle)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-24">
                {/* Edit Cycle Banner */}
                <AnimatePresence>
                    {isEditingCycle && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl p-5 border border-rose-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-rose-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Update Period Start Date</h3>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Select the correct start date of your last period on the calendar, then update to recalibrate predictions.
                                    </p>
                                    <button
                                        onClick={() => handleUpdatePeriod(true)}
                                        className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        Update Start Date
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsEditingCycle(false)}
                                    className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Phase Badge */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", getPhaseDot(currentPhase))} />
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Current Phase</p>
                                <p className="text-lg font-semibold text-gray-900">{currentPhase}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-0.5">Selected Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl shadow-rose-100/20 border border-white/50 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={prevMonth}
                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 mb-3">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-0">
                        {calendarDays.map((dayItem, i) => {
                            if (dayItem.isPadding) return <div key={i} />;

                            const date = dayItem.date;
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFuture = isFutureDate(date);
                            const dateStr = formatDate(date);
                            const log = monthLogs[dateStr];

                            // Phase calculation (getPhaseForDate already checks logged data first)
                            const phase = getPhaseForDate(date);

                            const isDisabled = isEditingCycle ? false : isFuture;

                            // Calculate Fertile Window
                            const dayInCycle = getCurrentDay(date);
                            const ovulationDay = (cycleSettings.cycle_length_days || 28) - 14;
                            const isFertile = dayInCycle >= (ovulationDay - 5) && dayInCycle <= (ovulationDay + 2);

                            // Determine phase neighbors for strip styling
                            const isRowStart = i % 7 === 0;
                            const isRowEnd = i % 7 === 6;

                            const prevItem = !isRowStart ? calendarDays[i - 1] : null;
                            const nextItem = !isRowEnd ? calendarDays[i + 1] : null;

                            const prevPhase = prevItem && !prevItem.isPadding ? getPhaseForDate(prevItem.date) : null;
                            const nextPhase = nextItem && !nextItem.isPadding ? getPhaseForDate(nextItem.date) : null;

                            const samePrev = prevPhase === phase;
                            const sameNext = nextPhase === phase;

                            return (
                                <button
                                    key={i}
                                    onClick={() => !isDisabled && setSelectedDate(date)}
                                    disabled={isDisabled}
                                    className={cn(
                                        "relative h-11 w-full flex items-center justify-center text-sm font-medium transition-all group backdrop-blur-[2px]",
                                        getPhaseColor(phase),
                                        // Shape logic for continuous strips (removed mx-1px)
                                        samePrev && "ml-0 rounded-l-none border-l-0",
                                        sameNext && "mr-0 rounded-r-none border-r-0",
                                        (!samePrev || isRowStart) && "rounded-l-xl",
                                        (!sameNext || isRowEnd) && "rounded-r-xl",

                                        // Selection state override - floating effect
                                        isSelected && "z-10 shadow-lg shadow-gray-200/50 scale-105",
                                        isSelected && !samePrev && !sameNext && "rounded-xl",

                                        // Interaction
                                        !isSelected && !isDisabled && "hover:brightness-95",
                                        isDisabled && "opacity-30 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <span className={cn(
                                        "relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                        isSelected ? "bg-gray-900 text-white shadow-lg" : ""
                                    )}>
                                        {date.getDate()}
                                    </span>
                                    {isToday && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50" />
                                    )}
                                    {isFertile && !isSelected && !isToday && (
                                        <div className="absolute bottom-1 w-3 h-0.5 rounded-full bg-blue-900/40" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Privacy Notice */}
                    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100/50">
                        <Shield className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-400 font-medium">Your data is encrypted and will never be shared</p>
                    </div>
                </div>



                {/* Logging Sections */}
                {!isEditingCycle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Toggle Track Mode */}
                        {/* Period State Button */}
                        <div className="relative mb-6">
                            {(() => {
                                const dateStr = formatDate(selectedDate);
                                const isAlreadyLogged = monthLogs[dateStr]?.is_period === true;

                                // Function to remove a day from period
                                const handleRemoveFromPeriod = async () => {
                                    startTransition(async () => {
                                        try {
                                            await logDailySymptoms({
                                                date: dateStr,
                                                symptoms: selectedSymptoms,
                                                isPeriod: false,  // Mark as NOT period
                                                flowIntensity: undefined,
                                                moods: selectedMoods,
                                                notes: note,
                                                waterIntake
                                            });

                                            // Refresh month logs (including adjacent months for padding days)
                                            const year = currentMonth.getFullYear();
                                            const month = currentMonth.getMonth();

                                            const monthsToFetch = [
                                                new Date(year, month - 1, 1),
                                                new Date(year, month, 1),
                                                new Date(year, month + 1, 1)
                                            ];

                                            const allLogs: any[] = [];
                                            for (const monthDate of monthsToFetch) {
                                                const monthYear = monthDate.getFullYear();
                                                const monthNum = String(monthDate.getMonth() + 1).padStart(2, '0');
                                                const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
                                                allLogs.push(...logs);
                                            }

                                            const logMap: Record<string, any> = {};
                                            allLogs.forEach((l: any) => {
                                                logMap[l.date] = l;
                                            });
                                            setMonthLogs(logMap);

                                            toast.success("Removed from period", {
                                                description: `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} is no longer marked as a period day`,
                                                duration: 3000
                                            });
                                        } catch (error) {
                                            toast.error("Failed to remove period day", {
                                                description: "Please try again",
                                                duration: 3000
                                            });
                                        }
                                    });
                                };

                                return (
                                    <div className="space-y-2">
                                        {/* Remove from Period Button - Compact */}
                                        {isAlreadyLogged && (
                                            <motion.button
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={handleRemoveFromPeriod}
                                                disabled={isPending}
                                                className="w-full group bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-rose-200 shadow-sm transition-all disabled:opacity-70 py-2 px-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-gray-100 group-hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors">
                                                            <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-500 transition-colors" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-gray-700 group-hover:text-gray-900 font-medium text-xs">Remove from Period</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-400 group-hover:text-rose-500 text-[10px] font-semibold transition-colors">
                                                        REMOVE
                                                    </div>
                                                </div>
                                            </motion.button>
                                        )}

                                        {/* Start/End Period Button - Compact */}
                                        <AnimatePresence mode="wait">
                                            {showEndButton ? (
                                                <motion.button
                                                    key="end-period"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.02 }}
                                                    whileHover={{ scale: 1.005 }}
                                                    whileTap={{ scale: 0.995 }}
                                                    onClick={handlePeriodToggle}
                                                    disabled={isPending}
                                                    className="w-full relative overflow-hidden group bg-gradient-to-r from-rose-100/40 to-pink-100/40 hover:from-rose-200/50 hover:to-pink-200/50 rounded-xl border border-rose-200/40 shadow-sm transition-all disabled:opacity-70 py-2 px-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center shadow-sm">
                                                                {isPending ? (
                                                                    <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Droplets className="w-4 h-4 text-rose-500" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <h3 className="text-gray-800 font-semibold text-[13px] leading-tight">
                                                                    {isAlreadyLogged ? "Period Ongoing" : "Continuing Period?"}
                                                                </h3>
                                                                <p className="text-rose-500/70 text-[10px] font-medium">End: {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-rose-400/80 px-3 py-1 rounded-lg text-white text-[10px] font-bold shadow-sm">
                                                            {isPending ? "..." : "END"}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    key="start-period"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.02 }}
                                                    whileHover={{ scale: 1.005 }}
                                                    whileTap={{ scale: 0.995 }}
                                                    onClick={handlePeriodToggle}
                                                    disabled={isPending}
                                                    className="w-full group bg-white hover:bg-rose-50/50 rounded-xl border border-rose-100 hover:border-rose-200 shadow-sm transition-all disabled:opacity-70 py-2 px-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 bg-rose-50 group-hover:bg-rose-100 border border-rose-100 rounded-lg flex items-center justify-center transition-colors">
                                                                {isPending ? (
                                                                    <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Droplet className="w-4 h-4 text-rose-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <h3 className="text-gray-800 font-semibold text-[13px] leading-tight">Period Started?</h3>
                                                                <p className="text-rose-400 text-[10px] font-medium">Mark {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} as start</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-rose-400 hover:bg-rose-500 px-3 py-1 rounded-lg text-white text-[10px] font-bold shadow-sm transition-colors">
                                                            {isPending ? "..." : "START"}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Flow Card (Period Mode) */}
                        {
                            trackMode === "period" && (
                                <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Droplets className="w-5 h-5 text-rose-500" />
                                        <h3 className="text-base font-semibold text-gray-900">Flow</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {flowOptions.map((f) => {
                                            const isActive = flowIntensity === f;
                                            return (
                                                <button
                                                    key={f}
                                                    onClick={() => setFlowIntensity(isActive ? null : f)}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                                                        isActive
                                                            ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                            : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                                    )}
                                                >
                                                    {f}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        }

                        {/* Advanced Cervical Discharge Card (MPIQ) */}
                        {
                            trackMode === "discharge" && (
                                <div className={cn(
                                    "relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-100/20 border border-blue-100 transition-all duration-300",
                                    isDischargeExpanded ? "p-0" : "p-0"
                                )}>
                                    {!isDischargeExpanded ? (
                                        <button
                                            onClick={() => setIsDischargeExpanded(true)}
                                            className="w-full p-5 flex items-center justify-between group hover:bg-white/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Waves className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-base font-semibold text-gray-900">Discharge</h3>
                                                    <p className="text-xs text-gray-500">Please fill out 3 questions for accurate phase prediction</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </button>
                                    ) : (
                                        <>
                                            {/* Wave Progress Bar */}
                                            <div className="absolute top-0 left-0 right-0 h-3 bg-gray-100/50 z-0">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-teal-300 via-blue-400 to-indigo-400"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${waveProgress}%` }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                />
                                                {/* SVG Wave Overlay for effect */}
                                                <svg className="absolute top-0 w-full h-full text-white/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                                                    <path d="M0 10 Q 25 0 50 10 T 100 10 V 10 H 0 Z" fill="currentColor" />
                                                </svg>
                                            </div>

                                            <div className="p-6 pt-8 relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Waves className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">Cervical Discharge</h3>
                                                            <p className="text-xs text-gray-500">Answer 4 questions to track fertility</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsDischargeExpanded(false)}
                                                        className="p-2 hover:bg-blue-50/50 rounded-full transition-colors text-blue-400 hover:text-blue-600"
                                                    >
                                                        <div className="sr-only">Collapse</div>
                                                        <ChevronRight className="w-5 h-5 -rotate-90" />
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Q1: Last Period Date */}
                                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-sm font-medium text-gray-700">1. First day of last period?</p>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="date"
                                                                value={getRelevantPeriodStart(selectedDate) || ""} // Dynamic based on context
                                                                disabled
                                                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                                                            />
                                                            <div className="absolute inset-y-0 right-2 flex items-center">
                                                                <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                                                                    From Calendar
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Q2: Consistency */}
                                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">2. Consistency of discharge?</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {consistencyOptions.map((opt) => (
                                                                <button
                                                                    key={opt.label}
                                                                    onClick={() => setMpiqConsistency(opt.label)}
                                                                    className={cn(
                                                                        "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                        mpiqConsistency === opt.label
                                                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                            : "bg-white border-gray-100 hover:bg-gray-50"
                                                                    )}
                                                                >
                                                                    {/* Image/Video Media */}
                                                                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                                        {opt.type === 'video' ? (
                                                                            <video
                                                                                src={opt.src}
                                                                                autoPlay
                                                                                loop
                                                                                muted
                                                                                playsInline
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={opt.src}
                                                                                alt={opt.label}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                                    <span className="text-[10px] text-gray-400 leading-tight mt-1">{opt.desc}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Q3: Appearance */}
                                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">3. Appearance of discharge?</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {appearanceOptions.map((opt) => (
                                                                <button
                                                                    key={opt.label}
                                                                    onClick={() => setMpiqAppearance(opt.label)}
                                                                    className={cn(
                                                                        "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                        mpiqAppearance === opt.label
                                                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                            : "bg-white border-gray-100 hover:bg-gray-50"
                                                                    )}
                                                                >
                                                                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden shadow-inner">
                                                                        {opt.type === 'video' ? (
                                                                            <video
                                                                                src={opt.src}
                                                                                autoPlay
                                                                                loop
                                                                                muted
                                                                                playsInline
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={opt.src}
                                                                                alt={opt.label}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Q4: Sensation */}
                                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">4. Vaginal sensation?</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {sensationOptions.map((opt) => (
                                                                <button
                                                                    key={opt.label}
                                                                    onClick={() => setMpiqSensation(opt.label)}
                                                                    className={cn(
                                                                        "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                                                                        mpiqSensation === opt.label
                                                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                            : "bg-white border-gray-100 hover:bg-gray-50"
                                                                    )}
                                                                >
                                                                    <span className="text-xs font-semibold text-gray-800">{opt.label}</span>
                                                                    <span className="text-[10px] text-gray-400 leading-tight mt-1">{opt.desc}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        }

                        {/* Symptoms Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <Activity className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Symptoms</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map(s => {
                                    const isActive = selectedSymptoms.includes(s);
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleItem(s, selectedSymptoms, setSelectedSymptoms)}
                                            className={cn(
                                                "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                isActive
                                                    ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-transparent shadow-md shadow-rose-200"
                                                    : "bg-white border-rose-100/50 text-gray-600 hover:border-rose-200 hover:bg-rose-50/30"
                                            )}
                                        >
                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Moods Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        y: [0, -2, 0],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <Smile className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Moods</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {moodsList.map(m => {
                                    const isActive = selectedMoods.includes(m.label);

                                    // Dynamic Styling Logic
                                    let activeClass = "";
                                    let inactiveClass = "";

                                    switch (m.type) {
                                        case 'positive': // Green
                                            activeClass = "bg-green-100 text-green-800 border-green-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-green-100 ring-1 ring-green-50 hover:bg-green-50/50";
                                            break;
                                        case 'blue': // Blue
                                            activeClass = "bg-blue-100 text-blue-800 border-blue-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-blue-100 ring-1 ring-blue-50 hover:bg-blue-50/50";
                                            break;
                                        case 'orange': // Orange
                                            activeClass = "bg-orange-100 text-orange-800 border-orange-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-orange-100 ring-1 ring-orange-50 hover:bg-orange-50/50";
                                            break;
                                        case 'negative': // Red
                                            activeClass = "bg-red-100 text-red-800 border-red-300 shadow-sm";
                                            inactiveClass = "bg-white text-gray-600 border-red-100 ring-1 ring-red-50 hover:bg-red-50/50";
                                            break;
                                        default:
                                            activeClass = "bg-gray-200 text-gray-900";
                                            inactiveClass = "bg-white text-gray-600 border-gray-100";
                                    }

                                    return (
                                        <button
                                            key={m.label}
                                            onClick={() => toggleItem(m.label, selectedMoods, setSelectedMoods)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                                                isActive ? activeClass : inactiveClass
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3" />}
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>



                        {/* Exercise Card */}
                        <div className="bg-gradient-to-br from-white to-green-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-green-100/20 border border-green-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 45, 0]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"
                                    >
                                        <Dumbbell className="w-4 h-4 text-green-500" />
                                    </motion.div>
                                    <h3 className="text-base font-semibold text-gray-900">Exercise Log</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedExercise([]);
                                        setExerciseMinutes("");
                                    }}
                                    className="text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-full bg-white border border-gray-100 hover:border-red-100"
                                >
                                    Didn't Exercise
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {exerciseOptions.map(e => {
                                        const isActive = selectedExercise.includes(e);
                                        return (
                                            <button
                                                key={e}
                                                onClick={() => toggleItem(e, selectedExercise, setSelectedExercise)}
                                                className={cn(
                                                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                    isActive
                                                        ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                                                        : "bg-white border-green-100/50 text-gray-600 hover:border-green-200 hover:bg-green-50/30"
                                                )}
                                            >
                                                {isActive && <Check className="w-3.5 h-3.5" />}
                                                {e}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Digital Clock Input */}
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-green-100/50">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={exerciseMinutes}
                                            onChange={(e) => setExerciseMinutes(e.target.value)}
                                            placeholder="00"
                                            className="w-full bg-transparent text-xl font-mono font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none"
                                        />
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">MIN</div>
                                </div>
                            </div>
                        </div>

                        {/* Water Intake Card */}
                        <div className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-blue-100/20 border border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{
                                        y: [0, 3, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                                >
                                    <Droplet className="w-4 h-4 text-blue-500 fill-blue-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Hydration</h3>
                            </div>

                            <div className="flex items-center gap-8 justify-center">
                                {/* Glass Animation */}
                                <div className="relative w-24 h-32 border-4 border-blue-200 border-t-0 rounded-b-3xl bg-blue-50/10 backdrop-blur-sm overflow-hidden flex-shrink-0 shadow-inner">
                                    {/* Liquid */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-blue-400/80 backdrop-blur-md"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min(waterIntake, 8) * 12.5}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/50 animate-pulse" />

                                        {/* Bubbles */}
                                        <div className="absolute w-full h-full overflow-hidden">
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute bg-white/30 rounded-full w-2 h-2"
                                                    initial={{ bottom: -10, left: `${20 + i * 30}%`, opacity: 0 }}
                                                    animate={{ bottom: "100%", opacity: [0, 1, 0] }}
                                                    transition={{
                                                        duration: 2 + i,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                        delay: i * 0.5
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Pouring Stream */}
                                    <AnimatePresence>
                                        {isPouring && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "105%", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-12"
                                                style={{ originY: 0 }}
                                            >
                                                <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="w-full h-full text-blue-400 fill-current drop-shadow-sm">
                                                    {/* Fluid shape: narrow top, widening bottom with curves */}
                                                    <path d="M 18 0 Q 21 30 15 90 Q 5 100 0 100 L 40 100 Q 35 100 25 90 Q 19 30 22 0 Z" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-center h-16 flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {waterIntake >= 8 ? (
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="w-40"
                                                >
                                                    <p className="text-[10px] uppercase tracking-wide text-green-500 font-bold mb-0.5">Woohoo!</p>
                                                    <p className="text-xs text-green-600 font-medium leading-tight">You’re taking care of yourself 💧</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="count"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                >
                                                    <p className="text-3xl font-bold text-gray-900">{waterIntake * 250}<span className="text-sm font-medium text-gray-400 ml-1">ml</span></p>
                                                    <p className="text-xs text-gray-500">{waterIntake} / 8 glasses</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setWaterIntake(waterIntake + 1);
                                                setIsPouring(true);
                                                setTimeout(() => setIsPouring(false), 600);
                                            }}
                                            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>




                        {/* Sleep Card */}
                        <div className="bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-indigo-100/20 border border-indigo-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        y: [0, -3, 0],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"
                                >
                                    <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Sleep Log</h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {sleepOptions.map(m => {
                                        const isActive = selectedSleepQuality.includes(m.label);
                                        return (
                                            <button
                                                key={m.label}
                                                onClick={() => toggleItem(m.label, selectedSleepQuality, setSelectedSleepQuality)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                                                    isActive
                                                        ? m.type === "positive" ? "bg-blue-100 text-blue-800 border-blue-300"
                                                            : m.type === "negative" ? "bg-red-100 text-red-800 border-red-300"
                                                                : "bg-orange-100 text-orange-800 border-orange-300"
                                                        : "bg-white border-indigo-50 text-gray-600 hover:border-indigo-100"
                                                )}
                                            >
                                                {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-indigo-100/50">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Hours</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={sleepHours}
                                                onChange={(e) => setSleepHours(e.target.value)}
                                                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-xl font-mono font-bold text-gray-300">:</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Mins</span>
                                            <input
                                                type="number"
                                                placeholder="00"
                                                value={sleepMinutes}
                                                onChange={(e) => setSleepMinutes(e.target.value)}
                                                className="w-12 bg-transparent text-xl font-mono font-bold text-gray-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="ml-auto text-xs font-medium text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg">
                                        TOTAL DURATION
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Disruptors Card */}
                        <div className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/20 border border-orange-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
                                >
                                    <ZapOff className="w-4 h-4 text-orange-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Disruptors</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {disruptorsList.map(item => {
                                    const isActive = selectedDisruptors.includes(item.label);
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => toggleItem(item.label, selectedDisruptors, setSelectedDisruptors)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2",
                                                isActive
                                                    ? item.type === "negative"
                                                        ? "bg-red-100 text-red-800 border-red-300 shadow-sm"
                                                        : "bg-orange-100 text-orange-800 border-orange-300 shadow-sm"
                                                    : "bg-white border-orange-100/50 text-gray-600 hover:border-orange-200"
                                            )}
                                        >
                                            {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Self Love Card */}
                        <div className="bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-pink-100/20 border border-pink-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center"
                                >
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Self Love Log</h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {selfLoveOptions.map(option => {
                                        const isActive = selectedSelfLove.includes(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleItem(option, selectedSelfLove, setSelectedSelfLove)}
                                                className={cn(
                                                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border",
                                                    isActive
                                                        ? "bg-pink-100 text-pink-800 border-pink-300 shadow-sm"
                                                        : "bg-white border-pink-100/50 text-gray-600 hover:border-pink-200 hover:bg-pink-50/30"
                                                )}
                                            >
                                                {isActive && <Check className="w-3.5 h-3.5" />}
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Others (log here)..."
                                    value={selfLoveOther}
                                    onChange={(e) => setSelfLoveOther(e.target.value)}
                                    className="w-full bg-white/60 border border-pink-100/50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Note Card */}
                        <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-rose-100/20 border border-rose-100">
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{
                                        x: [0, 2, -2, 0],
                                        y: [0, -2, 2, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"
                                >
                                    <PenLine className="w-4 h-4 text-rose-500" />
                                </motion.div>
                                <h3 className="text-base font-semibold text-gray-900">Note</h3>
                            </div>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="How are you feeling today?"
                                className="w-full bg-white/50 border border-rose-100 rounded-2xl p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent transition-all resize-none h-32"
                            />
                            <div className="mt-2 text-xs text-gray-400 text-right">
                                {note.length} characters
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isPending || isFutureDate(selectedDate)}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-base font-semibold rounded-full hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300"
                            >
                                {isPending ? "Saving..." : "Save Log"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div >
    );
}