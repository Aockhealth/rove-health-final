import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchUserCycleSettings } from '@/app/actions/cycle-sync';
import type { CycleSettings } from '../type';

export const useCycleSettings = () => {
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    last_period_start: "",
    cycle_length_days: 28,
    period_length_days: 5
  });
  const [isEditingCycle, setIsEditingCycle] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchUserCycleSettings();
      if (settings) {
        setCycleSettings({
          last_period_start: settings.last_period_start,
          cycle_length_days: settings.cycle_length_days || 28,
          period_length_days: settings.period_length_days || 5
        });

        // Auto-prompt if no period start date
        if (!settings.last_period_start) {
          setIsEditingCycle(true);
          toast.info("Welcome back! Please set your last period date to sync your cycle.", {
            duration: 6000
          });
        }
      } else {
        setIsEditingCycle(true);
      }
    };
    loadSettings();
  }, []);

  return {
    cycleSettings,
    setCycleSettings,
    isEditingCycle,
    setIsEditingCycle
  };
};