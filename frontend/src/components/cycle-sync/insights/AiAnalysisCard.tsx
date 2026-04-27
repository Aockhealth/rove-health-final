"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SegmentedDoughnut } from "@/components/ui/SegmentedDoughnut";
import { Sparkles, Leaf, Heart, Coffee, Info, Brain, Zap, MessageCircle, Plus } from "lucide-react";

/* ============================= */
/* 1. PHASE CONFIGURATION */
/* ============================= */

const PHASE_GUIDANCE: Record<string, {
  color: string;
  bg: string;
  blob: string;
  icon: any;
}> = {
  Menstrual: {
    color: "text-phase-menstrual",
    bg: "bg-phase-menstrual/10",
    blob: "bg-phase-menstrual/20",
    icon: Coffee,
  },
  Follicular: {
    color: "text-phase-follicular",
    bg: "bg-phase-follicular/10",
    blob: "bg-phase-follicular/20",
    icon: Leaf,
  },
  Ovulatory: {
    color: "text-phase-ovulatory",
    bg: "bg-phase-ovulatory/10",
    blob: "bg-phase-ovulatory/20",
    icon: Sparkles,
  },
  Luteal: {
    color: "text-phase-luteal",
    bg: "bg-phase-luteal/10",
    blob: "bg-phase-luteal/20",
    icon: Heart,
  }
};

const SUPPORT_PHASES = ["Menstrual", "Luteal"];
const OPTIMIZATION_PHASES = ["Follicular", "Ovulatory"];

const DEFAULT_SYMPTOMS: Record<string, string[]> = {
  Menstrual: ["cramps", "fatigue", "headache"],
  Luteal: ["bloating", "mood swings", "acne"]
};

/* ============================= */
/* 2. DATA CONTENT */
/* ============================= */

const SYMPTOM_LEARNING: Record<string, { stat: string; help: string; phases: string[] }> = {
  "headache": {
    phases: ["Menstrual"],
    stat: "Around 60% of women get period headaches — sudden estrogen drops affect brain blood vessels and pain sensitivity.",
    help: "Hydrate well, magnesium-rich foods, gentle neck stretches, reduce screen strain."
  },
  "cramps": {
    phases: ["Menstrual"],
    stat: "Up to 90% of women experience cramps — high prostaglandins trigger strong uterine muscle contractions.",
    help: "Heat therapy, light walking or yoga, anti-inflammatory foods, adequate sleep."
  },
  "bloating": {
    phases: ["Luteal", "Menstrual"],
    stat: "Over 80% of women feel bloated — progesterone slows digestion and causes fluid retention.",
    help: "Reduce salty foods, stay hydrated, gentle movement, fennel or ginger teas."
  },
  "acne": {
    phases: ["Luteal"],
    stat: "Around 75% of Indian women experience acne flare-ups — progesterone increases oil production and pore blockage.",
    help: "Low-glycaemic meals, good sleep, gentle skincare, avoid over-cleansing."
  },
  "fatigue": {
    phases: ["Menstrual", "Luteal"],
    stat: "Over 90% of Indian women feel exhausted around their period — falling estrogen reduces energy and iron deficiency adds strain.",
    help: "Prioritise rest, iron-rich foods, sunlight exposure, low-intensity workouts."
  },
  "mood swings": {
    phases: ["Luteal", "Menstrual"],
    stat: "Up to 95% experience mood changes — estrogen and serotonin drop together, impacting emotional regulation.",
    help: "Regular meals, omega-3 fats, breathwork, limit caffeine and sugar spikes."
  },
  "muscle pain": { 
    phases: ["Luteal", "Menstrual"],
    stat: "More than 80% of women have body or back pain - prostaglandins and inflammation sensitise pain pathways.",
    help: "Warm compress, gentle stretching, magnesium intake, posture awareness."
  },
  "backache": { 
    phases: ["Luteal", "Menstrual"],
    stat: "More than 80% of women have body or back pain - prostaglandins and inflammation sensitise pain pathways.",
    help: "Warm compress, gentle stretching, magnesium intake, posture awareness."
  },
  "diarrheoa": { 
    phases: ["Menstrual"],
    stat: "Nearly 50% of women get period diarrhoea - prostaglandins stimulate gut contractions along with the uterus.",
    help: "Light meals, probiotics, warm fluids, avoid greasy or very spicy foods."
  },
  "constipation": {
    phases: ["Luteal"],
    stat: "About 50% of Indian women experience constipation pre-period compared to ~20% globally - progesterone relaxes gut muscles and slows transit.",
    help: "Fibre-rich foods, warm water in the morning, regular movement, adequate fats."
  },
  "nausea": {
    phases: ["Luteal", "Menstrual"],
    stat: "Up to 70% of women report nausea or gut discomfort - hormonal shifts affect stomach emptying and gut nerves.",
    help: "Small frequent meals, ginger, peppermint tea, avoiding strong smells."
  },
  "breast pain": {
    phases: ["Menstrual", "Luteal"], 
    stat: "Around 70% of women experience breast tenderness - estrogen and progesterone cause fluid buildup in breast tissue.",
    help: "Supportive bra, reducing caffeine and salt, warm showers, gentle massage."
  },
  "hot flushes": {
    phases: ["Luteal", "Menstrual"],
    stat: "Up to ~75% of women experience hot flushes - falling or fluctuating estrogen disrupts the brain’s temperature regulation centre.",
    help: "Layered clothing, cooling foods, paced breathing, reducing caffeine and alcohol."
  },
  "vulvular pain": {
    phases: ["Luteal", "Menstrual"],
    stat: "Up to ~20% of women experience vulvar pain - estrogen fluctuations affect vulvar nerve sensitivity and tissue hydration.",
    help: "Avoid irritants, use gentle unscented products, breathable cotton underwear, pelvic floor relaxation."
  }
};

