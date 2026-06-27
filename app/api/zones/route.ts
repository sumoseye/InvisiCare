import { NextRequest, NextResponse } from 'next/server';
import { getZones, setArmed, setSensitivity } from '@/lib/simulators/events';
import type { Sensitivity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const armed = searchParams.get('armed');
  const sensitivity = searchParams.get('sensitivity') as Sensitivity | null;

  if (armed !== null) {
    setArmed(armed === 'true');
  }
  if (sensitivity) {
    setSensitivity(sensitivity);
  }

  return NextResponse.json({ zones: getZones() });
}
