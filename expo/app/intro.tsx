import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import { Star, Wine, BarChart3, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function IntroScreen() {
  const router = useRouter();
  const { markIntroSeen } = useSettings();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });
      return () => task.cancel();
    }
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markIntroSeen();
    router.replace('/' as any);
  };

  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingState, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.logoContainer}>
          <Wine size={32} color="#1a1a1a" strokeWidth={1.5} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Wine size={32} color="#1a1a1a" strokeWidth={1.5} />
        </View>
        <Text style={styles.appName}>Units Tally</Text>
        <Text style={styles.tagline}>Track mindfully. Drink responsibly.</Text>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Star size={20} fill="#FFD700" color="#E5A800" strokeWidth={1.5} />
              <Text style={styles.stepTitle}>Sober Days</Text>
            </View>
            <Text style={styles.stepDescription}>
              A gold star marks days without alcohol
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Calendar size={20} color="#1a1a1a" strokeWidth={1.5} />
              <Text style={styles.stepTitle}>Log Drinks</Text>
            </View>
            <Text style={styles.stepDescription}>
              Tap any day card to add or edit your drinks
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.xIndicator}>
                <View style={styles.xLine1} />
                <View style={styles.xLine2} />
              </View>
              <Text style={styles.stepTitle}>Drinking Days</Text>
            </View>
            <Text style={styles.stepDescription}>
              Quick way to log had alcohol that day: tap star to change to the <View style={styles.inlineXContainer}><View style={styles.inlineXLine1} /><View style={styles.inlineXLine2} /></View>
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <BarChart3 size={20} color="#1a1a1a" strokeWidth={1.5} />
              <Text style={styles.stepTitle}>View Progress</Text>
            </View>
            <Text style={styles.stepDescription}>
              Check your stats to see patterns over time
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Your data stays private on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
  },
  loadingState: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: 'Seville',
  },
  tagline: {
    fontSize: 15,
    color: '#888',
    fontWeight: '400' as const,
  },
  stepsContainer: {
    flex: 1,
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
    }),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 28,
  },
  xIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#D4A574',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#D4A574',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  inlineXContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -2,
  },
  inlineXLine1: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#C75050',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  inlineXLine2: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#C75050',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  footer: {
    paddingVertical: 32,
    gap: 16,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
