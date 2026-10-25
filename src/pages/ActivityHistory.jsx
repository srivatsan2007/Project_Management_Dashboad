import React, { useState } from 'react';
import {
  Activity,
  Folder,
  CheckCircle2,
  Upload,
  Flag,
  Trash2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ActivityHistory() {
  const { activityLogs, projects } = useWorkspace();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');

  const filteredLogs = activityLogs.filter((log) => {
    const matchType = selectedType === 'All' || log.entity_type === selectedType;
    const matchProject =
      selectedProject === 'All' ||
      log.details?.project_name === selectedProject ||
      log.entity_id === selectedProject;
    return matchType && matchProject;
  });

  const getActionIcon = (action, entity) => {
    if (action === 'complete') return <CheckCircle2 size={16} color="var(--accent-color)" />;
    if (action === 'upload') return <Upload size={16} color="var(--color-status-info)" />;
    if (action === 'delete') return <Trash2 size={16} color="var(--color-status-danger)" />;
    if (entity === 'milestone') return <Flag size={16} color="var(--color-status-warning)" />;
    if (entity === 'project') return <Folder size={16} color="var(--color-primary-olive)" />;
    return <Activity size={16} color="var(--accent-color)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>System Audit Trail & Activity</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Chronological audit logs of project updates, task state changes, and document vault actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Event Types</option>
            <option value="project">Project Events</option>
            <option value="task">Task Events</option>
            <option value="milestone">Milestone Events</option>
            <option value="document">Document Events</option>
          </select>

          <select
            className="select"
            style={{ width: 'auto' }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card">
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                color: 'var(--accent-color)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <Activity size={24} />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              No activity logged yet
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', marginInline: 'auto' }}>
              Your recent project creations, task updates, status changes, and document uploads will appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  paddingBottom: idx === filteredLogs.length - 1 ? 0 : '16px',
                  borderBottom: idx === filteredLogs.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getActionIcon(log.action_type, log.entity_type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {log.entity_title}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className="badge badge-olive" style={{ fontSize: '0.675rem', textTransform: 'uppercase' }}>
                      {log.action_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Entity: {log.entity_type}
                    </span>
                    {log.details?.from && log.details?.to && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>
                        ({log.details.from} → {log.details.to})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
