import React from 'react';
import { View, Text, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
// Dumbbell (lucide) reads as "exercise" far more specifically than the
// generic activity/pulse icon, which was overused across the app.
import { Dumbbell } from 'lucide-react-native';

type WellnessAverages = {
  water: number;
  sleep: string | number;
  exerciseMinutes: number;
};

type HabitsOverviewCardProps = {
  wellnessAverages?: WellnessAverages;
  theme: any;
};

export function HabitsOverviewCard({
  wellnessAverages,
  theme,
}: HabitsOverviewCardProps) {
  // Extract averages from backend data (fallback to 0)
  const avgSleep = Number(wellnessAverages?.sleep || 0);
  const avgExercise = wellnessAverages?.exerciseMinutes || 0;
  const avgHydration = wellnessAverages?.water || 0;

  return (
    <View 
      className="relative rounded-[32px] p-5 flex flex-col mb-4 overflow-hidden border border-white/60"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 0 }}
    >
      {/* Blob */}
      <View
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-40"
        style={{ backgroundColor: theme.color, transform: [{ scale: 1.5 }] }}
      />
      
      {/* Blur overlay to soften the blob */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
      )}

      <View className="relative z-10">
        <View className="flex-row items-center gap-2 mb-4">
          <Feather name="star" size={16} color={theme.color} />
          <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
            30-Day Habits
          </Text>
        </View>

        <View className="flex flex-col gap-3">
          {/* Sleep Row */}
          <View className="flex-row items-center justify-between p-3 rounded-[20px] border border-white/60 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-[14px] bg-white/70 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 0 }}>
                <Feather name="moon" size={16} color={theme.color} />
              </View>
              <Text className="text-sm font-medium text-rove-charcoal">Avg Sleep</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              {avgSleep > 0 ? (
                <>
                  <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>{avgSleep}</Text>
                  <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">hrs</Text>
                </>
              ) : (
                <Text className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</Text>
              )}
            </View>
          </View>

          {/* Exercise Row */}
          <View className="flex-row items-center justify-between p-3 rounded-[20px] border border-white/60 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-[14px] bg-white/70 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 0 }}>
                <Dumbbell size={16} color={theme.color} />
              </View>
              <Text className="text-sm font-medium text-rove-charcoal">Avg Workout</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              {avgExercise > 0 ? (
                <>
                  <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>{avgExercise}</Text>
                  <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">mins</Text>
                </>
              ) : (
                <Text className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</Text>
              )}
            </View>
          </View>

          {/* Hydration Row */}
          <View className="flex-row items-center justify-between p-3 rounded-[20px] border border-white/60 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 0 }}>
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-[14px] bg-white/70 shadow-sm" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 0 }}>
                <Feather name="droplet" size={16} color={theme.color} />
              </View>
              <Text className="text-sm font-medium text-rove-charcoal">Avg Hydration</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              {avgHydration > 0 ? (
                <>
                  <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>{(avgHydration * 0.25).toFixed(1)}</Text>
                  <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-wider">L/day</Text>
                </>
              ) : (
                <Text className="text-[10px] text-rove-stone/60 uppercase tracking-wider font-bold">No Data</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
