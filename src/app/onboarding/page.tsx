"use client";

import { useState, useMemo, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  RotateCcw,
  Plus,
  Sparkles,
  Calendar,
  BarChart3,
  HeartPulse,
  User,
  CalendarClock,
  Droplets,
  Activity,
  Stethoscope,
  Thermometer,
  Flower2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitOnboarding } from "./actions";

/* ================= TYPES ================= */
type PeriodRange = {
  startDate: Date;
  endDate: Date | null;
};

type SymptomEntry = {
  name: string;
  category: "Physical" | "Emotional";
  severity: number;
};

/* ================= CONSTANTS ================= */
const MEDICAL_CONDITIONS = [
  "None",
  "PCOS/PCOD",
  "Recurrent UTI",
  "Bacterial Vaginosis",
  "Endometriosis",
  "Fibroids",
  "Diabetes",
  "Hypertension",
];

const PHYSICAL_SYMPTOMS = [
  "Cramps", "Bloating", "Fatigue", "Headache", "Backache", "Acne", "Breast pain",
];

const EMOTIONAL_SYMPTOMS = [
  "Mood swings", "Feeling low", "Irritability", "Anger", "Food cravings",
];

const GOAL_OPTIONS = [
  { id: "syncing", label: "Cycle Syncing", desc: "Align lifestyle with your cycle" },
  { id: "tracking", label: "Cycle Tracking", desc: "Monitor predictions & health" },
  { id: "pcos", label: "PCOS Guidance", desc: "Manage symptoms" },
  { id: "other", label: "General Wellness", desc: "Improve energy & mood" },
];

/* ================= HELPERS ================= */
const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const getSeverityEmoji = (val: number) => {
  if (val === 0) return "🙂";
  if (val <= 3) return "😐";
  if (val <= 6) return "😣";
  if (val <= 8) return "😫";
  return "🥵";
};

const getGoalIcon = (id: string, isSelected: boolean) => {
  const className = `w-6 h-6 ${isSelected ? "text-white" : "text-rove-stone/80"}`;
  switch (id) {
    case "syncing": return <Calendar className={className} />;
    case "tracking": return <BarChart3 className={className} />;
    case "pcos": return <HeartPulse className={className} />;
    default: return <Flower2 className={className} />;
  }
};

