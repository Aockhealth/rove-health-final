import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ArticleCard } from './ArticleCard';
import type { LearnArticle } from '../../lib/learn';

type ContentRowProps = {
  title: string;
  articles: LearnArticle[];
  progressById: Record<string, number>;
};

export function ContentRow({ title, articles, progressById }: ContentRowProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text className="text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold', fontSize: 20, marginBottom: 12, paddingHorizontal: 20 }}>
        {title}
      </Text>
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => <ArticleCard article={item} progress={progressById[item.id] || 0} />}
      />
    </View>
  );
}
