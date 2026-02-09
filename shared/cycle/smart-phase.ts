/**
 * @deprecated This file is deprecated. Use `@shared/cycle/phase` instead.
 * This file is kept for backward compatibility and will be removed in a future version.
 * 
 * All exports are now re-exported from the canonical phase.ts module.
 */

// Re-export everything from the canonical module
export {
    // Types
    type Phase,
    type CycleSettings,
    type DailyLog,
    type PhaseResult,

    // Constants
    DEFAULT_CYCLE_LENGTH,
    DEFAULT_PERIOD_LENGTH,
    DEFAULT_LUTEAL_LENGTH,
    OVULATION_PHASE_WINDOW,
    FERTILE_WINDOW_BEFORE,
    FERTILE_WINDOW_AFTER,

    // Functions
    formatDate,
    normalizeToLocalMidnight,
    parseLocalDate,
    daysBetween,
    findStreakStart,
    getRelevantPeriodStart,
    calculatePhase,
    calculateSmartPhase,
    calculatePhaseLegacy,
    isInFertileWindow,
    getOvulationDay,
} from './phase';

