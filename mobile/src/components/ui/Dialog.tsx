import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { cn } from '../../lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange = () => {}, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger: React.FC<{ children: React.ReactNode, asChild?: boolean }> = ({ children }) => {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <TouchableOpacity onPress={() => onOpenChange(true)} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className, showClose = true }) => {
  const { open, onOpenChange } = useContext(DialogContext);

  if (!open) return null;

  return (
    <Modal
      transparent
      visible={open}
      onRequestClose={() => onOpenChange(false)}
      animationType="none"
    >
      <View className="flex-1 justify-center items-center p-4">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          />
        </TouchableWithoutFeedback>

        {/* Dialog Panel */}
        <Animated.View
          entering={ZoomIn.duration(200).springify()}
          exiting={ZoomOut.duration(200)}
          className={cn("w-full bg-white shadow-xl rounded-[2rem] p-6 relative", className)}
          style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }}
        >
          {showClose && (
            <TouchableOpacity
              onPress={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 items-center justify-center rounded-full bg-rove-cream"
              activeOpacity={0.7}
            >
              <X size={16} color="#A8A29E" />
            </TouchableOpacity>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

export const DialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <View className={cn("flex flex-col space-y-2 text-center items-center mb-4", className)}>
    {children}
  </View>
);

export const DialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <Text className={cn("text-xl font-bold text-rove-charcoal", className)} style={{ fontFamily: 'CormorantGaramond-Bold' }}>
    {children}
  </Text>
);

export const DialogDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <Text className={cn("text-sm text-rove-stone text-center", className)}>
    {children}
  </Text>
);
