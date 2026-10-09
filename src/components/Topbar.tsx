import { IconRefresh, IconSearch } from './icons';
import './Topbar.css';

interface TopbarProps {
  pageTitle: string;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  isRefreshing: boolean;
}

export function Topbar({
  pageTitle,
  onRefresh,
  onOpenCommandPalette,
  isRefreshing,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__title-block">
        <h1 className="topbar__title">{pageTitle}</h1>
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="topbar__search-btn"
          onClick={onOpenCommandPalette}
          title="Command palette"
        >
          <IconSearch size={14} />
          <span>Search…</span>
          <span className="topbar__kbd">⌘K</span>
        </button>

        <button
          type="button"
          className="topbar__icon-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
          aria-label="Refresh data"
        >
          <IconRefresh size={14} className={isRefreshing ? 'is-spinning' : ''} />
        </button>
      </div>
    </header>
  );
}
