import { NextRequest, NextResponse } from 'next/server';
import { schwartzSpec } from '@/server/data/schwartzValues';
import { scoreAssessment, type VignetteResponse, type ItemResponse } from '@/server/services/schwartzService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vignetteResponses: VignetteResponse[] | undefined = body.vignetteResponses;
    const boosterResponses: ItemResponse[] | undefined = body.boosterResponses;

    if (!vignetteResponses || !Array.isArray(vignetteResponses)) {
      return NextResponse.json(
        { error: 'vignetteResponses array is required' },
        { status: 400 }
      );
    }

    // Validate vignette responses
    for (const vr of vignetteResponses) {
      if (!vr.vignette_id || !vr.selected_option_id) {
        return NextResponse.json(
          { error: `Invalid vignette response: ${JSON.stringify(vr)}. vignette_id and selected_option_id are required.` },
          { status: 400 }
        );
      }
      const vignette = schwartzSpec.vignettes.find((v) => v.id === vr.vignette_id);
      if (!vignette) {
        return NextResponse.json(
          { error: `Unknown vignette_id: ${vr.vignette_id}` },
          { status: 400 }
        );
      }
      if (!vignette.options.some((o) => o.id === vr.selected_option_id)) {
        return NextResponse.json(
          { error: `Unknown selected_option_id: ${vr.selected_option_id} for vignette ${vr.vignette_id}` },
          { status: 400 }
        );
      }
    }

    // Validate booster responses if provided
    if (boosterResponses) {
      if (!Array.isArray(boosterResponses)) {
        return NextResponse.json(
          { error: 'boosterResponses must be an array' },
          { status: 400 }
        );
      }
      for (const r of boosterResponses) {
        if (!r.item_id || typeof r.response !== 'number' || r.response < 1 || r.response > 5) {
          return NextResponse.json(
            { error: `Invalid booster response: ${JSON.stringify(r)}. response must be 1-5.` },
            { status: 400 }
          );
        }
      }
    }

    const result = scoreAssessment(vignetteResponses, boosterResponses);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to score responses:', error);
    return NextResponse.json(
      { error: 'Failed to score responses' },
      { status: 500 }
    );
  }
}
