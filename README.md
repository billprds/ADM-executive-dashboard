# ADM Delivery Dashboard

Redesign of the Angkas Agile Delivery Management executive dashboard, rebuilt from the vibe-coded single-file HTML into a clean React/TypeScript app. Mock data now; Go backend planned.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Opens at **http://localhost:5174**. The app boots straight to the Active Projects tab with mock data from `src/mock/mockData.ts` — no backend required.

## Build

```bash
npm run typecheck   # tsc --noEmit
npm run build       # tsc -b && vite build → dist/
npm run preview     # serve dist/
```

## What's here (Phase 1)

- **Design system**: Every color, spacing, radius, type size is a CSS variable in `src/styles/tokens.css`. Single source of truth. No pastel gradients, no oversized headings, no rounded pill text backgrounds.
- **Shell**: Fixed-width dark sidebar (Sidebar.tsx) + thin topbar (Topbar.tsx). Sidebar handles navigation; topbar shows page title, refresh, and search entry point.
- **Active Projects tab**: Portfolio metrics strip, upcoming deployments (30-day window), portfolio register table. Click any row to open a right-side detail drawer.
- **Project Timelines tab**: Gantt board with sprints / weeks / months / quarters granularity, zoom, project & team filters, team-colored bars, milestone diamonds, today marker, sticky left columns. Auto-scrolls to today on load.
- **Command palette** (⌘K): Fuzzy jump between tabs, projects, or actions. Arrow keys + Enter.
- **Keyboard shortcuts**: `1`–`4` switch tabs; `⌘K` opens the palette; `Esc` closes overlays.

## What's coming (Phase 2)

- **Capacity Stack Rank**: 44-person heatmap with month/team/project filters, consecutive-cell run consolidation, sticky columns.
- **Project Effort Estimates**: PH-holiday-aware working-day duration calc, per-project totals, effort estimates table.

Both tabs currently render a placeholder listing the planned features.

## Switching to real backend later

Set in `.env`:

```
VITE_USE_MOCK_DATA=false
VITE_API_URL=http://localhost:8080
```

The frontend only knows about `fetchSnapshot()` in `src/lib/api.ts`. The mock and real paths are both already written, gated on that one flag. The Go backend needs to serve a `GET /api/snapshot` that returns the `DashboardSnapshot` shape defined in `src/lib/types.ts`.

## Folder structure

```
adm-dashboard/
├── index.html
├── package.json
├── tsconfig*.json
├── vite.config.ts
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx / App.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── Sidebar.tsx / .css
    │   ├── Topbar.tsx / .css
    │   ├── primitives.tsx / .css       # Panel, Metric, StatusDot, TeamBadge, Eyebrow
    │   ├── icons.tsx                    # Inline SVG icon set
    │   ├── ActiveProjectsView.tsx / .css
    │   ├── ProjectDetailDrawer.tsx / .css
    │   ├── TimelinesView.tsx / .css
    │   ├── CommandPalette.tsx / .css
    │   └── PlaceholderView.tsx / .css
    ├── lib/
    │   ├── types.ts                     # Shared TS types
    │   ├── api.ts                       # fetchSnapshot() with mock/real toggle
    │   ├── dateUtils.ts                 # ISO parsing, PH holidays, working-day math
    │   └── teams.ts                     # Team → color mapping
    ├── mock/
    │   └── mockData.ts                  # Angkas-shaped fixture
    └── styles/
        ├── tokens.css                   # ALL design tokens
        └── globals.css                  # Reset + base body styles
```

## Design principles applied

- **Fixed dark sidebar** with icon+label nav; active state uses accent-tint bg + accent text (no floating pill)
- **1px flat borders**, no drop-shadows anywhere
- **Single font**: Inter (400/500/600/700). JetBrains Mono only for tabular numeric data
- **Strict type scale**: 11px uppercase labels, 12px caption, 13px body, 14px body-lg, 18px title, 20px metric/page
- **Angkas blue** (`#3b82f6`) as accent, used sparingly for active states / key data
- **Status via semantic dots**, not solid pill fills
- **Team badges** are plain text prefixed by 6px colored square — the color square IS the affordance
- **No page has more than one primary color emphasis** at a time; muted status colors (green/amber/red at 60-70% saturation) throughout
