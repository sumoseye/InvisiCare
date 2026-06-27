import { NextResponse } from 'next/server';
import { generateSkeleton } from '@/lib/simulators/skeleton';

export const dynamic = 'force-dynamic';

export async function GET() {
  const skeleton = generateSkeleton();
  return NextResponse.json(skeleton);
}
