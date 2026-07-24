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
import { Accordion } from '../components/ui/Accordion';
import { Skeleton } from '../components/ui/Skeleton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Link } from 'expo-router';
import { ArrowLeft, Star, Activity, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SegmentedDoughnut } from '../components/ui/SegmentedDoughnut';

export default function GalleryScreen() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectValue, setSelectValue] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedPhase, setSelectedPhase] = useState<string>('Menstrual');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-rove-paper" edges={['top']}>
      <AnimatedBackground />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-rove-stone/10">
        <Button variant="ghost" size="icon" className="-ml-3 mr-2" onPress={() => router.push('/')}>
          <ArrowLeft size={24} color="#333" />
        </Button>
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

        {/* Accordion */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Accordion</Text>
          <Accordion 
            title="Daily Insights" 
            summary="You're in your follicular phase. High energy expected."
            icon={<Star size={20} color="#8DAA9D" />}
            themeColor="#8DAA9D"
            defaultOpen
          >
            <Text className="text-rove-charcoal text-sm leading-6" style={{ fontFamily: 'Inter-Regular' }}>
              Your estrogen levels are rising. This is a great time to schedule demanding tasks, try a new high-intensity workout class, or brainstorm new creative ideas. Make the most of this natural energy peak!
            </Text>
          </Accordion>
          <Accordion 
            title="Symptom Log" 
            summary="3 symptoms logged today"
            icon={<Activity size={20} color="#D4A25F" />}
            themeColor="#D4A25F"
          >
            <Text className="text-rove-charcoal text-sm leading-6" style={{ fontFamily: 'Inter-Regular' }}>
              • Cramps (Mild){'\n'}• Bloating (Moderate){'\n'}• Fatigue (Mild)
            </Text>
          </Accordion>
        </View>

        {/* Skeleton */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Skeleton Loader</Text>
          <View className="bg-white p-5 rounded-[2rem] border border-rove-stone/10 shadow-sm flex-row items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Tabs</Text>
          <SegmentedControl 
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'insights', label: 'Insights' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'log', label: 'Log Data' },
            ]}
          />
          <View className="bg-white p-6 rounded-[2rem] border border-rove-stone/10 shadow-sm mt-2">
            <Text className="text-rove-charcoal text-center" style={{ fontFamily: 'Inter-Medium' }}>
              Currently active tab: <Text className="font-bold">{activeTab}</Text>
            </Text>
          </View>
        </View>

        {/* Charts & Insights Spike */}
        <View className="mb-8 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>
            Charts & Insights
          </Text>
          <View className="bg-white/85 p-6 rounded-[2rem] border border-rove-stone/10 shadow-sm items-center justify-center">
            <Text className="text-sm font-semibold text-rove-stone mb-4 text-center" style={{ fontFamily: 'Inter-Medium' }}>
              Interactive Phase Doughnut Chart
            </Text>
            
            <View className="h-[200px] w-full items-center justify-center">
              <SegmentedDoughnut 
                selectedPhase={selectedPhase}
                onPhaseSelect={setSelectedPhase}
                size={180}
              />
            </View>
            
            <Text className="text-xs text-rove-stone text-center mt-4 max-w-[260px]" style={{ fontFamily: 'Inter-Regular' }}>
              Tap on any segment to select the phase. Tapping triggers a smooth pop-out offset translation and scale transition natively.
            </Text>
          </View>
        </View>

        {/* Theme Tokens Check */}
        <View className="mb-12 space-y-4">
          <Text className="text-lg font-bold text-rove-stone mb-2" style={{ fontFamily: 'Outfit-Bold' }}>Theme Tokens</Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-phase-menstrual shadow-sm mb-2" />
              <Text className="text-xs text-rove-stone font-medium">Menstrual</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-phase-follicular shadow-sm mb-2" />
              <Text className="text-xs text-rove-stone font-medium">Follicular</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-phase-ovulatory shadow-sm mb-2" />
              <Text className="text-xs text-rove-stone font-medium">Ovulatory</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-phase-luteal shadow-sm mb-2" />
              <Text className="text-xs text-rove-stone font-medium">Luteal</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-paper border border-rove-stone/20 shadow-sm mb-2" />
              <Text className="text-xs text-rove-stone font-medium">Paper</Text>
            </View>
          </View>
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
