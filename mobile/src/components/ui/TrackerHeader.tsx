import React from "react";
import { View, Text } from "react-native";
import { SegmentedDoughnut } from "./SegmentedDoughnut";

interface TrackerHeaderProps {
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
}

export function TrackerHeader({ selectedPhase, onPhaseSelect }: TrackerHeaderProps) {
  return (
    <View className="bg-white/30 rounded-2xl p-6 items-center shadow-sm">
      <Text className="text-xl font-bold text-rove-stone mb-1" style={{ fontFamily: "Outfit-Bold" }}>
        Current Cycle Phase
      </Text>
      <Text className="text-2xl font-bold text-rove-charcoal mb-4" style={{ fontFamily: "CormorantGaramond-Bold" }}>
        {selectedPhase}
      </Text>
      <SegmentedDoughnut selectedPhase={selectedPhase} onPhaseSelect={onPhaseSelect} size={200} />
    </View>
  );
}
