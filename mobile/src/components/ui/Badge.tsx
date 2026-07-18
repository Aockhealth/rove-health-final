import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 transition-colors flex-row self-start',
  {
    variants: {
      variant: {
        default: 'bg-rove-charcoal border-transparent',
        secondary: 'bg-rove-peach border-transparent',
        outline: 'border border-rove-stone text-rove-charcoal',
        menstrual: 'bg-phase-menstrual/20 border-transparent',
        follicular: 'bg-phase-follicular/20 border-transparent',
        ovulatory: 'bg-phase-ovulatory/20 border-transparent',
        luteal: 'bg-phase-luteal/20 border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const textVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-paper',
      secondary: 'text-rove-charcoal',
      outline: 'text-rove-charcoal',
      menstrual: 'text-phase-menstrual',
      follicular: 'text-phase-follicular',
      ovulatory: 'text-phase-ovulatory',
      luteal: 'text-phase-luteal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {typeof children === 'string' ? (
        <Text className={textVariants({ variant })}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
