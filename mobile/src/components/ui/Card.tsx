import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "rounded-[32px] bg-white border border-white/50 p-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<View, ViewProps & { children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <View ref={ref} className={className} {...props}>
      {typeof children === 'string' ? (
        <Text className="text-2xl font-semibold text-rove-charcoal tracking-tight">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
