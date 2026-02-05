'use client';

import React, { useMemo } from 'react';
import type { SchwartzValueScore } from '@/services/api';
import { rawMeanToPercent } from '@/stores/schwartzStore';

interface SpiderChartProps {
  valueScores: SchwartzValueScore[];
  size?: number;
  showLabels?: boolean;
  className?: string;
}

// Value order for circumplex (clockwise from top)
// This is the standard Schwartz circumplex order where opposing values
// are approximately 180 degrees apart:
//   - Universalism (pos 9) ↔ Power (pos 4)
//   - Benevolence (pos 8) ↔ Achievement (pos 3)
//   - Tradition (pos 7) ↔ Hedonism (pos 2)
//   - Conformity (pos 6) ↔ Stimulation (pos 1)
//   - Security (pos 5) ↔ Self-Direction (pos 0)
const VALUE_ORDER = [
  'self_direction',   // 0 - Openness (top)
  'stimulation',      // 1 - Openness
  'hedonism',         // 2 - Openness/Self-Enhancement
  'achievement',      // 3 - Self-Enhancement
  'power',            // 4 - Self-Enhancement
  'security',         // 5 - Conservation (bottom)
  'conformity',       // 6 - Conservation
  'tradition',        // 7 - Conservation
  'benevolence',      // 8 - Self-Transcendence
  'universalism',     // 9 - Self-Transcendence
];

// Short labels for display (to prevent cutoff)
const VALUE_SHORT_LABELS: Record<string, string> = {
  self_direction: 'Independence',
  stimulation: 'New Experiences',
  hedonism: 'Enjoying Life',
  achievement: 'Success',
  power: 'Influence',
  security: 'Safety',
  conformity: 'Rules',
  tradition: 'Tradition',
  benevolence: 'Helping Others',
  universalism: 'Fairness',
};

// Colors for each value (matching their dimension)
const VALUE_COLORS: Record<string, string> = {
  // Openness to Change (blue)
  self_direction: '#3B82F6',
  stimulation: '#60A5FA',
  hedonism: '#93C5FD',
  // Self-Enhancement (red/orange)
  achievement: '#F97316',
  power: '#EF4444',
  // Conservation (green)
  security: '#22C55E',
  conformity: '#4ADE80',
  tradition: '#86EFAC',
  // Self-Transcendence (purple)
  benevolence: '#A855F7',
  universalism: '#7C3AED',
};

export default function SpiderChart({
  valueScores,
  size = 320,
  showLabels = true,
  className = '',
}: SpiderChartProps) {
  // Use a larger internal viewBox to ensure labels fit
  const padding = showLabels ? 80 : 20;
  const viewBoxSize = size + padding * 2;
  const center = viewBoxSize / 2;
  const maxRadius = (size / 2) - 20; // Chart radius

  // Build score map
  const scoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const score of valueScores) {
      // Convert raw_mean (1-5) to 0-100 percentage
      map[score.value_id] = rawMeanToPercent(score.raw_mean);
    }
    return map;
  }, [valueScores]);

  // Calculate polygon points
  const points = useMemo(() => {
    const numValues = VALUE_ORDER.length;
    const angleStep = (2 * Math.PI) / numValues;
    const startAngle = -Math.PI / 2; // Start from top

    return VALUE_ORDER.map((valueId, i) => {
      const angle = startAngle + i * angleStep;
      const percent = scoreMap[valueId] ?? 50;
      const radius = (percent / 100) * maxRadius;

      return {
        valueId,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 35) * Math.cos(angle),
        labelY: center + (maxRadius + 35) * Math.sin(angle),
        percent,
        angle,
      };
    });
  }, [scoreMap, center, maxRadius]);

  // Generate grid rings
  const rings = [0.25, 0.5, 0.75, 1].map((scale) => {
    const radius = maxRadius * scale;
    const numValues = VALUE_ORDER.length;
    const angleStep = (2 * Math.PI) / numValues;
    const startAngle = -Math.PI / 2;

    const ringPoints = VALUE_ORDER.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
    });

    return ringPoints.join(' ');
  });

  // Generate axis lines
  const axisLines = useMemo(() => {
    const numValues = VALUE_ORDER.length;
    const angleStep = (2 * Math.PI) / numValues;
    const startAngle = -Math.PI / 2;

    return VALUE_ORDER.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x2: center + maxRadius * Math.cos(angle),
        y2: center + maxRadius * Math.sin(angle),
      };
    });
  }, [center, maxRadius]);

  // Polygon path for data
  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Get short label for display
  const getValueLabel = (valueId: string): string => {
    return VALUE_SHORT_LABELS[valueId] || valueId;
  };

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        {/* Grid rings */}
        {rings.map((ring, i) => (
          <polygon
            key={i}
            points={ring}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={polygonPath}
          fill="rgba(124, 58, 237, 0.2)"
          stroke="#7C3AED"
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((point) => (
          <circle
            key={point.valueId}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={VALUE_COLORS[point.valueId] || '#7C3AED'}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {showLabels &&
          points.map((point) => {
            // Determine text anchor based on position (left/right of center)
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (point.labelX < center - 20) textAnchor = 'end';
            else if (point.labelX > center + 20) textAnchor = 'start';

            // Adjust vertical alignment based on position (top/bottom)
            let dy = '0.35em';
            if (point.labelY < center - maxRadius * 0.5) dy = '0.9em';
            else if (point.labelY > center + maxRadius * 0.5) dy = '-0.3em';

            return (
              <text
                key={point.valueId}
                x={point.labelX}
                y={point.labelY}
                textAnchor={textAnchor}
                dy={dy}
                className="fill-gray-700 text-[11px] font-medium"
              >
                {getValueLabel(point.valueId)}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
