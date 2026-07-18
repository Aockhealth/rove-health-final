import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleResetPassword() {
    setError('');
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          
          <View className="mb-10 items-center">
            <View className="w-16 h-16 mb-4 bg-white rounded-2xl shadow-sm items-center justify-center">
               <Lock size={32} color="#2D2420" />
            </View>
            <Text className="text-3xl font-bold text-rove-charcoal mb-3 text-center">
              New Password
            </Text>
            <Text className="text-sm text-rove-stone font-medium leading-relaxed text-center">
              Please enter your new secure password.
            </Text>
          </View>

          <View className="space-y-4 mb-6 gap-4">
            <View>
              <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px] ml-1 mb-2">
                New Password
              </Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <Lock size={18} color="#A8A29E" />
                </View>
                <Input
                  className="pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={error}
                />
              </View>
            </View>

            <Button 
              onPress={handleResetPassword} 
              disabled={loading}
              className="w-full mt-4 h-14"
            >
              {loading ? "Saving..." : "Save New Password"}
            </Button>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
