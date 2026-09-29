import { IconRefresh, IconSearch } from './icons';
import { IS_MOCK } from '../lib/api';
import './Topbar.css';

interface TopbarProps {
  pageTitle: string;
  fetchedAt: string | null;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  isRefreshing: boolean;
}

export function Topbar({
  pageTitle,
  fetchedAt,
  onRefresh,
  onOpenCommandPalette,
  isRefreshing,
}: TopbarProps) {
  const fetchedTime = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

  return (
    <header className="topbar">
      <div className="topbar__title-block">
        <h1 className="topbar__title">{pageTitle}</h1>
      </div>

      <div className="topbar__actions">
        <span className="topbar__meta-item">
          <span className="topbar__meta-label">Refreshed</span>
          <span className="topbar__meta-value">{fetchedTime}</span>
        </span>

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

        <span
          className={`topbar__source ${IS_MOCK ? 'is-mock' : 'is-live'}`}
          title={IS_MOCK ? 'Rendering fixture data' : 'Rendering live data'}
        >
          <span className="topbar__source-dot" aria-hidden="true" />
          <span className="topbar__source-text">{IS_MOCK ? 'Mock' : 'Live'}</span>
        </span>
      </div>
    </header>
  );
}
