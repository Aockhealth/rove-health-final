import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { phaseThemes } from '../../data/home-content';
import { generateRoveChefProtocol } from '../../lib/api';
import { SectionHeader } from './SectionHeader';

type TabType = 'snack' | 'smoothie' | 'salad';

export function RoveChef({ phase, diet }: { phase: string, diet: string }) {
    const currentPhase = phase || "Menstrual";
    const theme = phaseThemes[currentPhase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    const [activeTab, setActiveTab] = useState<TabType>('snack');
    const [results, setResults] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    
    // We remove the cuisine/symptoms inputs from the main screen to keep it clean like the web app
    const [cuisine, setCuisine] = useState("");
    const [symptoms, setSymptoms] = useState("");

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const data = await generateRoveChefProtocol(
                currentPhase,
                diet || "Balanced",
                cuisine || "Global",
                activeTab,
                { currentSymptomsOrCraving: symptoms }
            );
            if (data) {
                setResults(prev => ({ ...prev, [activeTab]: data[activeTab] || data }));
            }
        } catch (e) {
            Alert.alert("Error", "Could not generate recipe");
        } finally {
            setIsGenerating(false);
        }
    };

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
                                onPress={() => setActiveTab(tab.id)}
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
                        
                        <View className="mb-6 bg-white p-4 rounded-xl border border-rove-stone/5">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-3">Ingredients</Text>
                            {currentItem.ingredients?.map((ing: string, i: number) => (
                                <View key={i} className="flex-row items-start mb-2">
                                    <View className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3" style={{ backgroundColor: theme.color }} />
                                    <Text className="text-sm text-rove-charcoal flex-1">{ing}</Text>
                                </View>
                            ))}
                        </View>

                        <Pressable
                            onPress={() => setResults(p => ({ ...p, [activeTab]: null }))}
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
                        <Text className="text-rove-stone text-sm italic mb-8">Maybe: {activeTab === 'snack' ? 'Iron-Rich Date Bites...' : activeTab === 'smoothie' ? 'Berry Antioxidant Blend...' : 'Warm Quinoa Bowl...'}</Text>

                        <Pressable
                            onPress={handleGenerate}
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
                    </View>
                )}
            </View>
        </View>
    );
}
