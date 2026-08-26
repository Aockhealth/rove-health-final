import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '../../lib/utils';

export interface SegmentedControlTab {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  tabs: SegmentedControlTab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  /** Tab ids that render dimmed with a badge and don't respond to taps. */
  disabledTabs?: string[];
  /** Badge text shown under a disabled tab. Caller supplies it translated. */
  disabledBadgeText?: string;
}

// Same dark-pill active state as the goal chips in FocusGoals, so the two
// toggles on Profile read as one design language instead of two.
export function SegmentedControl({ tabs, activeTab, onChange, className, disabledTabs, disabledBadgeText = 'Soon' }: SegmentedControlProps) {
  return (
    <View
      className={cn('flex-row rounded-2xl border border-stone-100 bg-stone-50 p-1.5', className)}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = !!disabledTabs?.includes(tab.id);
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (!isDisabled) onChange(tab.id);
            }}
            disabled={isDisabled}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            className={cn(
              'flex-1 items-center justify-center rounded-xl py-2.5',
              isActive && 'bg-stone-800'
            )}
            style={[
              isActive
                ? {
                    shadowColor: '#2D2420',
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }
                : undefined,
              isDisabled ? { opacity: 0.45 } : undefined,
            ]}
          >
            <Text
              className={cn(
                'text-sm',
                isActive ? 'font-semibold text-white' : 'text-stone-500'
              )}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {isDisabled ? (
              <Text className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-stone-400">
                {disabledBadgeText}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
