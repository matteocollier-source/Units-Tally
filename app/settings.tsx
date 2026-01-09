import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  Pressable,
  Switch,
  TextInput,
  Image,
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import { 
  Wine, 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  Heart, 
  Smartphone,
  Info,
} from 'lucide-react-native';
import { Stack } from 'expo-router';

const dayCardStars = [
  'https://r2-pub.rork.com/generated-images/cde08da4-d70d-4899-9eac-7ffb0ea71de5.png',
];

export default function SettingsScreen() {
  const {
    settings,
    updateWeekStartsOnSunday,
    updateHapticsEnabled,
    updateIndicatorType,
    updateLayoutType,
  } = useSettings();
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('1');

  const triggerHaptic = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDonate = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDonateModal(true);
  };

  const handleConfirmDonate = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const amount = parseFloat(donationAmount) || 1;
    Linking.openURL(`https://www.paypal.com/paypalme/yourhandle/${amount}`);
    setShowDonateModal(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerStyle: { backgroundColor: '#F2F2F7' },
        headerShadowVisible: false,
        headerLargeTitle: true,
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* VISUAL PREFERENCES */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Appearance</Text>
        </View>
        
        <View style={styles.sectionContainer}>
          {/* Day Card Layout */}
          <View style={styles.cardRow}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Day Card Layout</Text>
              <Text style={styles.cardSubtitle}>Choose how day cards are displayed</Text>
            </View>
            <View style={styles.selectorContainer}>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.layoutType === 'vertical' && styles.selectorOptionActive]}
                onPress={() => { triggerHaptic(); updateLayoutType('vertical'); }}
              >
                <View style={[styles.layoutIconVertical, settings.layoutType === 'vertical' && styles.layoutIconActive]} />
                <Text style={[styles.selectorLabel, settings.layoutType === 'vertical' && styles.selectorLabelActive]}>Vertical</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.layoutType === 'horizontal' && styles.selectorOptionActive]}
                onPress={() => { triggerHaptic(); updateLayoutType('horizontal'); }}
              >
                <View style={[styles.layoutIconHorizontal, settings.layoutType === 'horizontal' && styles.layoutIconActive]} />
                <Text style={[styles.selectorLabel, settings.layoutType === 'horizontal' && styles.selectorLabelActive]}>Horizontal</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Drink Indicator */}
          <View style={styles.cardRow}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Drink Indicator</Text>
              <Text style={styles.cardSubtitle}>Show drink icon or red X on drinking days</Text>
            </View>
            <View style={styles.selectorContainer}>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.indicatorType === 'emoji' && styles.selectorOptionActive]}
                onPress={() => { triggerHaptic(); updateIndicatorType('emoji'); }}
              >
                <Text style={[styles.selectorEmoji, settings.indicatorType === 'emoji' && styles.selectorEmojiActive]}>🍻</Text>
                <Text style={[styles.selectorLabel, settings.indicatorType === 'emoji' && styles.selectorLabelActive]}>Icon</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.indicatorType === 'x' && styles.selectorOptionActive]}
                onPress={() => { triggerHaptic(); updateIndicatorType('x'); }}
              >
                <View style={styles.selectorXContainer}>
                  <View style={[styles.selectorXLine1, settings.indicatorType === 'x' && styles.selectorXLineActive]} />
                  <View style={[styles.selectorXLine2, settings.indicatorType === 'x' && styles.selectorXLineActive]} />
                </View>
                <Text style={[styles.selectorLabel, settings.indicatorType === 'x' && styles.selectorLabelActive]}>Red X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BEHAVIOR */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Preferences</Text>
        </View>

        <View style={styles.sectionContainer}>
          {/* Week Start */}
          <View style={styles.rowItem}>
            <View style={styles.rowContent}>
              <View style={styles.iconBox}>
                <Calendar size={20} color="#000" />
              </View>
              <Text style={styles.rowTitle}>Week Starts On</Text>
            </View>
            <View style={styles.toggleContainer}>
               <TouchableOpacity 
                style={[styles.toggleBtn, settings.weekStartsOnSunday && styles.toggleBtnActive]}
                onPress={() => { triggerHaptic(); updateWeekStartsOnSunday(true); }}
               >
                 <Text style={[styles.toggleBtnText, settings.weekStartsOnSunday && styles.toggleBtnTextActive]}>Sun</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                style={[styles.toggleBtn, !settings.weekStartsOnSunday && styles.toggleBtnActive]}
                onPress={() => { triggerHaptic(); updateWeekStartsOnSunday(false); }}
               >
                 <Text style={[styles.toggleBtnText, !settings.weekStartsOnSunday && styles.toggleBtnTextActive]}>Mon</Text>
               </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Haptics */}
          <View style={styles.rowItem}>
             <View style={styles.rowContent}>
              <View style={styles.iconBox}>
                <Smartphone size={20} color="#000" />
              </View>
              <Text style={styles.rowTitle}>Haptic Feedback</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(val) => {
                if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateHapticsEnabled(val);
              }}
              trackColor={{ false: '#e9e9ea', true: '#000' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Support</Text>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.rowItem}
            onPress={() => { triggerHaptic(); setShowInstructions(true); }}
          >
             <View style={styles.rowContent}>
              <View style={styles.iconBox}>
                <Info size={20} color="#000" />
              </View>
              <Text style={styles.rowTitle}>How to use</Text>
            </View>
            <ChevronRight size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.rowItem}
            onPress={handleDonate}
          >
             <View style={styles.rowContent}>
              <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                <Heart size={20} color="#F44336" fill="#F44336" />
              </View>
              <Text style={styles.rowTitle}>Donate</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>£1.00</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Drink Tracker v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>

      {/* HELP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInstructions}
        onRequestClose={() => setShowInstructions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowInstructions(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.introHeader}>
              <View style={styles.introLogoContainer}>
                <Wine size={32} color="#1a1a1a" strokeWidth={1.5} />
              </View>
              <Text style={styles.introAppName}>Drink Tracker</Text>
              <Text style={styles.introTagline}>Track mindfully. Drink responsibly.</Text>
            </View>

            <View style={styles.introStepsContainer}>
              <View style={styles.introStepCard}>
                <View style={styles.introStepNumberContainer}>
                  <Text style={styles.introStepNumber}>1</Text>
                </View>
                <View style={styles.introStepContent}>
                  <View style={styles.introStepHeader}>
                    <Image 
                      source={{ uri: dayCardStars[0] }} 
                      style={styles.introStepIconImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.introStepTitle}>Drink-Free Days</Text>
                  </View>
                  <Text style={styles.introStepDescription}>
                    A gold star marks days without alcohol
                  </Text>
                </View>
              </View>

              <View style={styles.introStepCard}>
                <View style={styles.introStepNumberContainer}>
                  <Text style={styles.introStepNumber}>2</Text>
                </View>
                <View style={styles.introStepContent}>
                  <View style={styles.introStepHeader}>
                    <Wine size={20} color="#1a1a1a" strokeWidth={1.5} />
                    <Text style={styles.introStepTitle}>Log Drinks</Text>
                  </View>
                  <Text style={styles.introStepDescription}>
                    Tap any day card to add or edit your drinks
                  </Text>
                </View>
              </View>

              <View style={styles.introStepCard}>
                <View style={styles.introStepNumberContainer}>
                  <Text style={styles.introStepNumber}>3</Text>
                </View>
                <View style={styles.introStepContent}>
                  <View style={styles.introStepHeader}>
                    <View style={styles.introXIndicator}>
                      <View style={styles.introXLine1} />
                      <View style={styles.introXLine2} />
                    </View>
                    <Text style={styles.introStepTitle}>Drinking Days</Text>
                  </View>
                  <Text style={styles.introStepDescription}>
                    Simple quick way to log you&apos;ve had alcohol that day tap the star to the X
                  </Text>
                </View>
              </View>

              <View style={styles.introStepCard}>
                <View style={styles.introStepNumberContainer}>
                  <Text style={styles.introStepNumber}>4</Text>
                </View>
                <View style={styles.introStepContent}>
                  <View style={styles.introStepHeader}>
                    <BarChart3 size={20} color="#1a1a1a" strokeWidth={1.5} />
                    <Text style={styles.introStepTitle}>View Progress</Text>
                  </View>
                  <Text style={styles.introStepDescription}>
                    Check your stats to see patterns over time
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.introFooter}>
              <TouchableOpacity
                style={styles.introButton}
                onPress={() => setShowInstructions(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.introButtonText}>Got it</Text>
              </TouchableOpacity>
              <Text style={styles.introFooterNote}>
                Your data stays private on your device
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* DONATE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDonateModal}
        onRequestClose={() => setShowDonateModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDonateModal(false)}>
          <Pressable style={styles.donateModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.donateModalTitle}>Support the Creator</Text>
            <Text style={styles.donateModalSubtitle}>Enter the amount you&apos;d like to donate</Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.amountInput}
                value={donationAmount}
                onChangeText={setDonationAmount}
                keyboardType="decimal-pad"
                placeholder="1.00"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.quickAmountButtons}>
              {['1', '3', '5', '10'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    donationAmount === amount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => {
                    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDonationAmount(amount);
                  }}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      donationAmount === amount && styles.quickAmountTextActive,
                    ]}
                  >
                    £{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmDonateButton}
              onPress={handleConfirmDonate}
            >
              <Text style={styles.confirmDonateText}>Donate £{parseFloat(donationAmount) || 1}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelDonateButton}
              onPress={() => setShowDonateModal(false)}
            >
              <Text style={styles.cancelDonateText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardRow: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorOption: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorOptionActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectorLabelActive: {
    color: '#FFFFFF',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 60, // Align with text start
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9E9EA',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#636366',
  },
  toggleBtnTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#E9E9EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },

  /* MODAL STYLES (MATCHING INTRO) */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  introHeader: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  introLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  introAppName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  introTagline: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },
  introStepsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  introStepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  introStepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  introStepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  introStepContent: {
    flex: 1,
  },
  introStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  introStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  introStepDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    paddingLeft: 28,
  },
  introXIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introXLine1: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '45deg' }],
  },
  introXLine2: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '-45deg' }],
  },
  introStepIconImage: {
    width: 20,
    height: 20,
  },
  introFooter: {
    gap: 12,
  },
  introButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  introButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  introFooterNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  /* DONATE MODAL */
  donateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  donateModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  donateModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    padding: 0,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#1a1a1a',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  quickAmountTextActive: {
    color: '#1a1a1a',
  },
  confirmDonateButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmDonateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelDonateButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelDonateText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  selectorEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  selectorEmojiActive: {
    fontSize: 20,
  },
  selectorXContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectorXLine1: {
    position: 'absolute' as const,
    width: 14,
    height: 2,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '45deg' }],
  },
  selectorXLine2: {
    position: 'absolute' as const,
    width: 14,
    height: 2,
    backgroundColor: '#d32f2f',
    transform: [{ rotate: '-45deg' }],
  },
  selectorXLineActive: {
    backgroundColor: '#FFFFFF',
  },
  layoutIconVertical: {
    width: 18,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 4,
  },
  layoutIconHorizontal: {
    width: 24,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 4,
  },
  layoutIconActive: {
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
});
