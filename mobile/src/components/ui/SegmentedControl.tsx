import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
}

export function SegmentedControl({ tabs, activeTab, onChange, className }: SegmentedControlProps) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#e5e5e5', padding: 6, borderRadius: 16 }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 14 }, isActive ? { backgroundColor: '#fff' } : {}]}
          >
            <Text 
              style={[{ fontSize: 14, color: isActive ? '#333' : '#666' }]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
