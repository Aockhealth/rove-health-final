import React from 'react';
import { TextInput, type TextInputProps, View, Text } from 'react-native';
import { cn } from '../../lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
  error?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <View className="w-full">
        <TextInput
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-rove-stone/30 bg-white px-4 text-rove-charcoal placeholder:text-rove-stone/70 focus:border-rove-charcoal focus:bg-paper",
            error && "border-rove-red",
            className
          )}
          placeholderTextColor="#A8A29E"
          {...props}
        />
        {error ? (
          <Text className="mt-1 text-xs text-rove-red ml-1">{error}</Text>
        ) : null}
      </View>
    );
  }
);
Input.displayName = 'Input';
