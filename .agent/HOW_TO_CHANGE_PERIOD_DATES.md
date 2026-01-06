# How to Change Period Start/End Dates

## 🎯 Overview

You now have **3 ways** to adjust your period dates:

1. **Remove Individual Days** (NEW!)
2. **Adjust Start Date** (Existing)
3. **Manual Re-logging** (Basic)

---

## Method 1: Remove Individual Days ✨ NEW

### Use Case:
You logged Nov 11-15 as your period, but you want to change it to Nov 13-15.

### Steps:
1. **Navigate to November**
2. **Click on Nov 11** (the day you want to remove)
3. **Click "Remove from Period"** button (appears above the Start/End button)
4. **Confirm** - Nov 11 is now removed
5. **Repeat for Nov 12** if needed

### Result:
- Nov 11-12: No longer period days (show as Follicular)
- Nov 13-15: Still period days (show as Menstrual)

### UI:
```
┌─────────────────────────────────────────────┐
│ 🗑️ Remove from Period                       │
│ Unmark Nov 11 as a period day               │
│                                    REMOVE    │
└─────────────────────────────────────────────┘
```

---

## Method 2: Adjust Start Date (Existing)

### Use Case:
You logged Nov 11-15 as your period, and you want to change the start to Nov 13 (keeping the end at Nov 15).

### Steps:
1. **Navigate to November**
2. **Click on Nov 13** (your new start date)
3. **Click "Start Period"** button
4. System detects Nov 14-15 are already logged
5. Shows toast: *"Adjusting period start date - Moving start from Nov 11 to Nov 13"*
6. Automatically updates to Nov 13-15

### Result:
- Nov 11-12: Automatically removed
- Nov 13-15: Marked as period

---

## Method 3: Manual Re-logging (Basic)

### Use Case:
You want to completely redo your period dates.

### Steps:
1. **Remove all old period days** using Method 1
2. **Click on the new start date** (e.g., Nov 13)
3. **Click "Start Period"**
4. **Click on the new end date** (e.g., Nov 15)
5. **Click "End Period"**

### Result:
- Fresh period logged with correct dates

---

## 🎨 Visual Indicators

### When You Click a Period Day:
```
┌─────────────────────────────────────────────┐
│ 🗑️ Remove from Period                       │
│ Unmark Nov 11 as a period day               │
│                                    REMOVE    │
├─────────────────────────────────────────────┤
│ 💧 Within Period Cycle                      │
│ Mark Nov 11 as the end date?                │
│                                  END PERIOD  │
└─────────────────────────────────────────────┘
```

### When You Click a Non-Period Day:
```
┌─────────────────────────────────────────────┐
│ 💧 Logging for Nov 13                       │
│ Did your period start on this day?          │
│                               START PERIOD   │
└─────────────────────────────────────────────┘
```

---

## 🧪 Example Scenarios

### Scenario 1: Shorten Period (Remove Days from Start)
**Original**: Nov 11-15 (5 days)  
**Goal**: Nov 13-15 (3 days)

**Solution**:
1. Click Nov 11 → Click "Remove from Period"
2. Click Nov 12 → Click "Remove from Period"
3. Done! ✅

---

### Scenario 2: Shorten Period (Remove Days from End)
**Original**: Nov 11-15 (5 days)  
**Goal**: Nov 11-13 (3 days)

**Solution**:
1. Click Nov 14 → Click "Remove from Period"
2. Click Nov 15 → Click "Remove from Period"
3. Done! ✅

---

### Scenario 3: Extend Period (Add Days)
**Original**: Nov 11-13 (3 days)  
**Goal**: Nov 11-15 (5 days)

**Solution**:
1. Click Nov 15 (new end date)
2. Click "End Period"
3. System fills Nov 11-15 automatically ✅

---

### Scenario 4: Shift Period (Move Dates)
**Original**: Nov 11-15  
**Goal**: Nov 13-17

**Solution A** (Using Remove):
1. Remove Nov 11, 12
2. Click Nov 17 → "End Period"
3. Done! ✅

**Solution B** (Using Adjust):
1. Click Nov 13 → "Start Period" (adjusts to Nov 13-15)
2. Click Nov 17 → "End Period" (extends to Nov 13-17)
3. Done! ✅

---

## 💡 Tips

### ✅ Best Practices:
- **Remove from the edges** (start or end) for cleaner adjustments
- **Use "Adjust Start"** when you have future period days already logged
- **Check the calendar** after each change to verify

### ⚠️ Important Notes:
- Removing a day only affects that specific day
- The database is updated immediately
- Calendar refreshes automatically
- Toast notifications confirm each action

### 🎯 Quick Reference:

| Action | When to Use | Button |
|--------|-------------|--------|
| **Remove from Period** | Remove specific days | 🗑️ REMOVE |
| **Start Period** | Begin a new period or adjust start | 💧 START PERIOD |
| **End Period** | Mark the last day of period | 💧 END PERIOD |

---

## 🔒 Data Safety

All changes are:
- ✅ Saved immediately to database
- ✅ Reflected in calendar instantly
- ✅ Protected from future cycle changes
- ✅ Reversible (you can re-add days)

---

## 🚀 Summary

**To change Nov 11-15 to Nov 13-15:**

**Fastest Method**: 
1. Click Nov 11 → "Remove from Period"
2. Click Nov 12 → "Remove from Period"
3. Done in 2 clicks! 🎉

**Alternative Method**:
1. Click Nov 13 → "Start Period"
2. System auto-adjusts ✅

Both methods work perfectly - choose what feels more intuitive to you!
