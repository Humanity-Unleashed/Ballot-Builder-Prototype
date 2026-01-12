import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getConfidenceColor, getConfidenceLevel } from '../utils/scoring';

interface ConfidenceGaugeProps {
  confidence: number;
  label?: string;
}

/**
 * Displays a visual gauge showing confidence level in a recommendation
 * Shows percentage, progress bar, and confidence level description
 */
export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  label = 'Match',
}) => {
  const color = getConfidenceColor(confidence);
  const level = getConfidenceLevel(confidence);

  const confidenceLabels = {
    low: 'Low confidence - Answer more questions to improve',
    moderate: 'Moderate confidence',
    high: 'High confidence',
  };

  return (
    <View style={styles.container}>
      {/* Large percentage display */}
      <Text style={[styles.percentage, { color }]}>
        {confidence}%
      </Text>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Progress bar container */}
      <View style={styles.progressBarBackground}>
        {/* Filled portion of progress bar */}
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${confidence}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {/* Confidence level description */}
      <Text style={styles.description}>{confidenceLabels[level]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 12,
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
