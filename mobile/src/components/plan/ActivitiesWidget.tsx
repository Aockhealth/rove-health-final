import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ActivitiesWidgetProps {
  practices: any[];
  themeColor: string;
}

export function ActivitiesWidget({ practices, themeColor }: ActivitiesWidgetProps) {
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      try {
        const savedCustom = await AsyncStorage.getItem('rove_custom_activities');
        if (savedCustom && isMounted) setCustomItems(JSON.parse(savedCustom));

        const savedChecks = await AsyncStorage.getItem('rove_activity_checks');
        if (savedChecks && isMounted) setCheckedState(JSON.parse(savedChecks));
      } catch (e) {
        console.error('Failed to load local storage', e);
      }
    };
    loadState();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCheck = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newState = { ...checkedState, [id]: !checkedState[id] };
    setCheckedState(newState);
    await AsyncStorage.setItem('rove_activity_checks', JSON.stringify(newState));
  };

  const addCustom = async () => {
    if (!newItem.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const item = {
      title: newItem,
      desc: "Personal Goal",
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    const next = [...customItems, item];
    setCustomItems(next);
    await AsyncStorage.setItem('rove_custom_activities', JSON.stringify(next));
    setNewItem('');
  };

  const removeCustom = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = customItems.filter(i => i.id !== id);
    setCustomItems(next);
    await AsyncStorage.setItem('rove_custom_activities', JSON.stringify(next));
  };

  const mergedList = [
    ...practices.map((p, i) => ({ ...p, id: `sys-${p.title || p.name || i}`, isCustom: false })),
    ...customItems
  ];

  return (
    <View
      className="rounded-[28px] overflow-hidden relative border border-white/40"
      style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: Platform.OS === 'ios' ? 3 : 0 }}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: `${themeColor}0D` }]} />

      <View className="flex-row items-center p-5 border-b border-white/40">
        <View className="w-8 h-8 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${themeColor}15` }}>
          <Feather name="check-circle" size={14} color={themeColor} />
        </View>
        <Text className="text-xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Recommended For You
        </Text>
      </View>

      <View>
        {mergedList.map((item) => {
          const isChecked = checkedState[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleCheck(item.id)}
              activeOpacity={0.7}
              className="flex-row items-center p-4 border-b border-white/40"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                  isChecked ? 'border-transparent' : 'border-rove-stone/30 bg-white/50'
                }`}
                style={isChecked ? { backgroundColor: themeColor } : {}}
              >
                {isChecked && <Feather name="check" size={12} color="white" />}
              </View>

              <View className="flex-1">
                <Text
                  className={`font-bold text-sm ${isChecked ? 'text-rove-stone line-through' : 'text-rove-charcoal'}`}
                  style={isChecked ? { textDecorationLine: 'line-through' } : {}}
                >
                  {item.title || item.name}
                </Text>
                {item.desc && (
                  <Text className={`text-[10px] mt-1 ${isChecked ? 'text-rove-stone/50' : 'text-rove-stone'}`}>
                    {item.desc}
                  </Text>
                )}
              </View>

              {item.isCustom && (
                <TouchableOpacity onPress={() => removeCustom(item.id)} className="p-2">
                  <Feather name="trash-2" size={14} color="#C97B7B" style={{ opacity: 0.6 }} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="p-4 bg-rove-stone/5 flex-row items-center">
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add activity or supplement..."
          placeholderTextColor="#A8A29E"
          className="flex-1 text-sm font-medium text-rove-charcoal h-10 px-4 bg-white rounded-full border border-rove-stone/10"
          onSubmitEditing={addCustom}
        />
        <TouchableOpacity
          onPress={addCustom}
          disabled={!newItem.trim()}
          className="w-10 h-10 rounded-full items-center justify-center ml-2 shadow-sm"
          style={{ backgroundColor: !newItem.trim() ? '#E7E5E4' : themeColor }}
        >
          <Feather name="plus" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
