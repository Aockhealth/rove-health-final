import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
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
          "flex-row items-center justify-between h-14 w-full rounded-[1.25rem] border border-white/60 bg-white/50 px-5 shadow-sm",
          className
        )}
        style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 0 }}
      >
        <Text className={cn("text-base font-medium", selectedOption ? "text-rove-charcoal" : "text-rove-stone")} style={{ fontFamily: 'Raleway-Medium' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#A8A29E" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        title={title}
        snapPoints={['50%', '75%']}
      >
        <BottomSheetFlatList
          data={options}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelect(item.value)}
                className={cn(
                  "flex-row items-center justify-between py-4 px-4 rounded-[16px] mb-1.5",
                  isSelected ? "bg-rove-charcoal/5 border border-rove-charcoal/10" : "bg-transparent border border-transparent"
                )}
              >
                <Text 
                  className={cn(
                    "text-[17px]", 
                    isSelected ? "text-rove-charcoal font-bold" : "text-rove-charcoal/80 font-medium"
                  )}
                  style={{ fontFamily: isSelected ? 'Raleway-Bold' : 'Raleway-Medium' }}
                >
                  {item.label}
                </Text>
                {isSelected && <Check size={20} color="#37332E" />}
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </>
  );
};
