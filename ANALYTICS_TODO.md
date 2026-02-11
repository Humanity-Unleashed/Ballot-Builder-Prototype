# Analytics Tracking — Remaining Ideas

All high and medium priority button tracking is implemented.
Below are lower-priority items that could be added later.

## Possible future additions

### DomainLeanMeter.tsx — slider drag events
- Could track a debounced `slider_change` event with `{ axisId, oldValue, newValue }`
  fired only on pointer-up (not every move) to see which axes users adjust most
- Risk: noisy if users drag a lot; consider sampling or batching

### DemographicScreen.tsx — individual option selections
- Currently tracks skip vs continue + filled field count
- Could track each individual option pick (income, housing, age, etc.) for
  demographic distribution analysis — but may be too granular / noisy

### PersonalImpactSection.tsx
- Display-only component, no interactions to track
