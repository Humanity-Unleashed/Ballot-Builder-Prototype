'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDemographicStore } from '@/stores/demographicStore';
import {
  OptionButtonGroup,
  QuestionSection,
  ageOptions,
  housingOptions,
  incomeOptions,
  employmentOptions,
  dependentsOptions,
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
  const [showPrivacyTip, setShowPrivacyTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showPrivacyTip) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        tipRef.current && !tipRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPrivacyTip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPrivacyTip]);

  const toggleTip = useCallback(() => setShowPrivacyTip((v) => !v), []);

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
            Answer a few questions so Ballot Builder can better say how
            policies affect your life — everything is 100%{' '}
            <span className="relative inline-block">
              <button
                ref={triggerRef}
                type="button"
                onClick={toggleTip}
                onMouseEnter={() => setShowPrivacyTip(true)}
                onMouseLeave={() => setShowPrivacyTip(false)}
                className="underline decoration-dotted decoration-gray-400 underline-offset-2 text-gray-700 font-medium cursor-help"
              >
                private
              </button>
              {showPrivacyTip && (
                <div
                  ref={tipRef}
                  role="tooltip"
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg z-50"
                >
                  Everything is optional and confidential. Your answers never
                  leave your device and are never shared.
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-900" />
                </div>
              )}
            </span>{' '}
            and always stays on your device.
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

        <QuestionSection label="Dependents">
          <OptionButtonGroup
            options={dependentsOptions}
            value={profile.dependents}
            onChange={(v) => setField('dependents', v)}
            columns={4}
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
