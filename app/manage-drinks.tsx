import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings, DrinkTemplate } from '@/contexts/SettingsContext';
import { Plus, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ManageDrinksScreen() {
  const { settings, updateDrinkTemplate, addDrinkTemplate, deleteDrinkTemplate } = useSettings();
  const { editId } = useLocalSearchParams<{ edit?: string; editId?: string }>();
  const router = useRouter();
  
  const getInitialDrink = (): DrinkTemplate => {
    if (editId) {
      const existingDrink = settings.drinkTemplates.find(t => t.id === editId);
      if (existingDrink) {
        return { ...existingDrink };
      }
    }
    const sizeMl = 250;
    const percentage = 13.5;
    const calculatedUnits = (sizeMl * percentage) / 1000;
    return {
      id: '',
      name: 'Wine (large glass)',
      emoji: 'https://r2-pub.rork.com/generated-images/0cc54217-20c0-4c7b-89f2-259fcaff0110.png',
      size: String(sizeMl),
      percentage,
      units: Math.round(calculatedUnits * 100) / 100,
    };
  };

  const [editingDrink, setEditingDrink] = useState<DrinkTemplate>(getInitialDrink);
  const isEditing = Boolean(editId);

  const maybeHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (!settings.hapticsEnabled) return;
    Haptics.impactAsync(style);
  };

  const handleSaveDrink = () => {
    if (editingDrink.id) {
      updateDrinkTemplate(editingDrink);
    } else {
      const { id, ...drinkWithoutId } = editingDrink;
      addDrinkTemplate(drinkWithoutId);
    }
    maybeHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleDeleteDrink = () => {
    if (editingDrink.id) {
      maybeHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      deleteDrinkTemplate(editingDrink.id);
      router.back();
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#4a90e2" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Drink' : 'New Drink'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.editForm}
        contentContainerStyle={styles.editFormContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={editingDrink.name}
          onChangeText={(text) => {
            const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
            setEditingDrink({ ...editingDrink, name: capitalized });
          }}
          placeholder="e.g. beer or Moretti, wine or Shiraz, your choice"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Drink Icon</Text>
        <View style={styles.emojiPickerWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.emojiPicker}
            contentContainerStyle={styles.emojiPickerContent}
            nestedScrollEnabled
            directionalLockEnabled
            alwaysBounceHorizontal={false}
          >
            {[
              { uri: 'https://r2-pub.rork.com/generated-images/fe044876-cab6-4726-a476-ce85fbec954b.png', id: 'beer', name: 'Beer (Pint)', size: '568', percentage: 5 },
              { uri: 'https://r2-pub.rork.com/generated-images/0edd4d79-3c60-441b-96f9-dc2f38f7870e.png', id: 'beer-large', name: 'Beer (Large Bottle)', size: '660', percentage: 5 },
              { uri: 'https://r2-pub.rork.com/generated-images/5b0f56f5-ad3f-47cd-96a8-69880af9f38b.png', id: 'beer-small', name: 'Beer (Small Bottle)', size: '330', percentage: 5 },
              { uri: 'https://r2-pub.rork.com/generated-images/0cc54217-20c0-4c7b-89f2-259fcaff0110.png', id: 'wine-glass', name: 'Wine (large glass)', size: '250', percentage: 13.5 },
              { uri: 'https://r2-pub.rork.com/generated-images/d4add219-6b92-4a02-a755-019b794a0c3a.png', id: 'wine-bottle', name: 'Wine (Bottle)', size: '750', percentage: 13.5 },
              { uri: 'https://r2-pub.rork.com/generated-images/621b4703-f453-4156-9b65-4b6b361d1fa6.png', id: 'spirits', name: 'Spirits', size: '50', percentage: 40 },
              { uri: 'https://r2-pub.rork.com/generated-images/5a4c3b1a-7d2f-4c36-92bc-48c8a2cc14b9.png', id: 'cocktail', name: 'Cocktail', size: '200', percentage: 15 },
              { uri: 'https://r2-pub.rork.com/generated-images/ed6b1be5-43de-4146-9240-abfd8fdd6aa0.png', id: 'shot', name: 'Shot', size: '35', percentage: 40 },
              { uri: 'https://r2-pub.rork.com/generated-images/bd29c4f2-d6e0-438b-8c75-08f896128d98.png', id: 'tropical', name: 'Tropical', size: '250', percentage: 10 },
              { uri: 'https://r2-pub.rork.com/generated-images/custom-drink.png', id: 'custom', name: 'Custom', size: '250', percentage: 5 },
            ].map((item) => {
              const isDuplicate = !editingDrink.id && item.id !== 'custom' &&
                settings.drinkTemplates.some(t => t.name === item.name);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.emojiOption,
                    editingDrink.emoji === item.uri && styles.emojiOptionSelected,
                    isDuplicate && styles.emojiOptionDisabled,
                  ]}
                  disabled={isDuplicate}
                  onPress={() => {
                    const calculatedUnits = (parseFloat(item.size) * item.percentage) / 1000;
                    setEditingDrink({
                      ...editingDrink,
                      emoji: item.uri,
                      name: item.id === 'custom' ? editingDrink.name : item.name,
                      size: item.size,
                      percentage: item.percentage,
                      units: Math.round(calculatedUnits * 100) / 100
                    });
                  }}
                >
                  {item.id === 'custom' ? (
                    <View style={styles.customDrinkIconLarge}>
                      <Plus size={28} color="#000" />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.pixelDrinkImageLarge}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.emojiOptionLabel} numberOfLines={1}>
                    {item.id === 'custom' ? 'Custom' : item.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Text style={styles.inputLabel}>Amount (ml)</Text>
        <TextInput
          style={styles.input}
          value={editingDrink.size || ''}
          onChangeText={(text) => {
            const amount = parseFloat(text) || 0;
            const percentage = editingDrink.percentage || 0;
            const calculatedUnits = (amount * percentage) / 1000;
            setEditingDrink({ ...editingDrink, size: text, units: Math.round(calculatedUnits * 100) / 100 });
          }}
          keyboardType="decimal-pad"
          placeholder="330"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.inputLabel}>Alcohol %</Text>
        <TextInput
          style={styles.input}
          value={editingDrink.percentage?.toString() || ''}
          onChangeText={(text) => {
            const percentage = parseFloat(text) || 0;
            const amount = parseFloat(editingDrink.size || '0') || 0;
            const calculatedUnits = (amount * percentage) / 1000;
            setEditingDrink({ ...editingDrink, percentage, units: Math.round(calculatedUnits * 100) / 100 });
          }}
          keyboardType="decimal-pad"
          placeholder="5"
          placeholderTextColor="#bbb"
        />

        <View style={styles.calculatedUnitsContainer}>
          <Text style={styles.calculatedUnitsLabel}>Calculated Units:</Text>
          <Text style={styles.calculatedUnitsValue}>{editingDrink.units.toFixed(2)}</Text>
        </View>

        <Text style={styles.inputLabel}>Calories (optional)</Text>
        <TextInput
          style={styles.input}
          value={editingDrink.calories?.toString() || ''}
          onChangeText={(text) => {
            setEditingDrink({ ...editingDrink, calories: parseInt(text) || undefined });
          }}
          keyboardType="number-pad"
          placeholder="150"
          placeholderTextColor="#bbb"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveDrink}
        >
          <Text style={styles.saveButtonText}>Save Drink</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButtonLarge}
            onPress={handleDeleteDrink}
          >
            <Trash2 size={20} color="#ea4335" />
            <Text style={styles.deleteButtonText}>Delete Drink</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelEditButton}
          onPress={handleBack}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#4a90e2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#202124',
  },
  headerSpacer: {
    width: 60,
  },
  editForm: {
    flex: 1,
    padding: 16,
  },
  editFormContent: {
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#4a90e2',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#000',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
  },
  deleteButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#ea4335',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#ea4335',
  },
  cancelEditButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#5f6368',
    textAlign: 'center',
  },
  emojiPickerWrapper: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  emojiPicker: {
    minHeight: 130,
    maxHeight: 130,
  },
  emojiPickerContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'flex-start',
  },
  emojiOption: {
    width: 90,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingVertical: 6,
  },
  emojiOptionSelected: {
    borderColor: '#4a90e2',
    backgroundColor: '#e8f4fd',
    borderWidth: 3,
  },
  emojiOptionDisabled: {
    opacity: 0.35,
    backgroundColor: '#f0f0f0',
  },
  emojiOptionLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  pixelDrinkImageLarge: {
    width: 62,
    height: 62,
  },
  customDrinkIconLarge: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  calculatedUnitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
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
});
