import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/burn
 * Server-side proximity validation + burn.
 * 
 * The client sends their coordinates. The server:
 * 1. Verifies they're actually within range (zero-trust)
 * 2. Burns the drop (deletes encrypted payload)
 * 3. Returns confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dropId, latitude, longitude } = body;

    if (!dropId || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Server-side proximity validation (zero-trust)
    const { data: proximity, error: proxError } = await (supabaseAdmin as any).rpc(
      'validate_proximity',
      {
        drop_id: dropId,
        user_longitude: longitude,
        user_latitude: latitude,
      }
    );

    if (proxError || !proximity || proximity.length === 0) {
      return NextResponse.json(
        { error: 'Failed to verify proximity' },
        { status: 500 }
      );
    }

    const check = proximity[0];

    if (!check.is_active) {
      return NextResponse.json(
        { error: 'This dead drop has already been burned or has expired' },
        { status: 410 }
      );
    }

    if (!check.is_within_radius) {
      return NextResponse.json(
        {
          error: 'Not within unlock radius',
          distance: check.distance_meters,
          required: check.required_radius,
        },
        { status: 403 }
      );
    }

    // Step 2: Burn the drop
    const { data: burned, error: burnError } = await (supabaseAdmin as any).rpc(
      'burn_drop',
      { drop_id: dropId }
    );

    if (burnError || !burned) {
      return NextResponse.json(
        { error: 'Failed to burn drop — it may have already been destroyed' },
        { status: 410 }
      );
    }

    return NextResponse.json({ success: true, burned: true });
  } catch (error) {
    console.error('Burn API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
