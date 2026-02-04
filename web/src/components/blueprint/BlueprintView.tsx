'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  DollarSign,
  HeartPulse,
  Home,
  Shield,
  Leaf,
  Circle,
} from 'lucide-react';
import type { BlueprintProfile } from '@/types/blueprintProfile';
import type { Spec } from '@/types/civicAssessment';
import type { MetaDimensionScores } from '@/lib/archetypes';
import { generateValueSummary, getUserValueFramings } from '@/lib/valueFraming';
import { DOMAIN_DISPLAY_NAMES } from '@/lib/blueprintHelpers';
import ValueSummaryCard from './ValueSummaryCard';
import ValuesSpectrumCard from './ValuesSpectrumCard';
import PriorityInsightCard from './PriorityInsightCard';
import CompactAxisBar from './CompactAxisBar';
import VoteCTACard from './VoteCTACard';
import AxisEditModal from './AxisEditModal';

// Map domain IDs to lucide icons
function getDomainIcon(domainId: string) {
  switch (domainId) {
    case 'econ':
      return <DollarSign className="h-3.5 w-3.5" />;
    case 'health':
      return <HeartPulse className="h-3.5 w-3.5" />;
    case 'housing':
      return <Home className="h-3.5 w-3.5" />;
    case 'justice':
      return <Shield className="h-3.5 w-3.5" />;
    case 'climate':
      return <Leaf className="h-3.5 w-3.5" />;
    default:
      return <Circle className="h-3.5 w-3.5" />;
  }
}

interface BlueprintViewProps {
  profile: BlueprintProfile;
  blueprintSpec: Spec;
  metaDimensions: MetaDimensionScores | null;
  fineTuningResponses: Record<string, Record<string, number>>;
  onRetake: () => void;
  onEditingAxisChange: (axisId: string | null) => void;
  onFineTune: (axisId: string) => void;
  onChangeAxis: (axisId: string, value: number) => void;
  onChangeAxisImportance: (axisId: string, value: number) => void;
}

export default function BlueprintView({
  profile,
  blueprintSpec,
  metaDimensions,
  fineTuningResponses,
  onRetake,
  onEditingAxisChange,
  onFineTune,
  onChangeAxis,
  onChangeAxisImportance,
}: BlueprintViewProps) {
  const router = useRouter();
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [editingAxisId, setEditingAxisId] = useState<string | null>(null);

  // Derived
  const topPriorities = useMemo(() => {
    return [...profile.domains]
      .sort(
        (a, b) =>
          (b.importance.value_0_10 ?? 0) - (a.importance.value_0_10 ?? 0),
      )
      .slice(0, 2)
      .map((d) => DOMAIN_DISPLAY_NAMES[d.domain_id] || d.domain_id);
  }, [profile]);

  const valueSummary = useMemo(() => {
    return metaDimensions ? generateValueSummary(metaDimensions) : null;
  }, [metaDimensions]);

  const valueFramings = useMemo(() => {
    return metaDimensions ? getUserValueFramings(metaDimensions) : [];
  }, [metaDimensions]);

  const currentDomain = blueprintSpec.domains[currentDomainIndex];
  const currentDomProfile = profile.domains.find(
    (d) => d.domain_id === currentDomain?.id,
  );
  const currentDomainAxes = currentDomProfile?.axes ?? [];

  const handleEditAxis = (axisId: string) => {
    setEditingAxisId(axisId);
    onEditingAxisChange(axisId);
  };

  const handleCloseModal = () => {
    setEditingAxisId(null);
    onEditingAxisChange(null);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="overflow-y-auto px-4 pt-4 pb-10">
        {/* Section header */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-900">Your Civic Blueprint</h1>
          <button
            onClick={onRetake}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-600">Retake</span>
          </button>
        </div>

        {/* Value summary card */}
        {metaDimensions && valueSummary && (
          <ValueSummaryCard
            summary={valueSummary}
            framings={valueFramings}
            metaDimensions={metaDimensions}
          />
        )}

        {/* Values spectrum card */}
        {metaDimensions && <ValuesSpectrumCard metaDimensions={metaDimensions} />}

        {/* Priority insight */}
        {topPriorities.length >= 2 && <PriorityInsightCard priorities={topPriorities} />}

        {/* Domain tabs */}
        <div className="mb-3">
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
            {blueprintSpec.domains.map((domain, index) => {
              const isActive = index === currentDomainIndex;
              return (
                <button
                  key={domain.id}
                  onClick={() => setCurrentDomainIndex(index)}
                  className={[
                    'flex shrink-0 items-center gap-1 rounded-2xl px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {getDomainIcon(domain.id)}
                  {domain.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-tune hint */}
        <p className="mb-2 text-center text-xs text-gray-400">
          Tap any position to fine-tune
        </p>

        {/* Domain content - axis bars */}
        <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {currentDomainAxes.length > 0 && (
            <div className="space-y-3">
              {currentDomainAxes.map((axis) => {
                const axisDef = blueprintSpec.axes.find(
                  (a) => a.id === axis.axis_id,
                );
                if (!axisDef) return null;

                return (
                  <button
                    key={axis.axis_id}
                    onClick={() => handleEditAxis(axis.axis_id)}
                    className="block w-full rounded-xl bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                  >
                    <CompactAxisBar
                      name={axisDef.name}
                      value={axis.value_0_10}
                      poleALabel={axisDef.poleA.label}
                      poleBLabel={axisDef.poleB.label}
                      axisId={axis.axis_id}
                      importance={axis.importance}
                      isFineTuned={!!fineTuningResponses[axis.axis_id]}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Vote CTA */}
        <VoteCTACard onPress={() => router.push('/ballot')} />
      </div>

      {/* Edit modal */}
      {editingAxisId && (
        <AxisEditModal
          axisId={editingAxisId}
          profile={profile}
          spec={blueprintSpec}
          onClose={handleCloseModal}
          onChangeAxisImportance={onChangeAxisImportance}
          onChangeAxis={onChangeAxis}
          onFineTune={(id) => {
            handleCloseModal();
            onFineTune(id);
          }}
          fineTuningResponses={fineTuningResponses[editingAxisId] || {}}
        />
      )}
    </div>
  );
}
