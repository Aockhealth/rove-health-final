import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, SectionList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import ProfileAvatar from '../../components/home/ProfileAvatar';
import { LearnHero } from '../../components/learn/LearnHero';
import { ContentRow } from '../../components/learn/ContentRow';
import { CategoryPillBar } from '../../components/learn/CategoryPillBar';
import { LearnSkeleton } from '../../components/learn/LearnSkeleton';
import { fetchLearnArticles, getStorageUrl, type LearnArticle } from '../../lib/learn';
import { getAllReadingProgress } from '../../lib/readingProgress';

const CONTINUE_READING = 'Continue Reading';

export default function LearnScreen() {
  const sectionListRef = useRef<SectionList>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [progressById, setProgressById] = useState<Record<string, number>>({});

  const { data: articles = [], isPending: loading, refetch, isRefetching } = useQuery<LearnArticle[]>({
    queryKey: ['learn-articles'],
    queryFn: fetchLearnArticles,
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch the hero + first row's images as soon as the list loads, so they're
  // already on disk by the time the user scrolls to them instead of loading cold.
  useEffect(() => {
    if (articles.length === 0) return;
    const toPrefetch = articles.slice(0, 6).map((a) => getStorageUrl('learn-images', a.image_path)).filter(Boolean);
    Image.prefetch(toPrefetch);
  }, [articles]);

  useEffect(() => {
    if (articles.length === 0) return;
    getAllReadingProgress(articles.map((a) => a.id)).then(setProgressById);
  }, [articles]);

  const continueReading = useMemo(
    () => articles.filter((a) => (progressById[a.id] || 0) > 2 && (progressById[a.id] || 0) < 95),
    [articles, progressById]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, LearnArticle[]>();
    articles.forEach((a) => {
      if (!map.has(a.category)) map.set(a.category, []);
      map.get(a.category)!.push(a);
    });
    return map;
  }, [articles]);

  const categories = useMemo(() => [...grouped.keys()], [grouped]);

  const sections = useMemo(() => {
    const base = categories.map((category) => ({ title: category, data: [grouped.get(category)!] }));
    if (continueReading.length > 0) {
      return [{ title: CONTINUE_READING, data: [continueReading] }, ...base];
    }
    return base;
  }, [categories, grouped, continueReading]);

  const sectionIndexOffset = continueReading.length > 0 ? 1 : 0;
  const featured = articles.length > 0 ? articles[0] : null;

  const handleSelectCategory = (category: string | null) => {
    setActiveCategory(category);
    if (!category) {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 0 });
      return;
    }
    const sectionIndex = categories.indexOf(category) + sectionIndexOffset;
    if (sectionIndex >= 0) {
      sectionListRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, animated: true, viewOffset: 90 });
    }
  };

  if (loading) return <LearnSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-2 pt-1 flex-row items-center justify-between z-10">
        <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Learn</Text>
        <ProfileAvatar />
      </View>

      {categories.length > 0 && (
        <CategoryPillBar categories={categories} activeCategory={activeCategory} onSelect={handleSelectCategory} />
      )}

      {!featured ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-rove-stone">No articles found.</Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item, index) => `section-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={<LearnHero article={featured} />}
          renderSectionHeader={() => null}
          renderItem={({ item, section }) => (
            <ContentRow title={section.title} articles={item} progressById={progressById} />
          )}
          stickySectionHeadersEnabled={false}
          onScrollToIndexFailed={() => {}}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#AF6B6B" />
          }
        />
      )}
    </SafeAreaView>
  );
}
