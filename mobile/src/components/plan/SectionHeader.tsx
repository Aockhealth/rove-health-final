import React from 'react';
import { View, Text } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
    icon: string;
    iconFamily?: 'Feather' | 'Ionicons';
    title: string;
    subtitle?: string;
    color: string;
    /** Set false when nesting inside a card that already has its own padding,
     * so this doesn't add a second, mismatched inset on top of it. */
    inset?: boolean;
}

export function SectionHeader({ icon, iconFamily = 'Feather', title, subtitle, color, inset = true }: SectionHeaderProps) {
    return (
        <View className={`flex-row items-center mb-4 ${inset ? 'px-2' : ''}`}>
            <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
                {iconFamily === 'Ionicons' ? (
                    <Ionicons name={icon as any} size={14} color={color} />
                ) : (
                    <Feather name={icon as any} size={14} color={color} />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{title}</Text>
                {!!subtitle && (
                    <Text className="text-[10px] text-rove-stone font-semibold uppercase tracking-widest mt-0.5">{subtitle}</Text>
                )}
            </View>
        </View>
    );
}
