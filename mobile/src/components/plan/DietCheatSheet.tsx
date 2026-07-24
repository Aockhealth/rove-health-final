import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { phaseThemes } from '../../data/home-content';
import { SectionHeader } from './SectionHeader';

interface DietCheatSheetProps {
    data: {
        focus: { title: string; items: string[] };
        avoid: { title: string; items: string[] };
    };
    phase?: string;
}

export function DietCheatSheet({ data, phase }: DietCheatSheetProps) {
    if (!data) return null;

    const theme = phaseThemes[phase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    return (
        <View className="mb-10">
            <SectionHeader icon="check-square" title="One-Glance Strategy" color={theme.color} />

            <View className="flex-row mx-[-6px]">
                {/* Focus Column */}
                <View className="flex-1 px-[6px]">
                    <View className="rounded-[24px] p-5 border relative overflow-hidden" style={{
                        borderColor: 'rgba(255,255,255,0.6)',
                        shadowColor: '#1E7E34',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 12,
                        elevation: 2,
                    }}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#E6F4EA', opacity: 0.3 }]} />
                        
                        <View className="flex-row items-center mb-4 border-b border-[#1E7E34]/10 pb-3">
                            <View className="w-7 h-7 rounded-full items-center justify-center mr-2.5 bg-[#1E7E34]/10">
                                <Feather name="check" size={14} color="#1E7E34" />
                            </View>
                            <Text className="font-extrabold text-[11px] uppercase text-[#1E7E34] tracking-[2px]">{data.focus.title}</Text>
                        </View>
                        
                        <View className="flex-col gap-3">
                            {data.focus.items.map((item: any, i: number) => {
                                const label = typeof item === 'string' ? item : item.title;
                                return (
                                    <View key={i} className="flex-row items-start">
                                        <View className="w-1 h-1 rounded-full bg-[#1E7E34]/40 mt-1.5 mr-2" />
                                        <Text className="text-rove-charcoal/80 text-sm font-semibold flex-1 leading-tight">{label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Avoid Column */}
                <View className="flex-1 px-[6px]">
                    <View className="rounded-[24px] p-5 border relative overflow-hidden" style={{
                        borderColor: 'rgba(255,255,255,0.6)',
                        shadowColor: '#D93025',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 12,
                        elevation: 2,
                    }}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FCE8E6', opacity: 0.4 }]} />
                        
                        <View className="flex-row items-center mb-4 border-b border-[#D93025]/10 pb-3">
                            <View className="w-7 h-7 rounded-full items-center justify-center mr-2.5 bg-[#D93025]/10">
                                <Feather name="x" size={14} color="#D93025" />
                            </View>
                            <Text className="font-extrabold text-[11px] uppercase text-[#D93025] tracking-[2px]">{data.avoid.title}</Text>
                        </View>
                        
                        <View className="flex-col gap-3">
                            {data.avoid.items.map((item: any, i: number) => {
                                const label = typeof item === 'string' ? item : item.title;
                                return (
                                    <View key={i} className="flex-row items-start">
                                        <View className="w-1 h-1 rounded-full bg-[#D93025]/40 mt-1.5 mr-2" />
                                        <Text className="text-rove-charcoal/80 text-sm font-semibold flex-1 leading-tight">{label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
