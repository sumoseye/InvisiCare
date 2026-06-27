# InvisiCare

A production-grade, full-stack WiFi-based spatial sensing dashboard built with Next.js 14. Monitor vital signs, track human pose, detect intrusions, and analyze occupancy patterns — all simulated through WiFi CSI (Channel State Information) signal analysis.

![InvisiCare](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **Real-time Dashboard** — Breathing rate, heart rate, occupancy, and CSI waveform visualization
- **Pose Tracking** — 3D room with procedural furniture, animated humanoid figures, movement trails, per-person vitals panel
- **Intrusion Detection** — 3D intruder visualization, floor plan with multi-person dots, enhanced alert history
- **Analytics** — Vital sign trends, occupancy patterns, activity breakdown, fall risk assessment
- **Event Log** — Filterable event feed with CSV export and webhook configuration
- **Glassmorphism UI** — Dark professional theme with Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Charts | Recharts, Chart.js |
| Animation | Framer Motion + Three.js |
| 3D Graphics | Three.js (procedural room, humanoid, path trails) |
| Icons | Heroicons (no emoji in UI labels) |
| Database | PostgreSQL + Prisma (optional) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd invisicare
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file (optional — app works without database):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/wifisense
```

### Database Setup (Optional)

```bash
npx prisma generate
npx prisma db push
```

## API Routes

| Endpoint | Description | Update Rate |
|----------|-------------|-------------|
| `GET /api/vitals` | Current vital signs | 1s |
| `GET /api/skeleton` | Skeleton pose data | 100ms |
| `GET /api/waveform` | CSI waveform (50 points) | 500ms |
| `GET /api/events` | Event log with filters | 2s |
| `GET /api/zones` | Zone status data | 1s |

## Project Structure

```
invisicare/
├── app/                  # Next.js App Router pages & API routes
├── components/
│   ├── layout/           # Header, Navigation, AlertBanner
│   ├── tabs/             # Dashboard, Pose, Intrusion, Analytics, Events
│   ├── charts/           # Recharts visualizations
│   ├── visualizations/   # Skeleton, FloorPlan
│   ├── cards/            # StatusCard, ZoneCard, EventCard
│   └── ui/               # Button, Card, Toggle, Slider, Dialog
├── lib/
│   ├── simulators/       # Backend data simulators
│   ├── store.ts          # Zustand stores
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Utility functions
└── prisma/               # Database schema
```

## Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

1. Push to GitHub
2. Import project in Vercel
3. Deploy

## License

MIT
