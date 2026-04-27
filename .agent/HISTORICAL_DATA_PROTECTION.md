# Period Data Protection - How Historical Data Stays Safe

## ✅ Your Historical Data is Already Protected!

Your database uses a **per-day tracking system** that ensures historical period data can never be accidentally modified by new period entries.

---

## 📊 Database Architecture

### Two-Layer System:

#### 1. **`daily_logs` Table** (Individual Day Records)
```sql
create table daily_logs (
  id uuid primary key,
  user_id uuid references profiles(id),
  date date not null,
  is_period boolean default false,  -- ← THIS PROTECTS HISTORICAL DATA
  flow_intensity text,
  moods text[],
  symptoms text[],
  notes text,
  -- ... other columns
  
  unique(user_id, date)  -- One record per day
);
```

**Key Feature**: Each day has its own independent record with `is_period` flag.

#### 2. **`user_cycle_settings` Table** (Current Cycle Reference)
```sql
create table user_cycle_settings (
  user_id uuid primary key,
  last_period_start date,      -- ← Only used for PREDICTIONS
  cycle_length_days int,
  period_length_days int
);
```

**Key Feature**: This is only used to predict future phases, NOT to determine historical data.

---

## 🛡️ How Protection Works

### Example Scenario:

**December Period**: Dec 10-15 (logged)
**January Period**: Jan 5-10 (logged)

### What Happens in the Database:

```sql
-- December logs (PERMANENT)
daily_logs:
  2024-12-10: is_period = true
  2024-12-11: is_period = true
  2024-12-12: is_period = true
  2024-12-13: is_period = true
  2024-12-14: is_period = true
  2024-12-15: is_period = true

-- January logs (PERMANENT)
daily_logs:
  2025-01-05: is_period = true
  2025-01-06: is_period = true
  2025-01-07: is_period = true
  2025-01-08: is_period = true
  2025-01-09: is_period = true
  2025-01-10: is_period = true

-- Current cycle reference (CHANGES)
user_cycle_settings:
  last_period_start: 2025-01-05  -- Points to most recent
  period_length_days: 6
```

### When You View December:
1. App calls `fetchMonthLogs('2024-12')`
2. Returns all December `daily_logs` records
3. **December 10-15 show as period days** (from `is_period = true`)
4. `last_period_start` is ignored for historical dates

### When You View January:
1. App calls `fetchMonthLogs('2025-01')`
2. Returns all January `daily_logs` records
3. **January 5-10 show as period days** (from `is_period = true`)
4. `last_period_start` is used for future predictions only

---

## 🔒 Protection Mechanisms

### 1. **Immutable Historical Records**
- Once a day is logged with `is_period = true`, it stays that way
- New periods don't overwrite old `daily_logs` entries
- Each month's data is fetched independently

### 2. **Calendar Rendering Logic**
```typescript
// In page.tsx (lines 680-690)
const dateStr = formatDate(date);
const log = monthLogs[dateStr];

// PRIORITY: Use logged data first
const isLoggedPeriod = log?.is_period === true;
const phase = isLoggedPeriod ? "Menstrual" : getPhaseForDate(date);
```

**Priority Order**:
1. ✅ **First**: Check `daily_logs.is_period` (historical truth)
2. ⚠️ **Fallback**: Use `getPhaseForDate()` (prediction for unlogged dates)

### 3. **Month-Specific Data Fetching**
```typescript
// Fetches ONLY the current month's logs
useEffect(() => {
    const loadMonthLogs = async () => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const logs = await fetchMonthLogs(`${year}-${month}`);
        // ...
    };
    loadMonthLogs();
}, [currentMonth]);
```

**Result**: December logs are separate from January logs.

---

## 📝 What Gets Updated vs What Stays Fixed

### When You Start a New Period (Jan 5):

| Data | Action | Impact |
|------|--------|--------|
| `daily_logs` for Jan 5 | **Created** | New record with `is_period = true` |
| `user_cycle_settings.last_period_start` | **Updated** to Jan 5 | Only affects future predictions |
| `daily_logs` for Dec 10-15 | **NO CHANGE** | Historical data untouched |

### When You End a Period (Jan 10):

| Data | Action | Impact |
|------|--------|--------|
| `daily_logs` for Jan 5-10 | **Created/Updated** | All marked `is_period = true` |
| `user_cycle_settings.period_length_days` | **Updated** to 6 | Only affects future predictions |
| `daily_logs` for Dec 10-15 | **NO CHANGE** | Historical data untouched |

---

## 🧪 Test It Yourself

### Test 1: Historical Data Persistence
1. Log December period: Dec 10-15
2. Log January period: Jan 5-10
3. Navigate back to December
4. **Result**: Dec 10-15 still shows as period (rose gold)

### Test 2: Independent Month Data
1. View December → See Dec 10-15 as period
2. View January → See Jan 5-10 as period
3. View November → See no period (unless you logged one)
4. **Result**: Each month shows only its own logged data

### Test 3: Database Verification
```sql
-- Check December period (should exist)
SELECT date, is_period FROM daily_logs 
WHERE user_id = 'your-id' 
AND date BETWEEN '2024-12-10' AND '2024-12-15';

-- Check January period (should exist)
SELECT date, is_period FROM daily_logs 
WHERE user_id = 'your-id' 
AND date BETWEEN '2025-01-05' AND '2025-01-10';

-- Both queries should return is_period = true
```

---

## 🎯 Summary

### ✅ What You Asked For:
> "I don't want my past period dates to be modified if I add period dates in January"

### ✅ What You Already Have:
- **Per-day storage**: Each day is an independent database record
- **Historical protection**: Old `daily_logs` entries are never modified by new periods
- **Month-based fetching**: Each month loads only its own data
- **Priority system**: Logged data always overrides predictions

### ✅ Proof:
- December's `is_period = true` records stay in the database forever
- January's new period creates NEW records, doesn't touch December
- Calendar shows December data from December logs, not from predictions

---

## 🚀 No Action Needed!

Your system is already built with historical data protection. The `is_period` column in `daily_logs` is exactly what you described wanting - a per-day record that doesn't get modified by future entries.

The only thing that changes when you log a new period is:
- `user_cycle_settings.last_period_start` (used for predictions only)
- `user_cycle_settings.period_length_days` (used for predictions only)

Historical `daily_logs` records remain untouched! 🎉
