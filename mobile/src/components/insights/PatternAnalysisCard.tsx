import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Star, Leaf, Heart, Coffee, Info, Brain, Zap, MessageCircle, Plus, Smile, Sun, Crown, Lightbulb, TrendingUp } from 'lucide-react-native';
import { SegmentedDoughnut } from '../ui/SegmentedDoughnut';

const SYMPTOM_ICONS: Record<string, any> = {
  acne: require('../../../assets/images/symptoms/acne.png'),
  backache: require('../../../assets/images/symptoms/backache.png'),
  bloating: require('../../../assets/images/symptoms/bloating.png'),
  'breast-pain': require('../../../assets/images/symptoms/breast-pain.png'),
  constipation: require('../../../assets/images/symptoms/constipation.png'),
  cramps: require('../../../assets/images/symptoms/cramps.png'),
  diarrheoa: require('../../../assets/images/symptoms/diarrheoa.png'),
  fatigue: require('../../../assets/images/symptoms/fatigue.png'),
  headache: require('../../../assets/images/symptoms/headache.png'),
  'hot-flushes': require('../../../assets/images/symptoms/hot-flushes.png'),
  'muscle-pain': require('../../../assets/images/symptoms/muscle-pain.png'),
  nausea: require('../../../assets/images/symptoms/nausea.png'),
  'vulvular-pain': require('../../../assets/images/symptoms/vulvular-pain.png'),
};

const PHASE_GUIDANCE: Record<string, { color: string; bg: string; blob: string; icon: any }> = {
  Menstrual: { color: '#AF6B6B', bg: 'rgba(175, 107, 107, 0.1)', blob: 'rgba(175, 107, 107, 0.25)', icon: Coffee },
  Follicular: { color: '#8DAA9D', bg: 'rgba(141, 170, 157, 0.1)', blob: 'rgba(141, 170, 157, 0.25)', icon: Leaf },
  Ovulatory: { color: '#D4A25F', bg: 'rgba(212, 162, 95, 0.1)', blob: 'rgba(212, 162, 95, 0.25)', icon: Sun },
  Luteal: { color: '#7B82A8', bg: 'rgba(123, 130, 168, 0.1)', blob: 'rgba(123, 130, 168, 0.25)', icon: Heart },
};

const SUPPORT_PHASES = ['Menstrual', 'Luteal'];
const OPTIMIZATION_PHASES = ['Follicular', 'Ovulatory'];

const DEFAULT_SYMPTOMS: Record<string, string[]> = {
  Menstrual: ['cramps', 'fatigue', 'headache'],
  Luteal: ['bloating', 'mood swings', 'acne'],
};

const SYMPTOM_LEARNING: Record<string, { stat: string; help: string }> = {
  headache: {
    stat: 'Around 60% of women get period headaches — sudden estrogen drops affect brain blood vessels and pain sensitivity.',
    help: 'Hydrate well, magnesium-rich foods, gentle neck stretches, reduce screen strain.',
  },
  cramps: {
    stat: 'Up to 90% of women experience cramps — high prostaglandins trigger strong uterine muscle contractions.',
    help: 'Heat therapy, light walking or yoga, anti-inflammatory foods, adequate sleep.',
  },
  bloating: {
    stat: 'Over 80% of women feel bloated — progesterone slows digestion and causes fluid retention.',
    help: 'Reduce salty foods, stay hydrated, gentle movement, fennel or ginger teas.',
  },
  acne: {
    stat: 'Around 75% of Indian women experience acne flare-ups — progesterone increases oil production and pore blockage.',
    help: 'Low-glycaemic meals, good sleep, gentle skincare, avoid over-cleansing.',
  },
  fatigue: {
    stat: 'Over 90% of Indian women feel exhausted around their period — falling estrogen reduces energy and iron deficiency adds strain.',
    help: 'Prioritise rest, iron-rich foods, sunlight exposure, low-intensity workouts.',
  },
  'mood swings': {
    stat: 'Up to 95% experience mood changes — estrogen and serotonin drop together, impacting emotional regulation.',
    help: 'Regular meals, omega-3 fats, breathwork, limit caffeine and sugar spikes.',
  },
  'muscle pain': {
    stat: 'More than 80% of women have body or back pain - prostaglandins and inflammation sensitise pain pathways.',
    help: 'Warm compress, gentle stretching, magnesium intake, posture awareness.',
  },
  backache: {
    stat: 'More than 80% of women have body or back pain - prostaglandins and inflammation sensitise pain pathways.',
    help: 'Warm compress, gentle stretching, magnesium intake, posture awareness.',
  },
  diarrheoa: {
    stat: 'Nearly 50% of women get period diarrhoea - prostaglandins stimulate gut contractions along with the uterus.',
    help: 'Light meals, probiotics, warm fluids, avoid greasy or very spicy foods.',
  },
  constipation: {
    stat: 'About 50% of Indian women experience constipation pre-period compared to ~20% globally - progesterone relaxes gut muscles and slows transit.',
    help: 'Fibre-rich foods, warm water in the morning, regular movement, adequate fats.',
  },
  nausea: {
    stat: 'Up to 70% of women report nausea or gut discomfort - hormonal shifts affect stomach emptying and gut nerves.',
    help: 'Small frequent meals, ginger, peppermint tea, avoiding strong smells.',
  },
  'breast pain': {
    stat: 'Around 70% of women experience breast tenderness - estrogen and progesterone cause fluid buildup in breast tissue.',
    help: 'Supportive bra, reducing caffeine and salt, warm showers, gentle massage.',
  },
  'hot flushes': {
    stat: 'Up to ~75% of women experience hot flushes - falling or fluctuating estrogen disrupts the brain’s temperature regulation centre.',
    help: 'Layered clothing, cooling foods, paced breathing, reducing caffeine and alcohol.',
  },
  'vulvular pain': {
    stat: 'Up to ~20% of women experience vulvar pain - estrogen fluctuations affect vulvar nerve sensitivity and tissue hydration.',
    help: 'Avoid irritants, use gentle unscented products, breathable cotton underwear, pelvic floor relaxation.',
  },
};

