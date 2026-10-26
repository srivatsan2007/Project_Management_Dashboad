import React, { useState } from 'react';
import {
  Flag,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Check,
  Folder,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Milestones() {
  const {
    milestones,
    projects,
    createMilestone,
    toggleMilestoneCompletion,
    deleteMilestone,
  } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [projectFilter, setProjectFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      project_id: projects[0]?.id || '',
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setSubmitError(null);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createMilestone(formData);
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Milestone submit error:', err);
      setSubmitError(err.message || 'Failed to create milestone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleMilestoneCompletion(id);
    if (currentStatus !== 'Completed') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const filteredMilestones = milestones.filter(
    (m) => projectFilter === 'All' || m.project_id === projectFilter
  );

  const completedCount = filteredMilestones.filter((m) => m.status === 'Completed').length;
  const progressPercent =
    filteredMilestones.length > 0
      ? Math.round((completedCount / filteredMilestones.length) * 100)
      : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar */}
      <div className="card filter-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Milestones & Roadmap Checkpoints</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {completedCount} of {filteredMilestones.length} milestones reached ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="action-group">
          <select
            className="select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Overall Milestones Progress</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{progressPercent}%</span>
        </div>
        <div className="progress-container" style={{ height: '10px' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Milestones Cards Grid / Empty State */}
      {filteredMilestones.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--badge-bg)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Flag size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
            {projectFilter !== 'All' ? 'No milestones for this project' : 'No milestones yet'}
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              maxWidth: '440px',
              lineHeight: 1.5,
              margin: '0 0 24px',
            }}
          >
            Set key checkpoints, sprint goals, and delivery dates for your personal projects.
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Create your first milestone
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredMilestones.map((m) => {
            const project = projects.find((p) => p.id === m.project_id);
            const isDone = m.status === 'Completed';

            return (
              <div
                key={m.id}
                className="card card-hoverable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${isDone ? 'var(--color-status-success)' : 'var(--accent-color)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className={`badge ${isDone ? 'badge-status-completed' : 'badge-pistachio'}`}>
                      {m.status}
                    </span>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => setDeletingId(m.id)}
                      title="Delete milestone"
                    >
                      <Trash2 size={14} color="var(--color-status-danger)" />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {m.description || 'No detailed description.'}
                  </p>

                  {project && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '12px' }}>
                      <Folder size={13} /> {project.name}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    <span>Due {m.due_date}</span>
                  </div>

                  <button
                    className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-accent'}`}
                    onClick={() => handleToggle(m.id, m.status)}
                  >
                    <Check size={14} /> {isDone ? 'Completed' : 'Mark Reached'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Milestone Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Milestone"
        maxWidth="500px"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" form="milestone-form" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Milestone'}
            </button>
          </>
        }
      >
        <form id="milestone-form" onSubmit={handleSubmit}>
          {submitError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-status-danger-bg)',
                border: '1px solid rgba(217, 93, 93, 0.4)',
                color: 'var(--color-status-danger)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{submitError}</span>
            </div>
          )}

          {isGuest && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(96, 107, 61, 0.1)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)',
                fontSize: '0.785rem',
                marginBottom: '16px',
              }}
            >
              🌱 <strong>Guest mode:</strong> This milestone will be saved locally. Confirm your email and sign in to store all milestones in the Supabase database.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Milestone Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Core Engine Architecture V1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              placeholder="What deliverables constitute achieving this milestone?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Related Project</label>
              <select
                className="select"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMilestone(deletingId);
        }}
        title="Delete Milestone"
        message="Are you sure you want to remove this milestone?"
      />
    </div>
  );
}
