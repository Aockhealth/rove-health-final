import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AnimatedBackground />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back 🌸</Text>
        <Text style={styles.subtitle}>
          Track your cycle, understand your body.
        </Text>

        <Button
          onPress={() => router.push('/(tabs)/tracker' as any)}
          className="w-full mb-4"
        >
          Open Today's Log
        </Button>

        <Button
          onPress={() => router.push('/gallery')}
          variant="secondary"
          className="w-full mb-4"
        >
          UI Gallery
        </Button>

        <Button onPress={handleLogout} variant="outline" className="w-full">
          Log Out
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginBottom: 40,
    textAlign: 'center',
  },
});
