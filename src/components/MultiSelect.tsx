import { useEffect, useRef, useState } from 'react';
import './MultiSelect.css';
interface Option { value: string; label: string; }
interface Props { id: string; label: string; options: Option[]; selected: Set<string>; allLabel?: string; onChange: (next: Set<string>) => void; }
export function MultiSelect({ id, label, options, selected, allLabel = 'All', onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const allSelected = selected.size === 0 || selected.size === options.length;
  const displayText = allSelected ? allLabel : selected.size === 1 ? options.find(o => selected.has(o.value))?.label ?? `${selected.size} selected` : `${selected.size} selected`;
  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value); else next.add(value);
    if (next.size === options.length) onChange(new Set()); else onChange(next);
  }
  return (
    <div className="ms-wrap" ref={ref}>
      <label className="u-label ms-label" htmlFor={id}>{label}</label>
      <button id={id} type="button" className={`ms-trigger ${open ? 'is-open' : ''} ${!allSelected ? 'has-selection' : ''}`} onClick={() => setOpen(v => !v)}>
        <span className="ms-trigger-text">{displayText}</span><span className="ms-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown">
          <button type="button" className={`ms-option ms-option--all ${allSelected ? 'is-checked' : ''}`} onClick={() => onChange(new Set())}>
            <span className="ms-checkbox">{allSelected ? '✓' : ''}</span><span>{allLabel}</span>
          </button>
          <div className="ms-divider"/>
          {options.map(o => (
            <button key={o.value} type="button" className={`ms-option ${selected.has(o.value) ? 'is-checked' : ''}`} onClick={() => toggle(o.value)}>
              <span className="ms-checkbox">{selected.has(o.value) ? '✓' : ''}</span><span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
