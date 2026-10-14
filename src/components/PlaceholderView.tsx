import { Panel } from './primitives';
import './PlaceholderView.css';
interface Props { title: string; description: string; plannedFeatures: string[]; }
export function PlaceholderView({ title, description, plannedFeatures }: Props) {
  return (
    <div className="placeholder">
      <Panel title={title}>
        <p className="placeholder__desc">{description}</p>
        <div className="placeholder__section">
          <div className="u-label placeholder__label">Planned features</div>
          <ul className="placeholder__list">
            {plannedFeatures.map((f, i) => <li key={i} className="placeholder__item"><span className="placeholder__bullet"/>{f}</li>)}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
