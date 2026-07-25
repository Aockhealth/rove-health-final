import React, { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  FadeIn
} from 'react-native-reanimated';
import {
  Moon, Brain, Utensils, Activity, Droplets, Dumbbell,
  Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish,
  Carrot, Wheat, Drumstick, Shield, Pill, Home, FileText,
  Users, Mic, Image as ImageIcon, Lightbulb, Star, Music, Bike, Waves,
  Book, BookOpen, Smartphone, Clock, Beaker, Circle, Leaf,
  Sprout, CircleDot, Cookie, Nut, CupSoda, TreeDeciduous, Cherry,
  Milk, Bean, Egg, Anchor, Palmtree, Smile, Banana, ChevronRight
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const iconMap: Record<string, any> = {
  Moon, Sparkles: Star, Brain, Utensils, Activity, Leaf, Droplets, Dumbbell,
  Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish, Carrot, Wheat,
  Drumstick, Shield, Pill, Home, FileText, Users, Mic, Image: ImageIcon,
  Lightbulb, Star, Music, Bike, Waves, Book, BookOpen, Smartphone, Clock,
  Beaker, Circle, Bean, Sunrise: Sun, Sprout, CircleDot, Cookie, Nut, CupSoda,
  TreeDeciduous, Cherry, Milk, Jar: Beaker, Cheese: Circle, Egg, Corn: Wheat,
  Anchor, Palmtree, Smile, Banana,
};

export type RiverItem = {
  title: string;
  desc?: string;
  detail?: string;
  icon: string;
  color: string;
  bg: string;
};

export function RiverTrack({
  items,
  direction = 'left',
  label,
  speed = 30,
  onCardClick,
  hideIcon = false,
}: {
  items: RiverItem[];
  direction?: 'left' | 'right';
  label: string;
  speed?: number;
  onCardClick?: (item: RiverItem) => void;
  hideIcon?: boolean;
}) {
  const [setWidth, setSetWidth] = useState(0);
  const translateX = useSharedValue(0);

  const riverItems = [...items, ...items, ...items];

  const onSetLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== setWidth) {
      setSetWidth(w);
      cancelAnimation(translateX);
      translateX.value = direction === 'left' ? 0 : -w;
      const target = direction === 'left' ? -w : 0;
      const start = direction === 'left' ? 0 : -w;
      translateX.value = start;
      translateX.value = withRepeat(
        withTiming(target, { duration: (w / speed) * 1000, easing: Easing.linear }),
        -1,
        false
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!items.length) return null;

  return (
    <View className="w-full overflow-hidden">
      <View className="px-4 mb-3 flex-row items-center gap-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-charcoal/70">{label}</Text>
      </View>

      <View className="overflow-hidden py-2 -my-2">
        <Animated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
          {/* First set, measured to know the loop width */}
          <View onLayout={onSetLayout} className="flex-row gap-3 pl-4">
            {items.map((item, i) => (
              <RiverCard key={`a-${i}`} item={item} onPress={onCardClick} direction={direction} hideIcon={hideIcon} />
            ))}
          </View>
          {/* Duplicate sets to fill the loop seamlessly */}
          <View className="flex-row gap-3 pl-3">
            {items.map((item, i) => (
              <RiverCard key={`b-${i}`} item={item} onPress={onCardClick} direction={direction} hideIcon={hideIcon} />
            ))}
          </View>
          <View className="flex-row gap-3 pl-3 pr-4">
            {items.map((item, i) => (
              <RiverCard key={`c-${i}`} item={item} onPress={onCardClick} direction={direction} hideIcon={hideIcon} />
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function RiverCard({ item, onPress, direction = 'left', hideIcon = false }: { item: RiverItem; onPress?: (item: RiverItem) => void; direction?: 'left' | 'right'; hideIcon?: boolean }) {
  const Icon = iconMap[item.icon] || Circle;
  const clickable = !!onPress && !!item.detail;
  
  const scale = useSharedValue(1);
  const skewDeg = direction === 'left' ? '-2deg' : '2deg';
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { skewX: skewDeg }
    ]
  }));

  return (
    <Pressable
      disabled={!clickable}
      onPressIn={() => {
        if (clickable) {
          scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
        }
      }}
      onPressOut={() => {
        if (clickable) {
          scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        }
      }}
      onPress={() => {
        if (clickable) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(item);
        }
      }}
    >
      <Animated.View
        className={`flex-row items-center gap-3 py-1.5 rounded-[20px] w-48 ${hideIcon ? 'px-4' : 'pl-1.5 pr-4'}`}
        style={[
          {
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: item.color ? `${item.color}26` : 'rgba(255,255,255,0.6)', // ~15% opacity phase-colored outline instead of a solid tint fill
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          },
          animatedStyle,
        ]}
      >
        {!hideIcon && (
          <View
            className="w-10 h-10 rounded-xl items-center justify-center border border-white/60 shadow-sm"
            style={{ backgroundColor: item.bg }}
          >
            <Icon size={16} color={item.color} />
          </View>
        )}
        <View className="flex-1">
          <Text numberOfLines={1} className={`text-xs font-semibold text-rove-charcoal/90 ${hideIcon ? 'text-center' : ''}`} style={{ fontFamily: 'CormorantGaramond-Bold' }}>{item.title}</Text>
          <Text numberOfLines={1} className={`text-rove-charcoal/50 text-[10px] font-medium mt-0.5 ${hideIcon ? 'text-center' : ''}`}>{item.desc}</Text>
        </View>
        {clickable && (
          <ChevronRight size={12} color="#333" style={{ opacity: 0.3 }} />
        )}
      </Animated.View>
    </Pressable>
  );
}
