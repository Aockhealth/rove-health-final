import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/auth';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const router = useRouter();

  async function handleLogin() {
    setErrors({});
    const newErrors: typeof errors = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrors({ server: error.message });
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>
          
          <Animated.View 
            entering={FadeInDown.duration(600).withInitialValues({ transform: [{ translateY: 20 }] })}
            className="w-full bg-white/70 overflow-hidden"
            style={{ 
              borderRadius: 36,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.8)',
              shadowColor: '#AF6B6B', 
              shadowOpacity: 0.08, 
              shadowRadius: 24, 
              shadowOffset: { width: 0, height: 12 },
              padding: 32,
              paddingBottom: 40
            }}
          >
            
            {/* Header & Logo */}
            <View className="items-center mb-10">
              <View className={`w-20 h-20 mb-6 bg-white rounded-[2rem] items-center justify-center ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`} style={{ shadowColor: '#AF6B6B', shadowOpacity: 0.1, shadowRadius: 10 }}>
                 <Image 
                   source={require('../../../assets/images/splash-mark.png')}
                   className="w-12 h-12"
                   resizeMode="contain"
                 />
              </View>
              <Text className="text-4xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                Welcome Back
              </Text>
              <Text className="text-sm text-rove-stone font-medium text-center">
                Log in to continue your cycle syncing
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6 mb-8 gap-5">
              
              <View>
                <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px] ml-2 mb-2">
                  Email
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10 opacity-70">
                    <Mail size={18} color="#78716C" />
                  </View>
                  <Input
                    className="pl-12 bg-white/90 h-[56px] rounded-2xl border border-rove-stone/20"
                    style={{ fontSize: 15, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                    placeholder="hello@rove.com"
                    placeholderTextColor="#A8A29E"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between items-center ml-2 mb-2">
                  <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px]">
                    Password
                  </Text>
                  <Link href="/(auth)/forgot-password">
                    <Text className="text-[11px] font-semibold text-[#AF6B6B]">Forgot?</Text>
                  </Link>
                </View>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10 opacity-70">
                    <Lock size={18} color="#78716C" />
                  </View>
                  <Input
                    className="pl-12 bg-white/90 h-[56px] rounded-2xl border border-rove-stone/20"
                    style={{ fontSize: 15, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                    placeholder="••••••••"
                    placeholderTextColor="#A8A29E"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                  />
                </View>
              </View>

              {errors.server ? (
                <View className="bg-rove-red/10 border border-rove-red/20 p-4 rounded-2xl items-center mt-2">
                  <Text className="text-rove-red text-sm font-medium text-center">
                    {errors.server}
                  </Text>
                </View>
              ) : null}

            </View>

            <Button 
              onPress={handleLogin} 
              disabled={loading}
              className={`w-full h-[56px] rounded-2xl bg-rove-charcoal ${Platform.OS === 'ios' ? 'shadow-md' : ''}`}
              style={{ shadowColor: '#37332E', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
            >
              <Text className="text-rove-cream font-bold tracking-wide text-base">{loading ? "Logging in..." : "Log In"}</Text>
            </Button>

            {/* Separator */}
            <View className="relative mt-8 mb-6 justify-center items-center">
              <View className="absolute w-full h-[1px] bg-rove-stone/10" />
              <View className="bg-white/60 px-4 z-10 rounded-full">
                <Text className="text-rove-stone font-semibold text-xs tracking-wide uppercase">Or</Text>
              </View>
            </View>

            {/* Google */}
            <Button 
              variant="outline" 
              className="w-full h-[56px] rounded-2xl border-rove-stone/20 bg-white/80"
              onPress={async () => {
                setLoading(true);
                setErrors({});
                const res = await signInWithGoogle();
                if (!res.success && !res.cancelled) {
                  setErrors({ server: res.error || 'Google sign in failed' });
                }
                setLoading(false);
              }}
              disabled={loading}
            >
              <Text className="text-rove-charcoal font-bold text-base">Continue with Google</Text>
            </Button>

            {/* Footer Links */}
            <View className="mt-10 items-center gap-4">
              <View className="flex-row justify-center items-center">
                <Text className="text-rove-stone text-sm font-medium">Don't have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                  <Text className="text-rove-charcoal font-bold text-sm">Sign up</Text>
                </Link>
              </View>
          
              <Text className="text-[11px] text-rove-stone/60 text-center">
                View our{' '}
                <Text
                  className="underline text-rove-charcoal font-medium"
                  onPress={() => router.push('/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  className="underline text-rove-charcoal font-medium"
                  onPress={() => router.push('/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
