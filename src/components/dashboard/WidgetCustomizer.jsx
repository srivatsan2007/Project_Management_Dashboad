import React, { useState } from 'react';
import {
  X,
  Plus,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Maximize2,
  RotateCcw,
  Save,
  Check,
  BookmarkPlus,
} from 'lucide-react';
import { DEFAULT_DASHBOARD_LAYOUT } from '../../lib/seedData';

const AVAILABLE_WIDGETS = [
  { id: 'widget-stats', title: 'Key Performance Metrics', defaultSpan: 12, defaultSize: 'compact' },
  { id: 'widget-my-day', title: "Today's Focus & Priorities", defaultSpan: 8, defaultSize: 'standard' },
  { id: 'widget-deadlines', title: 'Upcoming Deadlines', defaultSpan: 4, defaultSize: 'standard' },
  { id: 'widget-progress-chart', title: 'Project Progress Overview', defaultSpan: 6, defaultSize: 'standard' },
  { id: 'widget-velocity-chart', title: 'Task Completion Velocity', defaultSpan: 6, defaultSize: 'standard' },
  { id: 'widget-recent-projects', title: 'Recent Active Projects', defaultSpan: 8, defaultSize: 'standard' },
  { id: 'widget-milestones', title: 'Milestones Radar', defaultSpan: 4, defaultSize: 'standard' },
  { id: 'widget-recent-activity', title: 'Recent Activity Stream', defaultSpan: 6, defaultSize: 'standard' },
  { id: 'widget-recent-docs', title: 'Project Documents Vault', defaultSpan: 6, defaultSize: 'compact' },
];

export default function WidgetCustomizer({
  isOpen,
  onClose,
  layout,
  setLayout,
  presets,
  activePreset,
  onApplyPreset,
  onSaveNewPreset,
  onRestoreDefaults,
}) {
  const [newPresetName, setNewPresetName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleVisibility = (widgetId) => {
    setLayout((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  };

  const moveWidget = (index, direction) => {
    const newLayout = [...layout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    const [moved] = newLayout.splice(index, 1);
    newLayout.splice(targetIndex, 0, moved);
    setLayout(newLayout);
  };

  const cycleSpan = (widgetId) => {
    setLayout((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w;
        let nextSpan = 6;
        if (w.colSpan === 4) nextSpan = 6;
        else if (w.colSpan === 6) nextSpan = 8;
        else if (w.colSpan === 8) nextSpan = 12;
        else if (w.colSpan === 12) nextSpan = 4;
        return { ...w, colSpan: nextSpan };
      })
    );
  };

  const addWidget = (widgetDef) => {
    if (layout.some((w) => w.id === widgetDef.id)) {
      // If already in list but hidden, make visible
      setLayout((prev) =>
        prev.map((w) => (w.id === widgetDef.id ? { ...w, visible: true } : w))
      );
      return;
    }
    setLayout((prev) => [
      ...prev,
      {
        id: widgetDef.id,
        title: widgetDef.title,
        visible: true,
        colSpan: widgetDef.defaultSpan,
        size: widgetDef.defaultSize,
      },
    ]);
  };

  const handleSavePreset = (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveNewPreset(newPresetName.trim());
    setNewPresetName('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(14, 18, 13, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '100%',
          height: '100%',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Customizer Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Customize Dashboard</h2>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Arrange widgets, toggle visibility, and configure grid spans
            </p>
          </div>
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Customizer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Preset Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              Dashboard Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className={`btn btn-sm ${activePreset === preset.name ? 'btn-accent' : 'btn-secondary'}`}
                  onClick={() => onApplyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Widgets Ordering & Sizing */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Active Widget Order & Span
              </label>
              <button
                className="btn btn-ghost btn-sm"
                onClick={onRestoreDefaults}
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                <RotateCcw size={12} /> Reset Layout
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {layout.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: item.visible ? 'var(--bg-card-hover)' : 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-card)',
                    opacity: item.visible ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => toggleVisibility(item.id)}
                      title={item.visible ? 'Hide widget' : 'Show widget'}
                    >
                      {item.visible ? (
                        <Eye size={15} color="var(--accent-color)" />
                      ) : (
                        <EyeOff size={15} color="var(--text-muted)" />
                      )}
                    </button>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Span: {item.colSpan || 12} / 12 cols
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn btn-secondary btn-icon btn-icon-sm"
                      onClick={() => cycleSpan(item.id)}
                      title={`Cycle width (${item.colSpan} cols)`}
                    >
                      <Maximize2 size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-icon-sm"
                      disabled={idx === 0}
                      onClick={() => moveWidget(idx, -1)}
                      title="Move Up"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-icon-sm"
                      disabled={idx === layout.length - 1}
                      onClick={() => moveWidget(idx, 1)}
                      title="Move Down"
                    >
                      <MoveDown size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Hidden / Available Widgets */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              Add Available Widgets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AVAILABLE_WIDGETS.filter(
                (aw) => !layout.some((l) => l.id === aw.id && l.visible)
              ).map((aw) => (
                <button
                  key={aw.id}
                  className="btn btn-secondary btn-sm"
                  onClick={() => addWidget(aw)}
                >
                  <Plus size={13} color="var(--accent-color)" /> {aw.title}
                </button>
              ))}
            </div>
          </div>

          {/* Save As Named Preset */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(200, 222, 160, 0.05)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <label className="form-label" style={{ marginBottom: '6px' }}>
              Save Custom Preset
            </label>
            <form onSubmit={handleSavePreset} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. Sprint Review Mode"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!newPresetName.trim()}>
                <BookmarkPlus size={14} /> Save
              </button>
            </form>
            {savedSuccess && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-status-success)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Preset saved successfully!
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button className="btn btn-primary" onClick={onClose}>
            Done Customizing
          </button>
        </div>
      </div>
    </div>
  );
}
