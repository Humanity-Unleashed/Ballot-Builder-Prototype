# Archived Components

This directory contains previous iterations of tab screens that are no longer active in the app but are kept for reference.

## Archived Tabs (`tabs/`)

| File | Description |
|------|-------------|
| `blueprint.tsx` | Original Blueprint screen - view/edit civic stances and priorities |
| `ballot.tsx` | Original Ballot screen - browse and complete ballot items |
| `profile.tsx` | User profile and settings screen |
| `prototype.tsx` | Initial swipe card prototype for civic blueprint |
| `adaptive-prototype.tsx` | Adaptive question flow prototype |
| `civic-assessment.tsx` | 5-point Likert scale civic assessment |
| `persona-selection.tsx` | Voter persona selection screen |

## Current Active Tabs

The app now uses these screens (in `app/(tabs)/`):
- `home.tsx` - Home screen
- `adaptive-assessment.tsx` - Smart assessment with adaptive questions
- `blueprint-v3.tsx` - Latest Blueprint UI
- `ballot-builder.tsx` - Ballot builder interface
- `blueprint-v2.tsx` - (hidden, accessible via direct navigation)

## Restoring Archived Files

To restore any of these files:
1. Move the file back to `app/(tabs)/`
2. Add a corresponding `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx`
