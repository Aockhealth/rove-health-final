import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { ChefHat } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeIn,
    FadeOut,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import { phaseThemes } from '../../data/home-content';
import { fetchChefOptions, fetchChefDetail } from '../../lib/api';
import { logFoodChoice, fetchFoodChoiceContext, type ChefOption } from '../../lib/foodChoices';
import { mapGoalToCoachGoal } from '../../lib/exercisePersonalization';
import { BottomSheet } from '../ui/BottomSheet';
import { AIGeneratingIndicator } from './AIGeneratingIndicator';

type TabType = 'snack' | 'smoothie' | 'salad';

type ChefDetail = {
    name: string;
    description: string;
    prep_time_minutes: number;
    ingredients: string[];
    instructions: string[];
    why: string;
};

const OPTIONS_LOADING_MESSAGES = [
    'Reading your cycle data...',
    'Remembering what you liked...',
    'Pulling real dishes for your phase...',
    'Setting the menu...',
];

const DETAIL_LOADING_MESSAGES = [
    'Good pick!',
    'Writing it up the classic way...',
    'Measuring out one serving...',
];

const SERVING_META: Record<ChefOption['serving_style'], { icon: any; color: string }> = {
    warm: { icon: 'thermometer', color: '#E8924E' },
    cold: { icon: 'wind', color: '#7CB9E8' },
    room: { icon: 'sun', color: '#D4A25F' },
};

const CUISINE_OPTIONS: { label: string; value: string }[] = [
    { label: 'Auto (Profile)', value: 'auto' },
    { label: 'Indian', value: 'Indian' },
    { label: 'Mediterranean', value: 'Mediterranean' },
    { label: 'Asian', value: 'Asian' },
    { label: 'Global', value: 'Global' },
];

// ─── Rotating "Maybe: ..." suggestion — a lightweight typewriter effect
// (type → pause → delete → next phrase, looping) so the empty state feels
// alive without needing an extra animation library. ─────────────────────────
const ANIMATED_EXAMPLES: Record<string, Record<TabType, string[]>> = {
    Menstrual: {
        snack: ['Warm Ragi Ladoo...', 'Jaggery Til Chikki...', 'Roasted Makhana...'],
        smoothie: ['Beetroot Iron Boost...', 'Warm Turmeric Milk...', 'Date & Almond Shake...'],
        salad: ['Warm Moong Bowl...', 'Steamed Veggie Khichdi...', 'Spiced Sweet Potato...'],
    },
    Follicular: {
        snack: ['Sprouted Moong Chaat...', 'Roasted Chana...', 'Fresh Fruit Chaat...'],
        smoothie: ['Green Detox Blend...', 'Mixed Berry Lassi...', 'Cucumber Mint Cooler...'],
        salad: ['Sprout & Veggie Bowl...', 'Kachumber Salad...', 'Citrus Quinoa Bowl...'],
    },
    Ovulatory: {
        snack: ['Chilled Fruit Bowl...', 'Cucumber Raita Cups...', 'Coconut Ladoo...'],
        smoothie: ['Coconut Water Cooler...', 'Watermelon Mint Blend...', 'Chilled Buttermilk...'],
        salad: ['Watermelon Feta Bowl...', 'Curd Rice Bowl...', 'Cooling Cucumber Salad...'],
    },
    Luteal: {
        snack: ['Dark Chocolate Bites...', 'Roasted Nut Mix...', 'Baked Sweet Potato...'],
        smoothie: ['Banana Cacao Shake...', 'Warm Golden Milk...', 'Peanut Butter Blend...'],
        salad: ['Warm Grain Bowl...', 'Roasted Veggie Bowl...', 'Paneer Bhurji Bowl...'],
    },
};

