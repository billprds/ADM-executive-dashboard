import type { ReactNode } from 'react';
import './primitives.css';

interface PanelProps {
  title?: string;
  meta?: string;
  actions?: ReactNode;
  children?: ReactNode;
  noPad?: boolean;
  dense?: boolean;
}

export function Panel({ title, meta, actions, children, noPad, dense }: PanelProps) {
  return (
    <div className={`panel ${dense ? 'panel--dense' : ''}`}>
      {(title || actions) && (
        <div className="panel__header">
          <div className="panel__header-left">
            {title && <span className="panel__title">{title}</span>}
            {meta && <span className="panel__meta">{meta}</span>}
          </div>
          {actions && <div className="panel__actions">{actions}</div>}
        </div>
      )}
      <div className={noPad ? 'panel__body--nopad' : 'panel__body'}>{children}</div>
    </div>
  );
}
