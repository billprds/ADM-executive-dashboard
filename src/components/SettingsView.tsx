import { useState } from 'react';
import type { AppSettings } from '../lib/types';
import { Panel } from './primitives';
import { DEFAULT_TEAMS, DEFAULT_STATUSES, teamColor } from '../lib/teams';
import './SettingsView.css';

interface Props {
  settings: AppSettings;
  onSettingsChange: (s: AppSettings) => void;
}

export function SettingsView({ settings, onSettingsChange }: Props) {
  const [newTeam,      setNewTeam]      = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#1a6fc4');
  const [newStatus,    setNewStatus]    = useState('');

  function resolveColor(t: string) {
    return settings.teamColors[t] ?? teamColor(t);
  }

  function updateTeamColor(team: string, color: string) {
    onSettingsChange({
      ...settings,
      teamColors: { ...settings.teamColors, [team]: color },
    });
  }

  function addTeam() {
    const t = newTeam.trim();
    if (!t || settings.teams.includes(t)) return;
    onSettingsChange({
      ...settings,
      teams: [...settings.teams, t],
      teamColors: { ...settings.teamColors, [t]: newTeamColor },
    });
    setNewTeam('');
    setNewTeamColor('#1a6fc4');
  }

  function removeTeam(t: string) {
    if (DEFAULT_TEAMS.includes(t)) return;
    const { [t]: _removed, ...rest } = settings.teamColors;
    onSettingsChange({
      ...settings,
      teams: settings.teams.filter((x) => x !== t),
      teamColors: rest,
    });
  }

  function addStatus() {
    const s = newStatus.trim();
    if (!s || settings.statuses.includes(s)) return;
    onSettingsChange({ ...settings, statuses: [...settings.statuses, s] });
    setNewStatus('');
  }

  function removeStatus(s: string) {
    if (DEFAULT_STATUSES.includes(s)) return;
    onSettingsChange({ ...settings, statuses: settings.statuses.filter((x) => x !== s) });
  }

  return (
    <div className="settings-view">
      {/* Teams */}
      <Panel title="Teams" meta="Configure teams used across projects and timelines">
        <div className="settings-list">
          {settings.teams.map((t) => (
            <div key={t} className="settings-item">
              {/* Color swatch — click to edit */}
              <label className="settings-item__color-wrap" title="Click to change color">
                <input
                  type="color"
                  className="settings-item__color-input"
                  value={resolveColor(t)}
                  onChange={(e) => updateTeamColor(t, e.target.value)}
                />
                <span
                  className="settings-item__swatch settings-item__swatch--clickable"
                  style={{ background: resolveColor(t) }}
                />
              </label>
              <span className="settings-item__label">{t}</span>
              <span className="settings-item__color-hex">{resolveColor(t)}</span>
              {DEFAULT_TEAMS.includes(t) ? (
                <span className="settings-item__default">default</span>
              ) : (
                <button
                  type="button"
                  className="settings-item__remove"
                  onClick={() => removeTeam(t)}
                  title="Remove team"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <div className="settings-add-row">
          <label className="settings-item__color-wrap" title="Pick color for new team">
            <input
              type="color"
              className="settings-item__color-input"
              value={newTeamColor}
              onChange={(e) => setNewTeamColor(e.target.value)}
            />
            <span
              className="settings-item__swatch settings-item__swatch--clickable"
              style={{ background: newTeamColor }}
            />
          </label>
          <input
            type="text"
            className="settings-input"
            placeholder="New team name (e.g. DATA)"
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTeam()}
          />
          <button type="button" className="settings-add-btn" onClick={addTeam} disabled={!newTeam.trim()}>
            Add team
          </button>
        </div>
      </Panel>

      {/* Statuses */}
      <Panel title="Activity statuses" meta="Configure statuses used in the timeline">
        <div className="settings-list">
          {settings.statuses.map((s) => (
            <div key={s} className="settings-item">
              <span className="settings-item__status-dot" />
              <span className="settings-item__label">{s}</span>
              {DEFAULT_STATUSES.includes(s) ? (
                <span className="settings-item__default">default</span>
              ) : (
                <button
                  type="button"
                  className="settings-item__remove"
                  onClick={() => removeStatus(s)}
                  title="Remove status"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <div className="settings-add-row">
          <input
            type="text"
            className="settings-input"
            placeholder="New status (e.g. On Hold)"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStatus()}
          />
          <button type="button" className="settings-add-btn" onClick={addStatus} disabled={!newStatus.trim()}>
            Add status
          </button>
        </div>
      </Panel>
    </div>
  );
}
