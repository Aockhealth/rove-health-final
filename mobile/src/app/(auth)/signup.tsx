import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GoogleIcon } from '../../components/ui/GoogleIcon';
import { supabase } from '../../lib/supabase';
import { signInWithGoogle, signInWithApple } from '../../lib/auth';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; server?: string }>({});
  const router = useRouter();

  async function handleSignup() {
    setErrors({});
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name.';
    }
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setErrors({ server: error.message });
      setLoading(false);
    } else {
      if (data.session) {
         router.replace('/');
      } else {
         router.push({ pathname: '/(auth)/verify-otp', params: { email } });
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-rove-cream" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.duration(600).withInitialValues({ transform: [{ translateY: 20 }] })}>

            <View className="items-center mb-9">
              <Text className="text-[13px] tracking-[5px] text-rove-stone uppercase" style={{ fontFamily: 'CormorantGaramond-Medium' }}>
                Rove
              </Text>
            </View>

            <Text className="text-[34px] text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              Create your account
            </Text>
            <Text className="text-[13px] text-rove-stone font-medium mb-8">
              A quiet, considered way to know your body.
            </Text>

            {/* Form */}
            <View className="gap-6 mb-2">

              <View>
                <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-[2.5px] mb-2.5">
                  Name
                </Text>
                <Input
                  className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
                  placeholder="Your full name"
                  placeholderTextColor="#A99B87"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  error={errors.name}
                />
              </View>

              <View>
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
                  error={errors.email}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-[2.5px] mb-2.5">
                  Password
                </Text>
                <Input
                  className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
                  placeholder="••••••••"
                  placeholderTextColor="#A99B87"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              {errors.server ? (
                <View className="bg-phase-menstrual/10 border border-phase-menstrual/20 p-4 rounded-2xl items-center">
                  <Text className="text-phase-menstrual text-sm font-medium text-center">
                    {errors.server}
                  </Text>
                </View>
              ) : null}

            </View>

            <Button
              onPress={handleSignup}
              disabled={loading}
              className="w-full h-[54px] rounded mt-6"
            >
              <Text className="text-rove-cream font-bold uppercase tracking-[2.5px] text-[13px]">{loading ? "Creating Account..." : "Create Account"}</Text>
            </Button>

            {/* Separator */}
            <View className="relative mt-6 mb-5 justify-center items-center">
              <View className="absolute w-full h-[1px] bg-rove-stone/20" />
              <View className="bg-rove-cream px-4 z-10">
                <Text className="text-rove-stone font-bold text-[10px] tracking-[2px] uppercase">Or</Text>
              </View>
            </View>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full h-[50px] rounded border-rove-stone/30 bg-white mb-3"
              onPress={async () => {
                setLoading(true);
                setErrors({});
                const res = await signInWithGoogle();
                if (res.success) {
                  router.replace('/');
                } else if (!res.cancelled) {
                  setErrors({ server: res.error || 'Google sign up failed' });
                }
                setLoading(false);
              }}
              disabled={loading}
            >
              <View style={{ marginRight: 10 }}>
                <GoogleIcon size={16} />
              </View>
              <Text className="text-rove-charcoal font-semibold text-[13px]">Continue with Google</Text>
            </Button>

            {/* Apple */}
            {Platform.OS === 'ios' ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={4}
                style={{ width: '100%', height: 50 }}
                onPress={async () => {
                  setLoading(true);
                  setErrors({});
                  const res = await signInWithApple();
                  if (res.success) {
                    router.replace('/');
                  } else if (!res.cancelled) {
                    setErrors({ server: res.error || 'Apple sign up failed' });
                  }
                  setLoading(false);
                }}
              />
            ) : null}

            {/* Footer Links */}
            <View className="mt-8 items-center gap-4">
              <View className="flex-row justify-center items-center">
                <Text className="text-rove-stone text-xs font-medium">
                  Already have an account?{' '}
                </Text>
                <Link href="/(auth)/login">
                  <Text className="text-rove-charcoal font-bold text-xs">Log in</Text>
                </Link>
              </View>
              <Text className="text-[11px] text-rove-stone text-center">
                By joining, you agree to our{' '}
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
