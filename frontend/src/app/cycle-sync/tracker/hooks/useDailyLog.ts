import { useState, useEffect } from 'react';
import { getDailyLog } from '@/app/actions/cycle-sync';
import { formatDate } from '../helpers';
import type { Consistency, Appearance, Sensation, TrackMode } from '../type';

export const useDailyLog = (selectedDate: Date) => {
    // Standard Tracker State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string[]>([]);
    const [exerciseMinutes, setExerciseMinutes] = useState<string>("");
    const [waterIntake, setWaterIntake] = useState<number>(0);
    const [isPouring, setIsPouring] = useState(false);
    const [selectedSelfLove, setSelectedSelfLove] = useState<string[]>([]);
    const [selfLoveOther, setSelfLoveOther] = useState<string>("");
    const [selectedSleepQuality, setSelectedSleepQuality] = useState<string[]>([]);
    const [sleepHours, setSleepHours] = useState<string>("");
    const [sleepMinutes, setSleepMinutes] = useState<string>("");
    const [selectedDisruptors, setSelectedDisruptors] = useState<string[]>([]);
    const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
    const [cervicalDischarge, setCervicalDischarge] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [trackMode, setTrackMode] = useState<TrackMode>("discharge");

    // MPIQ Specific State
    const [mpiqConsistency, setMpiqConsistency] = useState<Consistency | null>(null);
    const [mpiqAppearance, setMpiqAppearance] = useState<Appearance | null>(null);
    const [mpiqSensation, setMpiqSensation] = useState<Sensation | null>(null);
    const [isDischargeExpanded, setIsDischargeExpanded] = useState(false);

    // Fetch existing log when date changes
    useEffect(() => {
        const fetchLog = async () => {
            const data = await getDailyLog(formatDate(selectedDate));
            if (data) {
                setSelectedSymptoms(data.symptoms || []);
                setSelectedMoods(data.moods || []);
                setSelectedExercise(data.exercise_types || []);
                setExerciseMinutes(data.exercise_minutes ? String(data.exercise_minutes) : "");
                setWaterIntake(data.water_intake || 0);
                setSelectedSelfLove(data.self_love_tags || []);
                setSelfLoveOther(data.self_love_other || "");
                setSelectedSleepQuality(data.sleep_quality || []);

                if (data.sleep_minutes) {
                    setSleepHours(Math.floor(data.sleep_minutes / 60).toString());
                    setSleepMinutes((data.sleep_minutes % 60).toString());
                } else {
                    setSleepHours("");
                    setSleepMinutes("");
                }

                setFlowIntensity(data.flow_intensity || null);
                setSelectedDisruptors(data.disruptors || []);

                // Handle Cervical Discharge (Parse JSON if applicable)
                if (data.cervical_discharge) {
                    try {
                        if (data.cervical_discharge.startsWith('[')) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (Array.isArray(parsed) && parsed.length >= 3) {
                                setMpiqConsistency(parsed[0]);
                                setMpiqAppearance(parsed[1]);
                                setMpiqSensation(parsed[2]);
                            }
                        } else if (data.cervical_discharge.startsWith('{')) {
                            const parsed = JSON.parse(data.cervical_discharge);
                            if (parsed.type === 'MPIQ') {
                                setMpiqConsistency(parsed.consistency || null);
                                setMpiqAppearance(parsed.appearance || null);
                                setMpiqSensation(parsed.sensation || null);
                                setCervicalDischarge(parsed.legacyLabel || null);
                            } else {
                                setCervicalDischarge(data.cervical_discharge);
                            }
                        } else {
                            setCervicalDischarge(data.cervical_discharge);
                            setMpiqConsistency(null);
                            setMpiqAppearance(null);
                            setMpiqSensation(null);
                        }
                    } catch (e) {
                        setCervicalDischarge(data.cervical_discharge);
                        setMpiqConsistency(null);
                        setMpiqAppearance(null);
                        setMpiqSensation(null);
                    }
                } else {
                    setCervicalDischarge(null);
                    setMpiqConsistency(null);
                    setMpiqAppearance(null);
                    setMpiqSensation(null);
                }

                setNote(data.notes || "");

                // Set initial toggle state based on data
                if (data.flow_intensity || data.is_period) {
                    setTrackMode('period');
                } else {
                    setTrackMode('discharge');
                }
            } else {
                // Reset all state
                setSelectedSymptoms([]);
                setSelectedMoods([]);
                setSelectedExercise([]);
                setExerciseMinutes("");
                setWaterIntake(0);
                setSelectedSelfLove([]);
                setSelfLoveOther("");
                setSelectedSleepQuality([]);
                setSleepHours("");
                setSleepMinutes("");
                setSelectedDisruptors([]);
                setFlowIntensity(null);
                setCervicalDischarge(null);
                setNote("");
                setTrackMode('discharge');
                setMpiqConsistency(null);
                setMpiqAppearance(null);
                setMpiqSensation(null);
            }
        };
        fetchLog();
    }, [selectedDate]);

    return {
        // Standard state
        selectedSymptoms, setSelectedSymptoms,
        selectedMoods, setSelectedMoods,
        selectedExercise, setSelectedExercise,
        exerciseMinutes, setExerciseMinutes,
        waterIntake, setWaterIntake,
        isPouring, setIsPouring,
        selectedSelfLove, setSelectedSelfLove,
        selfLoveOther, setSelfLoveOther,
        selectedSleepQuality, setSelectedSleepQuality,
        sleepHours, setSleepHours,
        sleepMinutes, setSleepMinutes,
        selectedDisruptors, setSelectedDisruptors,
        flowIntensity, setFlowIntensity,
        cervicalDischarge, setCervicalDischarge,
        note, setNote,
        trackMode, setTrackMode,

        // MPIQ state
        mpiqConsistency, setMpiqConsistency,
        mpiqAppearance, setMpiqAppearance,
        mpiqSensation, setMpiqSensation,
        isDischargeExpanded, setIsDischargeExpanded
    };
};