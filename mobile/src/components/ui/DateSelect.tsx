import React, { useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ChevronDown, ChevronLeft, Calendar } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface DateSelectProps {
  value?: string;
  onValueChange: (dateStr: string) => void;
  error?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export const DateSelect: React.FC<DateSelectProps> = ({ value, onValueChange, error }) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [step, setStep] = useState<'year' | 'month' | 'day'>('year');

  const [tempYear, setTempYear] = useState<number | null>(null);
  const [tempMonth, setTempMonth] = useState<number | null>(null);

  const maxYear = new Date().getFullYear() - 18;
  const minYear = new Date().getFullYear() - 120;

  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [maxYear, minYear]
  );

  const dayCount = tempYear && tempMonth ? daysInMonth(tempYear, tempMonth) : 31;
  const dayOptions = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => i + 1),
    [dayCount]
  );

  const openSheet = () => {
    setStep('year');
    setTempYear(null);
    setTempMonth(null);
    bottomSheetRef.current?.present();
  };

  const handleYearSelect = (y: number) => {
    setTempYear(y);
    setStep('month');
  };

  const handleMonthSelect = (m: number) => {
    setTempMonth(m);
    setStep('day');
  };

  const handleDaySelect = (d: number) => {
    if (tempYear && tempMonth) {
      const formattedDate = `${tempYear}-${String(tempMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      onValueChange(formattedDate);
      bottomSheetRef.current?.dismiss();
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" opacity={0.4} />
    ),
    []
  );

  let currentData: { label: string; value: number }[] = [];
  if (step === 'year') {
    currentData = yearOptions.map((y) => ({ label: String(y), value: y }));
  } else if (step === 'month') {
    currentData = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
  } else {
    currentData = dayOptions.map((d) => ({ label: String(d), value: d }));
  }

  // Format display value
  let displayValue = 'Select Date of Birth';
  if (value) {
    const [y, m, d] = value.split('-');
    const mStr = MONTHS[Number(m) - 1] || m;
    displayValue = `${mStr} ${d}, ${y}`;
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openSheet}
        className={cn(
          "flex-row items-center h-14 w-full rounded-[20px] border px-5 shadow-sm",
          error ? "border-rove-red/50 bg-rove-red/5" : "border-white/60 bg-white/50"
        )}
        style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      >
        <Calendar size={18} color={value ? "#37332E" : "#A8A29E"} style={{ marginRight: 12 }} />
        <Text className={cn("flex-1 text-[15px] font-medium", value ? "text-rove-charcoal" : "text-rove-stone/60")} style={{ fontFamily: 'Inter-Medium' }}>
          {displayValue}
        </Text>
        <ChevronDown size={18} color="#A8A29E" />
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={['50%', '75%']}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#FAF9F6', borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: '#D6D3D1', width: 40, height: 4 }}
      >
        <View className="flex-row items-center mb-2 px-6 pt-2 pb-4">
          {step !== 'year' && (
            <TouchableOpacity 
              onPress={() => setStep(step === 'day' ? 'month' : 'year')}
              className="w-10 h-10 -ml-2 mr-2 items-center justify-center rounded-full active:bg-rove-charcoal/5"
            >
              <ChevronLeft size={24} color="#78716C" />
            </TouchableOpacity>
          )}
          <Text className="text-2xl font-bold text-rove-charcoal flex-1" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            {step === 'year' ? 'Select Year' : step === 'month' ? 'Select Month' : 'Select Day'}
          </Text>
        </View>

        <BottomSheetFlatList
          key={step} // Force remount when step (and numColumns) changes
          data={currentData}
          keyExtractor={(item) => String(item.value)}
          numColumns={step === 'month' ? 3 : 4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (step === 'year') handleYearSelect(item.value);
                else if (step === 'month') handleMonthSelect(item.value);
                else handleDaySelect(item.value);
              }}
              className={cn(
                "items-center justify-center rounded-[14px] bg-rove-charcoal/5 border border-transparent active:bg-rove-charcoal/10 active:border-rove-charcoal/20",
                step === 'month' ? "w-[30%] py-4" : "w-[23%] py-3.5"
              )}
            >
              <Text 
                className={cn(
                  "text-rove-charcoal font-medium",
                  step === 'month' ? "text-[16px]" : "text-[15px]"
                )} 
                style={{ fontFamily: 'Inter-Medium' }}
              >
                {step === 'month' ? item.label.slice(0, 3) : item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>
    </>
  );
};
