import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { useDrinkTracker } from '@/contexts/DrinkTrackerContext';
import { useSettings, DrinkTemplate } from '@/contexts/SettingsContext';
import { Plus, X, Home, BarChart3, Settings, Minus, Trash2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const dayCardStars = [
  'https://r2-pub.rork.com/generated-images/cde08da4-d70d-4899-9eac-7ffb0ea71de5.png',
];

const defaultDrinkTemplates: DrinkTemplate[] = [
  {
    id: 'default-wine',
    name: 'Wine (large glass)',
    emoji: 'https://r2-pub.rork.com/generated-images/0cc54217-20c0-4c7b-89f2-259fcaff0110.png',
    units: 3,
    size: '250',
    percentage: 12,
  },
  {
    id: 'default-wine-small',
    name: 'Wine (small glass)',
    emoji: 'https://r2-pub.rork.com/generated-images/a0333fe3-977d-4956-b403-0f797ea0e2f9.png',
    units: 2.1,
    size: '175',
    percentage: 12,
  },
  {
    id: 'default-beer',
    name: 'Beer (Pint)',
    emoji: 'https://r2-pub.rork.com/generated-images/fe044876-cab6-4726-a476-ce85fbec954b.png',
    units: 2.3,
    size: '568',
    percentage: 4,
  },
  {
    id: 'default-spirits',
    name: 'Spirits',
    emoji: 'https://r2-pub.rork.com/generated-images/621b4703-f453-4156-9b65-4b6b361d1fa6.png',
    units: 1,
    size: '25',
    percentage: 40,
  },
];

export default function DrinkTrackerScreen() {
  const drinkTracker = useDrinkTracker();
  const settingsContext = useSettings();
  
  const [modalVisible, setModalVisible] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(false);
  const [drinkTapCounts, setDrinkTapCounts] = useState<Record<string, number>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const confettiRef = useRef<any>(null);
  const router = useRouter();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const ignoreNextCardPressRef = useRef<boolean>(false);
  const pendingModalDateRef = useRef<string | null>(null);
  
  const weeks = useMemo(() => drinkTracker?.weeks ?? [], [drinkTracker?.weeks]);
  const statistics = drinkTracker?.statistics ?? { avgDrinkingDaysPerWeek: 0, avgUnitsPerWeek: 0 };
  const toggleDrank = drinkTracker?.toggleDrank ?? (() => {});
  const addUnits = drinkTracker?.addUnits ?? (() => {});
  const isLoading = drinkTracker?.isLoading ?? true;
  const data = useMemo(() => drinkTracker?.data ?? {}, [drinkTracker?.data]);
  
  const settings = settingsContext?.settings ?? { drinkTemplates: [], indicatorType: 'emoji' as const, hapticsEnabled: true };
  const addDrinkTemplate = settingsContext?.addDrinkTemplate ?? (() => undefined);
  const deleteDrinkTemplate = settingsContext?.deleteDrinkTemplate ?? (() => {});
  const markIntroSeen = settingsContext?.markIntroSeen ?? (() => {});

  const displayDrinks = settings.drinkTemplates.length > 0 ? settings.drinkTemplates : defaultDrinkTemplates;

  const maybeHaptic = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    if (!settings.hapticsEnabled) return;
    Haptics.impactAsync(style);
  }, [settings.hapticsEnabled]);

  // Helper to sync drinkTapCounts from saved data
  const syncDrinkCountsFromData = useCallback((date: string) => {
    const dayData = data[date];
    const savedCounts = dayData?.drinkCounts || {};
    const syncedCounts: Record<string, number> = {};
    
    const allDrinks = settings.drinkTemplates;
    allDrinks.forEach(drink => {
      syncedCounts[drink.id] = savedCounts[drink.id] || 0;
    });
    
    // Also include any saved counts that might not be in current templates
    Object.keys(savedCounts).forEach(drinkId => {
      if (!(drinkId in syncedCounts)) {
        syncedCounts[drinkId] = savedCounts[drinkId] || 0;
      }
    });
    
    setDrinkTapCounts(syncedCounts);
  }, [data, settings.drinkTemplates]);

  useEffect(() => {
    setShowFirstTimeGuide(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (pendingModalDateRef.current) {
        const date = pendingModalDateRef.current;
        pendingModalDateRef.current = null;
        setSelectedDate(date);
        syncDrinkCountsFromData(date);
        setModalVisible(true);
        console.log('[FocusEffect] Re-opening modal for date:', date);
      }
    }, [syncDrinkCountsFromData])
  );

  // Sync drinkTapCounts with saved data when modal is visible and data changes
  useEffect(() => {
    if (modalVisible && selectedDate) {
      syncDrinkCountsFromData(selectedDate);
    }
  }, [modalVisible, selectedDate, data, syncDrinkCountsFromData]);

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const handleDayPress = (date: string) => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    syncDrinkCountsFromData(date);
    setModalVisible(true);
  };

  const handleHomePress = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleToggle = (date: string) => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Medium);
    toggleDrank(date);
  };

  const handleAddDrink = (units: number, drinkId: string, drink?: DrinkTemplate) => {
    if (!selectedDate) return;
    
    maybeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    
    // If using a default drink, add it to templates first so it persists
    let actualDrinkId = drinkId;
    if (drinkId.startsWith('default-') && drink) {
      const existingDrink = settings.drinkTemplates.find(t => t.name === drink.name);
      if (!existingDrink) {
        const { id, ...drinkWithoutId } = drink;
        const newDrink = addDrinkTemplate(drinkWithoutId);
        if (newDrink?.id) {
          actualDrinkId = newDrink.id;
        }
        console.log('[AddDrink] Added default drink to templates', { drink: drink.name, newId: actualDrinkId });
      } else {
        actualDrinkId = existingDrink.id;
      }
    }
    
    const currentCount = drinkTapCounts[actualDrinkId] || drinkTapCounts[drinkId] || 0;
    const newCount = currentCount + 1;
    
    setDrinkTapCounts(prev => ({
      ...prev,
      [actualDrinkId]: newCount
    }));
    
    addUnits(selectedDate, 0, 1, actualDrinkId);
    console.log('[AddDrink]', { selectedDate, drinkId: actualDrinkId, units, newCount });
  };

  const handleRemoveDrink = (units: number, drinkId: string, drink?: DrinkTemplate) => {
    if (!selectedDate) return;
    
    // Find the actual drink ID (might be saved under a different ID if it was a default)
    let actualDrinkId = drinkId;
    if (drinkId.startsWith('default-') && drink) {
      const existingDrink = settings.drinkTemplates.find(t => t.name === drink.name);
      if (existingDrink) {
        actualDrinkId = existingDrink.id;
      }
    }
    
    const currentCount = drinkTapCounts[actualDrinkId] || drinkTapCounts[drinkId] || 0;
    if (currentCount <= 0) {
      return;
    }
    
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    const newCount = Math.max(0, currentCount - 1);
    
    // Update local state immediately for responsive UI
    setDrinkTapCounts(prev => ({
      ...prev,
      [actualDrinkId]: newCount,
    }));
    
    // Save to persistent storage (units parameter is ignored when drinkId is provided)
    addUnits(selectedDate, 0, -1, actualDrinkId);
    console.log('[RemoveDrink]', { selectedDate, drinkId: actualDrinkId, units, newCount });
  };

  

  const handleWeekTotalPress = (event: any, total: number) => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    if (total <= 14) {
      if (Platform.OS === 'web') {
        setConfettiOrigin({ x: 200, y: 300 });
      } else if (event?.nativeEvent?.pageX !== undefined && event?.nativeEvent?.pageY !== undefined) {
        const { pageX, pageY } = event.nativeEvent;
        setConfettiOrigin({ x: pageX, y: pageY });
      } else {
        setConfettiOrigin({ x: 200, y: 300 });
      }
      setTimeout(() => {
        try {
          confettiRef.current?.start();
        } catch (e) {
          console.log('[Confetti] Failed to start:', e);
        }
      }, Platform.OS === 'web' ? 100 : 50);
    }
  };

  const handleUnitPress = (date: string) => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    syncDrinkCountsFromData(date);
    setModalVisible(true);
  };

  const getDrinkIconForDate = useCallback((date: string): string | undefined => {
    const entry = data[date];
    const counts = entry?.drinkCounts ?? {};
    const topDrinkId = Object.entries(counts)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0];

    if (!topDrinkId) return undefined;
    
    const userDrink = settings.drinkTemplates.find(t => t.id === topDrinkId);
    if (userDrink?.emoji) return userDrink.emoji;
    
    const defaultDrink = defaultDrinkTemplates.find(t => t.id === topDrinkId);
    return defaultDrink?.emoji;
  }, [data, settings.drinkTemplates]);

  const dayIndicatorIcons = useMemo(() => {
    const icons: Record<string, string> = {};
    weeks.forEach(week => {
      week.days.forEach(day => {
        const icon = getDrinkIconForDate(day.date);
        if (icon) icons[day.date] = icon;
      });
    });
    return icons;
  }, [getDrinkIconForDate, weeks]);

  const handleStatPress = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.push('/stats' as any);
  };

  const getAverageDrinkFreeDays = () => {
    const historyStart = new Date('2025-06-01');
    historyStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysTotal = Math.max(0, Math.floor((today.getTime() - historyStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const weeksTotal = Math.max(1, daysTotal / 7);

    let drinkFreeDays = 0;

    for (let i = 0; i < daysTotal; i++) {
      const d = new Date(historyStart);
      d.setDate(historyStart.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const units = data[iso]?.units ?? 0;
      if (units <= 0) drinkFreeDays += 1;
    }

    const avgDrinkFreeDaysPerWeek = drinkFreeDays / weeksTotal;
    return Math.round(avgDrinkFreeDaysPerWeek * 10) / 10;
  };

  const averageDrinkFreeDays = getAverageDrinkFreeDays();
  const getCurrentWeekData = () => {
    const latestWeek = weeks[0];
    if (!latestWeek) return { totalDrinks: 0, totalUnits: 0, drinkFreeDays: 0, drinkDays: 0 };

    let totalUnits = 0;
    let totalDrinks = 0;
    let drinkFreeDays = 0;
    let drinkDays = 0;

    latestWeek.days.forEach(day => {
      const dayUnits = data[day.date]?.units ?? 0;
      const dayDrinkCount = data[day.date]?.drinkCount ?? 0;
      const drank = dayUnits > 0;

      totalUnits += dayUnits;
      totalDrinks += dayDrinkCount;
      if (!drank) drinkFreeDays++;
      if (drank) drinkDays++;
    });

    return { totalDrinks, totalUnits, drinkFreeDays, drinkDays };
  };

  const currentWeekData = getCurrentWeekData();

  useEffect(() => {
    console.log('[Home] data keys:', Object.keys(data).length);
    console.log('[Home] currentWeek drinkDays:', currentWeekData.drinkDays);
    console.log('[Home] avgDrinkFreeDays:', averageDrinkFreeDays);
    const todayIso = new Date().toISOString().split('T')[0];
    console.log('[Home] today:', todayIso, 'entry:', data[todayIso]);
  }, [averageDrinkFreeDays, currentWeekData.drinkDays, data]);

  if (!drinkTracker || !settingsContext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6ba5a7" />
      </View>
    );
  }

  if (isLoading) {
    const gridItems = [];
    const iconSize = 80;
    const cols = Math.ceil(400 / iconSize);
    const rows = Math.ceil(800 / iconSize);
    for (let i = 0; i < rows * cols; i++) {
      gridItems.push(i);
    }
    const drinkIcons = [
      'https://r2-pub.rork.com/generated-images/a0333fe3-977d-4956-b403-0f797ea0e2f9.png',
      'https://r2-pub.rork.com/generated-images/14293649-3ef8-4ce0-b636-3b5a845bec58.png',
      'https://r2-pub.rork.com/generated-images/621b4703-f453-4156-9b65-4b6b361d1fa6.png',
      'https://r2-pub.rork.com/generated-images/5a4c3b1a-7d2f-4c36-92bc-48c8a2cc14b9.png',
      'https://r2-pub.rork.com/generated-images/ed6b1be5-43de-4146-9240-abfd8fdd6aa0.png',
      'https://r2-pub.rork.com/generated-images/bd29c4f2-d6e0-438b-8c75-08f896128d98.png',
    ];
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGrid}>
          {gridItems.map((index) => (
            <Image
              key={index}
              source={{ uri: drinkIcons[index % drinkIcons.length] }}
              style={styles.loadingGridIcon}
            />
          ))}
        </View>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        <View style={styles.allStatsBox}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCircleLarge} onPress={handleStatPress}>
              <Text style={styles.statValueLarge}>{(Math.ceil(statistics.avgDrinkingDaysPerWeek * 10) / 10).toFixed(1)}</Text>
              <Text style={styles.statLabelLarge}>Average Drink{'\n'}Days / Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCircleLarge} onPress={handleStatPress}>
              <Text style={styles.statValueLarge}>{(Math.ceil(statistics.avgUnitsPerWeek * 10) / 10).toFixed(1)}</Text>
              <Text style={styles.statLabelLarge}>Weekly Average{'\n'}Units</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRowBottom}>
            <TouchableOpacity style={styles.weekStatCircle} onPress={handleStatPress}>
              <Text style={styles.weekStatValue}>{currentWeekData.drinkDays}</Text>
              <Text style={styles.weekStatLabel}>Drink Day{'\n'}This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekStatCircle} onPress={handleStatPress}>
              <Text style={styles.weekStatValue}>{averageDrinkFreeDays.toFixed(1)}</Text>
              <Text style={styles.weekStatLabel}>Average Drink{' '}Free Days</Text>
            </TouchableOpacity>
          </View>
        </View>


        {weeks.map((week, weekIndex) => {
          const weekTotal = week.days.reduce((sum, day) => sum + day.units, 0);
          
          return (
            <View key={weekIndex} style={styles.weekContainer}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekLabel}>{week.weekLabel}</Text>
                <TouchableOpacity onPress={(e) => handleWeekTotalPress(e, weekTotal)}>
                  <Text style={[styles.weekTotal, weekTotal > 14 && styles.weekTotalOver]}>{(Math.ceil(weekTotal * 10) / 10).toFixed(1)} Units</Text>
                </TouchableOpacity>
              </View>

              {settings.layoutType === 'vertical' ? (
                <View style={styles.daysGrid}>
                  {[...week.days]
                    .filter(day => {
                      const today = new Date().toISOString().split('T')[0];
                      return day.date <= today;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.date).getTime();
                      const dateB = new Date(b.date).getTime();
                      return dateB - dateA;
                    })
                    .map((day, dayIndex) => {
                  const isWeekend = day.day === 'Sat' || day.day === 'Sun';
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <View key={dayIndex} style={styles.dayCardWrapper}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.dayCard,
                          isWeekend && styles.dayCardWeekend,
                          isToday && styles.dayCardToday,
                          pressed && styles.dayCardPressed,
                        ]}
                        onPress={() => {
                          if (ignoreNextCardPressRef.current) {
                            console.log('[DayCard] ignored card press (toggle/stats interaction)', { date: day.date });
                            return;
                          }
                          handleDayPress(day.date);
                        }}
                      >
                        <View style={styles.dayCardHeader}>
                          <View style={styles.dayCardDateContainer}>
                            <Text style={styles.dayCardDay}>
                              {(() => {
                                const weekday = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long' });
                                const abbrevMap: Record<string, string> = {
                                  'Monday': 'Mon',
                                  'Tuesday': 'Tues',
                                  'Wednesday': 'Weds',
                                  'Thursday': 'Thurs',
                                  'Friday': 'Fri',
                                  'Saturday': 'Sat',
                                  'Sunday': 'Sun'
                                };
                                return abbrevMap[weekday] || weekday;
                              })()}
                            </Text>
                            <Text style={styles.dayCardDate}>
                              {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                            </Text>
                          </View>
                          <Pressable
                            style={styles.dayCardToggle}
                            onPressIn={() => {
                              ignoreNextCardPressRef.current = true;
                            }}
                            onPress={() => {
                              console.log('[DayCardToggle] pressed', { date: day.date, drank: day.drank });
                              if (day.drank) {
                                handleToggle(day.date);
                              } else {
                                handleToggle(day.date);
                              }
                              setTimeout(() => {
                                ignoreNextCardPressRef.current = false;
                              }, 0);
                            }}
                            hitSlop={12}
                            testID={`day-card-toggle-${day.date}`}
                          >
                            {day.drank ? (
                              settings.indicatorType === 'emoji' && dayIndicatorIcons[day.date] ? (
                                dayIndicatorIcons[day.date]?.startsWith('http') ? (
                                  <Image 
                                    source={{ uri: dayIndicatorIcons[day.date] }} 
                                    style={styles.dayCardDrinkIcon}
                                    resizeMode="contain"
                                  />
                                ) : (
                                  <Text style={styles.dayCardDrinkEmoji}>{dayIndicatorIcons[day.date]}</Text>
                                )
                              ) : (
                                <View style={styles.redXContainer}>
                                  <View style={styles.redXLine1} />
                                  <View style={styles.redXLine2} />
                                </View>
                              )
                            ) : (
                              <Image 
                                source={{ uri: dayCardStars[dayIndex % dayCardStars.length] }} 
                                style={styles.customStarImage}
                                resizeMode="contain"
                              />
                            )}
                          </Pressable>
                        </View>

                        <Pressable 
                          style={styles.dayCardStats}
                          onPressIn={() => {
                            ignoreNextCardPressRef.current = true;
                          }}
                          onPress={() => {
                            console.log('[DayCardStats] pressed', { date: day.date });
                            handleUnitPress(day.date);
                            setTimeout(() => {
                              ignoreNextCardPressRef.current = false;
                            }, 0);
                          }}
                          hitSlop={10}
                        >
                          <Text style={styles.dayCardDrinks}>{day.drinkCount} Drinks</Text>
                          <Text style={[styles.dayCardUnits, day.units <= 14 && styles.dayCardUnitsGreen]}>{(Math.ceil(day.units * 10) / 10).toFixed(1)} Units</Text>
                        </Pressable>
                      </Pressable>
                    </View>
                    );
                  })}
                  
                  <View style={styles.miniCalendarWrapper}>
                    <View style={styles.miniCalendar}>
                      {week.days.map((day, idx) => {
                        const dayNum = new Date(day.date).getDate();
                        const hasData = data[day.date];
                        const hasDrank = hasData?.drank || false;
                        const weekday = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' });
                        return (
                          <View key={idx} style={styles.miniCalDay}>
                            <Text style={styles.miniCalDayName}>{weekday}</Text>
                            <Text style={[styles.miniCalDayNum, hasDrank ? styles.miniCalRed : styles.miniCalBlue]}>
                              {dayNum}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.horizontalDaysContainer}>
                  {[...week.days]
                    .filter(day => {
                      const today = new Date().toISOString().split('T')[0];
                      return day.date <= today;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.date).getTime();
                      const dateB = new Date(b.date).getTime();
                      return dateB - dateA;
                    })
                    .map((day, dayIndex) => {
                      const isWeekend = day.day === 'Sat' || day.day === 'Sun';
                      const isToday = day.date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <Pressable
                          key={dayIndex}
                          style={({ pressed }) => [
                            styles.dayBar,
                            isWeekend && styles.dayBarWeekend,
                            isToday && styles.dayBarToday,
                            pressed && styles.dayBarPressed,
                          ]}
                          onPress={() => {
                            if (ignoreNextCardPressRef.current) {
                              console.log('[DayBar] ignored bar press (toggle/stats interaction)', { date: day.date });
                              return;
                            }
                            handleDayPress(day.date);
                          }}
                        >
                          <View style={styles.dayBarLeft}>
                            <Text style={styles.dayBarDay}>
                              {(() => {
                                const weekday = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long' });
                                const abbrevMap: Record<string, string> = {
                                  'Monday': 'Mon',
                                  'Tuesday': 'Tues',
                                  'Wednesday': 'Weds',
                                  'Thursday': 'Thurs',
                                  'Friday': 'Fri',
                                  'Saturday': 'Sat',
                                  'Sunday': 'Sun'
                                };
                                return abbrevMap[weekday] || weekday;
                              })()}
                            </Text>
                            <Text style={styles.dayBarDate}>
                              {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }} />

                          <Pressable
                            style={styles.dayBarCenter}
                            onPressIn={() => {
                              ignoreNextCardPressRef.current = true;
                            }}
                            onPress={() => {
                              console.log('[DayBarStats] pressed', { date: day.date });
                              handleUnitPress(day.date);
                              setTimeout(() => {
                                ignoreNextCardPressRef.current = false;
                              }, 0);
                            }}
                            hitSlop={10}
                          >
                            <View style={styles.dayBarStatsRow}>
                              <View style={styles.dayBarStatItem}>
                                <Text style={styles.dayBarStatValue}>{day.drinkCount}</Text>
                                <Text style={styles.dayBarStatLabel}>Drinks</Text>
                              </View>
                              <View style={styles.dayBarStatItem}>
                                <Text style={[styles.dayBarStatValue, day.units <= 14 && styles.dayBarUnitsGreen]}>
                                  {(Math.ceil(day.units * 10) / 10).toFixed(1)}
                                </Text>
                                <Text style={styles.dayBarStatLabel}>Units</Text>
                              </View>
                            </View>
                          </Pressable>

                          <View style={{ flex: 1 }} />

                          <Pressable
                            style={styles.dayBarToggle}
                            onPressIn={() => {
                              ignoreNextCardPressRef.current = true;
                            }}
                            onPress={() => {
                              console.log('[DayBarToggle] pressed', { date: day.date, drank: day.drank });
                              handleToggle(day.date);
                              setTimeout(() => {
                                ignoreNextCardPressRef.current = false;
                              }, 0);
                            }}
                            hitSlop={12}
                            testID={`day-bar-toggle-${day.date}`}
                          >
                            {day.drank ? (
                              settings.indicatorType === 'emoji' && dayIndicatorIcons[day.date] ? (
                                dayIndicatorIcons[day.date]?.startsWith('http') ? (
                                  <Image 
                                    source={{ uri: dayIndicatorIcons[day.date] }} 
                                    style={styles.dayCardDrinkIcon}
                                    resizeMode="contain"
                                  />
                                ) : (
                                  <Text style={styles.dayCardDrinkEmoji}>{dayIndicatorIcons[day.date]}</Text>
                                )
                              ) : (
                                <View style={styles.redXContainer}>
                                  <View style={styles.redXLine1} />
                                  <View style={styles.redXLine2} />
                                </View>
                              )
                            ) : (
                              <Image 
                                source={{ uri: dayCardStars[dayIndex % dayCardStars.length] }} 
                                style={styles.customStarImage}
                                resizeMode="contain"
                              />
                            )}
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  
                  <View style={styles.miniCalendarHorizontalWrapper}>
                    <View style={styles.miniCalendar}>
                      {week.days.map((day, idx) => {
                        const dayNum = new Date(day.date).getDate();
                        const hasData = data[day.date];
                        const hasDrank = hasData?.drank || false;
                        const weekday = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' });
                        return (
                          <View key={idx} style={styles.miniCalDay}>
                            <Text style={styles.miniCalDayName}>{weekday}</Text>
                            <Text style={[styles.miniCalDayNum, hasDrank ? styles.miniCalRed : styles.miniCalBlue]}>
                              {dayNum}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {Platform.OS !== 'web' && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={120}
            origin={confettiOrigin}
            autoStart={false}
            ref={confettiRef}
            fadeOut
            explosionSpeed={450}
            fallSpeed={3000}
            colors={['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#32CD32', '#FF6347']}
          />
        </View>
      )}

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={handleHomePress}>
            <Home size={22} color="#6ba5a7" strokeWidth={2.5} />
            <Text style={styles.navButtonText}>HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleStatPress}>
            <BarChart3 size={22} color="#6ba5a7" strokeWidth={2.5} />
            <Text style={styles.navButtonText}>STATS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/settings' as any)}>
            <Settings size={22} color="#6ba5a7" strokeWidth={2.5} />
            <Text style={styles.navButtonText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <Pressable style={styles.modalOverlay} onPress={() => {
          // Data is already saved via addUnits, just close modal
          setModalVisible(false);
        }}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  }) : 'Add Drink'}
                </Text>
                {data[selectedDate]?.drinkCount > 0 && (
                  <Text style={styles.modalSubtitle}>
                    {data[selectedDate].drinkCount} {data[selectedDate].drinkCount === 1 ? 'drink' : 'drinks'} • {(Math.ceil(data[selectedDate].units * 10) / 10).toFixed(1)} units
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#5f6368" />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              style={styles.drinkList}
              contentContainerStyle={styles.drinkListContent}
              showsVerticalScrollIndicator={true}
            >
              {displayDrinks.map((drink) => {
                const hasCount = (drinkTapCounts[drink.id] || 0) > 0;
                return (
                <View key={drink.id} style={[styles.drinkRow, hasCount && styles.drinkRowActive]}>
                  <View style={[styles.drinkButton, hasCount && styles.drinkButtonActive]}>
                    {drink.emoji.startsWith('http') ? (
                      <Image source={{ uri: drink.emoji }} style={styles.drinkEmojiImage} />
                    ) : (
                      <Text style={styles.drinkEmoji}>{drink.emoji}</Text>
                    )}
                    <View style={styles.drinkInfo}>
                      <Text style={styles.drinkLabel}>{drink.name}</Text>
                      <Text style={styles.drinkDetails}>
                        {drink.units.toFixed(2)} {drink.units === 1 ? 'unit' : 'units'}
                        {drink.size ? ` • ${drink.size}ml` : ''}
                        {drink.percentage ? ` • ${drink.percentage}%` : ''}
                        {drink.calories ? ` • ${drink.calories} cal` : ''}
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, !(drinkTapCounts[drink.id] > 0) && styles.quantityButtonDisabled]}
                        onPress={() => handleRemoveDrink(drink.units, drink.id, drink)}
                        disabled={!(drinkTapCounts[drink.id] > 0)}
                      >
                        <Minus size={18} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                      <View style={styles.quantityDisplay}>
                        <Text style={styles.quantityText}>{drinkTapCounts[drink.id] || 0}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleAddDrink(drink.units, drink.id, drink)}
                      >
                        <Plus size={18} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.editButtonInline}
                    onPress={() => {
                      maybeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                      deleteDrinkTemplate(drink.id);
                    }}
                  >
                    <Trash2 size={18} color="#ea4335" />
                  </TouchableOpacity>
                </View>
              )})}
            </ScrollView>

            <TouchableOpacity
              testID="add-new-drink-open-manage-drinks"
              style={styles.addNewButton}
              onPress={() => {
                maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
                pendingModalDateRef.current = selectedDate;
                setModalVisible(false);
                router.push('/manage-drinks?edit=new' as any);
              }}
            >
              <Plus size={20} color="#4a90e2" />
              <Text style={styles.addNewButtonText}>Add New Drink</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showFirstTimeGuide}
        onRequestClose={() => setShowFirstTimeGuide(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>Units Tally</Text>
              <Text style={styles.welcomeSubtitle}>Track your drinking habits</Text>
            </View>
            
            <View style={styles.welcomeContent}>
              <View style={styles.instructionRowLarge}>
                <View style={styles.instructionIconBoxLarge}>
                  <Image 
                    source={{ uri: dayCardStars[0] }} 
                    style={styles.instructionStarImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.instructionTextBoxLarge}>
                  <Text style={styles.instructionTitleLarge}>No drinks day</Text>
                  <Text style={styles.instructionDescLarge}>A star marks alcohol-free days</Text>
                </View>
              </View>
              
              <View style={styles.instructionRowLarge}>
                <View style={styles.instructionIconBoxLarge}>
                  <Image 
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/dtr3utcmcysm25b1a57zs' }} 
                    style={styles.instructionDrinkIconLarge}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.instructionTextBoxLarge}>
                  <Text style={styles.instructionTitleLarge}>Log drinks</Text>
                  <Text style={styles.instructionDescLarge}>Tap any day to add your drinks</Text>
                </View>
              </View>
              
              <View style={styles.instructionRowLarge}>
                <View style={styles.instructionIconBoxLarge}>
                  <View style={styles.redXLarge}>
                    <View style={styles.redXLine1Large} />
                    <View style={styles.redXLine2Large} />
                  </View>
                </View>
                <View style={styles.instructionTextBoxLarge}>
                  <Text style={styles.instructionTitleLarge}>Drinking day</Text>
                  <Text style={styles.instructionDescLarge}>An X shows when you have had alcohol</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.welcomeFooter}>
              <Text style={styles.privacyNote}>Your data stays private on device</Text>
              <TouchableOpacity
                style={styles.welcomeButton}
                onPress={() => {
                  maybeHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  markIntroSeen();
                  setShowFirstTimeGuide(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.welcomeButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#202124',
  },
  loadingGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGridIcon: {
    width: 80,
    height: 80,
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 16,
    fontFamily: 'monospace',
  },
  allStatsBox: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  statsRowBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  weekStatCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6ba5a7',
  },
  weekStatValue: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#6ba5a7',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  weekStatLabel: {
    fontSize: 7,
    fontWeight: '800' as const,
    color: '#4a90e2',
    textAlign: 'center',
    lineHeight: 9,
    letterSpacing: 0.3,
  },
  statCircleSmall: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6ba5a7',
  },
  statCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6ba5a7',
  },
  statValueSmall: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: '#6ba5a7',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statValueLarge: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: '#6ba5a7',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statLabelSmall: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#4a90e2',
    textAlign: 'center',
    lineHeight: 11,
    letterSpacing: 0.3,
  },
  statLabelLarge: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#4a90e2',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'web' ? 150 : (Platform.OS === 'android' ? 120 : 100),
    paddingTop: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#202124',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  weekContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCardWrapper: {
    width: '48.5%',
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 10,
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCardWeekend: {
    backgroundColor: '#f9f9f9',
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: '#4a90e2',
    backgroundColor: '#fafafa',
  },
  dayCardPressed: {
    opacity: 0.7,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dayCardDateContainer: {
    gap: 0,
    paddingTop: 14,
  },
  dayCardTodayLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#202124',
    fontFamily: 'monospace',
    lineHeight: 12,
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  dayCardDay: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#202124',
    fontFamily: 'monospace',
    lineHeight: 12,
  },
  dayCardToggle: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardDate: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#5f6368',
    fontFamily: 'monospace',
    marginTop: 1,
    letterSpacing: 0,
    lineHeight: 10,
  },
  dayCardStats: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 4,
  },
  dayCardDrinks: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#4a90e2',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  dayCardUnits: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6ba5a7',
    fontFamily: 'monospace',
  },
  dayCardUnitsGreen: {
    color: '#6ba5a7',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: '#4a90e2',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  weekTotal: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#2e7d32',
    fontFamily: 'monospace',
  },
  weekTotalOver: {
    color: '#d67c73',
  },
  dayBar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dayBarWeekend: {
    backgroundColor: '#f9f9f9',
  },
  dayBarToday: {
    borderWidth: 1.5,
    borderColor: '#4a90e2',
    backgroundColor: '#fafafa',
  },
  dayBarPressed: {
    opacity: 0.7,
  },
  dayBarLeft: {
    paddingRight: 8,
    minWidth: 70,
  },
  dayBarDay: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#202124',
    fontFamily: 'monospace',
  },
  dayBarDate: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#5f6368',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  dayBarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -24,
  },
  dayBarStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  dayBarStatItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayBarStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#4a90e2',
    fontFamily: 'monospace',
  },
  dayBarStatLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#5f6368',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  dayBarUnitsGreen: {
    color: '#6ba5a7',
  },
  dayBarToggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redXContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redXLine1: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '45deg' }],
  },
  redXLine2: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '-45deg' }],
  },

  medallionOuter: {
    width: 20,
    height: 20,
    position: 'absolute',
  },
  medallionInner: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  medallionShine: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  pixelStar: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  starCenter: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#D4AF37',
    top: 8,
    left: 8,
  },
  starPixel: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#D4AF37',
  },
  units: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#202124',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  dateContainer: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#5f6368',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: '#202124',
    fontWeight: '900' as const,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#202124',
  },
  editModalContent: {
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#4a90e2',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
    marginTop: 2,
  },
  drinkList: {
    flex: 1,
  },
  drinkListContent: {
    paddingBottom: 12,
  },
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  drinkRowActive: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: -4,
  },
  drinkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
  },
  drinkButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#4a90e2',
    borderWidth: 2,
  },
  drinkEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#202124',
    marginBottom: 2,
  },
  drinkDetails: {
    fontSize: 11,
    color: '#4a90e2',
    fontWeight: '600' as const,
  },
  editButtonInline: {
    padding: 10,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#4a90e2',
    marginLeft: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#5f6368',
    textAlign: 'center',
  },
  editDrinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    gap: 10,
  },
  deleteButton: {
    padding: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#4a90e2',
    marginLeft: 8,
  },
  editForm: {
    flex: 1,
  },
  editFormContent: {
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#4a90e2',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#000',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
  },
  cancelEditButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  emojiPicker: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  emojiOption: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  emojiOptionSelected: {
    borderColor: '#000',
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
  },
  pixelDrinkImage: {
    width: 46,
    height: 46,
  },
  editDrinkIconButton: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  drinkEmojiImageLarge: {
    width: 40,
    height: 40,
  },
  drinkEmojiLarge: {
    fontSize: 32,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  drinkInfoSection: {
    flex: 1,
    paddingHorizontal: 4,
  },
  manageDrinkControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityButtonManage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#202124',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplayManage: {
    minWidth: 24,
    alignItems: 'center',
  },
  quantityTextManage: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#202124',
    fontFamily: 'monospace',
  },
  deleteButtonManage: {
    padding: 8,
    marginLeft: 4,
  },
  drinkEmojiImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  calculatedUnitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  calculatedUnitsLabel: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: '#000',
  },
  calculatedUnitsValue: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#000',
    fontFamily: 'monospace',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    pointerEvents: 'box-none',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#202124',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    gap: 4,
  },
  navButtonText: {
    fontSize: 9,
    fontWeight: '900' as const,
    color: '#6ba5a7',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  miniCalendarWrapper: {
    width: '48.5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCalendar: {
    flexDirection: 'row',
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  miniCalDay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
  },
  miniCalDayName: {
    fontSize: 7,
    fontWeight: '700' as const,
    color: '#5f6368',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  miniCalDayNum: {
    fontSize: 13,
    fontWeight: '800' as const,
    fontFamily: 'monospace',
  },
  miniCalBlue: {
    color: '#6ba5a7',
  },
  miniCalRed: {
    color: '#ea4335',
  },
  tapCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6ba5a7',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tapCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800' as const,
    fontFamily: 'monospace',
  },
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  welcomeHeader: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400' as const,
  },
  welcomeContent: {
    padding: 20,
    gap: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  instructionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  instructionTextBox: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  instructionDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  instructionDrinkIcon: {
    width: 36,
    height: 36,
  },
  instructionRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  instructionIconBoxLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  instructionTextBoxLarge: {
    flex: 1,
  },
  instructionTitleLarge: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  instructionDescLarge: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionStarImage: {
    width: 48,
    height: 48,
  },
  instructionDrinkIconLarge: {
    width: 48,
    height: 48,
  },
  redXSmall: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redXLine1Small: {
    position: 'absolute',
    width: 16,
    height: 2.5,
    backgroundColor: '#d32f2f',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  redXLine2Small: {
    position: 'absolute',
    width: 16,
    height: 2.5,
    backgroundColor: '#d32f2f',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  welcomeFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  privacyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  welcomeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  customStarImage: {
    width: 38,
    height: 38,
  },
  dayCardDrinkIcon: {
    width: 34,
    height: 34,
  },
  dayCardDrinkEmoji: {
    fontSize: 30,
    lineHeight: 34,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#202124',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#d0d0d0',
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#fff',
    lineHeight: 24,
  },
  quantityDisplay: {
    minWidth: 28,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#202124',
    fontFamily: 'monospace',
  },
  redXLarge: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redXLine1Large: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: '#d32f2f',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  redXLine2Large: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: '#d32f2f',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  horizontalDaysContainer: {
    paddingHorizontal: 0,
  },
  miniCalendarHorizontalWrapper: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
