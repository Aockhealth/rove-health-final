import { useState, useEffect } from 'react';
import { fetchMonthLogs } from '@/app/actions/cycle-sync';

export const useMonthLogs = (currentMonth: Date) => {
  const [monthLogs, setMonthLogs] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadMonthLogs = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // Fetch logs for current month and adjacent months (for padding days)
      const monthsToFetch = [
        new Date(year, month - 1, 1), // Previous month
        new Date(year, month, 1),     // Current month
        new Date(year, month + 1, 1)  // Next month
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
      setMonthLogs(logMap);
    };
    loadMonthLogs();
  }, [currentMonth]);

  return { monthLogs, setMonthLogs };
};