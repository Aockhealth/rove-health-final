import { useTransition } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { 
  logDailySymptoms, 
  updateLastPeriodDate, 
  fetchUserCycleSettings,
  fetchMonthLogs 
} from '@/app/actions/cycle-sync';
import { formatDate, isFutureDate, isPastDate } from '../helpers';
import type { CycleSettings } from '../type';

interface UseTrackerActionsProps {
  selectedDate: Date;
  currentMonth: Date;
  cycleSettings: CycleSettings;
  setCycleSettings: (settings: CycleSettings) => void;
  setIsEditingCycle: (editing: boolean) => void;
  monthLogs: Record<string, any>;
  setMonthLogs: (logs: Record<string, any>) => void;
  
  // Daily log state
  selectedSymptoms: string[];
  selectedMoods: string[];
  selectedExercise: string[];
  exerciseMinutes: string;
  waterIntake: number;
  selectedSelfLove: string[];
  selfLoveOther: string;
  selectedSleepQuality: string[];
  sleepHours: string;
  sleepMinutes: string;
  selectedDisruptors: string[];
  flowIntensity: string | null;
  cervicalDischarge: string | null;
  note: string;
  trackMode: "period" | "discharge";
  
  // MPIQ state
  mpiqConsistency: any;
  mpiqAppearance: any;
  mpiqSensation: any;
}

