'use client';

import React from 'react';
import { UserCog, ChevronUp, ChevronDown } from 'lucide-react';
import { useDemographicStore } from '@/stores/demographicStore';
import {
  OptionButtonGroup,
  QuestionSection,
  incomeOptions,
  housingOptions,
  ageOptions,
  employmentOptions,
  dependentsOptions,
  educationOptions,
  insuranceOptions,
  veteranOptions,
} from '@/components/demographics/DemographicScreen';

interface DemographicSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export default function DemographicSection({ expanded, onToggle }: DemographicSectionProps) {
  const { profile, setField } = useDemographicStore();

  return (
    <div className="bg-gray-50 rounded-[14px] border border-gray-200 overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3.5 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <UserCog className="h-5 w-5 text-gray-600" />
          <span className="text-[15px] font-semibold text-gray-700">Adjust your profile</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Body (visible when expanded) */}
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-4">
          <p className="text-[13px] text-gray-500 leading-[18px]">
            Change your info to see how insights shift for different situations.
          </p>

          <QuestionSection label="Household income">
            <OptionButtonGroup
              options={incomeOptions}
              value={profile.householdIncome}
              onChange={(v) => setField('householdIncome', v)}
              columns={1}
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

          <QuestionSection label="Age range">
            <OptionButtonGroup
              options={ageOptions}
              value={profile.ageRange}
              onChange={(v) => setField('ageRange', v)}
              columns={3}
            />
          </QuestionSection>

          <QuestionSection label="Employment">
            <OptionButtonGroup
              options={employmentOptions}
              value={profile.employmentType}
              onChange={(v) => setField('employmentType', v)}
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

          <QuestionSection label="Education level">
            <OptionButtonGroup
              options={educationOptions}
              value={profile.educationLevel}
              onChange={(v) => setField('educationLevel', v)}
              columns={1}
            />
          </QuestionSection>

          <QuestionSection label="Health insurance">
            <OptionButtonGroup
              options={insuranceOptions}
              value={profile.healthInsurance}
              onChange={(v) => setField('healthInsurance', v)}
              columns={2}
            />
          </QuestionSection>

          <QuestionSection label="Veteran status">
            <OptionButtonGroup
              options={veteranOptions}
              value={profile.veteranStatus}
              onChange={(v) => setField('veteranStatus', v)}
              columns={3}
            />
          </QuestionSection>
        </div>
      )}
    </div>
  );
}
