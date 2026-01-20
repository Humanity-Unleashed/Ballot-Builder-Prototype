/**
 * PersonaCard Component
 *
 * Displays a voter persona card with selection capability
 * Adapted from ballot-builder-prototype for React Native
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Persona } from '../services/api';

interface PersonaCardProps {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  isSelected?: boolean;
}

export default function PersonaCard({ persona, onSelect, isSelected = false }: PersonaCardProps) {
  const formatGender = (gender: string): string => {
    return gender.replace(/_/g, ' ');
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardDefault,
      ]}
      onPress={() => onSelect(persona)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{persona.name}</Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{persona.county} County</Text>
          <Text style={styles.metadataText}> • </Text>
          <Text style={styles.metadataText}>{persona.age} years old</Text>
        </View>
      </View>

      {/* Story */}
      <Text style={styles.story} numberOfLines={4}>
        {persona.story}
      </Text>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{persona.incomeLevel} Income</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{formatGender(persona.gender)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 200,
    marginBottom: 16,
  },
  cardDefault: {
    borderColor: '#D6CCC8',
    backgroundColor: '#F5F0ED',
  },
  cardSelected: {
    borderColor: '#3AAFA9',
    backgroundColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3AAFA9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 12,
    paddingRight: 36, // Space for selection indicator
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 13,
    color: '#6B7280',
  },
  story: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 16,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D6CCC8',
  },
  tag: {
    backgroundColor: '#DFD9D7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
  },
});
