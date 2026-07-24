import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { phaseThemes } from '../../data/home-content';
import { generateRoveChefProtocol } from '../../lib/api';
import { SectionHeader } from './SectionHeader';
import {
    MAX_PROMPT_CHARS,
    MAX_PROMPTS_PER_SESSION,
    CharLimitIndicator,
    PromptCountIndicator,
    loadPromptCount,
    savePromptCount,
} from '../ui/PromptLimitIndicator';

type TabType = 'snack' | 'smoothie' | 'salad';

const CHEF_PROMPT_COUNT_KEY = 'rove_chef_prompt_count';

// Cuisine options — ported 1:1 from the web's <select> (RoveChef.tsx lines 294-300).
const CUISINE_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Auto (Profile)' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Mediterranean', label: 'Mediterranean' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Global', label: 'Global' },
];

// Same typed-placeholder examples as the web (ANIMATED_EXAMPLES), keyed by phase then tab.
const ANIMATED_EXAMPLES: Record<string, Record<string, string[]>> = {
    Menstrual: {
        snack: ['Warm Sesame Laddu...', 'Iron-Rich Date Bites...', 'Steamed Edamame...'],
        smoothie: ['Warm Cacao Elixir...', 'Beetroot Recovery Blend...', 'Ginger Turmeric Smoothie...'],
        salad: ['Warm Beetroot Salad...', 'Iron-Rich Spinach Bowl...', 'Roasted Pumpkin Toss...'],
    },
    Follicular: {
        snack: ['Sprouted Moong Salad...', 'Fresh Berry Bowl...', 'Fermented Yogurt Parfait...'],
        smoothie: ['Green Goddess Blend...', 'Matcha Energy Boost...', 'Probiotic Berry Blast...'],
        salad: ['Sprout & Moong Salad...', 'Tangy Cucumber Raita Bowl...', 'Fresh Herb Garden Toss...'],
    },
    Ovulatory: {
        snack: ['Raw Carrot Sticks...', 'Fresh Fig & Honey...', 'Cooling Cucumber Chat...'],
        smoothie: ['Maca Libido Smoothie...', 'Raw Cacao Shake...', 'Strawberry Glow Blend...'],
        salad: ['Cooling Kachumber Salad...', 'Watermelon Feta Bowl...', 'Chana Chaat Crunch...'],
    },
    Luteal: {
        snack: ['Roasted Sweet Potato...', 'Dark Chocolate Squares...', 'Sunflower Seed Mix...'],
        smoothie: ['Golden Milk Smoothie...', 'Sweet Potato Pie Shake...', 'Calming Chamomile Blend...'],
        salad: ['Warm Sweet Potato Salad...', 'Roasted Veggie Bowl...', 'Quinoa Crunch Salad...'],
    },
};

