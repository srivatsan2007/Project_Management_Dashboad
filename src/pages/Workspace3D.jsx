import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  FolderKanban,
  CheckCircle2,
  Flag,
  Layers,
  Plus,
  Sparkles,
  Info,
  Maximize2,
  List,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import ProjectWorld3D from '../components/workspace3d/ProjectWorld3D';
import ContextualPanel from '../components/workspace3d/ContextualPanel';
import WorldControlsToolbar from '../components/workspace3d/WorldControlsToolbar';

export default function Workspace3D() {
  const {
    projects,
    tasks,
    milestones,
    stats,
    getProjectProgress,
    updateTaskStatus,
    toggleMilestoneCompletion,
  } = useWorkspace();

  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const navigate = useNavigate();

  // State
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [cameraView, setCameraView] = useState('iso'); // 'iso' | 'top' | 'reset'
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [showListView, setShowListView] = useState(false);

  // Filter items if a specific project is selected
  const filteredProjects = selectedProjectFilter === 'All'
    ? projects
    : projects.filter((p) => p.id === selectedProjectFilter);

  const filteredTasks = selectedProjectFilter === 'All'
    ? tasks
    : tasks.filter((t) => t.project_id === selectedProjectFilter);

  const filteredMilestones = selectedProjectFilter === 'All'
    ? milestones
    : milestones.filter((m) => m.project_id === selectedProjectFilter);

  const handleCreateProjectClick = () => {
    if (isGuest) {
      openAuthPrompt({
        title: 'Sign in to create projects',
        message: 'Create an account to spawn interactive 3D project zones and track progress.',
        actionType: 'create_project',
      });
    } else {
      navigate('/projects');
    }
  };

  const handleResetCamera = () => {
    setSelectedEntity(null);
    setCameraView('reset');
    setTimeout(() => setCameraView('iso'), 50);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 100px)', minHeight: '620px' }}>
      {/* Top Header & Summary Stats */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-pistachio-accent)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>
            <Boxes size={16} />
            <span>INTERACTIVE 3D ENVIRONMENT</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
            3D Project Workspace
          </h2>
          <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: 0 }}>
            Live isometric visualization driven by actual database records.
          </p>
        </div>

        {/* Real Summary Metrics Pill Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <FolderKanban size={14} color="var(--color-pistachio-accent)" />
            <span><strong>{stats.totalProjects}</strong> Projects ({stats.activeProjects} Active)</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <CheckCircle2 size={14} color="var(--color-status-success)" />
            <span><strong>{stats.tasksCompleted} / {stats.totalTasks}</strong> Tasks Done</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <Flag size={14} color="var(--color-status-warning)" />
            <span><strong>{stats.completedMilestones} / {milestones.length}</strong> Milestones</span>
          </div>

          {/* Quick List-Alternative Toggle for Accessibility & Mobile */}
          <button
            className={`btn btn-sm ${showListView ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setShowListView(!showListView)}
            title="Toggle Quick Navigation List"
          >
            <List size={14} />
            <span className="hide-on-mobile">List Index</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div
        className="card"
        style={{
          flex: 1,
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--card-radius)',
          border: '1px solid var(--border-card)',
          minHeight: '480px',
        }}
      >
        <ProjectWorld3D
          projects={filteredProjects}
          tasks={filteredTasks}
          milestones={filteredMilestones}
          getProjectProgress={getProjectProgress}
          selectedEntity={selectedEntity}
          onSelectEntity={setSelectedEntity}
          autoRotate={autoRotate}
          cameraView={cameraView}
        />

        {/* Floating Controls Toolbar */}
        <WorldControlsToolbar
          cameraView={cameraView}
          setCameraView={setCameraView}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          projects={projects}
          selectedProjectId={selectedProjectFilter}
          onSelectProjectFilter={setSelectedProjectFilter}
          onResetView={handleResetCamera}
        />

        {/* Selected Entity Contextual Inspector Panel */}
        <ContextualPanel
          selectedEntity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          projects={projects}
          tasks={tasks}
          getProjectProgress={getProjectProgress}
          updateTaskStatus={updateTaskStatus}
          toggleMilestoneCompletion={toggleMilestoneCompletion}
        />

        {/* Empty State Overlay Beacon (When no projects exist in database) */}
        {projects.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 80,
              background: 'rgba(34, 41, 31, 0.92)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 24px',
              textAlign: 'center',
              maxWidth: '420px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ color: 'var(--color-pistachio-accent)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              ✦ MINIMAL 3D FOUNDATION
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Your workspace is waiting for its first project.
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              As you create projects and tasks, interactive 3D zones, depot crates, and milestone obelisks will dynamically populate this world.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleCreateProjectClick}>
              <Plus size={14} /> Create your first project
            </button>
          </div>
        )}

        {/* Quick List Drawer Overlay for Accessibility & Touch Screens */}
        {showListView && (
          <div
            className="card"
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '280px',
              maxHeight: 'calc(100% - 32px)',
              overflowY: 'auto',
              zIndex: 95,
              background: 'rgba(34, 41, 31, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                World Object Index
              </span>
              <button
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={() => setShowListView(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8rem' }}>
              {/* Projects List */}
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-pistachio-accent)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Projects ({projects.length})
                </span>
                {projects.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No projects created</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedEntity({ type: 'project', id: p.id, data: p });
                          setShowListView(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                        <span style={{ color: 'var(--color-pistachio-accent)', fontSize: '0.7rem' }}>{getProjectProgress(p.id)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-pistachio-accent)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Tasks ({tasks.length})
                </span>
                {tasks.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No tasks created</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedEntity({ type: 'task', id: t.id, data: t });
                          setShowListView(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                        <span className={`badge badge-priority-${t.priority?.toLowerCase()}`} style={{ fontSize: '0.625rem', padding: '1px 4px' }}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
