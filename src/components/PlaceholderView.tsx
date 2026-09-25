import { Panel } from './primitives';
import './PlaceholderView.css';

interface Props {
  title: string;
  description: string;
  plannedFeatures: string[];
}

export function PlaceholderView({ title, description, plannedFeatures }: Props) {
  return (
    <div className="placeholder">
      <Panel title={title} meta="Not yet implemented">
        <p className="placeholder__desc">{description}</p>
        <div className="placeholder__section">
          <div className="u-label placeholder__label">Planned for this view</div>
          <ul className="placeholder__list">
            {plannedFeatures.map((f, i) => (
              <li key={i} className="placeholder__item">
                <span className="placeholder__bullet" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
