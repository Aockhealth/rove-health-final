import React, { forwardRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  title?: string;
  showClose?: boolean;
  onDismiss?: () => void;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  ({ children, snapPoints = ['50%'], title, showClose = true, onDismiss }, ref) => {
    const defaultSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={defaultSnapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          {(title || showClose) && (
            <View className="flex-row justify-between items-center mb-4 px-6 pt-2">
              <Text className="text-xl font-bold text-rove-charcoal flex-1" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                {title}
              </Text>
              
              {showClose && (
                <TouchableOpacity 
                  onPress={() => {
                    if (ref && 'current' in ref && ref.current) {
                      ref.current.dismiss();
                    }
                  }}
                  className="w-8 h-8 items-center justify-center rounded-full bg-rove-cream"
                >
                  <X size={16} color="#A8A29E" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View className="flex-1 px-6 pb-6">
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  background: {
    backgroundColor: '#FAF9F6', // rove-paper
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
  },
  handle: {
    backgroundColor: '#D6D3D1', // rove-stone light
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  }
});
