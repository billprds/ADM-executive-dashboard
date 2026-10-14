import { IconGrid, IconTimeline, IconUsers, IconEffort, IconSettings } from './icons';
import './Sidebar.css';
export type TabId = 'active' | 'timelines' | 'capacity' | 'effort' | 'settings';

interface Props { activeTab: TabId; onTabChange: (t: TabId) => void; counts: Partial<Record<TabId, number>>; }
const MAIN_ITEMS = [
  { id: 'active'    as TabId, label: 'Active Projects',   Icon: IconGrid },
  { id: 'timelines' as TabId, label: 'Project Timelines', Icon: IconTimeline },
  { id: 'capacity'  as TabId, label: 'Capacity',          Icon: IconUsers },
  { id: 'effort'    as TabId, label: 'Effort Estimates',  Icon: IconEffort },
];

export function Sidebar({ activeTab, onTabChange, counts }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 20L12 4l8 16h-4l-1.5-3.2h-5L8 20H4z" fill="currentColor"/></svg></div>
        <div className="sidebar__brand-text">
          <div className="sidebar__brand-primary">ADM</div>
          <div className="sidebar__brand-secondary">Dashboard</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Portfolio</div>
        {MAIN_ITEMS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className={`sidebar__nav-item ${activeTab === id ? 'is-active' : ''}`} onClick={() => onTabChange(id)}>
            <Icon className="sidebar__nav-icon" size={14} />
            <span className="sidebar__nav-text">{label}</span>
            {counts[id] !== undefined && <span className="sidebar__nav-count">{counts[id]}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar__settings-section">
        <button type="button" className={`sidebar__nav-item ${activeTab === 'settings' ? 'is-active' : ''}`} onClick={() => onTabChange('settings')}>
          <IconSettings className="sidebar__nav-icon" size={14} />
          <span className="sidebar__nav-text">Settings</span>
        </button>
      </div>
      <div className="sidebar__foot">
        <div className="sidebar__foot-label">Shortcuts</div>
        <div className="sidebar__foot-shortcut"><kbd>⌘</kbd><kbd>K</kbd><span>Command palette</span></div>
        <div className="sidebar__foot-shortcut"><kbd>1</kbd>–<kbd>4</kbd><span>Switch tabs</span></div>
      </div>
    </aside>
  );
}
