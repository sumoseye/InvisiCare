'use client';

import { useEffect, useRef } from 'react';
import { ActivityChart } from '@/components/charts/ActivityChart';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { TrendsChart } from '@/components/charts/TrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ANALYTICS_PERSONS } from '@/lib/constants';
import { useAnalyticsStore, useVitalsStore } from '@/lib/store';
import { calcStats, isBreathingNormal, isHeartRateNormal } from '@/lib/utils';
import { generatePersonTrendData } from '@/lib/simulators/events';
import { useMemo } from 'react';

export function Analytics() {
  const {
    historicalVitals,
    personMetrics,
    occupancyData,
    activityDistribution,
    fallRisk,
    selectedPerson,
    setSelectedPerson,
    updateHistoricalVitals,
  } = useAnalyticsStore();

  const { breathing, heartRate, activity, people } = useVitalsStore();

  const analyticsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch analytics data every 5 seconds (ONLY SETUP ONCE)
  useEffect(() => {
    // Prevent multiple intervals from running
    if (analyticsIntervalRef.current) return;

    analyticsIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();

        // Update store with fetched data
        useAnalyticsStore.setState({
          occupancyData: data.occupancyData,
          activityDistribution: data.activityDistribution,
          fallRisk: data.fallRisk,
        });

        // Add current vitals to history
        updateHistoricalVitals({
          breathing: data.breathing || breathing,
          heartRate: data.heartRate || heartRate,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current);
        analyticsIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency - runs once on mount

  // Memoized chart data based on selected person
  const chartData = useMemo(() => {
    if (selectedPerson === 'all') return historicalVitals;
    return (
      personMetrics[selectedPerson]?.historicalVitals ||
      generatePersonTrendData(selectedPerson, 60)
    );
  }, [selectedPerson, historicalVitals, personMetrics]);

  // Calculate stats from chart data
  const breathingStats = useMemo(
    () => calcStats(chartData.map((v) => v.breathing)),
    [chartData]
  );

  const heartStats = useMemo(
    () => calcStats(chartData.map((v) => v.heartRate)),
    [chartData]
  );

  // Risk factors based on current activity and fall risk
  const riskFactors = useMemo(
    () => [
      {
        label: 'Activity Level',
        value: activity === 'walking' ? 'Moderate' : 'Low',
      },
      { label: 'Stability Score', value: `${100 - fallRisk}%` },
      { label: 'Recent Falls', value: '0' },
      {
        label: 'Movement Anomalies',
        value: fallRisk > 50 ? 'Detected' : 'None',
      },
    ],
    [activity, fallRisk]
  );

  return (
    <div className="space-y-6">
      {/* Person Selection */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-400">View data for:</span>
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-white/20 focus:border-accent-blue focus:outline-none"
        >
          {ANALYTICS_PERSONS.map((p) => (
            <option key={p} value={p} className="bg-slate-900">
              {p === 'all'
                ? 'All People'
                : p
                    .replace('-', ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TrendsChart data={chartData} />
        <OccupancyChart data={occupancyData} />
      </div>

      {/* Activity Distribution */}
      <ActivityChart data={activityDistribution} />

      {/* Fall Risk and Vital Signs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fall Risk Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fall Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      fallRisk > 66
                        ? '#ef4444'
                        : fallRisk > 33
                          ? '#fbbf24'
                          : '#34d399'
                    }
                    strokeWidth="8"
                    strokeDasharray={`${fallRisk * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {fallRisk}%
                  </span>
                </div>
              </div>

              {/* Risk Factors List */}
              <ul className="flex-1 space-y-2">
                {riskFactors.map((f) => (
                  <li key={f.label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="text-white font-medium">{f.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vital Signs Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Breathing Stats */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-accent-blue">
                  Breathing (BPM)
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Min</span>
                    <span>{breathingStats.min}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Max</span>
                    <span>{breathingStats.max}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Avg</span>
                    <span>{breathingStats.avg}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Current</span>
                    <span
                      className={
                        isBreathingNormal(breathing)
                          ? 'text-accent-green'
                          : 'text-accent-orange'
                      }
                    >
                      {breathing.toFixed(1)}
                    </span>
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Normal: 12–20 BPM</p>
              </div>

              {/* Heart Rate Stats */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-red-400">
                  Heart Rate (BPM)
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Min</span>
                    <span>{heartStats.min}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Max</span>
                    <span>{heartStats.max}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Avg</span>
                    <span>{heartStats.avg}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Current</span>
                    <span
                      className={
                        isHeartRateNormal(heartRate)
                          ? 'text-accent-green'
                          : 'text-accent-orange'
                      }
                    >
                      {heartRate}
                    </span>
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Normal: 60–100 BPM</p>
              </div>
            </div>

            {/* Selected Person Info */}
            {selectedPerson !== 'all' && people[selectedPerson] && (
              <p className="mt-4 text-xs text-slate-500">
                Showing metrics for{' '}
                {selectedPerson.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}