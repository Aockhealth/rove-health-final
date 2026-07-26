import React, { useState } from 'react';
import { Platform,  View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useDerivedValue, Easing } from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '../../lib/utils';

export interface AccordionProps {
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  themeColor?: string;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  summary,
  icon,
  children,
  themeColor = '#A8A29E',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);

  const derivedHeight = useDerivedValue(() => {
    return withTiming(isOpen ? contentHeight : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  });

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
    opacity: withTiming(isOpen ? 1 : 0, { duration: 300 }),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 300 }) }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;
    if (onLayoutHeight > 0 && contentHeight !== onLayoutHeight) {
      setContentHeight(onLayoutHeight);
    }
  };

  return (
    <View className={`bg-white/80 rounded-[2rem] border border-rove-stone/10 overflow-hidden mb-4 ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`} style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
        className="w-full flex-row items-center justify-between p-4 sm:p-5"
      >
        <View className="flex-row items-center gap-4 flex-1">
          {icon && (
            <View
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              {icon}
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-rove-charcoal" style={{ fontFamily: 'Inter-SemiBold' }}>
              {title}
            </Text>
            {summary && !isOpen && (
              <Text className="text-xs text-rove-stone font-medium mt-0.5" style={{ fontFamily: 'Inter-Medium' }}>
                {summary}
              </Text>
            )}
          </View>
        </View>
        <Animated.View style={iconStyle} className="w-8 h-8 rounded-full items-center justify-center bg-rove-paper ml-2">
          <ChevronDown size={20} color="#A8A29E" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[bodyStyle, { overflow: 'hidden' }]}>
        <View onLayout={onLayout} className="absolute w-full px-5 pb-6 pt-0">
          {children}
        </View>
      </Animated.View>
    </View>
  );
};