const OPTIMIZATION_INSIGHTS = [
  {
    title: "High Energy & Motivation",
    description: "Rising estrogen boosts dopamine and mental drive. Many women feel more energetic and proactive.",
    actions: ["Start new tasks", "Strength workouts", "Protein-forward meals"],
    icon: Zap
  },
  {
    title: "Sharper Focus & Memory",
    description: "Estrogen improves attention, memory and verbal fluency.",
    actions: ["Planning", "Studying", "Decision-making"],
    icon: Brain
  },
  {
    title: "Social Ease",
    description: "Estrogen enhances bonding and communication. Many feel more expressive and confident.",
    actions: ["Meetings", "Presentations", "Open communication"],
    icon: MessageCircle
  },
  {
    title: "Physical Strength",
    description: "Strength and endurance often peak due to higher neuromuscular efficiency.",
    actions: ["HIIT", "Strength training", "Challenging workouts"],
    icon: Zap
  },
  {
    title: "Creative Spark",
    description: "Neuroplasticity is high during this phase, making it easier to connect dots and solve complex problems.",
    actions: ["Brainstorming", "Art", "Writing"],
    icon: Sparkles
  }
];

/* ============================= */
/* 3. COMPONENT */
/* ============================= */

type Props = {
  phaseCounts?: Record<string, number>;
  symptomsByPhase: Record<string, Record<string, number>>;
  tipsByPhase?: Record<string, string[]>;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
  theme: any;
};

