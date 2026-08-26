import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.duration(600).withInitialValues({ transform: [{ translateY: 20 }] })}>
            <TouchableOpacity onPress={() => router.back()} className="mb-9 -ml-1" hitSlop={12}>
              <ArrowLeft size={22} color="#2D2420" />
            </TouchableOpacity>

            {!success ? (
              <>
                <View className="w-14 h-14 rounded-full bg-rove-cream border border-rove-stone/20 items-center justify-center mb-5">
                  <Mail size={22} color="#8DAA9D" />
                </View>

                <Text className="text-[32px] text-rove-charcoal mb-2.5" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                  Reset your password
                </Text>
                <Text className="text-[13px] text-rove-stone font-medium leading-relaxed mb-8">
                  Enter the email on your account and we'll send a link to get you back in.
                </Text>

                <View className="mb-8">
                  <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-[2.5px] mb-2.5">
                    Email
                  </Text>
                  <Input
                    className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
                    placeholder="hello@rove.com"
                    placeholderTextColor="#A99B87"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={error}
                  />
                </View>

                <Button
                  onPress={handleResetRequest}
                  disabled={loading}
                  className="w-full h-[54px] rounded"
                >
                  <Text className="text-rove-cream font-bold uppercase tracking-[2.5px] text-[13px]">{loading ? "Sending..." : "Send Reset Link"}</Text>
                </Button>
              </>
            ) : (
              <View className="bg-phase-follicular/10 border border-phase-follicular/20 p-6 rounded-2xl items-center">
                <Text className="text-phase-follicular font-bold text-lg mb-2">Check your inbox</Text>
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
