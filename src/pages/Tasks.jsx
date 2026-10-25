import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  List as ListIcon,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  Sun,
  Check,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const KANBAN_COLUMNS = ['To Do', 'In Progress', 'Testing', 'Completed'];

export default function Tasks() {
  const {
    tasks,
    projects,
    createTask,
    updateTask,
    updateTaskStatus,
    toggleMyDay,
    deleteTask,
  } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'my-day' | 'overdue' | 'completed'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'To Do',
    priority: 'Medium',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    estimated_hours: '2',
    notes: '',
    is_my_day: false,
    subtasks: [],
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleOpenCreate = (initialStatus = 'To Do') => {
    setEditingTask(null);
    setSubmitError(null);
    setFormData({
      title: '',
      description: '',
      project_id: '',
      status: initialStatus,
      priority: 'Medium',
      start_date: new Date().toISOString().split('T')[0],
      due_date: '',
      estimated_hours: '2',
      notes: '',
      is_my_day: false,
      subtasks: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setSubmitError(null);
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id || '',
      status: task.status,
      priority: task.priority,
      start_date: task.start_date || '',
      due_date: task.due_date || '',
      estimated_hours: String(task.estimated_hours || 0),
      notes: task.notes || '',
      is_my_day: Boolean(task.is_my_day),
      subtasks: task.subtasks || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Date validation
    if (formData.start_date && formData.due_date && formData.due_date < formData.start_date) {
      setSubmitError('Due date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        if (formData.status === 'Completed' && editingTask.status !== 'Completed') {
          confetti({ particleCount: 50, spread: 60 });
        }
      } else {
        await createTask(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Task submit error:', err);
      setSubmitError(err.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subtask helpers
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), is_completed: false },
      ],
    }));
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }));
  };

  const toggleSubtaskStatus = (id) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === id ? { ...s, is_completed: !s.is_completed } : s
      ),
    }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        await updateTaskStatus(taskId, targetStatus);
        if (targetStatus === 'Completed') {
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        }
      }
    }
  };

  // Filter tasks
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProject = projectFilter === 'All' || t.project_id === projectFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    let matchTab = true;
    if (activeTabFilter === 'my-day') matchTab = t.is_my_day;
    if (activeTabFilter === 'overdue') matchTab = t.due_date && t.due_date < todayStr && t.status !== 'Completed';
    if (activeTabFilter === 'completed') matchTab = t.status === 'Completed';

    return matchQuery && matchProject && matchStatus && matchPriority && matchTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Guest Mode Notice */}
      {isGuest && (
        <div
          className="card"
          style={{
            padding: '12px 18px',
            background: 'rgba(96, 107, 61, 0.12)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.15rem' }}>🌱</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <strong>Guest Workspace:</strong> Tasks created here are stored locally in your browser.
              Confirm your email and sign in to store all projects and tasks permanently in the Supabase cloud database.
            </span>
          </div>
          <a href="/login" className="btn btn-sm btn-outline">
            Sign In to Cloud Database
          </a>
        </div>
      )}

      {/* Top Filter and Controls Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search tasks..."
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="select" style={{ width: 'auto' }} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select className="select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* View Switcher and Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-card)' }}>
            <button
              className={`btn btn-ghost btn-icon btn-icon-sm ${viewMode === 'kanban' ? 'active' : ''}`}
              style={{ background: viewMode === 'kanban' ? 'var(--bg-card-hover)' : 'transparent' }}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <Layers size={15} />
            </button>
            <button
              className={`btn btn-ghost btn-icon btn-icon-sm ${viewMode === 'list' ? 'active' : ''}`}
              style={{ background: viewMode === 'list' ? 'var(--bg-card-hover)' : 'transparent' }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ListIcon size={15} />
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => handleOpenCreate()}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { key: 'all', label: `All Tasks (${tasks.length})` },
          { key: 'my-day', label: `My Day (${tasks.filter((t) => t.is_my_day).length})` },
          { key: 'overdue', label: `Overdue (${tasks.filter((t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed').length})` },
          { key: 'completed', label: `Completed (${tasks.filter((t) => t.status === 'Completed').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm ${activeTabFilter === tab.key ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTabFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {KANBAN_COLUMNS.map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            const isOver = dragOverColumn === colStatus;

            return (
              <div
                key={colStatus}
                className={`kanban-col ${isOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, colStatus)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colStatus)}
              >
                <div className="kanban-col-header">
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{colStatus}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-pistachio" style={{ fontSize: '0.7rem' }}>
                      {colTasks.length}
                    </span>
                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => handleOpenCreate(colStatus)}
                      title={`Add task to ${colStatus}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 12px',
                        textAlign: 'center',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '100px',
                      }}
                    >
                      <span>No tasks in {colStatus}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenCreate(colStatus)}
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        <Plus size={13} /> Add task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.project_id);
                      const isDone = task.status === 'Completed';

                      return (
                        <div
                          key={task.id}
                          className="kanban-task-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleOpenEdit(task)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            <button
                              className="btn btn-ghost btn-icon btn-icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMyDay(task.id);
                              }}
                              title={task.is_my_day ? 'Remove from My Day' : 'Add to My Day'}
                            >
                              <Sun size={14} color={task.is_my_day ? 'var(--accent-color)' : 'var(--text-muted)'} />
                            </button>
                          </div>

                          <span
                            style={{
                              fontSize: '0.885rem',
                              fontWeight: 600,
                              lineHeight: 1.4,
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                            }}
                          >
                            {task.title}
                          </span>

                          {project && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                              {project.name}
                            </div>
                          )}

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              {task.subtasks.filter((s) => s.is_completed).length} / {task.subtasks.length} subtasks
                            </div>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.725rem',
                              color: 'var(--text-muted)',
                              borderTop: '1px solid var(--border-subtle)',
                              paddingTop: '8px',
                            }}
                          >
                            <span>{task.due_date ? `Due ${task.due_date}` : 'No date'}</span>
                            <span>{task.estimated_hours}h</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', background: 'var(--bg-input)' }}>
                <th style={{ width: '40px', padding: '12px' }}></th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Task</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Priority</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Due Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const project = projects.find((p) => p.id === task.project_id);
                const isDone = task.status === 'Completed';

                return (
                  <tr
                    key={task.id}
                    onClick={() => handleOpenEdit(task)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {
                          const next = isDone ? 'To Do' : 'Completed';
                          updateTaskStatus(task.id, next);
                          if (next === 'Completed') confetti({ particleCount: 50, spread: 50 });
                        }}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-color)' }}>
                      {project?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-status-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {task.due_date || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => toggleMyDay(task.id)}
                        title={task.is_my_day ? 'Remove from My Day' : 'Add to My Day'}
                      >
                        <Sun size={15} color={task.is_my_day ? 'var(--accent-color)' : 'var(--text-muted)'} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => setDeletingTaskId(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={15} color="var(--color-status-danger)" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        maxWidth="640px"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" form="task-full-form" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </>
        }
      >
        <form id="task-full-form" onSubmit={handleSubmit}>
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
              🌱 <strong>Guest mode:</strong> This task will be saved locally. Confirm your email and sign in to store all tasks in the Supabase database.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Implement drag and drop handlers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Acceptance Criteria</label>
            <textarea
              className="textarea"
              placeholder="Detail the deliverable and requirements..."
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
                <option value="">No Project (General)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="form-group">
            <label className="form-label">Subtasks & Checklist</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSubtask}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {formData.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={sub.is_completed}
                      onChange={() => toggleSubtaskStatus(sub.id)}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <span style={{ fontSize: '0.825rem', textDecoration: sub.is_completed ? 'line-through' : 'none' }}>
                      {sub.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    onClick={() => removeSubtask(sub.id)}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="my-day-task-check"
              checked={formData.is_my_day}
              onChange={(e) => setFormData({ ...formData, is_my_day: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
            />
            <label htmlFor="my-day-task-check" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Flag as priority for <strong>My Day</strong>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingTaskId)}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={() => {
          if (deletingTaskId) deleteTask(deletingTaskId);
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
