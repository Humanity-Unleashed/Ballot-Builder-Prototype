/**
 * Button Component
 *
 * EXAMPLE COMPONENT - Reusable button with variants.
 * Use this as a template for other components.
 *
 * Complexity: ⭐ Easy
 *
 * @example
 * <Button title="Click me" onPress={() => {}} />
 * <Button title="Outline" variant="outline" onPress={() => {}} />
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// ===========================================
// Types
// ===========================================

interface ButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Button style variant */
  variant?: 'primary' | 'outline' | 'ghost';
  /** Disable the button */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
  /** Additional text styles */
  textStyle?: StyleProp<TextStyle>;
}

// ===========================================
// Component
// ===========================================

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'outline' && styles.outlineButton,
    variant === 'ghost' && styles.ghostButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },

  // Primary variant (filled)
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Outline variant
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  outlineText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Ghost variant (text only)
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Disabled state
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },

  // Text base
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
