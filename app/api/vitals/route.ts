import { NextResponse } from 'next/server';
import { generateVitalSigns } from '@/lib/simulators/vitalSigns';

export const dynamic = 'force-dynamic';

export async function GET() {
  const vitals = generateVitalSigns();
  return NextResponse.json(vitals);
}
