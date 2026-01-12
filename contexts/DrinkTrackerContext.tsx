import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { useSettings, DrinkTemplate } from './SettingsContext';

const defaultDrinkTemplates: DrinkTemplate[] = [
  {
    id: 'default-wine',
    name: 'Wine (large glass)',
    emoji: 'https://r2-pub.rork.com/generated-images/0cc54217-20c0-4c7b-89f2-259fcaff0110.png',
    units: 3.38,
    size: '250',
    percentage: 13.5,
  },
  {
    id: 'default-wine-small',
    name: 'Wine (small glass)',
    emoji: 'https://r2-pub.rork.com/generated-images/a0333fe3-977d-4956-b403-0f797ea0e2f9.png',
    units: 2.36,
    size: '175',
    percentage: 13.5,
  },
  {
    id: 'default-beer',
    name: 'Beer (Pint)',
    emoji: 'https://r2-pub.rork.com/generated-images/fe044876-cab6-4726-a476-ce85fbec954b.png',
    units: 2.84,
    size: '568',
    percentage: 5,
  },
  {
    id: 'default-spirits',
    name: 'Spirits',
    emoji: 'https://r2-pub.rork.com/generated-images/621b4703-f453-4156-9b65-4b6b361d1fa6.png',
    units: 2,
    size: '50',
    percentage: 40,
  },
];

export interface DayData {
  day: string;
  date: string;
  units: number;
  drank: boolean;
  drinkCount: number;
}

export interface WeekData {
  weekLabel: string;
  days: DayData[];
}

const STORAGE_KEY = '@drink_tracker_data';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0] ?? '';
}

function startOfWeek(date: Date, weekStartsOnSunday: boolean): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysToSubtract = weekStartsOnSunday ? dayOfWeek : (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysToSubtract);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

function getWeeksData(weekStartsOnSunday: boolean, earliestEntryDate: string | null): WeekData[] {
  const weeks: WeekData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If no entries exist, just show current week
  const historyStart = earliestEntryDate ? new Date(earliestEntryDate) : today;
  historyStart.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let cursorWeekStart = startOfWeek(today, weekStartsOnSunday);

  while (cursorWeekStart >= historyStart) {
    const days: DayData[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(cursorWeekStart);
      date.setDate(cursorWeekStart.getDate() + dayOffset);

      const dateStr = toISODate(date);
      days.push({
        day: dayNames[date.getDay()] ?? '',
        date: dateStr,
        units: 0,
        drank: false,
        drinkCount: 0,
      });
    }

    weeks.push({
      weekLabel: formatWeekLabel(cursorWeekStart),
      days,
    });

    const prev = new Date(cursorWeekStart);
    prev.setDate(cursorWeekStart.getDate() - 7);
    cursorWeekStart = prev;
  }

  return weeks;
}

interface Statistics {
  avgUnitsPerWeek: number;
  avgDrinkingDaysPerWeek: number;
}

type DayEntry = {
  units: number;
  drank: boolean;
  drinkCount: number;
  drinkCounts: Record<string, number>;
  savedDrinkCounts?: Record<string, number>;
};

function getEarliestEntryDate(data: Record<string, DayEntry>): string | null {
  const dates = Object.keys(data).filter(date => {
    const entry = data[date];
    // Consider a date as having an entry if it has any data recorded
    return entry && (entry.drank || entry.units > 0 || entry.drinkCount > 0 || Object.keys(entry.drinkCounts || {}).length > 0);
  });
  
  if (dates.length === 0) return null;
  
  return dates.sort()[0] ?? null;
}

