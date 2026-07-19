import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const QUOTES = [
  "Honoring your natural rhythm...",
  "The body is a fluid system, not a machine.",
  "Every phase has its own unique power.",
  "In tune with your nature."
];

export default function LoadingScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  return (
    <View className="flex-1 bg-[#FAF9F6] items-center justify-center relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.4 }]}>
        <LinearGradient colors={['rgba(175, 107, 107, 0.08)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        <LinearGradient colors={['transparent', 'rgba(141, 170, 157, 0.08)']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFillObject]} />
      </View>

      <Animated.View style={orbStyle} className="items-center justify-center mb-12">
        <View 
          className="w-36 h-36 rounded-full overflow-hidden" 
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10 }}
        >
          <LinearGradient
            colors={['rgba(245, 225, 225, 0.8)', 'rgba(230, 240, 235, 0.8)', 'rgba(249, 238, 221, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>
        <View className="absolute items-center justify-center">
           <Text className="text-xl font-bold uppercase tracking-[6px] text-rove-charcoal/70 ml-1">ROVE</Text>
        </View>
      </Animated.View>

      <View className="h-16 items-center justify-center px-12">
        <Animated.Text
          key={quoteIndex}
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(800)}
          className="text-center text-rove-stone/80 text-lg font-medium leading-relaxed italic"
          style={{ fontFamily: 'CormorantGaramond-Medium' }}
        >
          "{QUOTES[quoteIndex]}"
        </Animated.Text>
      </View>
    </View>
  );
}
