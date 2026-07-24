import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  React.useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const parsedUrl = Linking.parse(url);
      
      let accessToken = parsedUrl.queryParams?.access_token as string | undefined;
      let refreshToken = parsedUrl.queryParams?.refresh_token as string | undefined;

      // Supabase often puts tokens in the hash fragment for implicit flow
      if (parsedUrl.queryParams && typeof parsedUrl.queryParams === 'object') {
        const queryStr = Object.keys(parsedUrl.queryParams).join('&');
        if (queryStr.includes('access_token')) {
          const parts = queryStr.split('&');
          parts.forEach(part => {
            const [key, val] = part.split('=');
            if (key === 'access_token') accessToken = val;
            if (key === 'refresh_token') refreshToken = val;
          });
        }
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  async function handleResetPassword() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    <SafeAreaView className="flex-1 bg-rove-cream" edges={['top', 'bottom']}>
      <AnimatedBackground />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>

          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            className="w-full bg-white/80 p-8 rounded-[2rem] border border-white shadow-sm overflow-hidden"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}
          >
            <View className="mb-8 items-center">
              <View className="w-16 h-16 bg-phase-follicular/10 rounded-full flex items-center justify-center border border-phase-follicular/20 mb-4">
                <Lock size={32} color="#8DAA9D" />
              </View>
              <Text className="text-4xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                New Password
              </Text>
              <Text className="text-sm text-rove-stone font-medium leading-relaxed text-center">
                Please enter your new secure password.
              </Text>
            </View>

            <View className="space-y-4 mb-2 gap-4">
              <View>
                <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px] ml-1 mb-2">
                  New Password
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Lock size={18} color="#A8A29E" />
                  </View>
                  <Input
                    className="pl-12 bg-rove-cream/50 h-14 rounded-2xl border-transparent"
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
                className="w-full mt-2 h-14 rounded-full bg-rove-charcoal"
              >
                <Text className="text-rove-cream font-semibold text-lg">{loading ? "Saving..." : "Save New Password"}</Text>
              </Button>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
