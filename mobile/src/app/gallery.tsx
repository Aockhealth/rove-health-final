import React, { useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/Dialog';
import { BottomSheet, BottomSheetProps } from '../components/ui/BottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { toast } from 'sonner-native';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function GalleryScreen() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectValue, setSelectValue] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-rove-paper" edges={['top']}>
      <AnimatedBackground />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-rove-stone/10">
        <Link href="/" asChild>
          <Button variant="ghost" size="icon" className="-ml-3 mr-2">
            <ArrowLeft size={24} color="#333" />
          </Button>
        </Link>
        <Text className="text-2xl font-bold text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          UI Component Gallery
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-20" showsVerticalScrollIndicator={false}>
        
        {/* Buttons */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Buttons</Text>
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </View>

        {/* Badges */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Badges</Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </View>
        </View>

        {/* Inputs */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Inputs</Text>
          <Input placeholder="Standard Input" />
          <Input placeholder="Error Input" error="This field is required" />
        </View>

        {/* Select */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Select</Text>
          <Select 
            value={selectValue}
            onValueChange={setSelectValue}
            placeholder="Select a cycle phase"
            title="Cycle Phase"
            options={[
              { label: "Menstrual Phase", value: "menstrual" },
              { label: "Follicular Phase", value: "follicular" },
              { label: "Ovulatory Phase", value: "ovulatory" },
              { label: "Luteal Phase", value: "luteal" },
            ]}
          />
        </View>

        {/* Dialogs */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Dialogs</Text>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button variant="outline" onPress={() => setDialogOpen(true)}>Open Dialog Modal</Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to perform this action? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <View className="mt-6 flex-row gap-3">
                <Button variant="outline" className="flex-1" onPress={() => setDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1" onPress={() => {
                  setDialogOpen(false);
                  toast.success('Action confirmed!');
                }}>Confirm</Button>
              </View>
            </DialogContent>
          </Dialog>
        </View>

        {/* Bottom Sheets */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Bottom Sheets</Text>
          <Button variant="secondary" onPress={() => bottomSheetRef.current?.present()}>
            Open Bottom Sheet
          </Button>
        </View>

        {/* Toasts */}
        <View className="mb-12 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Toasts</Text>
          <View className="flex-row gap-2">
            <Button className="flex-1" onPress={() => toast.success('Successfully saved data!')}>Success</Button>
            <Button className="flex-1 bg-red-500" onPress={() => toast.error('Failed to save data.')}>Error</Button>
          </View>
          <Button variant="outline" onPress={() => toast('This is a neutral message.')}>Neutral Toast</Button>
        </View>

      </ScrollView>

      {/* The Bottom Sheet component */}
      <BottomSheet ref={bottomSheetRef} title="Interactive Sheet">
        <Text className="text-rove-charcoal text-base mb-6" style={{ fontFamily: 'Inter-Regular' }}>
          This is a native bottom sheet! You can drag it down to close it, or tap the X.
        </Text>
        <Button onPress={() => bottomSheetRef.current?.dismiss()}>Close Sheet</Button>
      </BottomSheet>
    </SafeAreaView>
  );
}
