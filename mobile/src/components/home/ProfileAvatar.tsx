import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

async function fetchProfileInitial(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
  return data?.full_name?.[0] || null;
}

import { Link } from 'expo-router';

export default function ProfileAvatar() {
  const { data: initial } = useQuery({
    queryKey: ['profile-avatar'],
    queryFn: fetchProfileInitial,
  });

  return (
    <Link href="/profile" asChild>
      <Pressable className="w-10 h-10 rounded-full bg-white/50 border border-white/60 items-center justify-center active:scale-95 z-50">
        {initial ? (
          <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{initial.toUpperCase()}</Text>
        ) : (
          <User size={20} color="#A8A29E" />
        )}
      </Pressable>
    </Link>
  );
}
