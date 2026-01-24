// Core Types
export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | null;
export type Consistency = "Tacky" | "Creamy" | "Stretchy" | "Bloody";
export type Appearance = "White/Yellow" | "Clear" | "Red";
export type Sensation = "Dry" | "Moist" | "Wet" | "Slippery";
export type TrackMode = "period" | "discharge";

// Interfaces
export interface CycleSettings {
    last_period_start: string;
    cycle_length_days: number;
    period_length_days: number;
}

export interface MPIQOption {
    label: string;
    score: number;
    desc: string;
    type: "video" | "image";
    src: string;
}

export interface MoodOption {
    label: string;
    type: "blue" | "orange" | "negative" | "positive";
}

export interface SleepOption {
    label: string;
    type: "positive" | "negative" | "orange";
}

export interface DisruptorOption {
    label: string;
    type: "negative" | "orange";
}

export interface CalendarDay {
    date: Date;
    isPadding: boolean;
}

export interface DailyLogData {
    date: string;
    symptoms?: string[];
    moods?: string[];
    exercise_types?: string[];
    exercise_minutes?: number;
    water_intake?: number;
    self_love_tags?: string[];
    self_love_other?: string;
    sleep_quality?: string[];
    sleep_minutes?: number;
    flow_intensity?: string;
    disruptors?: string[];
    cervical_discharge?: string;
    notes?: string;
    is_period?: boolean;
}

export interface SavePayload {
    date: string;
    symptoms: string[];
    moods: string[];
    exerciseTypes: string[];
    exerciseMinutes: number | null;
    waterIntake: number;
    selfLoveTags: string[];
    selfLoveOther: string;
    sleepQuality: string[];
    sleepMinutes: number | null;
    disruptors: string[];
    isPeriod: boolean;
    flowIntensity?: string;
    cervicalDischarge?: string;
    notes: string;
}