/**
 * Mezr App - Category Bar Component
 * Horizontal scrolling category tabs
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { CATEGORIES } from '../constants/modules';
import type { CategoryId } from '../types';

export const CategoryBar: React.FC = () => {
  const currentCategory = useAppStore((state) => state.currentCategory);
  const isActive = useAppStore((state) => state.isActive);
  const switchCategory = useAppStore((state) => state.switchCategory);

  const handleCategoryPress = (categoryId: CategoryId) => {
    if (!isActive) {
      switchCategory(categoryId);
    }
  };

  return (
    <View style={styles.categoryBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              currentCategory === cat.id && styles.categoryTabActive,
            ]}
            onPress={() => handleCategoryPress(cat.id as CategoryId)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                currentCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryBar: {
    marginTop: 50,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDarker,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark,
  },
  categoryTabActive: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    color: colors.textDark,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.textPrimary,
  },
});

export default CategoryBar;
