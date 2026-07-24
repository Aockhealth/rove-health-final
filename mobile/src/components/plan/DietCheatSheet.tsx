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
                        shadowColor: '#5B9A8B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 12,
                        elevation: 2,
                    }}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#5B9A8B', opacity: 0.05 }]} />
                        
                        <View className="flex-row items-center mb-4 border-b border-[#5B9A8B]/10 pb-3">
                            <View className="w-7 h-7 rounded-full items-center justify-center mr-2.5 bg-[#5B9A8B]/15">
                                <Feather name="check" size={14} color="#5B9A8B" />
                            </View>
                            <Text className="font-extrabold text-[11px] uppercase text-[#5B9A8B] tracking-[2px]">{data.focus.title}</Text>
                        </View>
                        
                        <View className="flex-col gap-3">
                            {data.focus.items.length > 0 ? (
                                data.focus.items.map((item: any, i: number) => {
                                    const label = typeof item === 'string' ? item : item.title;
                                    return (
                                        <View key={i} className="flex-row items-start">
                                            <View className="w-1.5 h-1.5 rounded-full bg-[#5B9A8B]/40 mt-1.5 mr-2.5" />
                                            <Text className="text-rove-charcoal/80 text-sm font-semibold flex-1 leading-tight">{label}</Text>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text className="text-rove-charcoal/40 text-xs italic">Nothing specific for this phase.</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Avoid Column */}
                <View className="flex-1 px-[6px]">
                    <View className="rounded-[24px] p-5 border relative overflow-hidden" style={{
                        borderColor: 'rgba(255,255,255,0.6)',
                        shadowColor: '#AF6B6B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 12,
                        elevation: 2,
                    }}>
                        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#AF6B6B', opacity: 0.05 }]} />
                        
                        <View className="flex-row items-center mb-4 border-b border-[#AF6B6B]/10 pb-3">
                            <View className="w-7 h-7 rounded-full items-center justify-center mr-2.5 bg-[#AF6B6B]/15">
                                <Feather name="x" size={14} color="#AF6B6B" />
                            </View>
                            <Text className="font-extrabold text-[11px] uppercase text-[#AF6B6B] tracking-[2px]">{data.avoid.title}</Text>
                        </View>
                        
                        <View className="flex-col gap-3">
                            {data.avoid.items.length > 0 ? (
                                data.avoid.items.map((item: any, i: number) => {
                                    const label = typeof item === 'string' ? item : item.title;
                                    return (
                                        <View key={i} className="flex-row items-start">
                                            <View className="w-1.5 h-1.5 rounded-full bg-[#AF6B6B]/40 mt-1.5 mr-2.5" />
                                            <Text className="text-rove-charcoal/80 text-sm font-semibold flex-1 leading-tight">{label}</Text>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text className="text-rove-charcoal/40 text-xs italic">Nothing specific for this phase.</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
