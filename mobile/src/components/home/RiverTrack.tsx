import React, { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  Moon, Brain, Utensils, Activity, Droplets, Dumbbell,
  Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish,
  Carrot, Wheat, Drumstick, Shield, Pill, Home, FileText,
  Users, Mic, Image as ImageIcon, Lightbulb, Star, Music, Bike, Waves,
  Book, BookOpen, Smartphone, Clock, Beaker, Circle, Leaf,
  Sprout, CircleDot, Cookie, Nut, CupSoda, TreeDeciduous, Cherry,
  Milk, Bean, Egg, Anchor, Palmtree, Smile, Banana,
} from 'lucide-react-native';

export const iconMap: Record<string, any> = {
  Moon, Sparkles: Star, Brain, Utensils, Activity, Leaf, Droplets, Dumbbell,
  Zap, Sun, TrendingUp, Heart, Wind, Coffee, Soup, Fish, Carrot, Wheat,
  Drumstick, Shield, Pill, Home, FileText, Users, Mic, Image: ImageIcon,
  Lightbulb, Star, Music, Bike, Waves, Book, BookOpen, Smartphone, Clock,
  Beaker, Circle, Bean, Sunrise: Sun, Sprout, CircleDot, Cookie, Nut, CupSoda,
  TreeDeciduous, Cherry, Milk, Jar: Beaker, Cheese: Circle, Egg, Corn: Wheat,
  Anchor, Palmtree, Smile, Banana,
};

type RiverItem = {
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
}: {
  items: RiverItem[];
  direction?: 'left' | 'right';
  label: string;
  speed?: number;
  onCardClick?: (item: RiverItem) => void;
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
      <View className="px-4 mb-2 flex-row items-center gap-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone/70">{label}</Text>
        {!!onCardClick && (
          <View className="flex-row items-center gap-1 bg-white/60 px-2 py-0.5 rounded-full border border-white/80">
            <Text className="text-[10px]">✨</Text>
            <Text className="text-[9px] font-bold text-rove-stone/80 tracking-wide">Tap cards</Text>
          </View>
        )}
      </View>

      <View className="overflow-hidden">
        <Animated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
          {/* First set, measured to know the loop width */}
          <View onLayout={onSetLayout} className="flex-row gap-3 pl-4">
            {items.map((item, i) => (
              <RiverCard key={`a-${i}`} item={item} onPress={onCardClick} />
            ))}
          </View>
          {/* Duplicate sets to fill the loop seamlessly */}
          <View className="flex-row gap-3 pl-3">
            {items.map((item, i) => (
              <RiverCard key={`b-${i}`} item={item} onPress={onCardClick} />
            ))}
          </View>
          <View className="flex-row gap-3 pl-3">
            {items.map((item, i) => (
              <RiverCard key={`c-${i}`} item={item} onPress={onCardClick} />
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function RiverCard({ item, onPress }: { item: RiverItem; onPress?: (item: RiverItem) => void }) {
  const Icon = iconMap[item.icon] || Circle;
  const clickable = !!onPress && !!item.detail;

  return (
    <Pressable
      disabled={!clickable}
      onPress={() => clickable && onPress?.(item)}
      className="min-w-[150px] flex-shrink-0 p-3 rounded-2xl shadow-sm bg-white/95 border border-white/50 flex-row items-center gap-3"
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: item.bg }}
      >
        <Icon size={18} color={item.color} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="font-heading text-xs font-semibold text-rove-charcoal">{item.title}</Text>
        <Text numberOfLines={1} className="text-rove-charcoal/60 text-[10px] font-medium">{item.desc}</Text>
      </View>
    </Pressable>
  );
}
