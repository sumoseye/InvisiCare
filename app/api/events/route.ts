import { NextRequest, NextResponse } from 'next/server';
import {
  getEvents,
  setArmed,
  setSensitivity,
  acknowledgeEvent,
  dismissEventById,
} from '@/lib/simulators/events';
import { timeRangeToMs } from '@/lib/utils';
import type { Sensitivity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';
  const zone = searchParams.get('zone') || 'all';
  const timeRange = searchParams.get('timeRange') || '24h';
  const search = searchParams.get('search') || '';
  const person = searchParams.get('person') || 'all';
  const armed = searchParams.get('armed');

  if (armed !== null) setArmed(armed === 'true');

  const sensitivity = searchParams.get('sensitivity') as Sensitivity | null;
  if (sensitivity) setSensitivity(sensitivity);

  const action = searchParams.get('action');
  const eventId = searchParams.get('eventId');
  if (action === 'acknowledge' && eventId) acknowledgeEvent(eventId);
  if (action === 'dismiss' && eventId) dismissEventById(eventId);

  const events = getEvents(filter, zone, timeRangeToMs(timeRange), search, person);
  return NextResponse.json({ events });
}