function AnimatedPlaceholder({ phrases }: { phrases: string[] }) {
    const [text, setText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    React.useEffect(() => {
        if (!phrases.length) return;
        const current = phrases[phraseIndex % phrases.length];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting && charIndex <= current.length) {
            timeout = setTimeout(() => {
                setText(current.slice(0, charIndex));
                setCharIndex((c) => c + 1);
            }, 35);
        } else if (!isDeleting) {
            timeout = setTimeout(() => setIsDeleting(true), 1800);
        } else if (charIndex > 0) {
            timeout = setTimeout(() => {
                setText(current.slice(0, charIndex - 1));
                setCharIndex((c) => c - 1);
            }, 20);
        } else {
            timeout = setTimeout(() => {
                setIsDeleting(false);
                setPhraseIndex((p) => (p + 1) % phrases.length);
            }, 400);
        }
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, phraseIndex, phrases]);

    // Reset the typewriter whenever the phrase set itself changes (phase or
    // meal-type switch) so it doesn't keep typing out a phrase from the old set.
    React.useEffect(() => {
        setText('');
        setPhraseIndex(0);
        setCharIndex(0);
        setIsDeleting(false);
    }, [phrases]);

    return (
        <Text className="text-rove-stone text-sm italic mb-8 text-center px-4">
            Maybe: {text}
            <Text style={{ opacity: 0.5 }}>|</Text>
        </Text>
    );
}

// ─── Compact cuisine pill — same visual weight as the "Curating for" tag ── //
// next to it, opening a bottom sheet rather than the full-size form <Select> //
// used elsewhere (that control is sized for forms, not an inline badge).    //
function CuisinePicker({ value, onChange, color }: { value: string; onChange: (v: string) => void; color: string }) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const selected = CUISINE_OPTIONS.find((o) => o.value === value) || CUISINE_OPTIONS[0];

    return (
        <>
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    sheetRef.current?.present();
                }}
                className="flex-row items-center px-3 py-1.5 rounded-lg border border-rove-stone/10"
                style={{ backgroundColor: `${color}05` }}
            >
                <Feather name="globe" size={9} color={color} style={{ marginRight: 5 }} />
                <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>
                    {selected.label}
                </Text>
                <Feather name="chevron-down" size={10} color={color} style={{ marginLeft: 4 }} />
            </Pressable>

            <BottomSheet ref={sheetRef} title="Cuisine Style" snapPoints={['40%']}>
                <BottomSheetFlatList
                    data={CUISINE_OPTIONS}
                    keyExtractor={(item) => item.value}
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                    renderItem={({ item }) => {
                        const isSelected = item.value === value;
                        return (
                            <Pressable
                                onPress={() => {
                                    onChange(item.value);
                                    sheetRef.current?.dismiss();
                                }}
                                className={`flex-row items-center justify-between py-4 px-4 rounded-[16px] mb-1.5 ${isSelected ? 'bg-rove-charcoal/5 border border-rove-charcoal/10' : ''}`}
                            >
                                <Text
                                    className="text-[17px]"
                                    style={{ fontFamily: isSelected ? 'Inter-Bold' : 'Inter-Medium', color: isSelected ? '#37332E' : 'rgba(55,51,46,0.8)' }}
                                >
                                    {item.label}
                                </Text>
                                {isSelected && <Feather name="check" size={18} color="#37332E" />}
                            </Pressable>
                        );
                    }}
                />
            </BottomSheet>
        </>
    );
}

// ─── Animated option card — spring pop-in + a real spring press, instead of
// a plain style-callback scale, matching the tactile feel the rest of the
// tracker already uses (SymptomChip). ──────────────────────────────────────
function OptionCard({
    option,
    index,
    accentColor,
    onPress,
}: {
    option: ChefOption;
    index: number;
    accentColor: string;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);
    const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const serving = SERVING_META[option.serving_style] || SERVING_META.room;

    const handlePress = () => {
        scale.value = withSequence(
            withTiming(0.96, { duration: 90 }),
            withSpring(1, { damping: 10, stiffness: 300 })
        );
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 90).springify().damping(14).mass(0.7)}
            style={[pressStyle, { marginBottom: 12 }]}
        >
            <Pressable onPress={handlePress}>
                <View
                    className="bg-white rounded-2xl border border-rove-stone/10 overflow-hidden flex-row"
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 1,
                    }}
                >
                    <View style={{ width: 4, backgroundColor: accentColor }} />
                    <View className="p-4 flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text
                                className="font-bold text-lg text-rove-charcoal flex-1 mr-2"
                                style={{ fontFamily: 'CormorantGaramond-Regular' }}
                            >
                                {option.name}
                            </Text>
                            <View className="flex-row items-center" style={{ gap: 6 }}>
                                <View
                                    className="px-2 py-0.5 rounded-full flex-row items-center"
                                    style={{ backgroundColor: `${accentColor}12` }}
                                >
                                    <Feather name="clock" size={10} color={accentColor} />
                                    <Text className="text-[9px] font-bold ml-1" style={{ color: accentColor }}>
                                        {option.prep_time_minutes}m
                                    </Text>
                                </View>
                                <View
                                    className="w-5 h-5 rounded-full items-center justify-center"
                                    style={{ backgroundColor: `${serving.color}15` }}
                                >
                                    <Feather name={serving.icon} size={10} color={serving.color} />
                                </View>
                            </View>
                        </View>
                        <Text className="text-[13px] text-rove-stone mb-2">{option.description}</Text>
                        <Text className="text-[11px] text-rove-stone mb-2" numberOfLines={1}>
                            {option.key_ingredients?.join(' · ')}
                        </Text>
                        <View className="flex-row items-start">
                            <View className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: accentColor }} />
                            <Text className="text-[11px] flex-1 leading-4 italic" style={{ color: accentColor }}>
                                {option.why}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ─── Empty-state icon — a gentle breathing + tilt loop so the card feels