const FOLLICULAR_INSIGHTS = [
  { title: 'High Energy & Motivation', description: 'Rising estrogen boosts dopamine and mental drive. Many women feel more energetic and proactive.', actions: ['Start new tasks', 'Strength workouts', 'Protein-forward meals'], icon: Zap },
  { title: 'Sharper Focus & Memory', description: 'Estrogen improves attention, memory and verbal fluency as it climbs toward ovulation.', actions: ['Planning', 'Studying', 'Decision-making'], icon: Brain },
  { title: 'Creative Spark', description: 'Neuroplasticity is high during this phase, making it easier to connect dots and solve complex problems.', actions: ['Brainstorming', 'Art', 'Writing'], icon: Lightbulb },
  { title: 'Social Curiosity', description: 'Rising estrogen makes you more open to new people, ideas and experiences.', actions: ['Networking', 'Trying new things', 'Meeting people'], icon: MessageCircle },
  { title: 'Building Endurance', description: 'Stamina climbs steadily through this phase, making it a good window to ramp up cardio training.', actions: ['Cardio', 'Dance', 'Cycling'], icon: Zap },
];

const OVULATORY_INSIGHTS = [
  { title: 'Peak Confidence & Charisma', description: 'Peak estrogen and testosterone boost magnetism and verbal expressiveness.', actions: ['Presentations', 'Dates', 'Bold conversations'], icon: Crown },
  { title: 'Physical Strength Peak', description: 'Strength and power output often peak due to hormone-driven neuromuscular efficiency.', actions: ['HIIT', 'Heavy lifting', 'PR attempts'], icon: Zap },
  { title: 'Social Magnetism', description: 'Many feel more expressive and drawn to connection right now.', actions: ['Socializing', 'Networking events', 'Deep conversations'], icon: MessageCircle },
  { title: 'Heightened Pain Tolerance', description: 'Some research shows pain sensitivity dips around ovulation, making this a good time for tougher workouts.', actions: ['Challenging workouts', 'Endurance events'], icon: Heart },
  { title: 'Sharpest Communication', description: 'Verbal fluency and persuasion often peak alongside hormone levels.', actions: ['Negotiations', 'Pitches', 'Interviews'], icon: Brain },
];

const OPTIMIZATION_INSIGHTS_BY_PHASE: Record<string, typeof FOLLICULAR_INSIGHTS> = {
  Follicular: FOLLICULAR_INSIGHTS,
  Ovulatory: OVULATORY_INSIGHTS,
};

type PatternAnalysisCardProps = {
  phaseCounts?: Record<string, number>;
  symptomsByPhase: Record<string, Record<string, number>>;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
};

