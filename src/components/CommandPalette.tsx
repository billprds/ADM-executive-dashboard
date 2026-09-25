import { useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '../lib/types';
import type { TabId } from './Sidebar';
import { IconSearch, IconGrid, IconTimeline, IconUsers, IconEffort, IconRocket } from './icons';
import './CommandPalette.css';

interface Command {
  id: string;
  label: string;
  hint?: string;
  Icon: typeof IconSearch;
  group: 'Navigate' | 'Projects' | 'Actions';
  run: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onTabChange: (tab: TabId) => void;
  onRefresh: () => void;
  onOpenProject: (project: Project) => void;
}

export function CommandPalette({ isOpen, onClose, projects, onTabChange, onRefresh, onOpenProject }: Props) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const commands: Command[] = useMemo(() => [
    {
      id: 'nav-active',
      label: 'Go to Active Projects',
      Icon: IconGrid,
      group: 'Navigate',
      run: () => { onTabChange('active'); onClose(); },
    },
    {
      id: 'nav-timelines',
      label: 'Go to Project Timelines',
      Icon: IconTimeline,
      group: 'Navigate',
      run: () => { onTabChange('timelines'); onClose(); },
    },
    {
      id: 'nav-capacity',
      label: 'Go to Capacity',
      hint: 'Coming in Phase 2',
      Icon: IconUsers,
      group: 'Navigate',
      run: () => { onTabChange('capacity'); onClose(); },
    },
    {
      id: 'nav-effort',
      label: 'Go to Effort Estimates',
      hint: 'Coming in Phase 2',
      Icon: IconEffort,
      group: 'Navigate',
      run: () => { onTabChange('effort'); onClose(); },
    },
    {
      id: 'action-refresh',
      label: 'Refresh data',
      Icon: IconSearch,
      group: 'Actions',
      run: () => { onRefresh(); onClose(); },
    },
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      label: p.name,
      hint: p.number,
      Icon: IconRocket,
      group: 'Projects' as const,
      run: () => { onOpenProject(p); onClose(); },
    })),
  ], [projects, onTabChange, onClose, onRefresh, onOpenProject]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || (c.hint?.toLowerCase().includes(q) ?? false)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = { Navigate: [], Projects: [], Actions: [] };
    filtered.forEach((c) => groups[c.group].push(c));
    return groups;
  }, [filtered]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const flatOrdered = useMemo(() => [
    ...grouped.Navigate,
    ...grouped.Projects,
    ...grouped.Actions,
  ], [grouped]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(flatOrdered.length - 1, i + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); flatOrdered[activeIdx]?.run(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, flatOrdered, activeIdx, onClose]);

  if (!isOpen) return null;

  let cursor = 0;

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className="cmdk__input-row">
          <IconSearch size={14} className="cmdk__input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmdk__input"
            placeholder="Jump to project, tab, or action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="cmdk__esc u-mono">ESC</span>
        </div>

        <div className="cmdk__results">
          {flatOrdered.length === 0 ? (
            <div className="cmdk__empty">No matches for “{query}”</div>
          ) : (
            (['Navigate', 'Projects', 'Actions'] as const).map((groupName) => {
              const items = grouped[groupName];
              if (items.length === 0) return null;
              return (
                <div key={groupName} className="cmdk__group">
                  <div className="cmdk__group-label u-label">{groupName}</div>
                  {items.map((c) => {
                    const idx = cursor++;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`cmdk__item ${idx === activeIdx ? 'is-active' : ''}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={c.run}
                      >
                        <c.Icon size={14} className="cmdk__item-icon" />
                        <span className="cmdk__item-label">{c.label}</span>
                        {c.hint && <span className="cmdk__item-hint u-mono">{c.hint}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="cmdk__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
