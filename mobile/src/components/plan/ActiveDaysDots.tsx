import React from 'react';
import { View, Text } from 'react-native';

/**
 * "3 of 4 this week" as a dot row — the completion state that was missing
 * from the "aim for N active days" guide. That guide was a static sentence
 * with nothing tracking whether she actually hit it; this is the count.
 *
 * Filled dots are capped at `target` even if she logged more days than the
 * guide asked for — this rewards hitting the goal, not overshooting it
 * indefinitely, and keeps the row a fixed, glanceable width.
 */
export function ActiveDaysDots({
  completed,
  target,
  color,
}: {
  /** Days in the last 7 with a logged workout. */
  completed: number;
  /** activeDaysPerWeek — how many she's aiming for. */
  target: number;
  color: string;
}) {
  if (target <= 0) return null;
  const filled = Math.min(completed, target);

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="flex-row gap-1">
        {Array.from({ length: target }).map((_, i) => (
          <View
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: i < filled ? color : 'transparent',
              borderWidth: 1.5,
              borderColor: i < filled ? color : `${color}40`,
            }}
          />
        ))}
      </View>
      <Text className="text-[10px] font-bold" style={{ color }}>
        {completed} of {target}
      </Text>
    </View>
  );
}