export const [DrinkTrackerProvider, useDrinkTracker] = createContextHook(() => {
  const { settings } = useSettings();
  const [data, setData] = useState<Record<string, DayEntry>>({});
  
  const dataQuery = useQuery({
    queryKey: ['drinkData'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newData: Record<string, DayEntry>) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    },
  });

  const normalizeDayEntry = useCallback((entry: any): DayEntry => {
    const drinkCounts = (entry?.drinkCounts && typeof entry.drinkCounts === 'object') ? entry.drinkCounts : {};
    const savedDrinkCounts = (entry?.savedDrinkCounts && typeof entry.savedDrinkCounts === 'object') ? entry.savedDrinkCounts : undefined;
    const drinkCount = typeof entry?.drinkCount === 'number' ? entry.drinkCount : 0;
    const units = typeof entry?.units === 'number' ? entry.units : 0;

    const safeUnits = Number.isFinite(units) ? Math.max(0, units) : 0;
    const drank = typeof entry?.drank === 'boolean' ? entry.drank : safeUnits > 0;

    return {
      units: safeUnits,
      drank,
      drinkCount: Math.max(0, drinkCount),
      drinkCounts,
      savedDrinkCounts,
    };
  }, []);

  const computeTotalsFromCounts = useCallback((drinkCounts: Record<string, number>) => {
    let units = 0;
    let drinkCount = 0;

    Object.entries(drinkCounts).forEach(([drinkId, count]) => {
      const safeCount = Math.max(0, count);
      if (safeCount <= 0) return;

      // Look up template from user templates first, then fall back to defaults
      let template = settings.drinkTemplates.find(t => t.id === drinkId);
      if (!template) {
        template = defaultDrinkTemplates.find(t => t.id === drinkId);
      }
      const perDrinkUnits = template?.units ?? 0;

      drinkCount += safeCount;
      units += safeCount * perDrinkUnits;
    });

    return {
      units: Math.round(units * 100) / 100,
      drinkCount,
    };
  }, [settings.drinkTemplates]);

  useEffect(() => {
    if (dataQuery.data) {
      const raw: Record<string, any> = dataQuery.data as Record<string, any>;
      const normalized: Record<string, DayEntry> = {};

      Object.entries(raw).forEach(([date, entry]) => {
        const base = normalizeDayEntry(entry);
        const totals = computeTotalsFromCounts(base.drinkCounts);
        const hasCounts = Object.keys(base.drinkCounts).length > 0;
        const reconciledUnits = hasCounts ? totals.units : base.units;
        const reconciledDrinkCount = hasCounts ? totals.drinkCount : base.drinkCount;

        const reconciled: DayEntry = {
          ...base,
          units: reconciledUnits,
          drinkCount: reconciledDrinkCount,
          drank: base.drank || reconciledUnits > 0,
        };
        normalized[date] = reconciled;
      });

      setData(normalized);
    }
  }, [computeTotalsFromCounts, dataQuery.data, normalizeDayEntry]);

  const toggleDrank = (date: string) => {
    setData(prevData => {
      const current = normalizeDayEntry(prevData[date]);
      const hasAnythingLogged = current.units > 0 || current.drinkCount > 0 || Object.keys(current.drinkCounts).length > 0;

      if (hasAnythingLogged) {
        console.log('[toggleDrank] saving drinks and marking as no-drink day', { date, drinkCounts: current.drinkCounts });
        const updated: Record<string, DayEntry> = {
          ...prevData,
          [date]: {
            units: 0,
            drank: false,
            drinkCount: 0,
            drinkCounts: {},
            savedDrinkCounts: current.drinkCounts,
          },
        };
        saveMutation.mutate(updated);
        return updated;
      }

      if (!current.drank && current.savedDrinkCounts && Object.keys(current.savedDrinkCounts).length > 0) {
        console.log('[toggleDrank] restoring saved drinks', { date, savedDrinkCounts: current.savedDrinkCounts });
        const totals = computeTotalsFromCounts(current.savedDrinkCounts);
        const updated: Record<string, DayEntry> = {
          ...prevData,
          [date]: {
            units: totals.units,
            drank: true,
            drinkCount: totals.drinkCount,
            drinkCounts: current.savedDrinkCounts,
            savedDrinkCounts: undefined,
          },
        };
        saveMutation.mutate(updated);
        return updated;
      }

      const nextDrank = !current.drank;
      const updated: Record<string, DayEntry> = {
        ...prevData,
        [date]: {
          ...current,
          drank: nextDrank,
        },
      };

      saveMutation.mutate(updated);
      console.log('[toggleDrank] toggled indicator', { date, nextDrank });
      return updated;
    });
  };

  const addUnits = (date: string, unitsToAdd: number, drinkCountChange: number = 1, drinkId?: string) => {
    setData(prevData => {
      const current = normalizeDayEntry(prevData[date]);

      let nextDrinkCounts: Record<string, number> = { ...current.drinkCounts };

      if (drinkId) {
        const currentDrinkCount = nextDrinkCounts[drinkId] || 0;
        const nextCount = Math.max(0, currentDrinkCount + drinkCountChange);
        if (nextCount === 0) {
          delete nextDrinkCounts[drinkId];
        } else {
          nextDrinkCounts[drinkId] = nextCount;
        }

        const totals = computeTotalsFromCounts(nextDrinkCounts);

        const updated = {
          ...prevData,
          [date]: {
            units: totals.units,
            drank: totals.units > 0 || totals.drinkCount > 0 ? true : current.drank,
            drinkCount: totals.drinkCount,
            drinkCounts: nextDrinkCounts,
          },
        };

        saveMutation.mutate(updated);
        return updated;
      }

      const newUnits = Math.max(0, current.units + unitsToAdd);
      const newDrinkCount = Math.max(0, current.drinkCount + drinkCountChange);

      const updated = {
        ...prevData,
        [date]: {
          units: newUnits,
          drank: newUnits > 0 || newDrinkCount > 0 ? true : current.drank,
          drinkCount: newDrinkCount,
          drinkCounts: nextDrinkCounts,
        },
      };
      saveMutation.mutate(updated);
      return updated;
    });
  };

  const earliestEntryDate = getEarliestEntryDate(data);

  const getWeeksWithData = (): WeekData[] => {
    const weeks = getWeeksData(settings.weekStartsOnSunday, earliestEntryDate);
    return weeks.map(week => ({
      ...week,
      days: week.days.map(day => {
        const entry = data[day.date];
        const units = entry?.units ?? 0;
        const drinkCount = entry?.drinkCount ?? 0;
        const drank = entry?.drank ?? units > 0;
        return {
          ...day,
          units,
          drank,
          drinkCount,
        };
      }),
    }));
  };

  const calculateStatistics = (): Statistics => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If no entries, return zeros
    if (!earliestEntryDate) {
      return {
        avgUnitsPerWeek: 0,
        avgDrinkingDaysPerWeek: 0,
      };
    }

    const historyStart = new Date(earliestEntryDate);
    historyStart.setHours(0, 0, 0, 0);

    const daysTotal = Math.max(0, Math.floor((today.getTime() - historyStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const weeksTotal = Math.max(1, daysTotal / 7);

    let totalUnits = 0;
    let totalDrinkingDays = 0;

    for (let i = 0; i < daysTotal; i++) {
      const d = new Date(historyStart);
      d.setDate(historyStart.getDate() + i);
      const iso = toISODate(d);
      const entry = data[iso];
      const units = entry?.units ?? 0;
      const drank = entry?.drank ?? units > 0;

      totalUnits += units;
      if (drank || units > 0) totalDrinkingDays += 1;
    }

    const avgUnitsPerWeek = totalUnits / weeksTotal;
    const avgDrinkingDaysPerWeek = totalDrinkingDays / weeksTotal;

    return {
      avgUnitsPerWeek: Math.round(avgUnitsPerWeek * 10) / 10,
      avgDrinkingDaysPerWeek: Math.round(avgDrinkingDaysPerWeek * 10) / 10,
    };
  };

  return {
    weeks: getWeeksWithData(),
    statistics: calculateStatistics(),
    toggleDrank,
    addUnits,
    isLoading: dataQuery.isLoading,
    data,
    earliestEntryDate,
  };
});