export function PatternAnalysisCard({ phaseCounts, symptomsByPhase, selectedPhase, onPhaseSelect }: PatternAnalysisCardProps) {
  const router = useRouter();

  const currentCounts = symptomsByPhase?.[selectedPhase] || {};
  const topSymptoms = Object.entries(currentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const isSupportPhase = SUPPORT_PHASES.includes(selectedPhase);
  const isOptimizationPhase = OPTIMIZATION_PHASES.includes(selectedPhase);
  const guidance = PHASE_GUIDANCE[selectedPhase] || PHASE_GUIDANCE['Luteal'];

  let displaySymptoms: string[] = [];
  let isDefaultView = false;

  if (topSymptoms.length > 0) {
    displaySymptoms = topSymptoms.map(([name]) => name);
  } else if (isSupportPhase) {
    displaySymptoms = DEFAULT_SYMPTOMS[selectedPhase] || [];
    isDefaultView = true;
  } else if (isOptimizationPhase && topSymptoms.length === 0) {
    isDefaultView = true;
  }

  const activeOptimizationInsights = OPTIMIZATION_INSIGHTS_BY_PHASE[selectedPhase] || FOLLICULAR_INSIGHTS;
  const loggedDays = phaseCounts?.[selectedPhase] || 0;
  const rotationIndex = loggedDays % activeOptimizationInsights.length;
  const rotatedInsights = [...activeOptimizationInsights, ...activeOptimizationInsights].slice(rotationIndex, rotationIndex + 3);

  return (
    <View
      className="relative rounded-[32px] border border-white/60 overflow-hidden"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}
    >
      {/* Background Blob */}
      <View style={{ position: 'absolute', top: -48, right: -48, width: 192, height: 192, borderRadius: 96, backgroundColor: guidance.blob, opacity: 0.5 }} />
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color={guidance.color} />
          <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Pattern Analysis</Text>
        </View>

        <Pressable
          onPress={() => router.push('/(app)/tracker' as any)}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/60 bg-white/70"
        >
          <Plus size={14} color={guidance.color} />
          <Text className="text-xs font-bold text-rove-charcoal">Track</Text>
        </Pressable>
      </View>

      {/* Phase Selector */}
      <View className="items-center mb-8">
        <SegmentedDoughnut selectedPhase={selectedPhase} onPhaseSelect={onPhaseSelect} size={180} />
      </View>

      {/* Top Symptoms */}
      {!isDefaultView && topSymptoms.length > 0 && (
        <View className="mb-8">
          <Text className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Top 3 Symptoms in {selectedPhase}
          </Text>
          <View className="flex-row gap-3">
            {topSymptoms.map(([name, count]) => {
              const iconKey = name.toLowerCase().replace(/\s+/g, '-');
              const iconSource = SYMPTOM_ICONS[iconKey];
              return (
                <View key={name} className="flex-1 items-center bg-white border border-stone-100 rounded-2xl p-3 shadow-sm">
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F5F5F4', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' }}>
                    {iconSource ? (
                      <Image source={iconSource} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    ) : (
                      <Smile size={26} color={guidance.color} />
                    )}
                  </View>
                  <Text numberOfLines={2} className="text-[11px] font-medium text-center capitalize text-rove-charcoal mb-1">
                    {name}
                  </Text>
                  <View style={{ backgroundColor: guidance.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                    <Text style={{ color: guidance.color }} className="text-[10px] font-bold">{count}d</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Insight Cards */}
      <View className="gap-4">
        {isDefaultView && (
          <View className="items-center mb-1">
            <Text className="text-xs text-stone-400 italic mb-1">Keep logging symptoms to unlock personal insights.</Text>
            <Text className="text-xs font-bold text-rove-charcoal uppercase tracking-wider">Common in {selectedPhase}</Text>
          </View>
        )}

        {isSupportPhase && displaySymptoms.map((name) => {
          const info = SYMPTOM_LEARNING[name.toLowerCase()];
          if (!info) return null;
          return (
            <View key={name} style={{ backgroundColor: guidance.bg, borderRadius: 16, padding: 20 }}>
              <View className="flex-row items-start gap-3">
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={16} color={guidance.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: guidance.color }} className="text-sm font-bold mb-1 capitalize">Why {name}?</Text>
                  <Text className="text-xs text-rove-charcoal/80 leading-relaxed mb-3">{info.stat}</Text>
                  <View className="flex-row gap-2 items-start">
                    <Text style={{ color: guidance.color }} className="text-[10px] font-bold uppercase tracking-wide mt-0.5">FIX:</Text>
                    <Text className="flex-1 text-xs text-rove-charcoal font-medium">{info.help}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {isOptimizationPhase && rotatedInsights.map((item) => {
          const Icon = item.icon || Star;
          return (
            <View key={item.title} style={{ backgroundColor: guidance.bg, borderRadius: 16, padding: 20 }}>
              <View className="flex-row items-start gap-3">
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={guidance.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: guidance.color }} className="text-sm font-bold mb-1">{item.title}</Text>
                  <Text className="text-xs text-rove-charcoal/80 leading-relaxed mb-3">{item.description}</Text>
                  <View className="flex-row gap-2 items-start">
                    <Text style={{ color: guidance.color }} className="text-[10px] font-bold uppercase tracking-wide mt-0.5">BEST TIME:</Text>
                    <Text className="flex-1 text-xs text-rove-charcoal font-medium">{item.actions.join(', ')}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
