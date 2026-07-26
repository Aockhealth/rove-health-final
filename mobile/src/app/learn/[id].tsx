import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Markdown from 'react-native-markdown-display';
import FitImage from 'react-native-fit-image';
import { ChevronLeft, Clock, User, Share2 } from 'lucide-react-native';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { fetchArticleById, fetchArticleMarkdown, getStorageUrl, cleanTitle } from '../../lib/learn';
import { getReadingProgress, setReadingProgress } from '../../lib/readingProgress';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const latestProgress = useRef(0);

  const { data: article, isPending: articleLoading } = useQuery({
    queryKey: ['learn-article', id],
    queryFn: () => fetchArticleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: markdownContent, isPending: markdownLoading } = useQuery({
    queryKey: ['learn-article-md', id],
    queryFn: () => fetchArticleMarkdown(article!.md_file_path),
    enabled: !!article?.md_file_path,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!id) return;
    getReadingProgress(id).then((pct) => {
      latestProgress.current = pct;
    });
    return () => {
      if (latestProgress.current > 0) setReadingProgress(id, latestProgress.current);
    };
  }, [id]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    const pct = scrollable > 0 ? Math.min(100, Math.max(0, (contentOffset.y / scrollable) * 100)) : 0;
    setScrollProgress(pct);
    latestProgress.current = pct;
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        message: `${cleanTitle(article.title)} — https://rovehealth.in/cycle-sync/learn/${article.id}`,
      });
    } catch {
      // user cancelled or share failed — nothing to recover from
    }
  };

  if (articleLoading || (article && markdownLoading)) return <LoadingScreen />;
  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-rove-stone">Article not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-rove-charcoal font-bold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const imageUrl = getStorageUrl('learn-images', article.image_path);

  return (
    <View className="flex-1 bg-white">
      {/* Reading progress bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'transparent', zIndex: 50 }}>
        <View style={{ width: `${scrollProgress}%`, height: '100%', backgroundColor: '#AF6B6B' }} />
      </View>

      <ScrollView onScroll={handleScroll} scrollEventThrottle={32} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ height: 280, backgroundColor: '#E7E5E4' }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-rove-stone">No Cover Image</Text>
            </View>
          )}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </View>

        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5 mx-5 mt-2 self-start px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <ChevronLeft size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>Back to Library</Text>
          </Pressable>
        </SafeAreaView>

        {/* Content */}
        <View style={{ marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: 'white', padding: 20, paddingBottom: 60 }}>
          <View className="flex-row flex-wrap items-center gap-2 mb-6">
            <View style={{ backgroundColor: 'rgba(212, 162, 95, 0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: '#D4A25F', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                {article.category}
              </Text>
            </View>
            {article.read_time && (
              <View className="flex-row items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full">
                <Clock size={12} color="#78716C" />
                <Text className="text-xs text-rove-stone">{article.read_time}</Text>
              </View>
            )}
          </View>

          <Text className="text-rove-charcoal mb-6" style={{ fontFamily: 'CormorantGaramond-Bold', fontSize: 30, lineHeight: 36 }}>
            {cleanTitle(article.title)}
          </Text>

          <View className="flex-row items-center gap-3 mb-8 pb-8 border-b border-stone-100">
            <View className="w-11 h-11 bg-stone-100 rounded-full items-center justify-center">
              <User size={18} color="#A8A29E" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-rove-stone uppercase tracking-widest mb-0.5">
                Verified & Reviewed By
              </Text>
              <Text className="text-sm font-medium text-rove-charcoal leading-snug">
                Dr. Aditya Oswal, Dr. Chaitanya Kalra and Dr. Harshita Pathak
              </Text>
            </View>
          </View>

          <Markdown 
            style={markdownStyles}
            rules={{
              image: (node: any, children: any, parent: any, styles: any) => {
                const { src, alt } = node.attributes;
                return (
                  <FitImage
                    key={node.key}
                    indicator={true}
                    style={styles._VIEW_SAFE_image}
                    source={{ uri: src }}
                    accessible={!!alt}
                    accessibilityLabel={alt}
                  />
                );
              }
            }}
          >
            {(markdownContent || '').trimStart().replace(/^#\s+[^\n]+(\r?\n)*/, "")}
          </Markdown>
        </View>
      </ScrollView>

      {scrollProgress > 5 && (
        <Pressable
          onPress={handleShare}
          className="absolute bottom-6 right-6 flex-row items-center gap-2 bg-white px-5 py-3 rounded-full"
          style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 0 }}
        >
          <Share2 size={16} color="#2D2420" />
          <Text style={{ fontWeight: 'bold', color: '#2D2420', fontSize: 13 }}>Share</Text>
        </Pressable>
      )}
    </View>
  );
}

const markdownStyles = {
  body: { color: '#2D2420CC' },
  heading1: { fontFamily: 'CormorantGaramond-Bold', fontSize: 28, color: '#2D2420', marginTop: 24, marginBottom: 16, lineHeight: 34 },
  heading2: { fontFamily: 'CormorantGaramond-Bold', fontSize: 24, color: '#2D2420', marginTop: 28, marginBottom: 12, lineHeight: 30 },
  heading3: { fontFamily: 'CormorantGaramond-Bold', fontSize: 20, color: '#2D2420', marginTop: 24, marginBottom: 12, lineHeight: 26 },
  heading4: { fontSize: 15, fontWeight: 'bold' as const, color: '#2D2420', textTransform: 'uppercase' as const, marginTop: 20, marginBottom: 10, letterSpacing: 0.5 },
  paragraph: { fontSize: 16, lineHeight: 26, color: '#2D2420CC', marginBottom: 20 },
  strong: { fontWeight: 'bold' as const, color: '#2D2420' },
  bullet_list: { marginBottom: 20 },
  ordered_list: { marginBottom: 20 },
  list_item: { marginBottom: 12, fontSize: 16, lineHeight: 26, color: '#2D2420CC' },
  blockquote: { backgroundColor: 'rgba(212, 162, 95, 0.08)', borderLeftColor: '#D4A25F', borderLeftWidth: 4, paddingHorizontal: 16, paddingVertical: 14, marginVertical: 20, borderRadius: 8, fontStyle: 'italic' as const },
  link: { color: '#AF6B6B', textDecorationLine: 'underline' as const },
  hr: { backgroundColor: '#E7E5E4', height: 1, marginVertical: 24 },
  code_inline: { backgroundColor: '#F5F5F4', color: '#2D2420', fontSize: 14, borderRadius: 4, paddingHorizontal: 4 },
  code_block: { backgroundColor: '#FAFAF9', borderColor: '#E7E5E4', padding: 12, borderRadius: 8 },
  fence: { backgroundColor: '#FAFAF9', borderColor: '#E7E5E4', padding: 12, borderRadius: 8 },
};
