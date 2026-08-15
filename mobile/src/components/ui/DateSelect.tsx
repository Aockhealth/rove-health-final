import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, Calendar } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { cn } from '../../lib/utils';

export interface DateSelectProps {
  value?: string;
  onValueChange: (dateStr: string) => void;
  error?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DateSelect: React.FC<DateSelectProps> = ({ value, onValueChange, error }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onValueChange(formattedDate);
    hideDatePicker();
  };

  // Format display value
  let displayValue = 'Select Date of Birth';
  let initialDate = new Date();
  initialDate.setFullYear(initialDate.getFullYear() - 25); // Default to 25 years ago for convenience

  if (value) {
    const [y, m, d] = value.split('-');
    const mStr = MONTHS[Number(m) - 1] || m;
    displayValue = `${mStr} ${d}, ${y}`;
    initialDate = new Date(Number(y), Number(m) - 1, Number(d));
  }

  const maxYear = new Date().getFullYear() - 16; // Min 16 years old
  const maximumDate = new Date(maxYear, 11, 31);
  const minYear = new Date().getFullYear() - 100;
  const minimumDate = new Date(minYear, 0, 1);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={showDatePicker}
        className={cn(
          "flex-row items-center h-14 w-full rounded-[20px] border px-5 shadow-sm",
          error ? "border-rove-red/50 bg-rove-red/5" : "border-white/60 bg-white/50"
        )}
        style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 0 }}
      >
        <Calendar size={18} color={value ? "#37332E" : "#A8A29E"} style={{ marginRight: 12 }} />
        <Text className={cn("flex-1 text-[15px] font-medium", value ? "text-rove-charcoal" : "text-rove-stone")} style={{ fontFamily: 'Raleway-Medium' }}>
          {displayValue}
        </Text>
        <ChevronDown size={18} color="#A8A29E" />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="spinner"
        date={initialDate}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        confirmTextIOS="Confirm"
        cancelTextIOS="Cancel"
      />
    </>
  );
};
