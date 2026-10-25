import React, { useState } from 'react';
import Modal from './Modal';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function QuickTaskModal({ isOpen, onClose }) {
  const { projects, createTask } = useWorkspace();
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMyDay, setIsMyDay] = useState(true);
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        project_id: projectId || null,
        priority,
        due_date: dueDate || null,
        is_my_day: isMyDay,
        is_daily_priority: isMyDay,
        estimated_hours: Number(estimatedHours) || 0,
        status: 'To Do',
      });
      setTitle('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Task"
      maxWidth="500px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="quick-task-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </>
      }
    >
      <form id="quick-task-form" onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Test responsive navigation bar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select
              className="select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No Project (General)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Est. Effort (Hours)</label>
            <input
              type="number"
              className="input"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <input
            type="checkbox"
            id="my-day-check"
            checked={isMyDay}
            onChange={(e) => setIsMyDay(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
          />
          <label htmlFor="my-day-check" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Add directly to <strong>My Day</strong> priorities
          </label>
        </div>
      </form>
    </Modal>
  );
}
