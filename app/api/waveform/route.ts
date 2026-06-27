import { NextResponse } from 'next/server';
import { getWaveformResponse } from '@/lib/simulators/waveform';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getWaveformResponse());
}
