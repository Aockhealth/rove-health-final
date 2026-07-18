import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheet } from './BottomSheet';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  title = "Select Option",
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  const selectedOption = options.find(o => o.value === value);

  const handleSelect = (val: string) => {
    onValueChange(val);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => bottomSheetRef.current?.present()}
        className={cn(
          "flex-row items-center justify-between h-14 w-full rounded-[1.25rem] border border-rove-stone/20 bg-white px-5",
          className
        )}
      >
        <Text className={cn("text-base font-medium", selectedOption ? "text-rove-charcoal" : "text-rove-stone/70")} style={{ fontFamily: 'Inter-Medium' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#A8A29E" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        title={title}
        snapPoints={['50%', '75%']}
      >
        <ScrollView className="flex-1 mt-2" showsVerticalScrollIndicator={false}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.value)}
                className={cn(
                  "flex-row items-center justify-between py-5 border-b border-rove-stone/10 px-2",
                  index === options.length - 1 && "border-b-0"
                )}
              >
                <Text 
                  className={cn(
                    "text-lg", 
                    isSelected ? "text-rove-sage font-bold" : "text-rove-charcoal font-medium"
                  )}
                  style={{ fontFamily: isSelected ? 'Inter-Bold' : 'Inter-Medium' }}
                >
                  {option.label}
                </Text>
                {isSelected && <Check size={20} color="#8A9A86" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </>
  );
};
