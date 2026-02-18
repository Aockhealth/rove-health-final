# Period Tracker Beta Test Script (100 Testers)

This script validates:
1. Phase calculation correctness.
2. Phase display correctness (badge, day label, fertile marker, late marker).
3. Recalculation correctness when period dates are edited.

Use this as the primary QA script for beta testing.

## 1. Fixed Test Rules (Source of Truth)

Use these rules for expected results during testing:

1. `dayInCycle = diffDays + 1` when late (`diffDays >= cycle_length_days` and target date <= today).
2. Otherwise, `dayInCycle = (diffDays % cycle_length_days) + 1`.
3. Phase order:
- Menstrual: `dayInCycle <= period_length_days` unless date is explicitly set `is_period=false`.
- Ovulatory: `dayInCycle` in `[ovulationDay - 1, ovulationDay + 1]`.
- Luteal: `dayInCycle > ovulationDay + 1` or late.
- Follicular: all remaining days.
4. `ovulationDay = cycle_length_days - luteal_length_days` (default luteal = 14).
5. Period logs override settings anchor. Most recent logged streak is expected to drive phase.

## 2. Environment And Data Setup

1. Test date reference: February 18, 2026.
2. Timezone: execute at least one full run in US timezone with DST (for date boundary checks).
3. Seed each tester with:
- `cycle_length_days`
- `period_length_days`
- `last_period_start`
- optional logged streak in calendar.
4. Capture evidence for every run:
- Before screenshot (phase badge + selected date + day label).
- After screenshot (post-edit).
- Calendar screenshot with marked period days.

## 3. Core Functional Cases (Run For Every Cohort)

### TC-01 Menstrual Base
1. Set `cycle_length_days=28`, `period_length_days=5`, `last_period_start=2026-02-18`.
2. Open tracker on `2026-02-18`.
3. Expected:
- Phase: `Menstrual`
- Day: `1`
- No late marker.

### TC-02 Follicular Base
1. Set `last_period_start=2026-02-11`.
2. Open tracker on `2026-02-18`.
3. Expected:
- Day: `8`
- Phase: `Follicular`

### TC-03 Ovulatory Window Base
1. Keep cycle 28/period 5/luteal 14.
2. Set `last_period_start=2026-02-05` (Day 14 on Feb 18).
3. Expected:
- Phase: `Ovulatory`
- Day: `14`
- Fertile marker visible.

### TC-04 Luteal Base
1. Set `last_period_start=2026-01-31` (Day 19 on Feb 18).
2. Expected:
- Phase: `Luteal`
- Day: `19`
- No late marker.

### TC-05 Late Period Base
1. Set `last_period_start=2026-01-20` with cycle 28.
2. Open tracker on `2026-02-18`.
3. Expected:
- `latePeriod=true`
- Phase remains `Luteal`
- Day shown as real elapsed day (not wrapped)
- Late by label visible.

## 4. Date Edit Recalculation Cases (Critical)

### TC-06 Move Start Forward By 2 Days
1. Baseline: `last_period_start=2026-02-05`.
2. In calendar edit mode, shift streak to start `2026-02-07` (same streak length).
3. Save.
4. Expected:
- Anchor updates to `2026-02-07`.
- Day on Feb 18 reduces by 2.
- Phase updates immediately if boundary crossed.

### TC-07 Move Start Backward By 3 Days
1. Baseline start `2026-02-10`.
2. Edit streak start to `2026-02-07`.
3. Save.
4. Expected:
- Day increases by 3.
- Phase may shift forward (example Follicular -> Ovulatory) depending on new day.

### TC-08 Replace Old Streak With Newer Streak
1. Keep older streak in past month.
2. Add newer streak in current month.
3. Save.
4. Expected:
- Most recent streak start is anchor.
- Badge/day re-computed from newer streak.

### TC-09 Remove A Day Inside Menstrual Window
1. Mark day 3 as `is_period=false`.
2. Select that date.
3. Expected:
- Date should not show Menstrual from default prediction on explicit false.
- Recomputed phase for that date follows non-menstrual phase rule.

### TC-10 End Period Here
1. Enter period edit mode.
2. Choose end day and click `End Period Here`.
3. Save.
4. Expected:
- Selected end day remains period=true.
- Following 7 days become period=false.
- Phase recalculates correctly on those future cleared days.

## 5. Boundary And Risk Cases

### TC-11 Cycle Length Variants
Run same baseline/edit tests with `cycle_length_days`:
1. 21
2. 24
3. 28
4. 32
5. 35

### TC-12 Period Length Variants
Run with `period_length_days`:
1. 1
2. 3
3. 5
4. 7
5. 10

### TC-13 Ovulation Boundary
For each profile, verify:
1. `ovulationDay-1` => Ovulatory
2. `ovulationDay` => Ovulatory
3. `ovulationDay+1` => Ovulatory
4. `ovulationDay-2` => Follicular
5. `ovulationDay+2` => Luteal

### TC-14 DST/Leap Date Safety
1. DST forward set: March 1 to March 10, 2026.
2. DST fallback set: November 1 to November 10, 2026.
3. Leap checks: February 29, 2024 and March 1, 2024.
4. Expected:
- Day increments by 1/day only.
- No skipped/duplicate day in badge.

### TC-15 No Data / Missing Anchor
1. Remove `last_period_start` and clear period logs.
2. Open tracker.
3. Expected:
- Phase is unknown.
- Prompt to add period start appears.

## 6. 100 Tester Beta Matrix

Assign testers into 10 cohorts of 10 users each.

1. Cohort A (Users 1-10): 28-day cycle, 5-day period, basic phase display (TC-01..05).
2. Cohort B (Users 11-20): forward/backward edits (TC-06..08).
3. Cohort C (Users 21-30): explicit false + end period flow (TC-09..10).
4. Cohort D (Users 31-40): short cycles (21/24), all core + edit tests.
5. Cohort E (Users 41-50): long cycles (32/35), all core + edit tests.
6. Cohort F (Users 51-60): period length stress (1/3/7/10), boundaries.
7. Cohort G (Users 61-70): ovulation boundary precision (TC-13 intensive).
8. Cohort H (Users 71-80): late-period behavior + edits while late.
9. Cohort I (Users 81-90): DST + leap year scenarios.
10. Cohort J (Users 91-100): full regression sweep (TC-01..15).

Minimum execution per tester:
1. 10 cases per tester for cohorts A-I.
2. 15 cases per tester for cohort J.

## 7. Pass/Fail Sheet Template (Use Per Tester)

Capture this for each case:

1. Tester ID
2. Case ID
3. Input Settings (`cycle`, `period`, `last_period_start`, edited dates)
4. Expected (`phase`, `day`, `late`, `fertile`)
5. Actual (`phase`, `day`, `late`, `fertile`)
6. Result: Pass/Fail
7. Screenshot links (before/after)
8. Notes (UI lag, mismatch, stale cache, wrong marker)

## 8. Exit Criteria For Beta Signoff

1. 100% pass for TC-01..TC-10 across all assigned testers.
2. >= 98% pass for boundary/risk cases (TC-11..TC-15).
3. 0 unresolved P0/P1 defects:
- wrong phase/day after edit
- stale badge after save
- incorrect late/fertile indicator
- anchor not updated to latest streak

## 9. Known High-Risk Observations To Watch

1. Editing period dates across month boundaries.
2. Mixed logs where some days are explicit `is_period=false`.
3. Late-period state not clearing after new period start.
4. Badge/day mismatch vs calendar selected date.
