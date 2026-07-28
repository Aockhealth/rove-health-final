import React from 'react';
import { View, Image, Text, type ImageProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  className?: string;
  source?: ImageProps['source'];
  fallback?: string;
}

export function Avatar({ className, source, fallback }: AvatarProps) {
  return (
    <View
      className={cn(
        "h-10 w-10 shrink-0 overflow-hidden rounded-full bg-rove-stone/20 items-center justify-center",
        className
      )}
    >
      {source ? (
        <Image source={source} className="h-full w-full" />
      ) : fallback ? (
        <Text className="text-rove-charcoal font-medium text-sm">
          {fallback.substring(0, 2).toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}
