import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <Animated.View 
            entering={FadeInDown.duration(1000).springify()}
            className="w-full bg-white/80 p-8 rounded-[2rem] border border-white shadow-sm overflow-hidden"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}
          >
            
            {/* Header & Logo */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 mb-4">
                 <Image 
                   source={{ uri: 'https://placehold.co/400' }}
                   className="w-full h-full"
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
                <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px] ml-1 mb-2">
                  Email
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Mail size={18} color="#A8A29E" />
                  </View>
                  <Input
                    className="pl-12 bg-rove-cream/50 h-14 rounded-2xl border-transparent"
                    placeholder="hello@rove.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between items-center ml-1 mb-2">
                  <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px]">
                    Password
                  </Text>
                  <Link href="/(auth)/forgot-password">
                    <Text className="text-[11px] font-semibold text-rove-charcoal/60">Forgot?</Text>
                  </Link>
                </View>
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
              className="w-full h-14 rounded-full bg-rove-charcoal"
            >
              <Text className="text-rove-cream font-semibold text-lg">{loading ? "Logging in..." : "Log In"}</Text>
            </Button>

            {/* Separator */}
            <View className="relative mt-8 mb-6 justify-center items-center">
              <View className="absolute w-full h-[1px] bg-rove-stone/20" />
              <View className="bg-white px-4 z-10">
                <Text className="text-rove-stone font-medium text-sm">Or continue with</Text>
              </View>
            </View>

            {/* Google Placeholder */}
            <Button variant="outline" className="w-full h-14 rounded-full border-rove-stone/20 bg-white">
              <Text className="text-rove-charcoal font-semibold text-base">Continue with Google</Text>
            </Button>

            {/* Footer Links */}
            <View className="mt-8 items-center space-y-3 gap-2">
              <View className="flex-row justify-center mt-8">
            <Text className="text-rove-stone text-sm" style={{ fontFamily: 'Inter-Regular' }}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Text className="text-rove-charcoal font-bold text-sm" style={{ fontFamily: 'Inter-Bold' }}>Sign up</Text>
            </Link>
          </View>
          
            {/* Temporary Link for Design System Verification */}
            <View className="mt-8 pt-6 border-t border-rove-stone/10 items-center">
              <Link href="/gallery" asChild>
                <Button variant="outline" size="sm">View UI Component Gallery</Button>
              </Link>
            </View>
            <Text className="text-[11px] text-rove-stone/60 mt-4 text-center">
              View our Privacy Policy
            </Text>
          </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
