import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getStorageUrl, cleanTitle, type LearnArticle } from '../../lib/learn';

const { width } = Dimensions.get('window');

export function LearnHero({ article }: { article: LearnArticle }) {
  const router = useRouter();
  const imageUrl = getStorageUrl('learn-images', article.image_path);

  return (
    <View style={{ width, height: width * 1.1, backgroundColor: '#F5F5F4' }}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          contentFit="cover"
          cachePolicy="disk"
          priority="high"
          transition={250}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
      />

      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 28 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: '#2D2420' }}>
            Featured Series
          </Text>
        </View>
        <Text style={{ fontFamily: 'CormorantGaramond-Bold', fontSize: 34, color: 'white', lineHeight: 38, marginBottom: 10 }}>
          {cleanTitle(article.title)}
        </Text>
        <Text numberOfLines={3} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginBottom: 16 }}>
          {article.excerpt}
        </Text>
        <Pressable
          onPress={() => router.push({ pathname: '/learn/[id]', params: { id: article.id } })}
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'white', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, gap: 8 }}
        >
          <Feather name="play" size={16} color="#2D2420" />
          <Text style={{ fontWeight: 'bold', color: '#2D2420' }}>Read Now</Text>
        </Pressable>
      </View>
    </View>
  );
}
