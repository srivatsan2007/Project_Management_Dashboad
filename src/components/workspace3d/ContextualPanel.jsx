import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Folder,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Flag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContextualPanel({
  selectedEntity,
  onClose,
  projects = [],
  tasks = [],
  getProjectProgress = () => 0,
  updateTaskStatus,
  toggleMilestoneCompletion,
}) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  if (!selectedEntity) return null;

  const { type, data } = selectedEntity;

  // Handle Task Status Update Directly From 3D Panel
  const handleStatusChange = async (newStatus) => {
    if (!updateTaskStatus || !data?.id) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateTaskStatus(data.id, newStatus);
      if (newStatus === 'Completed') {
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Milestone Toggle Directly From 3D Panel
  const handleMilestoneToggle = async () => {
    if (!toggleMilestoneCompletion || !data?.id) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await toggleMilestoneCompletion(data.id);
      if (data.status !== 'Completed') {
        confetti({ particleCount: 60, spread: 60 });
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update milestone');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="card contextual-3d-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '320px',
        maxHeight: 'calc(100% - 40px)',
        overflowY: 'auto',
        zIndex: 100,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px var(--accent-color-glow)',
        border: '1px solid var(--border-strong)',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '20px',
        background: 'rgba(34, 41, 31, 0.94)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--color-pistachio-accent)',
              letterSpacing: '0.08em',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            3D {type} Inspector
          </span>
          <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
            {data.name || data.title}
          </h3>
        </div>

        <button
          className="btn btn-ghost btn-icon btn-icon-sm"
          onClick={onClose}
          aria-label="Close details panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Error Banner */}
      {updateError && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--color-status-danger-bg)',
            color: 'var(--color-status-danger)',
            fontSize: '0.75rem',
            marginBottom: '12px',
          }}
        >
          {updateError}
        </div>
      )}

      {/* ================= PROJECT DETAILS ================= */}
      {type === 'project' && (() => {
        const progress = getProjectProgress(data.id);
        const projectTasks = tasks.filter((t) => t.project_id === data.id);
        const completedCount = projectTasks.filter((t) => t.status === 'Completed').length;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge badge-status-${data.status?.toLowerCase().replace(' ', '-')}`}>
                {data.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Priority: <strong>{data.priority || 'Medium'}</strong>
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--color-pistachio-accent)' }}>{progress}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {data.description || 'No project description provided.'}
            </div>

            {/* Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '10px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tasks</span>
                <strong>{completedCount} / {projectTasks.length} Done</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Deadline</span>
                <strong>{data.deadline || 'No deadline'}</strong>
              </div>
              {data.budget && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Budget</span>
                  <strong>${Number(data.budget).toLocaleString()}</strong>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: '4px' }}
              onClick={() => navigate(`/projects/${data.id}`)}
            >
              <ExternalLink size={14} /> Open Full Project Page
            </button>
          </div>
        );
      })()}

      {/* ================= TASK DETAILS ================= */}
      {type === 'task' && (() => {
        const parentProject = projects.find((p) => p.id === data.project_id);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge badge-priority-${data.priority?.toLowerCase()}`}>
                {data.priority} Priority
              </span>
              <span className={`badge badge-status-${data.status?.toLowerCase().replace(' ', '-')}`}>
                {data.status}
              </span>
            </div>

            {parentProject && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-pistachio-accent)' }}>
                <Folder size={13} />
                <span>{parentProject.name}</span>
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {data.description || 'No task description provided.'}
            </div>

            {/* Quick Status Changer (Requirement 5: Live editing from 3D) */}
            <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Move Task Depot (3D Position):
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {['To Do', 'In Progress', 'Testing', 'Completed'].map((st) => (
                  <button
                    key={st}
                    className={`btn btn-sm ${data.status === st ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                    onClick={() => handleStatusChange(st)}
                    disabled={isUpdating || data.status === st}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Due: {data.due_date || 'None'}</span>
              <span>Est: {data.estimated_hours || 0}h</span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => navigate('/tasks')}
            >
              Open Tasks Workspace <ArrowRight size={14} />
            </button>
          </div>
        );
      })()}

      {/* ================= MILESTONE DETAILS ================= */}
      {type === 'milestone' && (() => {
        const parentProject = projects.find((p) => p.id === data.project_id);
        const isDone = data.status === 'Completed';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge ${isDone ? 'badge-status-completed' : 'badge-pistachio'}`}>
                {data.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {data.due_date}
              </span>
            </div>

            {parentProject && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-pistachio-accent)' }}>
                <Folder size={13} />
                <span>{parentProject.name}</span>
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {data.description || 'Milestone checkpoint for sprint deliverables.'}
            </div>

            {/* Quick Toggle Reached (Requirement 5) */}
            <button
              className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleMilestoneToggle}
              disabled={isUpdating}
              style={{ width: '100%' }}
            >
              {isDone ? (
                <>
                  <RotateCcw size={14} /> Reopen Checkpoint
                </>
              ) : (
                <>
                  <Check size={14} /> Mark Reached (Completed)
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => navigate('/milestones')}
            >
              View All Milestones <ArrowRight size={14} />
            </button>
          </div>
        );
      })()}
    </div>
  );
}
