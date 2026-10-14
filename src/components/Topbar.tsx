import { IconRefresh, IconSearch, IconMoon, IconSun } from './icons';
import './Topbar.css';

interface Props {
  pageTitle: string;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  isRefreshing: boolean;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Topbar({ pageTitle, onRefresh, onOpenCommandPalette, isRefreshing, darkMode, onToggleDark }: Props) {
  return (
    <header className="topbar">
      <h1 className="topbar__title">{pageTitle}</h1>
      <div className="topbar__actions">
        <button type="button" className="topbar__search-btn" onClick={onOpenCommandPalette}>
          <IconSearch size={14} /><span>Search…</span><span className="topbar__kbd">⌘K</span>
        </button>
        <button type="button" className="topbar__icon-btn" onClick={onToggleDark} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <IconSun size={14} /> : <IconMoon size={14} />}
        </button>
        <button type="button" className="topbar__icon-btn" onClick={onRefresh} disabled={isRefreshing} title="Refresh">
          <IconRefresh size={14} className={isRefreshing ? 'is-spinning' : ''} />
        </button>
      </div>
    </header>
  );
}
