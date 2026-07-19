import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List } from 'lucide-react-native';

export default function PlanScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <List size={48} color="#C97B7B" />
        </View>
        <Text style={styles.title}>Plan</Text>
        <Text style={styles.subtitle}>
          Your personalized cycle-based plan will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: { marginBottom: 20, opacity: 0.4 },
  title: { fontSize: 24, fontFamily: 'Outfit-Bold', color: '#2D2420', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#A8A29E', textAlign: 'center' },
});
