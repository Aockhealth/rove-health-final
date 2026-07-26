import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleResetRequest() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'rovehealth://reset-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
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
            className={`w-full bg-white/80 p-8 rounded-[2rem] border border-white overflow-hidden ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}
          >
            <Link href="/(auth)/login" className="mb-6 self-start" asChild>
              <Button variant="ghost" size="icon" className={`w-10 h-10 rounded-full bg-white border border-rove-stone/10 items-center justify-center ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}>
                <ArrowLeft size={20} color="#2D2420" />
              </Button>
            </Link>

            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-phase-follicular/10 rounded-full flex items-center justify-center border border-phase-follicular/20 mb-4">
                <Mail size={32} color="#8DAA9D" />
              </View>
              <Text className="text-4xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                Reset Password
              </Text>
              <Text className="text-sm text-rove-stone font-medium text-center leading-relaxed">
                Enter the email address associated with your account, and we'll send you a link to reset your password.
              </Text>
            </View>

            {!success ? (
              <View className="space-y-4 mb-2 gap-4">
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
                      error={error}
                    />
                  </View>
                </View>

                <Button
                  onPress={handleResetRequest}
                  disabled={loading}
                  className="w-full mt-2 h-14 rounded-full bg-rove-charcoal"
                >
                  <Text className="text-rove-cream font-semibold text-lg">{loading ? "Sending link..." : "Send Reset Link"}</Text>
                </Button>
              </View>
            ) : (
              <View className="bg-rove-green/10 border border-rove-green/20 p-6 rounded-3xl items-center mt-2">
                <Text className="text-rove-green font-bold text-lg mb-2">Check your inbox</Text>
                <Text className="text-rove-charcoal/80 text-sm font-medium text-center leading-relaxed">
                  We sent a password reset link to <Text className="font-bold">{email}</Text>. Please click the link to reset your password.
                </Text>
              </View>
            )}
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
