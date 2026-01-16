/**
 * Blueprint Slider Component
 *
 * Discrete 0-10 slider for stance and importance values.
 * Uses touchable areas for each step (more accessible than drag).
 *
 * @example
 * <BlueprintSlider
 *   value={5}
 *   onChange={(v) => setValue(v)}
 *   leftLabel="Left"
 *   rightLabel="Right"
 * />
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

// ===========================================
// Types
// ===========================================

interface BlueprintSliderProps {
  /** Current value 0-10 */
  value: number;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Left endpoint label (value 0) */
  leftLabel: string;
  /** Right endpoint label (value 10) */
  rightLabel: string;
  /** Center label (value 5) */
  centerLabel?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Variant affects coloring */
  variant?: 'stance' | 'importance';
}

// ===========================================
// Component
// ===========================================

export default function BlueprintSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  centerLabel = 'Mixed',
  disabled = false,
  variant = 'stance',
}: BlueprintSliderProps) {
  const handlePress = (newValue: number) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(newValue);
  };

  const getTrackColor = (position: number): string => {
    if (position < value) {
      return variant === 'importance' ? Colors.primary : '#60A5FA';
    }
    return Colors.gray[200];
  };

  const getThumbColor = (): string => {
    if (disabled) return Colors.gray[400];
    return variant === 'importance' ? Colors.primary : Colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Labels row */}
      <View style={styles.labelsRow}>
        <Text style={[styles.endpointLabel, styles.leftLabel]} numberOfLines={2}>
          {leftLabel}
        </Text>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
        <Text style={[styles.endpointLabel, styles.rightLabel]} numberOfLines={2}>
          {rightLabel}
        </Text>
      </View>

      {/* Slider track with tick marks */}
      <View style={styles.trackContainer}>
        {/* Background track */}
        <View style={styles.track}>
          {/* Filled portion */}
          <View
            style={[
              styles.trackFill,
              { width: `${value * 10}%` },
              disabled && styles.trackFillDisabled,
            ]}
          />
        </View>

        {/* Tick marks and touch areas */}
        <View style={styles.ticksContainer}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tick => (
            <Pressable
              key={tick}
              style={styles.tickTouchArea}
              onPress={() => handlePress(tick)}
              disabled={disabled}
            >
              <View
                style={[
                  styles.tick,
                  tick === 5 && styles.tickCenter,
                  tick === value && styles.tickActive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Thumb indicator */}
        <View
          style={[
            styles.thumb,
            { left: `${value * 10}%` },
            { backgroundColor: getThumbColor() },
          ]}
        />
      </View>

      {/* Current value chip */}
      <View style={styles.valueChipContainer}>
        <View style={[styles.valueChip, disabled && styles.valueChipDisabled]}>
          <Text style={[styles.valueChipText, disabled && styles.valueChipTextDisabled]}>
            {value}/10
          </Text>
        </View>
      </View>
    </View>
  );
}

// ===========================================
// Compact variant for domain rows
// ===========================================

interface CompactSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CompactSlider({ value, onChange, disabled = false }: CompactSliderProps) {
  const handlePress = (newValue: number) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(newValue);
  };

  return (
    <View style={compactStyles.container}>
      <View style={compactStyles.track}>
        <View
          style={[
            compactStyles.trackFill,
            { width: `${value * 10}%` },
          ]}
        />
      </View>
      <View style={compactStyles.ticksContainer}>
        {[0, 2, 5, 8, 10].map(tick => (
          <Pressable
            key={tick}
            style={compactStyles.tickTouchArea}
            onPress={() => handlePress(tick)}
            disabled={disabled}
          >
            <View style={[compactStyles.tick, tick === 5 && compactStyles.tickCenter]} />
          </Pressable>
        ))}
      </View>
      <Text style={compactStyles.valueText}>{value}</Text>
    </View>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  endpointLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[600],
    flex: 1,
  },
  leftLabel: {
    textAlign: 'left',
  },
  rightLabel: {
    textAlign: 'right',
  },
  centerLabel: {
    fontSize: 11,
    color: Colors.gray[400],
    textAlign: 'center',
    flex: 1,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  trackFillDisabled: {
    backgroundColor: Colors.gray[300],
  },
  ticksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickTouchArea: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 2,
    height: 12,
    backgroundColor: Colors.gray[300],
    borderRadius: 1,
  },
  tickCenter: {
    height: 16,
    backgroundColor: Colors.gray[400],
  },
  tickActive: {
    backgroundColor: Colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginLeft: -12,
    top: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  valueChipContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  valueChip: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  valueChipDisabled: {
    backgroundColor: Colors.gray[50],
  },
  valueChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  valueChipTextDisabled: {
    color: Colors.gray[400],
  },
});

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  ticksContainer: {
    position: 'absolute',
    left: 0,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tickTouchArea: {
    width: 20,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: Colors.gray[300],
  },
  tickCenter: {
    height: 10,
    backgroundColor: Colors.gray[400],
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    width: 24,
    textAlign: 'right',
  },
});
