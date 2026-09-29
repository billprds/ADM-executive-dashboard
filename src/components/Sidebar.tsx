import { IconGrid, IconTimeline, IconUsers, IconEffort } from './icons';
import './Sidebar.css';

export type TabId = 'active' | 'timelines' | 'capacity' | 'effort';

interface NavItem {
  id: TabId;
  label: string;
  Icon: typeof IconGrid;
  count?: number;
}

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Partial<Record<TabId, number>>;
}

export function Sidebar({ activeTab, onTabChange, counts }: SidebarProps) {
  const items: NavItem[] = [
    { id: 'active',    label: 'Active Projects',   Icon: IconGrid,     count: counts.active },
    { id: 'timelines', label: 'Project Timelines', Icon: IconTimeline, count: counts.timelines },
    { id: 'capacity',  label: 'Capacity',          Icon: IconUsers,    count: counts.capacity },
    { id: 'effort',    label: 'Effort Estimates',  Icon: IconEffort,   count: counts.effort },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" aria-hidden="true">
          {/* Small A monogram — not a stock logo */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M4 20L12 4l8 16h-4l-1.5-3.2h-5L8 20H4z" fill="currentColor" />
          </svg>
        </div>
        <div className="sidebar__brand-text">
          <div className="sidebar__brand-primary">ADM</div>
          <div className="sidebar__brand-secondary">Delivery</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <div className="sidebar__nav-label">Portfolio</div>
        {items.map(({ id, label, Icon, count }) => (
          <button
            key={id}
            type="button"
            className={`sidebar__nav-item ${activeTab === id ? 'is-active' : ''}`}
            onClick={() => onTabChange(id)}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon className="sidebar__nav-icon" />
            <span className="sidebar__nav-text">{label}</span>
            {count !== undefined && (
              <span className="sidebar__nav-count">{count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar__foot">
        <div className="sidebar__foot-label">Shortcuts</div>
        <div className="sidebar__foot-shortcut">
          <kbd>⌘</kbd><kbd>K</kbd>
          <span>Command palette</span>
        </div>
        <div className="sidebar__foot-shortcut">
          <kbd>1</kbd>–<kbd>4</kbd>
          <span>Switch tabs</span>
        </div>
      </div>
    </aside>
  );
}