export const useTrackerActions = (props: UseTrackerActionsProps) => {
  const [isPending, startTransition] = useTransition();

  const refreshMonthLogs = async () => {
    const year = props.currentMonth.getFullYear();
    const month = props.currentMonth.getMonth();

    const monthsToFetch = [
      new Date(year, month - 1, 1),
      new Date(year, month, 1),
      new Date(year, month + 1, 1)
    ];

    const allLogs: any[] = [];
    for (const monthDate of monthsToFetch) {
      const monthYear = monthDate.getFullYear();
      const monthNum = String(monthDate.getMonth() + 1).padStart(2, '0');
      const logs = await fetchMonthLogs(`${monthYear}-${monthNum}`);
      allLogs.push(...logs);
    }

    const logMap: Record<string, any> = {};
    allLogs.forEach((l: any) => {
      logMap[l.date] = l;
    });
    props.setMonthLogs(logMap);
  };

  const handleSave = () => {
    startTransition(async () => {
      const isPeriodMode = props.trackMode === "period";

      let finalCervicalDischarge = !isPeriodMode ? (props.cervicalDischarge || null) : null;
      let finalNotes = props.note;

      // MPIQ LOGIC: Save as ["Consistency", "Appearance", "Sensation"]
      if (!isPeriodMode && (props.mpiqConsistency || props.mpiqAppearance || props.mpiqSensation)) {
        const mpiqArray = [
          props.mpiqConsistency || "",
          props.mpiqAppearance || "",
          props.mpiqSensation || ""
        ];
        finalCervicalDischarge = JSON.stringify(mpiqArray);
      }

      const payload = {
        date: formatDate(props.selectedDate),
        symptoms: props.selectedSymptoms,
        moods: props.selectedMoods,
        exerciseTypes: props.selectedExercise,
        exerciseMinutes: props.exerciseMinutes ? parseInt(props.exerciseMinutes) : null,
        waterIntake: props.waterIntake,
        selfLoveTags: props.selectedSelfLove,
        selfLoveOther: props.selfLoveOther,
        sleepQuality: props.selectedSleepQuality,
        sleepMinutes: (props.sleepHours || props.sleepMinutes) 
          ? (parseInt(props.sleepHours || "0") * 60 + parseInt(props.sleepMinutes || "0")) 
          : null,
        disruptors: props.selectedDisruptors,
        isPeriod: isPeriodMode,
        flowIntensity: isPeriodMode ? props.flowIntensity || "Normal" : undefined,
        cervicalDischarge: finalCervicalDischarge || undefined,
        notes: finalNotes
      };

      const result = await logDailySymptoms(payload);
      if (!result.success) {
        toast.error("Failed to save entry", {
          description: result.error,
          duration: 5000
        });
        return;
      }

      // Update period start date ONLY if logging a period start and no start date exists yet
      if (isPeriodMode && !props.cycleSettings.last_period_start) {
        await updateLastPeriodDate(formatDate(props.selectedDate));
        props.setCycleSettings({
          ...props.cycleSettings,
          last_period_start: formatDate(props.selectedDate)
        });
      }

      toast.success("Entry Saved!", {
        description: "Your daily log has been updated.",
        duration: 3000
      });

      await refreshMonthLogs();
    });
  };

  const handlePeriodToggle = async () => {
    const dateStr = formatDate(props.selectedDate);
    const globalStart = props.cycleSettings.last_period_start;
    const hasGlobalStart = !!globalStart;
    const showEndButton = !!props.cycleSettings.last_period_start;

    startTransition(async () => {
      try {
        if (!showEndButton) {
          // START PERIOD
          if (isFutureDate(props.selectedDate)) {
            toast.warning("Logging future period", {
              description: "You're logging a period for a future date. Make sure this is intentional.",
              duration: 4000
            });
          }

          if (hasGlobalStart && !isPastDate(props.selectedDate)) {
            const start = new Date(globalStart);
            start.setHours(0, 0, 0, 0);
            const current = new Date(props.selectedDate);
            current.setHours(0, 0, 0, 0);
            const daysSinceStart = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceStart >= 0 && daysSinceStart < 14) {
              toast.warning("Unusually short cycle", {
                description: `Less than 14 days since last period start. Make sure this is intentional.`,
                duration: 4000
              });
            }
          }

          if (!hasGlobalStart || !isPastDate(props.selectedDate)) {
            const result = await updateLastPeriodDate(dateStr);
            if (result.success) {
              props.setCycleSettings({
                ...props.cycleSettings,
                last_period_start: dateStr
              });
              const freshSettings = await fetchUserCycleSettings();
              if (freshSettings) {
                props.setCycleSettings({
                  last_period_start: freshSettings.last_period_start,
                  cycle_length_days: freshSettings.cycle_length_days || 28,
                  period_length_days: freshSettings.period_length_days || 5
                });
              }
            }
          }

          await logDailySymptoms({
            date: dateStr,
            symptoms: props.selectedSymptoms,
            isPeriod: true,
            flowIntensity: props.flowIntensity || "Normal",
            moods: props.selectedMoods,
            notes: props.note,
            waterIntake: props.waterIntake
          });

          await refreshMonthLogs();

          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#FDA4AF', '#F43F5E', '#FFFFFF']
          });

          toast.success("Period started!", {
            description: `Started on ${props.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            duration: 3000
          });
        } else {
          // END PERIOD
          if (!globalStart) {
            toast.error("No period start found", {
              description: "Please start a period first.",
              duration: 3000
            });
            return;
          }

          const start = new Date(globalStart);
          start.setHours(0, 0, 0, 0);
          const end = new Date(props.selectedDate);
          end.setHours(0, 0, 0, 0);
          const diffTime = end.getTime() - start.getTime();
          const length = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

          if (length > 10) {
            toast.warning("Long period (>10 days)", {
              description: `This period is ${length} days. Make sure this is correct.`,
              duration: 5000
            });
          }

          const logsToUpdate = [];
          for (let i = 0; i < length; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dStr = formatDate(d);

            logsToUpdate.push(logDailySymptoms({
              date: dStr,
              symptoms: dStr === dateStr ? props.selectedSymptoms : (props.monthLogs[dStr]?.symptoms || []),
              isPeriod: true,
              flowIntensity: dStr === dateStr ? (props.flowIntensity || "Normal") : (props.monthLogs[dStr]?.flow_intensity || "Normal"),
              moods: dStr === dateStr ? props.selectedMoods : (props.monthLogs[dStr]?.moods || []),
              notes: dStr === dateStr ? props.note : (props.monthLogs[dStr]?.notes || ""),
              waterIntake: dStr === dateStr ? props.waterIntake : (props.monthLogs[dStr]?.water_intake || 0)
            }));
          }

          await Promise.all(logsToUpdate);
          await updateLastPeriodDate("");
          props.setCycleSettings({ ...props.cycleSettings, last_period_start: "" });

          await refreshMonthLogs();

          toast.success("Period ended!", {
            description: `${length} day period from ${globalStart} to ${dateStr}`,
            duration: 3000
          });
        }
      } catch (error) {
        toast.error("An error occurred", {
          description: "Please try again or refresh the page.",
          duration: 5000
        });
      }
    });
  };

  const handleUpdatePeriod = (showAlert = true) => {
    startTransition(async () => {
      const dateStr = formatDate(props.selectedDate);
      const result = await updateLastPeriodDate(dateStr);

      if (result.success) {
        props.setCycleSettings({
          ...props.cycleSettings,
          last_period_start: dateStr
        });
        props.setIsEditingCycle(false);
        if (showAlert) {
          alert(`Cycle updated! Period start date set to ${props.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
        }
        window.location.reload();
      } else {
        alert("Failed to update cycle: " + result.error);
      }
    });
  };

  const handleRemoveFromPeriod = async () => {
    const dateStr = formatDate(props.selectedDate);
    startTransition(async () => {
      try {
        await logDailySymptoms({
          date: dateStr,
          symptoms: props.selectedSymptoms,
          isPeriod: false,
          flowIntensity: undefined,
          moods: props.selectedMoods,
          notes: props.note,
          waterIntake: props.waterIntake
        });

        await refreshMonthLogs();

        toast.success("Removed from period", {
          description: `${props.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} is no longer marked as a period day`,
          duration: 3000
        });
      } catch (error) {
        toast.error("Failed to remove period day", {
          description: "Please try again",
          duration: 3000
        });
      }
    });
  };

  return {
    handleSave,
    handlePeriodToggle,
    handleUpdatePeriod,
    handleRemoveFromPeriod,
    isPending
  };
};