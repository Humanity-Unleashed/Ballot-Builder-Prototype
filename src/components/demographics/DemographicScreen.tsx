'use client';

import React from 'react';
import { Info } from 'lucide-react';

import { useDemographicStore } from '@/stores/demographicStore';
import type { DemographicProfile } from '@/stores/demographicStore';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

// ── OptionButtonGroup ──

interface OptionDef<T extends string> {
  value: T;
  label: string;
}

export function OptionButtonGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: OptionDef<T>[];
  value: T | null;
  onChange: (val: T | null) => void;
  columns?: number;
}) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-2'
        : columns === 3
          ? 'grid-cols-3'
          : 'grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-2`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(selected ? null : opt.value)}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-violet-600 bg-violet-50 text-violet-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Question section wrapper ──

export function QuestionSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      {children}
    </div>
  );
}

// ── Option definitions ──

export const incomeOptions: OptionDef<NonNullable<DemographicProfile['householdIncome']>>[] = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_50k', label: '$25,000 – $50,000' },
  { value: '50k_75k', label: '$50,000 – $75,000' },
  { value: '75k_100k', label: '$75,000 – $100,000' },
  { value: '100k_150k', label: '$100,000 – $150,000' },
  { value: '150k_200k', label: '$150,000 – $200,000' },
  { value: 'over_200k', label: 'Over $200,000' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const housingOptions: OptionDef<NonNullable<DemographicProfile['housingSituation']>>[] = [
  { value: 'own_home', label: 'Own my home' },
  { value: 'rent', label: 'Rent' },
  { value: 'live_with_family', label: 'Live with family' },
  { value: 'unhoused', label: 'Unhoused' },
  { value: 'other', label: 'Other' },
];

export const ageOptions: OptionDef<NonNullable<DemographicProfile['ageRange']>>[] = [
  { value: '18_24', label: '18–24' },
  { value: '25_34', label: '25–34' },
  { value: '35_44', label: '35–44' },
  { value: '45_54', label: '45–54' },
  { value: '55_64', label: '55–64' },
  { value: '65_plus', label: '65+' },
];

export const employmentOptions: OptionDef<NonNullable<DemographicProfile['employmentType']>>[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'other', label: 'Other' },
];

export const dependentsOptions: OptionDef<NonNullable<DemographicProfile['dependents']>>[] = [
  { value: 'none', label: 'None' },
  { value: 'one', label: '1' },
  { value: 'two', label: '2' },
  { value: 'three_plus', label: '3+' },
];

export const educationOptions: OptionDef<NonNullable<DemographicProfile['educationLevel']>>[] = [
  { value: 'high_school', label: 'High school or GED' },
  { value: 'some_college', label: 'Some college' },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'graduate', label: 'Graduate degree' },
  { value: 'other', label: 'Other' },
];

export const insuranceOptions: OptionDef<NonNullable<DemographicProfile['healthInsurance']>>[] = [
  { value: 'employer', label: 'Employer' },
  { value: 'marketplace', label: 'Marketplace (ACA)' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'military_va', label: 'Military / VA' },
  { value: 'uninsured', label: 'Uninsured' },
  { value: 'other', label: 'Other' },
];

export const veteranOptions: OptionDef<NonNullable<DemographicProfile['veteranStatus']>>[] = [
  { value: 'veteran', label: 'Veteran' },
  { value: 'not_veteran', label: 'Not a veteran' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// ── Main component ──

interface DemographicScreenProps {
  onComplete: () => void;
}

export default function DemographicScreen({ onComplete }: DemographicScreenProps) {
  const { profile, setField, submitProfile, skipProfile } = useDemographicStore();
  const { track } = useAnalyticsContext();

  const handleSkip = () => {
    track('click', { element: 'skip_demographics' });
    skipProfile();
    onComplete();
  };

  const handleContinue = () => {
    // Count how many fields were filled out
    const filledCount = Object.entries(profile).filter(
      ([key, val]) => key !== 'zipCode' ? val !== null : val !== '',
    ).length;
    track('click', { element: 'submit_demographics', filledCount });
    submitProfile();
    onComplete();
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 pb-32">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Explanatory blurb */}
        <div className="mb-6 flex gap-3 rounded-xl bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm leading-relaxed text-blue-800">
            Policies affect people differently based on their circumstances.
            Sharing a bit about your situation helps Ballot Builder show how
            candidates&apos; proposals could impact your life — from taxes to
            healthcare to housing costs. All answers are optional and stored only
            on your device.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {/* 1. Household income */}
          <QuestionSection label="Household income">
            <OptionButtonGroup
              options={incomeOptions}
              value={profile.householdIncome}
              onChange={(v) => setField('householdIncome', v)}
              columns={1}
            />
          </QuestionSection>

          {/* 2. Housing situation */}
          <QuestionSection label="Housing situation">
            <OptionButtonGroup
              options={housingOptions}
              value={profile.housingSituation}
              onChange={(v) => setField('housingSituation', v)}
              columns={2}
            />
          </QuestionSection>

          {/* 3. Age range */}
          <QuestionSection label="Age range">
            <OptionButtonGroup
              options={ageOptions}
              value={profile.ageRange}
              onChange={(v) => setField('ageRange', v)}
              columns={3}
            />
          </QuestionSection>

          {/* 4. Employment */}
          <QuestionSection label="Employment">
            <OptionButtonGroup
              options={employmentOptions}
              value={profile.employmentType}
              onChange={(v) => setField('employmentType', v)}
              columns={2}
            />
          </QuestionSection>

          {/* 5. Dependents */}
          <QuestionSection label="Dependents">
            <OptionButtonGroup
              options={dependentsOptions}
              value={profile.dependents}
              onChange={(v) => setField('dependents', v)}
              columns={4}
            />
          </QuestionSection>

          {/* 6. Education level */}
          <QuestionSection label="Education level">
            <OptionButtonGroup
              options={educationOptions}
              value={profile.educationLevel}
              onChange={(v) => setField('educationLevel', v)}
              columns={1}
            />
          </QuestionSection>

          {/* 7. Health insurance */}
          <QuestionSection label="Health insurance">
            <OptionButtonGroup
              options={insuranceOptions}
              value={profile.healthInsurance}
              onChange={(v) => setField('healthInsurance', v)}
              columns={2}
            />
          </QuestionSection>

          {/* 8. ZIP code */}
          <QuestionSection label="ZIP code">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={profile.zipCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setField('zipCode', val);
              }}
              placeholder="e.g. 90210"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </QuestionSection>

          {/* 9. Veteran status */}
          <QuestionSection label="Veteran status">
            <OptionButtonGroup
              options={veteranOptions}
              value={profile.veteranStatus}
              onChange={(v) => setField('veteranStatus', v)}
              columns={3}
            />
          </QuestionSection>
        </div>
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
