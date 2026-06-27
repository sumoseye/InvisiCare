import { randomNoise } from '../utils';

let phase = 0;

export function generateWaveform(): number[] {
  phase += 0.08;
  const waveform: number[] = [];

  for (let i = 0; i < 50; i++) {
    const breathing = Math.sin(phase + i * 0.15) * 8;
    const heartbeat = Math.sin(phase * 4.8 + i * 0.4) * 4;
    const noise = randomNoise(3);
    const base = 100 + breathing + heartbeat + noise;
    waveform.push(Math.round(base * 10) / 10);
  }

  return waveform;
}

export function getWaveformResponse() {
  return {
    waveform: generateWaveform(),
    timestamp: Date.now(),
  };
}