/* ================= COMPONENT ================= */
export default function OnboardingWizard() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);

  /* ---------- STEP 1: NAME ---------- */
  const [name, setName] = useState("");

  /* ---------- STEP 2: HISTORY (CALENDAR) ---------- */
  const [viewDate, setViewDate] = useState(new Date());
  const [periods, setPeriods] = useState<PeriodRange[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  /* ---------- STEP 3: DETAILS (MANUAL) ---------- */
  const [manualCycleLength, setManualCycleLength] = useState("28");
  const [manualPeriodLength, setManualPeriodLength] = useState("5");
  const [manualRegularity, setManualRegularity] = useState<"Regular" | "Irregular">("Regular");

  /* ---------- STEP 4: HEALTH (MEDICAL) ---------- */
  const [conditions, setConditions] = useState<string[]>([]);

  /* ---------- STEP 5: SYMPTOMS ---------- */
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [activeSymptomTab, setActiveSymptomTab] = useState<"Physical" | "Emotional">("Physical");
  const [customSymptom, setCustomSymptom] = useState("");

  /* ---------- STEP 6: GOALS ---------- */
  const [goals, setGoals] = useState<string[]>([]);

  /* ================= AUTO STATS ================= */
  const autoStats = useMemo(() => {
    const completed = periods
      .filter((p) => p.startDate && p.endDate)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (completed.length < 2) return null;

    const cycleLengths: number[] = [];
    for (let i = 0; i < completed.length - 1; i++) {
      const diff =
        (completed[i + 1].startDate.getTime() -
          completed[i].startDate.getTime()) /
        (1000 * 3600 * 24);
      cycleLengths.push(Math.round(diff));
    }

    const avgCycle = Math.round(
      cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    );

    const bleedLengths = completed.map(
      (p) =>
        Math.ceil(
          (p.endDate!.getTime() - p.startDate.getTime()) / (1000 * 3600 * 24)
        ) + 1
    );

    const avgBleed = Math.round(
      bleedLengths.reduce((a, b) => a + b, 0) / bleedLengths.length
    );

    const minCycle = Math.min(...cycleLengths);
    const maxCycle = Math.max(...cycleLengths);
    const isIrregular = maxCycle - minCycle >= 8 || avgCycle < 21 || avgCycle > 35;

    return { avgCycle, avgBleed, isIrregular };
  }, [periods]);

  /* ================= HELPERS ================= */
  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleCondition = (condition: string) => {
    if (condition === "None") {
      setConditions(["None"]);
    } else {
      setConditions((prev) => {
        const cleaned = prev.filter((c) => c !== "None");
        return cleaned.includes(condition)
          ? cleaned.filter((c) => c !== condition)
          : [...cleaned, condition];
      });
    }
  };

  const toggleSymptom = (name: string, category: "Physical" | "Emotional") => {
    if (!name.trim()) return;
    setSelectedSymptoms((prev) => {
      const exists = prev.find((s) => s.name === name);
      if (exists) return prev.filter((s) => s.name !== name);
      return [...prev, { name, category, severity: 5 }];
    });
    if (customSymptom) setCustomSymptom("");
  };

  /* ================= NAVIGATION ================= */
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return alert("Please enter your name");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (isSelecting) return alert("Please finish selecting your period end date.");
      const validPeriods = periods.filter((p) => p.startDate && p.endDate);
      if (validPeriods.length < 2) { setStep(3); } else { setStep(4); }
      return;
    }
    if (step === 3) { setStep(4); return; }
    if (step === 4) { setStep(5); return; }
    if (step === 5) { setStep(6); return; }
    if (step === 6 && goals.length === 0) return alert("Select at least one goal");
  };

  const handleBack = () => {
    if (step === 4) {
      const validPeriods = periods.filter((p) => p.startDate && p.endDate);
      if (validPeriods.length >= 2) { setStep(2); return; }
    }
    setStep(Math.max(1, step - 1));
  };

  const handleSubmit = () => {
    if (goals.length === 0) return alert("Select at least one goal");
    startTransition(async () => {
      await submitOnboarding({
        name,
        goals,
        conditions,
        symptoms: selectedSymptoms,
        lastPeriod: periods[0]?.startDate ?
          `${periods[0].startDate.getFullYear()}-${String(periods[0].startDate.getMonth() + 1).padStart(2, '0')}-${String(periods[0].startDate.getDate()).padStart(2, '0')}`
          : "",
        periodHistory: periods
          .filter(p => p.startDate && p.endDate)
          .map(p => ({
            startDate: `${p.startDate.getFullYear()}-${String(p.startDate.getMonth() + 1).padStart(2, '0')}-${String(p.startDate.getDate()).padStart(2, '0')}`,
            endDate: `${p.endDate!.getFullYear()}-${String(p.endDate!.getMonth() + 1).padStart(2, '0')}-${String(p.endDate!.getDate()).padStart(2, '0')}`
          })),
        cycleLength: autoStats?.avgCycle ?? parseInt(manualCycleLength),
        periodLength: autoStats?.avgBleed ?? parseInt(manualPeriodLength),
        isIrregular: autoStats?.isIrregular ?? manualRegularity === "Irregular",
      });
    });
  };

  /* ================= CALENDAR LOGIC (ENHANCED) ================= */
  const handleDayClick = (date: Date) => {
    if (isSelecting) {
      setPeriods((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((p) => p.endDate === null);
        if (idx !== -1) {
          if (date < updated[idx].startDate) {
            updated[idx].startDate = date;
            updated[idx].endDate = date; // Reset if clicked earlier
          } else {
            updated[idx].endDate = date;
          }
        }
        return updated;
      });
      setIsSelecting(false);
    } else {
      setPeriods((prev) => [...prev, { startDate: date, endDate: null }]);
      setIsSelecting(true);
    }
  };

  const hasDataInCurrentMonth = periods.some((p) =>
    p.startDate.getMonth() === viewDate.getMonth() &&
    p.startDate.getFullYear() === viewDate.getFullYear()
  );

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month); // 0 Sun - 6 Sat

    // Previous Month Filler
    const prevMonthDays = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(year, month - 1, prevMonthLastDate - i));
    }

    // Current Month Days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(new Date(year, month, i));
    }

    // Next Month Filler (Fill up to 42 cells for 6 rows)
    const nextMonthDays = [];
    const totalSlots = 42;
    const filledSlots = prevMonthDays.length + currentMonthDays.length;
    for (let i = 1; i <= totalSlots - filledSlots; i++) {
      nextMonthDays.push(new Date(year, month + 1, i));
    }

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    return allDays.map((date, index) => {
      const isCurrentMonth = date.getMonth() === month;

      let status = "default";
      let isSameDay = false;

      // Check Status
      periods.forEach((p) => {
        if (p.startDate.toDateString() === date.toDateString()) status = "start";
        else if (p.endDate?.toDateString() === date.toDateString()) status = "end";
        else if (p.startDate && p.endDate && date > p.startDate && date < p.endDate) status = "mid";
      });

      // Special check for single day period
      const found = periods.find(p => p.startDate.toDateString() === date.toDateString() && p.endDate?.toDateString() === date.toDateString());
      if (found) isSameDay = true;

      // Styles
      let cls = "text-rove-charcoal hover:bg-gray-50 transition-all duration-200";
      if (!isCurrentMonth) cls = "text-rove-stone/30 bg-gray-50/30"; // Faded for other months

      if (status === "start" && !isSameDay) cls = "bg-rove-red text-white rounded-l-full relative z-10 shadow-lg shadow-rove-red/20";
      else if (status === "end") cls = "bg-rove-red text-white rounded-r-full relative z-10 shadow-lg shadow-rove-red/20";
      else if (isSameDay) cls = "bg-rove-red text-white rounded-full relative z-10 shadow-lg shadow-rove-red/20";
      else if (status === "mid") cls = "bg-rove-red/15 text-rove-red";

      return (
        <button
          key={index}
          onClick={() => handleDayClick(date)}
          className={`h-9 w-9 text-sm font-medium flex items-center justify-center rounded-lg ${cls}`}
        >
          {date.getDate()}
        </button>
      );
    });
  };

  /* ================= MAIN RENDER ================= */
  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden flex justify-center pt-6 px-4 md:pt-16 pb-20">
      <div className="blob-glow-peach" />
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-3" />

      <div className="glass-panel relative z-10 w-full max-w-2xl p-6 md:p-12 flex flex-col min-h-[600px] border-rove-peach/30 shadow-2xl">

        {/* STEP COUNTER */}
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-rove-stone/60">
            Step {step} of 6
          </span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-rove-stone/40">
            {step === 1 && "Identity"}
            {step === 2 && "History"}
            {step === 3 && "Details"}
            {step === 4 && "Health"}
            {step === 5 && "Symptoms"}
            {step === 6 && "Goals"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 md:mb-10">
          {[1, 2, 3, 4, 5, 6].map((s) => {
            let isActive = s <= step;
            if (step >= 4 && periods.filter((p) => p.endDate).length >= 2 && s === 3) isActive = true;
            return <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isActive ? "bg-rove-charcoal shadow-sm" : "bg-black/5"}`} />;
          })}
        </div>

        <div className="flex-1">
          {/* STEP 1: NAME */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Welcome to Rove</h2>
              </div>
              <p className="text-rove-stone mb-8 md:mb-10 text-base md:text-lg">First things first, what should we call you?</p>
              <div className="relative">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full text-3xl md:text-4xl font-heading font-medium border-b-2 border-gray-200 py-3 bg-transparent outline-none focus:border-rove-red transition-colors placeholder:text-rove-stone/40 text-rove-charcoal" autoFocus />
                {name && <Sparkles className="absolute right-0 top-1/2 -translate-y-1/2 text-rove-red w-6 h-6 animate-pulse" />}
              </div>
            </div>
          )}

          {/* STEP 2: HISTORY (CALENDAR) */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Log Past Periods</h2>
              </div>
              <p className="text-rove-stone mb-6 md:mb-8 text-sm md:text-base">Tap <b className="text-rove-charcoal">Start</b> date, then <b className="text-rove-charcoal">End</b> date. Use arrows to change months.</p>
              <div className="bg-white/50 rounded-3xl p-4 md:p-6 border border-white/50 shadow-sm backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-2 hover:bg-white rounded-full transition-colors"><ChevronLeft className="text-rove-stone w-5 h-5 md:w-6 md:h-6" /></button>
                  <span className="font-heading font-medium text-base md:text-lg text-rove-charcoal">{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-2 hover:bg-white rounded-full transition-colors"><ChevronRight className="text-rove-stone w-5 h-5 md:w-6 md:h-6" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="text-[10px] md:text-xs font-bold text-center text-rove-stone/50 uppercase tracking-widest">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 place-items-center">
                  {renderCalendar()}
                </div>
                {hasDataInCurrentMonth && (
                  <div className="mt-6 flex justify-center">
                    <button onClick={() => setPeriods(prev => prev.filter(p => p.startDate.getMonth() !== viewDate.getMonth()))} className="text-xs font-semibold text-rove-red hover:bg-rove-red/10 px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-rove-red/20">
                      <RotateCcw size={14} /> Clear this month
                    </button>
                  </div>
                )}
              </div>
              {isSelecting && <p className="text-center mt-4 text-sm text-rove-red font-medium animate-pulse">Now tap the end date of your period</p>}
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Cycle Details</h2>
              </div>
              <p className="text-rove-stone mb-8 md:mb-10 text-sm md:text-base">We don't have enough data yet. Please estimate your averages.</p>

              <div className="space-y-6 md:space-y-8">
                <div className="bg-white/50 p-5 md:p-6 rounded-3xl border border-white/50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rove-red shadow-sm border border-white/50"><RotateCcw className="w-5 h-5" /></div>
                    <div><label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Cycle Length</label><span className="text-xs text-rove-stone/60">Days between periods</span></div>
                  </div>
                  <input type="number" value={manualCycleLength} onChange={(e) => setManualCycleLength(e.target.value)} className="w-16 text-center text-3xl md:text-4xl font-heading font-semibold border-b-2 border-gray-200 py-1 bg-transparent outline-none focus:border-rove-red text-rove-charcoal" />
                </div>

                <div className="bg-white/50 p-5 md:p-6 rounded-3xl border border-white/50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rove-red shadow-sm border border-white/50"><Droplets className="w-5 h-5" /></div>
                    <div><label className="text-xs font-bold uppercase tracking-widest text-rove-stone block">Period Duration</label><span className="text-xs text-rove-stone/60">Days of bleeding</span></div>
                  </div>
                  <input type="number" value={manualPeriodLength} onChange={(e) => setManualPeriodLength(e.target.value)} className="w-16 text-center text-3xl md:text-4xl font-heading font-semibold border-b-2 border-gray-200 py-1 bg-transparent outline-none focus:border-rove-red text-rove-charcoal" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 px-1"><Activity className="w-4 h-4 text-rove-stone" /><label className="text-xs font-bold uppercase tracking-widest text-rove-stone">Regularity</label></div>
                  <div className="flex gap-4">
                    {(["Regular", "Irregular"] as const).map((r) => (
                      <button key={r} onClick={() => setManualRegularity(r)} className={`flex-1 py-3 md:py-4 rounded-2xl border-2 font-heading font-medium transition-all duration-300 ${manualRegularity === r ? "bg-rove-charcoal text-white border-rove-charcoal shadow-lg" : "bg-white border-transparent text-rove-stone hover:bg-white/80 hover:border-gray-200"}`}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: HEALTH */}
          {step === 4 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Medical History</h2>
              </div>
              <p className="text-rove-stone mb-6 md:mb-8 text-sm md:text-base">Select any existing conditions.</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {MEDICAL_CONDITIONS.map((cond) => {
                  const isSelected = conditions.includes(cond);
                  return (
                    <button key={cond} onClick={() => toggleCondition(cond)} className={`px-4 py-2 md:px-5 md:py-3 rounded-full border text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isSelected ? "bg-rove-red text-white border-rove-red shadow-lg" : "bg-white border-transparent text-rove-stone hover:border-gray-200 hover:bg-white/80 shadow-sm"}`}>
                      {isSelected && <Check size={14} />} {cond}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: SYMPTOMS */}
          {step === 5 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red"><Thermometer className="w-6 h-6" /></div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Typical Symptoms</h2>
              </div>
              <p className="text-rove-stone mb-6 md:mb-8 text-sm md:text-base">What do you usually experience?</p>

              <div className="flex p-1 bg-gray-100 rounded-full mb-6 md:mb-8 w-fit">
                {(["Physical", "Emotional"] as const).map((tab) => <button key={tab} onClick={() => setActiveSymptomTab(tab)} className={`px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-300 ${activeSymptomTab === tab ? "bg-white text-rove-charcoal shadow-sm" : "text-rove-stone hover:text-rove-charcoal"}`}>{tab}</button>)}
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
                {(activeSymptomTab === "Physical" ? PHYSICAL_SYMPTOMS : EMOTIONAL_SYMPTOMS).map((sym) => {
                  const isSelected = selectedSymptoms.find((s) => s.name === sym);
                  return (
                    <button key={sym} onClick={() => toggleSymptom(sym, activeSymptomTab)} className={`px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border text-xs md:text-sm font-medium transition-all duration-300 ${isSelected ? "bg-rove-red/10 text-rove-red border-rove-red" : "bg-white border-transparent text-rove-stone hover:bg-white/80 shadow-sm"}`}>{sym}</button>
                  );
                })}
              </div>

              {selectedSymptoms.filter((s) => s.category === activeSymptomTab).length > 0 && (
                <div className="bg-white/60 border border-white/50 rounded-3xl p-4 md:p-6 space-y-6 shadow-sm backdrop-blur-sm animate-in slide-in-from-bottom-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-rove-stone/60">Typical Severity (0-10)</h3>
                  {selectedSymptoms.filter((s) => s.category === activeSymptomTab).map((sym) => (
                    <div key={sym.name}>
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="font-heading font-medium text-rove-charcoal">{sym.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl animate-in fade-in zoom-in">{getSeverityEmoji(sym.severity)}</span>
                          <span className="font-bold text-rove-red bg-white px-2 py-0.5 rounded-md shadow-sm w-8 text-center">{sym.severity}</span>
                        </div>
                      </div>
                      <input type="range" min="0" max="10" value={sym.severity} onChange={(e) => setSelectedSymptoms((prev) => prev.map((s) => s.name === sym.name ? { ...s, severity: parseInt(e.target.value) } : s))} className="w-full accent-rove-red h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: GOALS */}
          {step === 6 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rove-red/10 rounded-full text-rove-red"><Sparkles className="w-6 h-6" /></div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-rove-charcoal">Your Goals</h2>
              </div>
              <p className="text-rove-stone mb-6 md:mb-8 text-sm md:text-base">Finally, what brings you to Rove?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = goals.includes(goal.id);
                  return (
                    <div key={goal.id} onClick={() => toggleGoal(goal.id)} className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-36 group cursor-pointer ${isSelected ? "bg-white border-rove-red/40 ring-4 ring-rove-red/5 shadow-xl scale-[1.02]" : "bg-white/40 border-white/60 shadow-sm hover:bg-white/60 hover:shadow-md hover:scale-[1.01]"}`}>
                      {isSelected && <div className="absolute top-4 right-4 transition-all duration-300 opacity-100 scale-100"><div className="bg-rove-red text-white rounded-full p-1 shadow-sm"><Check size={12} strokeWidth={4} /></div></div>}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${isSelected ? "bg-rove-red text-white shadow-lg shadow-rove-red/20" : "bg-white text-rove-stone border border-white/80 shadow-sm"}`}>{getGoalIcon(goal.id, isSelected)}</div>
                      <div>
                        <h3 className={`font-heading font-bold text-lg mb-1 transition-colors ${isSelected ? "text-rove-charcoal" : "text-rove-charcoal/80"}`}>{goal.label}</h3>
                        {goal.desc && <p className={`text-xs transition-colors ${isSelected ? "text-rove-stone" : "text-rove-stone/70"}`}>{goal.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-8 md:pt-12 flex justify-between items-center">
          <button onClick={handleBack} disabled={step === 1} className="text-rove-stone font-medium hover:text-rove-charcoal disabled:opacity-0 transition-all px-2 py-2 flex items-center gap-1"><ChevronLeft size={18} /> Back</button>
          {step === 6 ? (
            <Button disabled={isPending} onClick={handleSubmit} className="px-6 py-4 md:px-8 md:py-5 rounded-2xl bg-rove-red hover:bg-rove-red/90 text-white shadow-xl shadow-rove-red/20 flex items-center gap-3 text-base md:text-lg font-heading font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
              {isPending ? <span className="animate-pulse">Finalizing...</span> : <>Finish Setup <Check size={18} /></>}
            </Button>
          ) : (
            <Button onClick={handleNext} className="px-6 py-4 md:px-8 md:py-5 rounded-2xl bg-rove-charcoal hover:bg-black text-white shadow-lg flex items-center gap-3 text-base md:text-lg font-heading font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Next Step <ArrowRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}