// alive before the user has done anything yet. ─────────────────────────────
function BreathingIcon({ color, icon }: { color: string; icon: any }) {
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    React.useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
        rotate.value = withRepeat(
            withSequence(
                withTiming(-4, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
                withTiming(4, { duration: 1600, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    return (
        <Animated.View
            style={[
                {
                    width: 64,
                    height: 64,
                    borderRadius: 24,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    shadowColor: color,
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 5 },
                },
                style,
            ]}
        >
            <Feather name={icon} size={26} color="white" />
        </Animated.View>
    );
}

export function RoveChef({ phase, diet, fitnessGoal }: { phase: string, diet: string, fitnessGoal?: string | null }) {
    const currentPhase = phase || "Menstrual";
    const theme = phaseThemes[currentPhase as keyof typeof phaseThemes] || phaseThemes.Menstrual;
    // RN's native <Modal> renders in a separate native window on iOS, and
    // SafeAreaView's auto-detected insets are unreliable there (often report
    // 0, clipping content under the status bar/notch) — fall back to a
    // guaranteed minimum so the close button never ends up off-screen.
    const insets = useSafeAreaInsets();
    const modalTopInset = Math.max(insets.top, 44);

    const [activeTab, setActiveTab] = useState<TabType>('snack');
    const [cuisine, setCuisine] = useState('auto');
    const [options, setOptions] = useState<Record<string, ChefOption[] | null>>({});
    const [details, setDetails] = useState<Record<string, ChefDetail | null>>({});
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    // Once the user actually engages (generates options), Chef takes over the
    // full screen instead of competing for attention inside the Nourish tab's
    // scroll — the idle teaser card below is all that shows until then.
    const [isFullscreen, setIsFullscreen] = useState(false);

    const currentOptions = options[activeTab];
    const currentDetail = details[activeTab];
    const hasData = !!currentOptions || !!currentDetail;

    const handleGenerateOptions = async (isRegenerate = false) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsFullscreen(true);

        // Regenerating without picking = she rejected all four. That's a real
        // preference signal — log it before fetching the next set.
        if (isRegenerate && currentOptions) {
            logFoodChoice({
                phase: currentPhase,
                mealType: activeTab,
                optionsShown: currentOptions,
                chosenName: null,
                chosenIndex: null,
            });
        }

        setIsLoadingOptions(true);
        setDetails(prev => ({ ...prev, [activeTab]: null }));
        try {
            const context = await fetchFoodChoiceContext(activeTab);
            const data = await fetchChefOptions({
                phase: currentPhase,
                mealType: activeTab,
                dietaryPreferences: diet || 'Balanced',
                cuisine: cuisine === 'auto' ? undefined : cuisine,
                recentChosen: context.recentChosen,
                recentShown: context.recentShown,
                preferenceSummary: context.preferenceSummary,
                fitnessGoal: mapGoalToCoachGoal(fitnessGoal),
            });
            if (data?.options?.length) {
                setOptions(prev => ({ ...prev, [activeTab]: data.options }));
            } else {
                throw new Error('empty options');
            }
        } catch (e) {
            Alert.alert('Error', 'Could not fetch options. Please try again.');
        } finally {
            setIsLoadingOptions(false);
        }
    };

    const handlePickOption = async (option: ChefOption, index: number) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const shown = currentOptions || [];

        // The pick is the data asset — log it regardless of how the detail
        // fetch goes.
        logFoodChoice({
            phase: currentPhase,
            mealType: activeTab,
            optionsShown: shown,
            chosenName: option.name,
            chosenIndex: index,
        });

        setIsLoadingDetail(true);
        try {
            const detail = await fetchChefDetail({
                dishName: option.name,
                mealType: activeTab,
                phase: currentPhase,
                dietaryPreferences: diet || 'Balanced',
                keyIngredients: option.key_ingredients,
            });
            setDetails(prev => ({ ...prev, [activeTab]: detail }));
        } catch (e) {
            Alert.alert('Error', 'Could not load the recipe. Please try again.');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const TABS: { id: TabType; label: string; icon: any }[] = [
        { id: 'snack', label: 'Snack', icon: 'coffee' },
        { id: 'smoothie', label: 'Smoothie', icon: 'droplet' },
        { id: 'salad', label: 'Salad', icon: 'sun' },
    ];

    return (
        <View>
            <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                    <ChefHat size={13} color={theme.color} style={{ marginRight: 6 }} />
                    <Text className="text-[10px] font-bold uppercase" style={{ color: theme.color, letterSpacing: 2.5 }}>
                        Phase Nutrition
                    </Text>
                </View>
                <Text className="text-3xl text-rove-charcoal mb-1" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                    Rove Chef
                </Text>
                <Text className="text-sm text-rove-stone">
                    Choose one protocol at a time for your {currentPhase} phase.
                </Text>
            </View>

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
                {/* Soft phase-colored glow for depth, matching web's blurred blobs */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 170,
                        height: 170,
                        borderRadius: 85,
                        backgroundColor: theme.color,
                        opacity: 0.12,
                    }}
                />
                <View className="flex-row bg-[#FAF9F6] p-1 rounded-full border border-rove-stone/10 mb-6">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <Pressable
                                key={tab.id}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setActiveTab(tab.id);
                                }}
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

                {hasData ? (
                    /* ── Resume teaser: data already exists from a previous session, ── */
                    /* just re-open the fullscreen view rather than starting over.    */
                    <Animated.View key="resume" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)}>
                        <Pressable
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsFullscreen(true);
                            }}
                            className="flex-row items-center bg-white rounded-2xl border border-rove-stone/10 p-4"
                            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}
                        >
                            <View
                                className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: theme.color }}
                            >
                                <Feather name={TABS.find(t => t.id === activeTab)?.icon} size={17} color="white" />
                            </View>
                            <View className="flex-1 mr-2">
                                <Text
                                    className="font-bold text-base text-rove-charcoal"
                                    style={{ fontFamily: 'CormorantGaramond-Regular' }}
                                    numberOfLines={1}
                                >
                                    {currentDetail ? currentDetail.name : `${currentOptions?.length || 0} dishes to pick from`}
                                </Text>
                                <Text className="text-[12px] text-rove-stone" numberOfLines={1}>
                                    {currentDetail
                                        ? currentDetail.description
                                        : currentOptions?.map(o => o.name).join(' · ')}
                                </Text>
                            </View>
                            {currentDetail ? (
                                <View className="px-2 py-0.5 rounded-full flex-row items-center mr-2" style={{ backgroundColor: `${theme.color}12` }}>
                                    <Feather name="clock" size={10} color={theme.color} />
                                    <Text className="text-[9px] font-bold ml-1" style={{ color: theme.color }}>{currentDetail.prep_time_minutes}m</Text>
                                </View>
                            ) : null}
                            <Feather name="chevron-right" size={18} color="#A8A29E" />
                        </Pressable>
                    </Animated.View>
                ) : (
                    /* ── Empty state ── */
                    <Animated.View key="empty" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)} className="items-center py-4">
                        <View className="flex-row flex-wrap justify-center gap-2 mb-8">
                            <View className="px-3 py-1.5 rounded-lg border border-rove-stone/10" style={{ backgroundColor: `${theme.color}05` }}>
                                <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Curating for: {diet || 'Veg'}</Text>
                            </View>
                            <CuisinePicker value={cuisine} onChange={setCuisine} color={theme.color} />
                        </View>

                        <BreathingIcon color={theme.color} icon={TABS.find(t => t.id === activeTab)?.icon} />

                        <Text className="font-bold text-2xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Regular' }}>Ready to nourish?</Text>
                        <AnimatedPlaceholder phrases={ANIMATED_EXAMPLES[currentPhase]?.[activeTab] || ANIMATED_EXAMPLES.Menstrual[activeTab]} />

                        <Pressable
                            onPress={() => handleGenerateOptions(false)}
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
                    </Animated.View>
                )}
            </View>

            {/* ── Fullscreen takeover: once Chef is actually in use, it becomes ── */}
            {/* the centerpiece — everything else (tab bar, other Nourish       */}
            {/* sections) is hidden behind this native modal layer.            */}
            <Modal
                visible={isFullscreen}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setIsFullscreen(false)}
            >
                <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
                    <LinearGradient
                        colors={[`${theme.color}14`, 'transparent']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View className="flex-row items-center justify-between px-5 pb-4" style={{ paddingTop: modalTopInset }}>
                        <Pressable
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsFullscreen(false);
                            }}
                            className="w-9 h-9 rounded-full items-center justify-center bg-white"
                            style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
                        >
                            <Feather name="x" size={16} color={theme.color} />
                        </Pressable>
                        <Text className="text-[11px] font-bold uppercase tracking-widest text-rove-charcoal">Rove Chef</Text>
                        <View className="w-9" />
                    </View>

                    <View className="flex-row bg-white/70 mx-5 p-1 rounded-full border border-rove-stone/10 mb-4">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <Pressable
                                    key={tab.id}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setActiveTab(tab.id);
                                    }}
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

                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingHorizontal: 20,
                            paddingBottom: 40,
                            justifyContent: isLoadingOptions || isLoadingDetail ? 'center' : 'flex-start',
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {isLoadingOptions ? (
                            <AIGeneratingIndicator key="loading-options" color={theme.color} messages={OPTIONS_LOADING_MESSAGES} />
                        ) : isLoadingDetail ? (
                            <AIGeneratingIndicator key="loading-detail" color={theme.color} messages={DETAIL_LOADING_MESSAGES} />
                        ) : currentDetail ? (
                            /* ── Full recipe for the chosen dish ── */
                            <Animated.View
                                key="detail"
                                entering={FadeIn.duration(320)}
                                exiting={FadeOut.duration(150)}
                                className="bg-white rounded-2xl border border-rove-stone/10 p-5"
                            >
                                <Animated.View entering={FadeInDown.delay(40).duration(300)} className="flex-row items-center justify-between mb-2">
                                    <Text className="font-bold text-2xl text-rove-charcoal flex-1 mr-2" style={{ fontFamily: 'CormorantGaramond-Regular' }}>{currentDetail.name}</Text>
                                    <View className="px-2.5 py-1 rounded-full flex-row items-center" style={{ backgroundColor: `${theme.color}12` }}>
                                        <Feather name="clock" size={11} color={theme.color} />
                                        <Text className="text-[10px] font-bold ml-1" style={{ color: theme.color }}>{currentDetail.prep_time_minutes} min</Text>
                                    </View>
                                </Animated.View>
                                <Animated.Text
                                    entering={FadeInDown.delay(80).duration(300)}
                                    className="text-sm text-rove-stone mb-4"
                                >
                                    {currentDetail.description}
                                </Animated.Text>

                                <Animated.View entering={FadeInDown.delay(120).duration(300)} className="mb-4 bg-[#FAF9F6] p-4 rounded-xl border border-rove-stone/5">
                                    <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">Why it works</Text>
                                    <Text className="text-sm text-rove-charcoal leading-5">{currentDetail.why}</Text>
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(160).duration(300)} className="mb-4 bg-[#FAF9F6] p-4 rounded-xl border border-rove-stone/5">
                                    <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Ingredients</Text>
                                    {currentDetail.ingredients?.map((ing: string, i: number) => (
                                        <Animated.View key={i} entering={FadeInDown.delay(180 + i * 40).duration(250)} className="flex-row items-start mb-2">
                                            <View className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3" style={{ backgroundColor: theme.color }} />
                                            <Text className="text-sm text-rove-charcoal flex-1">{ing}</Text>
                                        </Animated.View>
                                    ))}
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(220).duration(300)} className="mb-6 bg-[#FAF9F6] p-4 rounded-xl border border-rove-stone/5">
                                    <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Steps</Text>
                                    {currentDetail.instructions?.map((step: string, i: number) => (
                                        <Animated.View key={i} entering={FadeInDown.delay(260 + i * 60).duration(250)} className="flex-row items-start mb-2.5">
                                            <View className="w-5 h-5 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: `${theme.color}15` }}>
                                                <Text className="text-[10px] font-bold" style={{ color: theme.color }}>{i + 1}</Text>
                                            </View>
                                            <Text className="text-sm text-rove-charcoal flex-1 leading-5">{step}</Text>
                                        </Animated.View>
                                    ))}
                                </Animated.View>

                                <View className="flex-row" style={{ gap: 10 }}>
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setDetails(p => ({ ...p, [activeTab]: null }));
                                        }}
                                        className="flex-1 py-4 rounded-full items-center justify-center flex-row border"
                                        style={{ borderColor: `${theme.color}40`, backgroundColor: 'white' }}
                                    >
                                        <Feather name="arrow-left" size={14} color={theme.color} />
                                        <Text className="font-bold tracking-wider ml-2 text-[10px] uppercase" style={{ color: theme.color }}>Back to options</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleGenerateOptions(false)}
                                        className="flex-1 py-4 rounded-full items-center justify-center flex-row"
                                        style={{ backgroundColor: theme.color }}
                                    >
                                        <Feather name="rotate-cw" size={14} color="white" />
                                        <Text className="text-white font-bold tracking-wider ml-2 text-[10px] uppercase">Fresh menu</Text>
                                    </Pressable>
                                </View>
                            </Animated.View>
                        ) : currentOptions ? (
                            /* ── The menu: 3-4 real dishes to pick from ── */
                            <Animated.View key="options" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)}>
                                <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3 text-center">
                                    What do you feel like? Tap one
                                </Text>
                                {currentOptions.map((option, i) => (
                                    <OptionCard
                                        key={`${option.name}-${i}`}
                                        option={option}
                                        index={i}
                                        accentColor={theme.color}
                                        onPress={() => handlePickOption(option, i)}
                                    />
                                ))}

                                <Pressable
                                    onPress={() => handleGenerateOptions(true)}
                                    className="py-3.5 rounded-full items-center justify-center flex-row border mt-1"
                                    style={{ borderColor: `${theme.color}40`, backgroundColor: 'rgba(255,255,255,0.7)' }}
                                >
                                    <Feather name="rotate-cw" size={13} color={theme.color} />
                                    <Text className="font-bold tracking-wider ml-2 text-[10px] uppercase" style={{ color: theme.color }}>None of these — show me others</Text>
                                </Pressable>
                            </Animated.View>
                        ) : (
                            /* ── No data for this tab yet — e.g. switched to a fresh   ── */
                            /* meal type while already fullscreen from another one.    ── */
                            <Animated.View key="empty-modal" entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)} className="items-center py-4">
                                <View className="flex-row flex-wrap justify-center gap-2 mb-8">
                                    <View className="px-3 py-1.5 rounded-lg border border-rove-stone/10" style={{ backgroundColor: `${theme.color}05` }}>
                                        <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Curating for: {diet || 'Veg'}</Text>
                                    </View>
                                    <CuisinePicker value={cuisine} onChange={setCuisine} color={theme.color} />
                                </View>
                                <BreathingIcon color={theme.color} icon={TABS.find(t => t.id === activeTab)?.icon} />
                                <Text className="font-bold text-2xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Regular' }}>Ready to nourish?</Text>
                                <AnimatedPlaceholder phrases={ANIMATED_EXAMPLES[currentPhase]?.[activeTab] || ANIMATED_EXAMPLES.Menstrual[activeTab]} />
                                <Pressable
                                    onPress={() => handleGenerateOptions(false)}
                                    className="w-full py-4 rounded-2xl items-center justify-center flex-row"
                                    style={{ backgroundColor: theme.color }}
                                >
                                    <Feather name="zap" size={16} color="white" />
                                    <Text className="text-white font-bold ml-2 text-[11px] uppercase tracking-widest">Generate {TABS.find(t => t.id === activeTab)?.label}</Text>
                                </Pressable>
                            </Animated.View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
