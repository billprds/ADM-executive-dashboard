import { useEffect, useRef, useState } from 'react';
import type { Project } from '../lib/types';
import type { TabId } from './Sidebar';
import { IconSearch } from './icons';
import './CommandPalette.css';

interface Props { isOpen: boolean; onClose: () => void; projects: Project[]; onTabChange: (t: TabId) => void; onRefresh?: () => void; onOpenProject: (p: Project) => void; }

const TABS: { id: TabId; label: string }[] = [
  { id: 'active', label: 'Active Projects' }, { id: 'timelines', label: 'Project Timelines' },
  { id: 'capacity', label: 'Capacity' }, { id: 'effort', label: 'Effort Estimates' }, { id: 'settings', label: 'Settings' },
];

export function CommandPalette({ isOpen, onClose, projects, onTabChange, onOpenProject }: Props) {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = query.toLowerCase();
  const tabItems = TABS.filter(t => t.label.toLowerCase().includes(q)).map(t => ({ kind: 'tab' as const, label: t.label, sub: 'Navigate', action: () => { onTabChange(t.id); onClose(); } }));
  const projItems = projects.filter(p => p.name.toLowerCase().includes(q) || p.number.toLowerCase().includes(q)).map(p => ({ kind: 'project' as const, label: p.name, sub: p.number, action: () => { onOpenProject(p); onClose(); } }));
  const items = [...tabItems, ...projItems].slice(0, 12);

  useEffect(() => { if (isOpen) { setQuery(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);
  useEffect(() => { setIdx(0); }, [query]);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, items.length-1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i-1, 0)); }
      else if (e.key === 'Enter') { items[idx]?.action(); }
    };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [isOpen, items, idx]);

  if (!isOpen) return null;
  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={e=>e.stopPropagation()}>
        <div className="cmdk__input-row">
          <IconSearch size={14} className="cmdk__input-icon"/>
          <input ref={inputRef} className="cmdk__input" placeholder="Search tabs, projects, actions…" value={query} onChange={e=>setQuery(e.target.value)}/>
          <span className="cmdk__esc">ESC</span>
        </div>
        <div className="cmdk__results">
          {items.length === 0 ? <div className="cmdk__empty">No results for "{query}"</div> : items.map((item,i) => (
            <button key={i} type="button" className={`cmdk__item ${i===idx?'is-active':''}`} onClick={item.action} onMouseEnter={()=>setIdx(i)}>
              <span className="cmdk__item-icon">›</span>
              <span className="cmdk__item-label">{item.label}</span>
              <span className="cmdk__item-hint">{item.sub}</span>
            </button>
          ))}
        </div>
        <div className="cmdk__footer"><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>ESC</kbd> close</span></div>
      </div>
    </div>
  );
}
