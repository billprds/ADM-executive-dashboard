import { useEffect, useState, useCallback } from 'react';
import type { DashboardSnapshot, Project } from './lib/types';
import type { TabId } from './components/Sidebar';
import { fetchSnapshot } from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ActiveProjectsView } from './components/ActiveProjectsView';
import { TimelinesView } from './components/TimelinesView';
import { PlaceholderView } from './components/PlaceholderView';
import { CommandPalette } from './components/CommandPalette';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { MOCK_TODAY_ISO } from './mock/mockData';
import './App.css';

const TAB_META: Record<TabId, { title: string; subtitle?: string }> = {
  active:    { title: 'Active Projects',   subtitle: 'Portfolio overview · Weekly Tech Leadership briefing' },
  timelines: { title: 'Project Timelines', subtitle: 'Gantt view across projects' },
  capacity:  { title: 'Capacity',          subtitle: 'Team allocation & stack rank' },
  effort:    { title: 'Effort Estimates',  subtitle: 'PH-holiday-aware effort calculator' },
};

export default function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSnapshot();
      setSnapshot(data);
    } catch (err) {
      console.error('[App] fetch failed', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Keyboard shortcuts: ⌘K palette, 1-4 tabs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      // Number-key tab switching — but not while typing in an input
      const activeEl = document.activeElement;
      const inInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLSelectElement;
      if (!inInput && !paletteOpen) {
        if (e.key === '1') setActiveTab('active');
        else if (e.key === '2') setActiveTab('timelines');
        else if (e.key === '3') setActiveTab('capacity');
        else if (e.key === '4') setActiveTab('effort');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [paletteOpen]);

  const projects = snapshot?.projects ?? [];
  const timeline = snapshot?.timeline ?? [];

  const counts: Partial<Record<TabId, number>> = {
    active: projects.length,
    timelines: new Set(timeline.map((t) => t.projectId)).size,
    capacity: 0,
    effort: timeline.filter((t) => t.devResources != null && t.qaResources != null).length,
  };

  const meta = TAB_META[activeTab];

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
      <main className="app__main">
        <Topbar
          pageTitle={meta.title}
          pageSubtitle={meta.subtitle}
          fetchedAt={snapshot?.fetchedAt ?? null}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          onOpenCommandPalette={() => setPaletteOpen(true)}
        />
        <div className="app__content">
          {!snapshot ? (
            <div className="app__loading">Loading portfolio…</div>
          ) : activeTab === 'active' ? (
            <ActiveProjectsView projects={projects} timeline={timeline} todayISO={MOCK_TODAY_ISO} />
          ) : activeTab === 'timelines' ? (
            <TimelinesView timeline={timeline} todayISO={MOCK_TODAY_ISO} />
          ) : activeTab === 'capacity' ? (
            <PlaceholderView
              title="Capacity Stack Rank"
              description="Per-person daily capacity heatmap with run consolidation, month/team/project filters, and sticky columns. Consolidates 44 people × 21 workdays into scan-friendly bars."
              plannedFeatures={[
                'Sticky Name / Role / Team columns',
                'Month tabs (Jul → Nov 2026) + All Months view',
                'Bucket codes (RDMP / TDBT / MNTN / MGMT / UN/A) consolidated into continuous run bars',
                'Project filter dims non-matching cells',
                'Multi-team support (e.g. "AI/Data Science/ML")',
              ]}
            />
          ) : (
            <PlaceholderView
              title="Project Effort Estimates"
              description="Working-day duration calculator that respects Philippine 2026 holidays. Automatically totals Dev + QA effort per project."
              plannedFeatures={[
                'Auto-computed Duration = workdays between Start / Due minus PH 2026 holidays',
                'Auto-computed Estimate = (Dev + QA) × Duration',
                'Per-project subtotal row with highlighted Total Estimate',
                'Project filter with "All Projects" default',
                'Groups rows by project with sticky headers',
              ]}
            />
          )}
        </div>
      </main>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        onTabChange={setActiveTab}
        onRefresh={refresh}
        onOpenProject={(p) => { setActiveTab('active'); setDrawerProject(p); }}
      />

      {drawerProject && (
        <ProjectDetailDrawer
          project={drawerProject}
          timeline={timeline.filter((t) => t.projectId === drawerProject.id)}
          onClose={() => setDrawerProject(null)}
        />
      )}
    </div>
  );
}
