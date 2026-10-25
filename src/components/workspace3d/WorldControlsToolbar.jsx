import React from 'react';
import {
  RotateCcw,
  Compass,
  Layers,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Eye,
} from 'lucide-react';

export default function WorldControlsToolbar({
  cameraView,
  setCameraView,
  autoRotate,
  setAutoRotate,
  projects = [],
  selectedProjectId = 'All',
  onSelectProjectFilter = () => {},
  onResetView = () => {},
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 90,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(34, 41, 31, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '6px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Reset Camera */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={onResetView}
        title="Reset camera to default isometric view"
        style={{ fontSize: '0.75rem', gap: '5px' }}
      >
        <RotateCcw size={14} />
        <span className="hide-on-mobile">Reset View</span>
      </button>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

      {/* Isometric vs Top-Down View Toggle */}
      <button
        className={`btn btn-sm ${cameraView === 'iso' ? 'btn-accent' : 'btn-ghost'}`}
        onClick={() => setCameraView('iso')}
        title="Isometric 3D Perspective"
        style={{ fontSize: '0.75rem' }}
      >
        <Compass size={14} />
        <span>Isometric</span>
      </button>

      <button
        className={`btn btn-sm ${cameraView === 'top' ? 'btn-accent' : 'btn-ghost'}`}
        onClick={() => setCameraView('top')}
        title="Top-Down Overhead Blueprint"
        style={{ fontSize: '0.75rem' }}
      >
        <Layers size={14} />
        <span>Top-Down</span>
      </button>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

      {/* Auto-Rotate Spin Toggle */}
      <button
        className={`btn btn-sm ${autoRotate ? 'btn-accent' : 'btn-ghost'}`}
        onClick={() => setAutoRotate(!autoRotate)}
        title={autoRotate ? 'Pause 3D rotation' : 'Enable ambient camera rotation'}
        style={{ fontSize: '0.75rem', gap: '5px' }}
      >
        {autoRotate ? <Pause size={14} /> : <Play size={14} />}
        <span className="hide-on-mobile">Auto-Rotate</span>
      </button>

      {/* Project Filter Select (Highlight specific project zone) */}
      {projects.length > 0 && (
        <>
          <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="var(--color-pistachio-accent)" />
            <select
              className="select"
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                height: 'auto',
                width: 'auto',
                background: 'var(--bg-input)',
              }}
              value={selectedProjectId}
              onChange={(e) => onSelectProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
