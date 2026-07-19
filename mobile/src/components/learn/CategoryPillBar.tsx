import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

type CategoryPillBarProps = {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryPillBar({ categories, activeCategory, onSelect }: CategoryPillBarProps) {
  const handleSelect = (category: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ height: 60, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
    >
      <Pressable
        onPress={() => handleSelect(null)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: activeCategory === null ? '#2D2420' : '#F5F5F4',
        }}
      >
        <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: 'bold', color: activeCategory === null ? 'white' : '#2D2420' }}>
          All
        </Text>
      </Pressable>
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <Pressable
            key={category}
            onPress={() => handleSelect(category)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: isActive ? '#2D2420' : '#F5F5F4',
            }}
          >
            <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: 'bold', color: isActive ? 'white' : '#2D2420' }}>
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
