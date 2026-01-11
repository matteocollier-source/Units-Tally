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
  TextInput,
  Image,
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Wine, 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  Heart, 
  Info,
  Sparkles,
  Layout,
  Grid3X3,
} from 'lucide-react-native';
import { Stack } from 'expo-router';

const dayCardStars = [
  'https://r2-pub.rork.com/generated-images/cde08da4-d70d-4899-9eac-7ffb0ea71de5.png',
];

export default function SettingsScreen() {
  const {
    settings,
    updateWeekStartsOnSunday,
    updateIndicatorType,
    updateLayoutType,
  } = useSettings();
  
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('1');

  const handleDonate = () => {
    setShowDonateModal(true);
  };

  const handleConfirmDonate = () => {
    const amount = parseFloat(donationAmount) || 1;
    Linking.openURL(`https://www.paypal.com/paypalme/yourhandle/${amount}`);
    setShowDonateModal(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* VISUAL PREFERENCES */}
        <View style={styles.sectionHeaderContainer}>
          <Layout size={14} color="#666" />
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
                onPress={() => updateLayoutType('vertical')}
                activeOpacity={0.7}
              >
                {settings.layoutType === 'vertical' && (
                  <LinearGradient
                    colors={['#2a2a2a', '#1a1a1a']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <View style={[styles.layoutIconVertical, settings.layoutType === 'vertical' && styles.layoutIconActive]} />
                <Text style={[styles.selectorLabel, settings.layoutType === 'vertical' && styles.selectorLabelActive]}>Vertical</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.layoutType === 'horizontal' && styles.selectorOptionActive]}
                onPress={() => updateLayoutType('horizontal')}
                activeOpacity={0.7}
              >
                {settings.layoutType === 'horizontal' && (
                  <LinearGradient
                    colors={['#2a2a2a', '#1a1a1a']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
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
                onPress={() => updateIndicatorType('emoji')}
                activeOpacity={0.7}
              >
                {settings.indicatorType === 'emoji' && (
                  <LinearGradient
                    colors={['#2a2a2a', '#1a1a1a']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.selectorEmoji, settings.indicatorType === 'emoji' && styles.selectorEmojiActive]}>🍻</Text>
                <Text style={[styles.selectorLabel, settings.indicatorType === 'emoji' && styles.selectorLabelActive]}>Icon</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectorOption, settings.indicatorType === 'x' && styles.selectorOptionActive]}
                onPress={() => updateIndicatorType('x')}
                activeOpacity={0.7}
              >
                {settings.indicatorType === 'x' && (
                  <LinearGradient
                    colors={['#2a2a2a', '#1a1a1a']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
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
          <Grid3X3 size={14} color="#666" />
          <Text style={styles.sectionHeader}>Preferences</Text>
        </View>

        <View style={styles.sectionContainer}>
          {/* Week Start */}
          <View style={styles.rowItem}>
            <View style={styles.rowContent}>
              <LinearGradient
                colors={['#1e3a5f', '#0d2137']}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Calendar size={18} color="#5ba3e0" />
              </LinearGradient>
              <View>
                <Text style={styles.rowTitle}>Week Starts On</Text>
                <Text style={styles.rowSubtitle}>First day of your week</Text>
              </View>
            </View>
            <View style={styles.toggleContainer}>
               <TouchableOpacity 
                style={[styles.toggleBtn, settings.weekStartsOnSunday && styles.toggleBtnActive]}
                onPress={() => updateWeekStartsOnSunday(true)}
                activeOpacity={0.7}
               >
                 <Text style={[styles.toggleBtnText, settings.weekStartsOnSunday && styles.toggleBtnTextActive]}>Sun</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                style={[styles.toggleBtn, !settings.weekStartsOnSunday && styles.toggleBtnActive]}
                onPress={() => updateWeekStartsOnSunday(false)}
                activeOpacity={0.7}
               >
                 <Text style={[styles.toggleBtnText, !settings.weekStartsOnSunday && styles.toggleBtnTextActive]}>Mon</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.sectionHeaderContainer}>
          <Sparkles size={14} color="#666" />
          <Text style={styles.sectionHeader}>Support</Text>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.rowItem}
            onPress={() => setShowInstructions(true)}
            activeOpacity={0.7}
          >
             <View style={styles.rowContent}>
              <LinearGradient
                colors={['#2d2d2d', '#1a1a1a']}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Info size={18} color="#888" />
              </LinearGradient>
              <View>
                <Text style={styles.rowTitle}>How to use</Text>
                <Text style={styles.rowSubtitle}>Learn the basics</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#444" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.rowItem}
            onPress={handleDonate}
            activeOpacity={0.7}
          >
             <View style={styles.rowContent}>
              <LinearGradient
                colors={['#4a1c2e', '#2d1119']}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Heart size={18} color="#e85a7e" fill="#e85a7e" />
              </LinearGradient>
              <View>
                <Text style={styles.rowTitle}>Donate</Text>
                <Text style={styles.rowSubtitle}>Support development</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>£1.00</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>Drink Tracker v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️</Text>
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
                <Wine size={32} color="#fff" strokeWidth={1.5} />
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
                    <Wine size={20} color="#fff" strokeWidth={1.5} />
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
                    <BarChart3 size={20} color="#fff" strokeWidth={1.5} />
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
            <View style={styles.donateIconContainer}>
              <Heart size={32} color="#e85a7e" fill="#e85a7e" />
            </View>
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
                placeholderTextColor="#555"
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
                  onPress={() => setDonationAmount(amount)}
                  activeOpacity={0.7}
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
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#e85a7e', '#c44569']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.confirmDonateText}>Donate £{parseFloat(donationAmount) || 1}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelDonateButton}
              onPress={() => setShowDonateModal(false)}
              activeOpacity={0.7}
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
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContainer: {
    backgroundColor: '#141414',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  cardRow: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorOption: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  selectorOptionActive: {
    borderColor: '#444',
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  selectorLabelActive: {
    color: '#fff',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    minHeight: 64,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#222',
    marginLeft: 66,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#333',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#1f2d1f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a4a2a',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6fcf6f',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 6,
  },
  footerLine: {
    width: 40,
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#333',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  introHeader: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  introLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  introAppName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  introTagline: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  introStepsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  introStepCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  introStepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  introStepNumber: {
    fontSize: 12,
    fontWeight: '700',
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
    color: '#fff',
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
    backgroundColor: '#e85a7e',
    transform: [{ rotate: '45deg' }],
  },
  introXLine2: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#e85a7e',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  introButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  introFooterNote: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },

  /* DONATE MODAL */
  donateModalContent: {
    backgroundColor: '#141414',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  donateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2d1119',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  donateModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
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
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    width: '100%',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    padding: 0,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    width: '100%',
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  confirmDonateButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
  },
  confirmDonateText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelDonateButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelDonateText: {
    color: '#666',
    fontSize: 15,
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
    backgroundColor: '#e85a7e',
    transform: [{ rotate: '45deg' }],
  },
  selectorXLine2: {
    position: 'absolute' as const,
    width: 14,
    height: 2,
    backgroundColor: '#e85a7e',
    transform: [{ rotate: '-45deg' }],
  },
  selectorXLineActive: {
    backgroundColor: '#fff',
  },
  layoutIconVertical: {
    width: 16,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginBottom: 6,
  },
  layoutIconHorizontal: {
    width: 22,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginBottom: 6,
  },
  layoutIconActive: {
    borderColor: '#fff',
  },
});
