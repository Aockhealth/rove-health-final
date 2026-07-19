import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getStorageUrl, cleanTitle, type LearnArticle } from '../../lib/learn';

type ArticleCardProps = {
  article: LearnArticle;
  progress?: number;
};

export function ArticleCard({ article, progress = 0 }: ArticleCardProps) {
  const router = useRouter();
  const imageUrl = getStorageUrl('learn-images', article.image_path);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/learn/[id]', params: { id: article.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: 160, marginRight: 12 }}
    >
      <View style={{ width: 160, height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E7E5E4' }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="disk"
            transition={200}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#A8A29E', fontSize: 12 }}>No Image</Text>
          </View>
        )}

        {/* Gradient scrim for text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.45, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
        />

        {article.read_time && (
          <View style={{ position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
              {article.read_time}
            </Text>
          </View>
        )}

        <View style={{ position: 'absolute', left: 10, right: 10, bottom: progress > 0 ? 18 : 10 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            {article.category}
          </Text>
          <Text numberOfLines={2} style={{ color: 'white', fontSize: 13, fontWeight: 'bold', lineHeight: 16 }}>
            {cleanTitle(article.title)}
          </Text>
        </View>

        {progress > 0 && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.25)' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: '#AF6B6B' }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
