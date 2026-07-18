import React from 'react';
import { Text, Pressable, PressableProps, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors flex-row',
  {
    variants: {
      variant: {
        default: 'bg-rove-charcoal',
        outline: 'border border-rove-stone bg-transparent',
        ghost: 'bg-transparent',
        secondary: 'bg-rove-peach',
      },
      size: {
        default: 'h-11 px-8 py-2',
        sm: 'h-9 px-4',
        lg: 'h-14 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const textVariants = cva('text-base font-medium', {
  variants: {
    variant: {
      default: 'text-paper',
      outline: 'text-rove-charcoal',
      ghost: 'text-rove-charcoal',
      secondary: 'text-rove-charcoal',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
  ({ className, textClassName, variant, size, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text className={cn(textVariants({ variant }), textClassName)}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';
