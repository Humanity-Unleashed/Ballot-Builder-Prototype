'use client';

import React from 'react';
import { useDemographicStore } from '@/stores/demographicStore';
import {
  OptionButtonGroup,
  QuestionSection,
  ageOptions,
  housingOptions,
  incomeOptions,
  employmentOptions,
  insuranceOptions,
} from '@/components/demographics/DemographicScreen';

interface DemographicGateProps {
  relevantAxes: string[];
  onComplete: () => void;
  onSkip: () => void;
}

/** Check if any axis in the set matches a prefix */
function hasAxisPrefix(axes: string[], prefix: string): boolean {
  return axes.some((a) => a.startsWith(prefix));
}

export default function DemographicGate({ relevantAxes, onComplete, onSkip }: DemographicGateProps) {
  const profile = useDemographicStore((s) => s.profile);
  const setField = useDemographicStore((s) => s.setField);

  // Conditional fields based on ballot axes
  const showHealth = hasAxisPrefix(relevantAxes, 'health_');
  const showIncome =
    relevantAxes.includes('econ_safetynet') ||
    relevantAxes.includes('housing_affordability_tools');
  const showEmployment = hasAxisPrefix(relevantAxes, 'econ_');

  return (
    <div className="flex flex-col items-center justify-start h-full px-4 pt-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 pb-24">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-gray-900">
            A bit about you
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This helps us show how policies might affect your life.
            Everything is optional and stays on your device.
          </p>
        </div>

        {/* Always-shown fields */}
        <QuestionSection label="Age range">
          <OptionButtonGroup
            options={ageOptions}
            value={profile.ageRange}
            onChange={(v) => setField('ageRange', v)}
            columns={3}
          />
        </QuestionSection>

        <QuestionSection label="Housing situation">
          <OptionButtonGroup
            options={housingOptions}
            value={profile.housingSituation}
            onChange={(v) => setField('housingSituation', v)}
            columns={2}
          />
        </QuestionSection>

        {/* Conditional fields */}
        {showHealth && (
          <QuestionSection label="Health insurance">
            <OptionButtonGroup
              options={insuranceOptions}
              value={profile.healthInsurance}
              onChange={(v) => setField('healthInsurance', v)}
              columns={2}
            />
          </QuestionSection>
        )}

        {showIncome && (
          <QuestionSection label="Household income">
            <OptionButtonGroup
              options={incomeOptions}
              value={profile.householdIncome}
              onChange={(v) => setField('householdIncome', v)}
              columns={1}
            />
          </QuestionSection>
        )}

        {showEmployment && (
          <QuestionSection label="Employment">
            <OptionButtonGroup
              options={employmentOptions}
              value={profile.employmentType}
              onChange={(v) => setField('employmentType', v)}
              columns={2}
            />
          </QuestionSection>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
