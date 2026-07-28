import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, Mail } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Input } from '../../components/ui/Input';

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleVerify() {
    setError('');
    
    if (otp.length < 6 || otp.length > 8 || !/^\d+$/.test(otp)) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please sign up again.');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      setSuccess('Verified! Loading...');
      router.replace('/');
    }
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setIsResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setIsResending(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('A new code has been sent to your email.');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
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
            className={`w-full bg-white/80 p-8 rounded-[2rem] border border-white overflow-hidden ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}
          >
            
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-phase-follicular/10 rounded-full flex items-center justify-center border border-phase-follicular/20 mb-4">
                <Mail size={32} color="#8DAA9D" />
              </View>
              <Text className="text-4xl text-rove-charcoal mb-2 text-center" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                Verify your email
              </Text>
              <Text className="text-sm text-rove-stone font-medium text-center leading-relaxed">
                We have sent a verification code to{'\n'}
                <Text className="font-bold text-rove-charcoal">{email}</Text>.{'\n'}
                Enter it below to activate your account.
              </Text>
            </View>

            <View className="space-y-6 mb-6 gap-4">
              
              <View>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <ShieldCheck size={18} color="#A8A29E" />
                  </View>
                  <Input
                    className="pl-12 bg-rove-cream/50 h-14 rounded-2xl border-transparent text-center text-2xl font-semibold tracking-[5px]"
                    placeholder="00000000"
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 8))}
                    keyboardType="number-pad"
                    maxLength={8}
                    error={error}
                  />
                </View>
              </View>

              {success ? (
                <View className="bg-green-50 border border-green-100 p-4 rounded-2xl items-center mt-2">
                  <Text className="text-green-700 text-sm font-medium text-center">
                    {success}
                  </Text>
                </View>
              ) : null}

              {error ? (
                <View className="bg-rove-red/10 border border-rove-red/20 p-4 rounded-2xl items-center mt-2">
                  <Text className="text-rove-red text-sm font-medium text-center">
                    {error}
                  </Text>
                </View>
              ) : null}

            </View>

            <Button 
              onPress={handleVerify} 
              disabled={loading || !!success}
              className="w-full h-14 rounded-full bg-rove-charcoal"
            >
              <Text className="text-rove-cream font-semibold text-lg">{loading ? "Verifying..." : "Verify Email"}</Text>
            </Button>

            <View className="mt-6 items-center space-y-3 gap-2">
              <TouchableOpacity 
                onPress={handleResend} 
                disabled={isResending || resendCooldown > 0}
              >
                <Text className={`text-sm font-semibold ${isResending || resendCooldown > 0 ? 'text-rove-stone/50' : 'text-rove-stone hover:text-rove-charcoal'}`}>
                  {isResending 
                    ? "Sending..." 
                    : resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : "Resend code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-sm font-semibold text-rove-stone underline" style={{ textDecorationLine: 'underline' }}>
                  Back to Log In
                </Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
