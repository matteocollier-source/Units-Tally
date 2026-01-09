import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

export interface DrinkTemplate {
  id: string;
  name: string;
  emoji: string;
  units: number;
  size?: string;
  percentage?: number;
  calories?: number;
}

export type IndicatorType = 'emoji' | 'x';
export type GraphType = 'bar' | 'line';
export type LayoutType = 'vertical' | 'horizontal';

interface Settings {
  indicatorType: IndicatorType;
  drinkTemplates: DrinkTemplate[];
  weekStartsOnSunday: boolean;
  graphType: GraphType;
  hasSeenIntro: boolean;
  hapticsEnabled: boolean;
  layoutType: LayoutType;
}

const SETTINGS_KEY = '@drink_tracker_settings';

const defaultDrinkTemplates: DrinkTemplate[] = [
  {
    id: 'default-wine',
    name: 'Wine (Glass)',
    emoji: 'https://r2-pub.rork.com/generated-images/0cc54217-20c0-4c7b-89f2-259fcaff0110.png',
    units: 3.38,
    size: '250',
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

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<Settings>({
    indicatorType: 'emoji',
    drinkTemplates: defaultDrinkTemplates,
    weekStartsOnSunday: true,
    graphType: 'line',
    hasSeenIntro: false,
    hapticsEnabled: false,
    layoutType: 'vertical',
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const drinkTemplates = (parsed.drinkTemplates && parsed.drinkTemplates.length > 0) 
          ? parsed.drinkTemplates 
          : defaultDrinkTemplates;
        return {
          indicatorType: parsed.indicatorType || 'emoji',
          drinkTemplates,
          weekStartsOnSunday: parsed.weekStartsOnSunday !== undefined ? parsed.weekStartsOnSunday : true,
          graphType: parsed.graphType || 'line',
          hasSeenIntro: parsed.hasSeenIntro || false,
          hapticsEnabled: parsed.hapticsEnabled || false,
          layoutType: parsed.layoutType || 'vertical',
        };
      }
      const initialSettings = {
        indicatorType: 'emoji' as IndicatorType,
        drinkTemplates: defaultDrinkTemplates,
        weekStartsOnSunday: true,
        graphType: 'line' as GraphType,
        hasSeenIntro: false,
        hapticsEnabled: false,
        layoutType: 'vertical' as LayoutType,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
      console.log('[SettingsContext] Initialized with default drinks for first-time user');
      return initialSettings;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: Settings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      const dataWithDefaults = {
        ...settingsQuery.data,
        drinkTemplates: (settingsQuery.data.drinkTemplates && settingsQuery.data.drinkTemplates.length > 0)
          ? settingsQuery.data.drinkTemplates
          : defaultDrinkTemplates,
      };
      setSettings(dataWithDefaults);
    }
  }, [settingsQuery.data]);

  const updateIndicatorType = (type: IndicatorType) => {
    const updated = { ...settings, indicatorType: type };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const updateDrinkTemplates = (templates: DrinkTemplate[]) => {
    const updated = { ...settings, drinkTemplates: templates };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const updateDrinkTemplate = (template: DrinkTemplate) => {
    const nextNameKey = template.name.trim().toLowerCase();
    const hasDuplicateName = settings.drinkTemplates.some(t => t.id !== template.id && t.name.trim().toLowerCase() === nextNameKey);

    if (hasDuplicateName) {
      console.log('[Settings] updateDrinkTemplate blocked (duplicate name)', { templateId: template.id, name: template.name });
      return;
    }

    const templates = settings.drinkTemplates.map(t => 
      t.id === template.id ? template : t
    );
    updateDrinkTemplates(templates);
  };

  const addDrinkTemplate = (template: Omit<DrinkTemplate, 'id'>): DrinkTemplate | undefined => {
    const nextNameKey = template.name.trim().toLowerCase();
    const hasDuplicateName = settings.drinkTemplates.some(t => t.name.trim().toLowerCase() === nextNameKey);

    if (hasDuplicateName) {
      console.log('[Settings] addDrinkTemplate blocked (duplicate name)', { name: template.name });
      const existing = settings.drinkTemplates.find(t => t.name.trim().toLowerCase() === nextNameKey);
      return existing;
    }

    const newTemplate: DrinkTemplate = { ...template, id: Date.now().toString() };
    updateDrinkTemplates([...settings.drinkTemplates, newTemplate]);
    return newTemplate;
  };

  const deleteDrinkTemplate = (id: string) => {
    updateDrinkTemplates(settings.drinkTemplates.filter(t => t.id !== id));
  };

  const updateWeekStartsOnSunday = (weekStartsOnSunday: boolean) => {
    const updated = { ...settings, weekStartsOnSunday };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const updateGraphType = (graphType: GraphType) => {
    const updated = { ...settings, graphType };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const markIntroSeen = () => {
    const updated = { ...settings, hasSeenIntro: true };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const updateHapticsEnabled = (hapticsEnabled: boolean) => {
    const updated = { ...settings, hapticsEnabled };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const updateLayoutType = (layoutType: LayoutType) => {
    const updated = { ...settings, layoutType };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  return {
    settings,
    updateIndicatorType,
    updateDrinkTemplates,
    updateDrinkTemplate,
    addDrinkTemplate,
    deleteDrinkTemplate,
    updateWeekStartsOnSunday,
    updateGraphType,
    markIntroSeen,
    updateHapticsEnabled,
    updateLayoutType,
    isLoading: settingsQuery.isLoading,
  };
});