export function AiAnalysisCard({
  phaseCounts,
  symptomsByPhase,
  selectedPhase,
  onPhaseSelect
}: Props) {
  
  // 1. Get Logged Symptoms
  const currentCounts = symptomsByPhase?.[selectedPhase] || {};
  const topSymptoms = Object.entries(currentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // 2. Identify Phase Type & Styling
  const isSupportPhase = SUPPORT_PHASES.includes(selectedPhase);
  const isOptimizationPhase = OPTIMIZATION_PHASES.includes(selectedPhase);
  const guidance = PHASE_GUIDANCE[selectedPhase] || PHASE_GUIDANCE["Luteal"];

  // 3. Determine List to Show (Logged vs Default)
  let displaySymptoms: string[] = [];
  let isDefaultView = false;

  if (topSymptoms.length > 0) {
    displaySymptoms = topSymptoms.map(([name]) => name);
  } else if (isSupportPhase) {
    displaySymptoms = DEFAULT_SYMPTOMS[selectedPhase] || [];
    isDefaultView = true;
  } 
  // ✅ FIX: Mark Optimization phases as "Default View" if no symptoms logged
  else if (isOptimizationPhase && topSymptoms.length === 0) {
    isDefaultView = true;
  }

  // 4. Optimization Rotation Logic
  const loggedDays = phaseCounts?.[selectedPhase] || 0;
  const rotationIndex = loggedDays % OPTIMIZATION_INSIGHTS.length;
  const rotatedInsights = [
    ...OPTIMIZATION_INSIGHTS, 
    ...OPTIMIZATION_INSIGHTS
  ].slice(rotationIndex, rotationIndex + 3);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm max-w-md mx-auto">

      {/* Background Blob */}
      <div className={cn(
        "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500",
        guidance.blob
      )} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="text-amber-500 text-lg">✨</div>
          <h3 className="text-lg font-heading text-rove-charcoal">
            Pattern Analysis
          </h3>
        </div>

        {/* Perpetual UX: Track Button */}
        <Link 
          href="/cycle-sync/tracker"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-xs font-bold text-rove-charcoal rounded-full transition-all border border-stone-200 shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={14} className="text-amber-500" />
          Track
        </Link>
      </div>

      {/* Phase Selector */}
      <div className="flex justify-center mb-8 relative z-10">
        <SegmentedDoughnut
          selectedPhase={selectedPhase}
          onPhaseSelect={onPhaseSelect}
          size={180}
        />
      </div>

      {/* --- SECTION 1: ICONS ROW --- */}
      {/* Hide icons if using Default View (no logs) */}
      {!isDefaultView && topSymptoms.length > 0 && (
        <div className="mb-8 relative z-10">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
            Top 3 Symptoms in {selectedPhase}
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {topSymptoms.map(([name, count]) => {
              const iconName = name.toLowerCase().replace(/\s+/g, "-");

              return (
                <div
                  key={name}
                  className="flex flex-col items-center bg-white border border-stone-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 relative mb-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-full scale-90" />
                    <Image
                      src={`/assets/symptoms/${iconName}.svg`}
                      alt={name}
                      fill
                      className="object-contain relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <span className="text-[11px] font-medium text-center mb-1 capitalize text-rove-charcoal leading-tight h-8 flex items-center justify-center line-clamp-2">
                    {name}
                  </span>

                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-300",
                    guidance.bg, guidance.color
                  )}>
                    {count}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SECTION 2: INSIGHT CARDS --- */}
      <div className="space-y-4 relative z-10">
        
        {/* CASE A: SUPPORT PHASE (Logged OR Default) */}
        {isSupportPhase && displaySymptoms.length > 0 && (
          <AnimatePresence>
            {isDefaultView && (
               <div className="text-center mb-4">
                 <p className="text-xs text-stone-400 italic mb-1">Keep logging symptoms to unlock personal insights.</p>
                 <p className="text-xs font-bold text-rove-charcoal uppercase tracking-wider">Common in {selectedPhase}</p>
               </div>
            )}

            {displaySymptoms.map((name) => {
              const info = SYMPTOM_LEARNING[name.toLowerCase()];
              if (!info) return null;

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-2xl p-5 border border-transparent shadow-sm relative overflow-hidden transition-colors duration-300",
                    guidance.bg
                  )}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm",
                      guidance.color
                    )}>
                      <Info size={16} />
                    </div>

                    <div className="flex-1">
                      <h5 className={cn("text-sm font-bold mb-1 capitalize", guidance.color)}>
                        Why {name}?
                      </h5>

                      <p className="text-xs text-rove-charcoal/80 leading-relaxed mb-3">
                        {info.stat}
                      </p>

                      <div className="flex gap-2 items-start">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wide mt-0.5", guidance.color)}>
                          FIX:
                        </span>
                        <p className="text-xs text-rove-charcoal font-medium">
                          {info.help}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* CASE B: OPTIMIZATION PHASE (Rotating Cards) */}
        {isOptimizationPhase && (
          <AnimatePresence>
            {/* ✅ ADDED: Header message for Follicular/Ovulatory when no logs exist */}
            {isDefaultView && (
               <div className="text-center mb-4">
                 <p className="text-xs text-stone-400 italic mb-1">Keep logging symptoms to unlock personal insights.</p>
                 <p className="text-xs font-bold text-rove-charcoal uppercase tracking-wider">Common in {selectedPhase}</p>
               </div>
            )}

            {rotatedInsights.map((item, index) => {
              const Icon = item.icon || Sparkles;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "rounded-2xl p-5 border border-transparent shadow-sm relative overflow-hidden transition-colors duration-300",
                    guidance.bg
                  )}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm",
                      guidance.color
                    )}>
                      <Icon size={16} />
                    </div>

                    <div className="flex-1">
                      <h5 className={cn("text-sm font-bold mb-1", guidance.color)}>
                        {item.title}
                      </h5>

                      <p className="text-xs text-rove-charcoal/80 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      <div className="flex gap-2 items-start">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wide mt-0.5", guidance.color)}>
                          BEST TIME:
                        </span>
                        <p className="text-xs text-rove-charcoal font-medium">
                          {item.actions.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}