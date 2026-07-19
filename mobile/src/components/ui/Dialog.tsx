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
      <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
          <Animated.View style={StyleSheet.absoluteFillObject} entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} />
        </TouchableWithoutFeedback>

        <Animated.View
          entering={ZoomIn.duration(400).springify().damping(24).stiffness(180).mass(0.8)}
          exiting={ZoomOut.duration(200)}
          className={cn(
            "bg-[#FAF9F6] w-[90%] max-w-[400px] rounded-[32px] p-6 shadow-xl border border-white/50",
            className
          )}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}
        >
          {showClose && (
            <TouchableOpacity
              onPress={() => onOpenChange(false)}
              className="absolute top-5 right-5 z-10 w-8 h-8 items-center justify-center rounded-full bg-rove-stone/10"
            >
              <X size={16} color="#7B82A8" />
            </TouchableOpacity>
          )}
          <View className="pt-2 pb-1">
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const DialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <View className={cn("mb-5 items-center", className)}>
    {children}
  </View>
);

export const DialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <Text className={cn("text-2xl font-bold text-rove-charcoal text-center mb-1", className)} style={{ fontFamily: 'CormorantGaramond-Bold' }}>
    {children}
  </Text>
);

export const DialogDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <Text className={cn("text-[11px] font-semibold text-rove-stone/80 text-center uppercase tracking-widest", className)}>
    {children}
  </Text>
);