// Typewriter effect over the phase/tab examples — same cadence as the web's
// AnimatedPlaceholder (50ms type, 2s pause at full string, 500ms pause blank).
function AnimatedPlaceholder({ phase, type }: { phase: string; type: string }) {
    const [text, setText] = useState('');
    const phaseData = ANIMATED_EXAMPLES[phase] || ANIMATED_EXAMPLES.Menstrual;
    const examples = phaseData[type] || phaseData.snack;

    useEffect(() => {
        let currentIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId: ReturnType<typeof setTimeout>;

        const typeEffect = () => {
            if (!examples || examples.length === 0) return;
            const currentString = examples[currentIndex];
            if (!currentString) return;

            if (isDeleting) {
                setText(currentString.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setText(currentString.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = 50;
            if (!isDeleting && charIndex === currentString.length) {
                isDeleting = true;
                typeSpeed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentIndex = (currentIndex + 1) % examples.length;
                typeSpeed = 500;
            }
            timeoutId = setTimeout(typeEffect, typeSpeed);
        };

        timeoutId = setTimeout(typeEffect, 500);
        return () => clearTimeout(timeoutId);
    }, [examples]);

    return (
        <Text className="text-rove-stone text-sm italic mb-8">
            Maybe: {text}
            <Text>|</Text>
        </Text>
    );
}

export function RoveChef({ phase, diet }: { phase: string, diet: string }) {
    const currentPhase = phase || "Menstrual";
    const theme = phaseThemes[currentPhase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    const [activeTab, setActiveTab] = useState<TabType>('snack');
    const [results, setResults] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    // Ingredients/Recipe toggle inside a generated result — mirrors the
    // web's ResultCard (frontend/src/components/cycle-sync/RoveChef.tsx),
    // which mobile was missing entirely (ingredients-only, no instructions).
    const [resultView, setResultView] = useState<'ingredients' | 'recipe'>('ingredients');

    // Same defaults/behavior as the web — goalFocus has no UI control on either
    // platform (hardcoded), while cuisine and avoid-ingredients are real,
    // user-editable inputs revealed via the "Generate" progressive-disclosure
    // form below, matching frontend/src/components/cycle-sync/RoveChef.tsx.
    const [goalFocus] = useState('Hormone balance and steady energy');
    const [cuisinePreference, setCuisinePreference] = useState('');
    const [avoidIngredients, setAvoidIngredients] = useState('');
    const [generationCount, setGenerationCount] = useState(0);

    useEffect(() => {
        loadPromptCount(CHEF_PROMPT_COUNT_KEY).then(setGenerationCount);
    }, []);

    const handleGenerate = async () => {
        setShowForm(false);
        setIsGenerating(true);
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        savePromptCount(CHEF_PROMPT_COUNT_KEY, newCount);
        try {
            const data = await generateRoveChefProtocol(
                currentPhase,
                diet || "Balanced",
                cuisinePreference,
                activeTab,
                {
                    goalFocus,
                    currentSymptomsOrCraving: '',
                    avoidIngredients: avoidIngredients
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                }
            );
            if (data) {
                setResults(prev => ({ ...prev, [activeTab]: data[activeTab] || data }));
                setResultView('ingredients');
            }
        } catch (e) {
            Alert.alert("Error", "Could not generate recipe");
        } finally {
            setIsGenerating(false);
        }
    };

    const isLimitReached = generationCount >= MAX_PROMPTS_PER_SESSION;
    const isOverChars = avoidIngredients.length > MAX_PROMPT_CHARS;

    const TABS: { id: TabType; label: string; icon: any }[] = [
        { id: 'snack', label: 'Snack', icon: 'coffee' },
        { id: 'smoothie', label: 'Smoothie', icon: 'droplet' },
        { id: 'salad', label: 'Salad', icon: 'sun' },
    ];

    const currentItem = results[activeTab];

    return (
        <View>
            <SectionHeader icon="coffee" title="Rove Chef" subtitle={`One protocol at a time for your ${currentPhase} phase`} color={theme.color} />

            <View
                className="rounded-[32px] p-6 border relative overflow-hidden"
                style={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    elevation: 4,
                }}
            >
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                <LinearGradient
                    colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View className="flex-row bg-[#FAF9F6] p-1 rounded-full border border-rove-stone/10 mb-6">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <Pressable
                                key={tab.id}
                                onPress={() => { setActiveTab(tab.id); setShowForm(false); setResultView('ingredients'); }}
                                className={`flex-1 py-3 rounded-full items-center justify-center flex-row ${isActive ? 'bg-white' : ''}`}
                                style={isActive ? {
                                    borderWidth: 1,
                                    borderColor: 'rgba(45,36,32,0.1)',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    shadowOffset: { width: 0, height: 2 },
                                    elevation: 1
                                } : undefined}
                            >
                                <Feather name={tab.icon as any} size={14} color={isActive ? theme.color : '#A8A29E'} />
                                <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${isActive ? 'text-rove-charcoal' : 'text-rove-stone'}`}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {isGenerating ? (
                    <View className="py-12 items-center justify-center">
                        <ActivityIndicator color={theme.color} size="large" />
                        <Text className="text-[11px] font-bold uppercase tracking-widest text-rove-stone mt-4">Chef is curating...</Text>
                    </View>
                ) : currentItem ? (
                    <View className="bg-[#FAF9F6] rounded-2xl border border-rove-stone/10 p-5 mt-2">
                        <Text className="font-bold text-2xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Regular' }}>{currentItem.name || currentItem.title}</Text>
                        <Text className="text-sm text-rove-stone mb-4">{currentItem.description}</Text>

                        <View className="mb-4 bg-white p-4 rounded-xl border border-rove-stone/5">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">Why it works</Text>
                            <Text className="text-sm text-rove-charcoal leading-5">{currentItem.why}</Text>
                        </View>

                        {currentItem.instructions && currentItem.instructions.length > 0 && (
                            <View className="flex-row bg-white/60 p-1 rounded-xl border border-rove-stone/10 mb-3 self-center">
                                <Pressable
                                    onPress={() => setResultView('ingredients')}
                                    className="px-4 py-2 rounded-lg"
                                    style={resultView === 'ingredients' ? { backgroundColor: theme.color } : undefined}
                                >
                                    <Text className={`text-xs font-bold ${resultView === 'ingredients' ? 'text-white' : 'text-rove-stone'}`}>Ingredients</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setResultView('recipe')}
                                    className="px-4 py-2 rounded-lg"
                                    style={resultView === 'recipe' ? { backgroundColor: theme.color } : undefined}
                                >
                                    <Text className={`text-xs font-bold ${resultView === 'recipe' ? 'text-white' : 'text-rove-stone'}`}>Recipe</Text>
                                </Pressable>
                            </View>
                        )}

                        {resultView === 'recipe' && currentItem.instructions && currentItem.instructions.length > 0 ? (
                            <View className="mb-6 bg-white p-4 rounded-xl border border-rove-stone/5">
                                <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Recipe</Text>
                                {currentItem.instructions.map((step: string, i: number) => (
                                    <View key={i} className="flex-row items-start mb-3">
                                        <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: theme.color }}>
                                            <Text className="text-white text-[11px] font-bold">{i + 1}</Text>
                                        </View>
                                        <Text className="text-sm text-rove-charcoal flex-1 leading-5">{step}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="mb-6 bg-white p-4 rounded-xl border border-rove-stone/5">
                                <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Ingredients</Text>
                                {currentItem.ingredients?.map((ing: string, i: number) => (
                                    <View key={i} className="flex-row items-start mb-2">
                                        <View className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3" style={{ backgroundColor: theme.color }} />
                                        <Text className="text-sm text-rove-charcoal flex-1">{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Pressable
                            onPress={() => { setResults(p => ({ ...p, [activeTab]: null })); setShowForm(true); }}
                            className="py-4 rounded-full items-center justify-center flex-row"
                            style={{
                                backgroundColor: theme.color,
                                shadowColor: '#000',
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                shadowOffset: { width: 0, height: 2 },
                                elevation: 1
                            }}
                        >
                            <Feather name="rotate-cw" size={16} color="white" />
                            <Text className="text-white font-bold tracking-wider ml-2 text-xs uppercase">Curate Another</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="items-center py-4">
                        <View className="self-start px-3 py-1.5 rounded-lg mb-8 border border-rove-stone/10" style={{ backgroundColor: `${theme.color}05` }}>
                            <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Curating for: {diet || 'Veg'}</Text>
                        </View>

                        <View
                            className="w-20 h-20 rounded-[28px] items-center justify-center mb-6"
                            style={{
                                backgroundColor: theme.color,
                                shadowColor: '#000',
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                shadowOffset: { width: 0, height: 2 },
                                elevation: 1
                            }}
                        >
                            <Feather name={TABS.find(t => t.id === activeTab)?.icon as any} size={32} color="white" />
                        </View>

                        <Text className="font-bold text-2xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Regular' }}>Ready to nourish?</Text>
                        <AnimatedPlaceholder phase={currentPhase} type={activeTab} />

                        {showForm ? (
                            <View className="w-full">
                                <Text className="text-[10px] font-bold uppercase tracking-wider text-rove-stone mb-2 ml-1">Cuisine Style</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ marginHorizontal: -2 }}>
                                    {CUISINE_OPTIONS.map((opt) => {
                                        const isSelected = cuisinePreference === opt.value;
                                        return (
                                            <Pressable
                                                key={opt.value || 'auto'}
                                                onPress={() => setCuisinePreference(opt.value)}
                                                className="mx-1"
                                            >
                                                <View
                                                    className={`px-4 py-2 rounded-full border ${isSelected ? 'border-transparent' : 'border-rove-stone/20 bg-white/40'}`}
                                                    style={isSelected ? { backgroundColor: theme.color } : undefined}
                                                >
                                                    <Text className={`font-bold text-[11px] ${isSelected ? 'text-white' : 'text-rove-stone'}`}>{opt.label}</Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>

                                <Text className="text-[10px] font-bold uppercase tracking-wider text-rove-stone mb-2 ml-1">Avoid Ingredients</Text>
                                <TextInput
                                    value={avoidIngredients}
                                    onChangeText={setAvoidIngredients}
                                    maxLength={MAX_PROMPT_CHARS}
                                    placeholder="e.g. peanuts, dairy, soy..."
                                    placeholderTextColor="#A8A29E99"
                                    className="w-full bg-white/40 border border-rove-stone/20 rounded-xl px-3 py-2.5 text-xs font-medium text-rove-charcoal mb-3"
                                />

                                <View className="flex-row items-center justify-between mb-4 px-1">
                                    <CharLimitIndicator charCount={avoidIngredients.length} />
                                    <PromptCountIndicator promptCount={generationCount} />
                                </View>

                                <View className="flex-row gap-2">
                                    <Pressable
                                        onPress={() => setShowForm(false)}
                                        className="px-5 py-3 rounded-full border border-rove-stone/20 items-center justify-center"
                                    >
                                        <Text className="text-xs font-bold text-rove-stone">Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleGenerate}
                                        disabled={isLimitReached || isOverChars}
                                        className="flex-1 py-3 rounded-2xl items-center justify-center flex-row"
                                        style={{
                                            backgroundColor: theme.color,
                                            opacity: isLimitReached || isOverChars ? 0.5 : 1,
                                            shadowColor: '#000',
                                            shadowOpacity: 0.05,
                                            shadowRadius: 4,
                                            shadowOffset: { width: 0, height: 2 },
                                            elevation: 1
                                        }}
                                    >
                                        <Feather name="zap" size={16} color="white" />
                                        <Text className="text-white font-bold ml-2 text-[11px] uppercase tracking-widest">Generate {TABS.find(t => t.id === activeTab)?.label}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => setShowForm(true)}
                                className="w-full py-4 rounded-2xl items-center justify-center flex-row"
                                style={{
                                    backgroundColor: theme.color,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    shadowOffset: { width: 0, height: 2 },
                                    elevation: 1
                                }}
                            >
                                <Feather name="zap" size={16} color="white" />
                                <Text className="text-white font-bold ml-2 text-[11px] uppercase tracking-widest">Generate {TABS.find(t => t.id === activeTab)?.label}</Text>
                            </Pressable>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}
