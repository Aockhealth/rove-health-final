import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-rove-paper justify-center items-center px-6">
      <Text className="text-3xl font-bold text-rove-charcoal mb-4" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
        Home Hub
      </Text>
      <Text className="text-base text-rove-stone text-center mb-8" style={{ fontFamily: 'Inter-Regular' }}>
        This is a placeholder for the main Cycle Sync Tracker dashboard.
      </Text>
      
      <Button onPress={handleLogout} variant="outline" className="w-full">
        Log Out
      </Button>
    </SafeAreaView>
  );
}
