import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useDrinkTracker } from '@/contexts/DrinkTrackerContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DataPoint {
  label: string;
  value: number;
  fullLabel?: string;
}

export default function StatsScreen() {
  const { weeks, data } = useDrinkTracker();
  const { settings } = useSettings();

  const maybeHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (!settings.hapticsEnabled) return;
    Haptics.impactAsync(style);
  };
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  const screenWidth = Dimensions.get('window').width;
  const graphWidth = screenWidth - 64;

  const handlePrevMonth = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMonthOffset(selectedMonthOffset + 1);
  };

  const handleNextMonth = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (selectedMonthOffset > 0) {
      setSelectedMonthOffset(selectedMonthOffset - 1);
    }
  };

  const handlePrevYear = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(selectedYear + 1);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    Object.keys(data).forEach(dateStr => {
      const year = new Date(dateStr).getFullYear();
      years.add(year);
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const getDominantDrinkIcon = (dateStr: string): string | null => {
    const dayData = data[dateStr];
    if (!dayData || !dayData.drinkCounts) return null;
    
    const drinkCounts = dayData.drinkCounts;
    const drinkIds = Object.keys(drinkCounts).filter(id => drinkCounts[id] > 0);
    
    if (drinkIds.length < 2) return null;
    
    let maxUnits = 0;
    let dominantDrinkId: string | null = null;
    
    drinkIds.forEach(drinkId => {
      const count = drinkCounts[drinkId] || 0;
      const template = settings.drinkTemplates.find(t => t.id === drinkId);
      const units = template ? count * template.units : 0;
      
      if (units > maxUnits) {
        maxUnits = units;
        dominantDrinkId = drinkId;
      }
    });
    
    if (dominantDrinkId) {
      const template = settings.drinkTemplates.find(t => t.id === dominantDrinkId);
      return template?.emoji || null;
    }
    
    return null;
  };

  const getCalendarData = () => {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() - selectedMonthOffset, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days: { date: string; day: number; drank: boolean | null; isFuture: boolean; dominantDrinkIcon: string | null }[] = [];
    
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ date: '', day: 0, drank: null, isFuture: false, dominantDrinkIcon: null });
    }
    
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      const dayData = weeks.flatMap(w => w.days).find(d => d.date === dateStr);
      const storedData = data[dateStr];
      days.push({
        date: dateStr,
        day,
        drank: storedData ? storedData.drank : (dayData ? dayData.drank : null),
        isFuture,
        dominantDrinkIcon: getDominantDrinkIcon(dateStr),
      });
    }
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      month: `${monthNames[month]} ${year}`,
      days,
    };
  };

  const getWeeklyData = (): DataPoint[] => {
    const latestWeek = weeks[0];
    if (!latestWeek) return [];
    
    const dayAbbrev = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sortedDays = [...latestWeek.days].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedDays.map((day, index) => {
      const date = new Date(day.date);
      return {
        label: dayAbbrev[index] || day.day,
        value: Math.ceil(day.units * 10) / 10,
        fullLabel: `${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  };

  const getMonthlyData = (): DataPoint[] => {
    const last4Weeks = weeks.slice(0, 4).reverse();
    return last4Weeks.map((week, index) => {
      const firstDay = week.days[0];
      const lastDay = week.days[6];
      const startDate = new Date(firstDay.date);
      const endDate = new Date(lastDay.date);
      const totalUnits = week.days.reduce((sum, day) => sum + day.units, 0);
      
      return {
        label: `W${index + 1}`,
        value: Math.ceil(totalUnits * 10) / 10,
        fullLabel: `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`,
      };
    });
  };

  const getYearlyData = (): DataPoint[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyUnits: number[] = new Array(12).fill(0);
    
    Object.entries(data).forEach(([dateStr, dayData]) => {
      const date = new Date(dateStr);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        monthlyUnits[month] += dayData.units || 0;
      }
    });
    
    return monthNames.map((name, index) => ({
      label: name,
      value: Math.ceil(monthlyUnits[index] * 10) / 10,
    }));
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();
  const calendarData = getCalendarData();

  const weeklyMax = Math.max(...weeklyData.map(d => d.value), 1);
  const monthlyMax = Math.max(...monthlyData.map(d => d.value), 1);
  const yearlyMax = Math.max(...yearlyData.map(d => d.value), 1);

  const weeklyAvg = weeklyData.length > 0 
    ? weeklyData.reduce((sum, d) => sum + d.value, 0) / weeklyData.length 
    : 0;
  const monthlyAvg = monthlyData.length > 0 
    ? monthlyData.reduce((sum, d) => sum + d.value, 0) / monthlyData.length 
    : 0;
  const yearlyTotal = yearlyData.reduce((sum, d) => sum + d.value, 0);

  const renderNeonGraph = (
    dataPoints: DataPoint[],
    maxValue: number,
    height: number,
    title: string,
    subtitle: string,
    accentColor: string,
    glowColor: string,
    weeklyLimit?: number,
    showValuesInBars?: boolean
  ) => {
    const barWidth = Math.max((graphWidth - 40) / dataPoints.length - 12, 20);
    const normalizedMax = Math.ceil(maxValue / 5) * 5 || 5;
    
    return (
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>{title}</Text>
          <Text style={[styles.graphSubtitle, { color: accentColor }]}>{subtitle}</Text>
        </View>
        <View style={[styles.graphContainer, { height }]}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={styles.gridLine}>
                <Text style={styles.gridLabel}>{normalizedMax - (i * normalizedMax / 4)}</Text>
              </View>
            ))}
          </View>



          <View style={styles.barsContainer}>
            {dataPoints.map((point, index) => {
              const barHeight = (point.value / normalizedMax) * (height - 40);
              const dailyLimit = typeof weeklyLimit === 'number' && weeklyLimit > 0 ? weeklyLimit / Math.max(1, dataPoints.length) : undefined;
              const isOverLimit = typeof dailyLimit === 'number' ? point.value > dailyLimit : false;

              return (
                <View key={index} style={[styles.barWrapper, { marginHorizontal: 4 }]}>
                  <View style={styles.barColumn}>
                    {chartType === 'bar' ? (
                      <View
                        style={[
                          styles.neonBar,
                          {
                            height: Math.max(barHeight, 2),
                            width: barWidth,
                            backgroundColor: isOverLimit ? '#ff4757' : accentColor,
                            shadowColor: isOverLimit ? '#ff4757' : glowColor,
                          },
                        ]}
                      >
                        <View style={[styles.barGlow, { backgroundColor: isOverLimit ? '#ff4757' : glowColor }]} />
                        {showValuesInBars && point.value > 0 && barHeight > 20 && (
                          <Text style={styles.barValueText}>{point.value}</Text>
                        )}
                      </View>
                    ) : (
                      <View style={styles.linePointContainer}>
                        <View
                          style={[
                            styles.linePoint,
                            {
                              bottom: Math.max(barHeight, 2),
                              backgroundColor: isOverLimit ? '#ff4757' : accentColor,
                              shadowColor: isOverLimit ? '#ff4757' : glowColor,
                            },
                          ]}
                        />
                        {index < dataPoints.length - 1 && (() => {
                          const nextHeight = (dataPoints[index + 1].value / normalizedMax) * (height - 40);
                          const heightDiff = nextHeight - barHeight;
                          const horizontalDistance = (graphWidth - 40) / dataPoints.length;
                          const angle = Math.atan2(heightDiff, horizontalDistance) * (180 / Math.PI);
                          const lineLength = Math.sqrt(horizontalDistance * horizontalDistance + heightDiff * heightDiff);

                          return (
                            <View
                              style={[
                                styles.lineConnector,
                                {
                                  bottom: Math.max(barHeight, 2) + 3,
                                  left: 3,
                                  width: lineLength,
                                  backgroundColor: isOverLimit ? '#ff4757' : accentColor,
                                  transform: [{ rotate: `${angle}deg` }],
                                },
                              ]}
                            />
                          );
                        })()}
                      </View>
                    )}
                  </View>
                  <Text style={styles.barLabel}>{point.label}</Text>
                  {point.fullLabel && (
                    <Text style={styles.barSubLabel}>{point.fullLabel}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
            <ChevronLeft size={20} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>{calendarData.month}</Text>
          <TouchableOpacity 
            onPress={handleNextMonth} 
            style={[styles.monthButton, selectedMonthOffset === 0 && styles.monthButtonDisabled]}
            disabled={selectedMonthOffset === 0}
          >
            <ChevronRight size={20} color={selectedMonthOffset === 0 ? '#444' : '#fff'} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarWeekDays}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {calendarData.days.map((dayData, index) => (
            <View key={index} style={styles.calendarDay}>
              {dayData.day > 0 && (
                <>
                  <Text style={styles.calendarDayNumber}>{dayData.day}</Text>
                  {!dayData.isFuture && dayData.drank === true ? (
                    dayData.dominantDrinkIcon ? (
                      <View style={styles.calendarDrinkIcon}>
                        <Image 
                          source={{ uri: dayData.dominantDrinkIcon }} 
                          style={styles.calendarDrinkIconImage}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View style={styles.calendarX}>
                        <View style={styles.calendarXLine1} />
                        <View style={styles.calendarXLine2} />
                      </View>
                    )
                  ) : !dayData.isFuture && dayData.drank === false ? (
                    <View style={styles.calendarStar}>
                      <Text style={styles.calendarStarText}>★</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.graphsSection}>
        <Text style={styles.sectionTitle}>Units Over Time</Text>
        
        {renderNeonGraph(
          weeklyData,
          weeklyMax,
          160,
          'This Week',
          `Avg: ${weeklyAvg.toFixed(1)} units/day`,
          '#00d4aa',
          '#00ffcc',
          14,
          true
        )}
        
        {renderNeonGraph(
          monthlyData,
          monthlyMax,
          160,
          'Last 4 Weeks',
          `Avg: ${monthlyAvg.toFixed(1)} units/week`,
          '#00b4d8',
          '#00e5ff',
          14,
          true
        )}
        
        <View style={styles.yearGraphWrapper}>
          <View style={styles.yearSelector}>
            <TouchableOpacity 
              onPress={handlePrevYear} 
              style={styles.yearButton}
              disabled={!availableYears.includes(selectedYear - 1)}
            >
              <ChevronLeft 
                size={18} 
                color={availableYears.includes(selectedYear - 1) ? '#fff' : '#333'} 
                strokeWidth={3} 
              />
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity 
              onPress={handleNextYear} 
              style={styles.yearButton}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight 
                size={18} 
                color={selectedYear >= new Date().getFullYear() ? '#333' : '#fff'} 
                strokeWidth={3} 
              />
            </TouchableOpacity>
          </View>
          {renderNeonGraph(
            yearlyData,
            yearlyMax,
            180,
            `${selectedYear} Overview`,
            `Total: ${yearlyTotal.toFixed(1)} units`,
            '#a855f7',
            '#c084fc'
          )}
        </View>
      </View>

      <View style={styles.chartTypeToggle}>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'bar' && styles.chartTypeButtonActive]}
          onPress={() => {
            maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
            setChartType('bar');
          }}
        >
          <Text style={[styles.chartTypeText, chartType === 'bar' && styles.chartTypeTextActive]}>Bar Chart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
          onPress={() => {
            maybeHaptic(Haptics.ImpactFeedbackStyle.Light);
            setChartType('line');
          }}
        >
          <Text style={[styles.chartTypeText, chartType === 'line' && styles.chartTypeTextActive]}>Line Chart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00d4aa' }]} />
          <Text style={styles.legendText}>Within limits</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff4757' }]} />
          <Text style={styles.legendText}>Over limits</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  calendarSection: {
    backgroundColor: '#0d1117',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00d4aa40',
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111820',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4aa50',
  },
  monthButtonDisabled: {
    backgroundColor: '#0d1117',
    borderColor: '#1a2332',
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00ffcc',
    letterSpacing: 0.5,
    textShadowColor: '#00ffcc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#00d4aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.285%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 3,
  },
  calendarDayNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#e0e0e0',
    marginBottom: 2,
  },
  calendarX: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarXLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#ff4757',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  calendarXLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#ff4757',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  calendarStar: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarStarText: {
    fontSize: 13,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  calendarDrinkIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDrinkIconImage: {
    width: 20,
    height: 20,
  },
  graphsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  graphCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  graphSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  graphContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    height: 1,
  },
  gridLabel: {
    position: 'absolute',
    left: -30,
    fontSize: 10,
    color: '#444',
    width: 25,
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingLeft: 35,
    paddingBottom: 30,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barColumn: {
    justifyContent: 'flex-end',
  },
  neonBar: {
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  barGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    fontWeight: '500' as const,
  },
  barSubLabel: {
    fontSize: 8,
    color: '#444',
    marginTop: 2,
  },
  yearGraphWrapper: {
    marginBottom: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  yearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  yearText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#a855f7',
    minWidth: 60,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500' as const,
  },
  chartTypeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  chartTypeButtonActive: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  chartTypeTextActive: {
    color: '#0a0a0a',
  },
  linePointContainer: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
  },
  linePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  lineConnector: {
    position: 'absolute',
    height: 1.5,
    left: 3,
    borderRadius: 1,
    transformOrigin: '0% 50%',
  },
  barValueText: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#0a0a0a',
  },
});
