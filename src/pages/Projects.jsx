import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Archive,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Projects() {
  const { projects, createProject, updateProject, deleteProject, getProjectProgress } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updated_at'); // 'name' | 'deadline' | 'progress' | 'updated_at'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    color: '#606B3D',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: '',
    github_url: '',
    deploy_url: '',
    notes: '',
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      priority: 'Medium',
      color: '#606B3D',
      start_date: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: '',
      github_url: '',
      deploy_url: '',
      notes: '',
    });
    setEditingProject(null);
    setSubmitError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      color: project.color || '#606B3D',
      start_date: project.start_date || '',
      deadline: project.deadline || '',
      budget: project.budget || '',
      github_url: project.github_url || '',
      deploy_url: project.deploy_url || '',
      notes: project.notes || '',
    });
    setSubmitError(null);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        if (formData.status === 'Completed' && editingProject.status !== 'Completed') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        await createProject(formData);
      }
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Project submit error:', err);
      setSubmitError(err.message || 'Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (project, e) => {
    e.stopPropagation();
    const newStatus = project.status === 'Archived' ? 'Active' : 'Archived';
    await updateProject(project.id, { status: newStatus });
  };

  const handleToggleComplete = async (project, e) => {
    e.stopPropagation();
    const newStatus = project.status === 'Completed' ? 'Active' : 'Completed';
    await updateProject(project.id, { status: newStatus });
    if (newStatus === 'Completed') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Filter and sort
  const filteredProjects = projects
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'deadline') return (a.deadline || '9999').localeCompare(b.deadline || '9999');
      if (sortBy === 'progress') return getProjectProgress(b.id) - getProjectProgress(a.id);
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
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
              <strong>Guest Workspace:</strong> Projects created here are stored locally in your browser.
              Confirm your email and sign in to store all projects and tasks permanently in the Supabase database.
            </span>
          </div>
          <Link to="/login" className="btn btn-sm btn-outline">
            Sign In to Cloud Database
          </Link>
        </div>
      )}

      {/* Top Filter & Action Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search projects..."
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          <select className="select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select className="select" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="updated_at">Sort: Recently Updated</option>
            <option value="name">Sort: Name</option>
            <option value="progress">Sort: Progress %</option>
            <option value="deadline">Sort: Deadline</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-card)' }}>
            <button
              className={`btn btn-ghost btn-icon btn-icon-sm ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ background: viewMode === 'grid' ? 'var(--bg-card-hover)' : 'transparent' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={15} />
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

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <FolderPlus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Projects Container */}
      {filteredProjects.length === 0 ? (
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
            <FolderPlus size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
            {searchQuery || statusFilter !== 'All' ? 'No matching projects' : 'No projects yet'}
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
            {searchQuery || statusFilter !== 'All'
              ? `No projects matched your criteria. Try adjusting your search or filters.`
              : 'Your workspace is ready. Create your first project to get started.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              <FolderPlus size={16} /> Create your first project
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/tasks')}>
              Explore task boards
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredProjects.map((project) => {
            const progress = getProjectProgress(project.id);
            const isCompleted = project.status === 'Completed';
            const isArchived = project.status === 'Archived';

            return (
              <div
                key={project.id}
                className="card card-hoverable"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  cursor: 'pointer',
                  borderTop: `4px solid ${project.color || 'var(--color-primary-olive)'}`,
                  opacity: isArchived ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className={`badge badge-status-${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => handleToggleComplete(project, e)}
                        title={isCompleted ? 'Mark active' : 'Mark completed'}
                      >
                        <CheckCircle size={15} color={isCompleted ? 'var(--accent-color)' : 'var(--text-muted)'} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => handleToggleArchive(project, e)}
                        title={isArchived ? 'Restore from archive' : 'Archive project'}
                      >
                        {isArchived ? <RotateCcw size={15} /> : <Archive size={15} />}
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => handleOpenEdit(project, e)}
                        title="Edit project"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProjectId(project.id);
                        }}
                        title="Delete project"
                      >
                        <Trash2 size={15} color="var(--color-status-danger)" />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5, minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Completion</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{progress}%</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Metadata footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} />
                      <span>{project.deadline ? `Due ${project.deadline}` : 'No deadline'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}>
                          <GitBranch size={14} />
                        </a>
                      )}
                      {project.deploy_url && (
                        <a href={project.deploy_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
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
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>Project</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>Priority</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>Progress</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>Deadline</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const progress = getProjectProgress(project.id);
                return (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    className="hover:bg-card-hover"
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{project.name}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge badge-status-${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge badge-priority-${project.priority.toLowerCase()}`}>
                        {project.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-container" style={{ width: '80px' }}>
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {project.deadline || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => handleOpenEdit(project, e)}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProjectId(project.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} color="var(--color-status-danger)" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="620px"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" form="project-form" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSubmit}>
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
              🌱 <strong>Guest mode:</strong> This project will be saved locally. Confirm your email and sign in to store all projects in the Supabase database.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Aura Design System"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              placeholder="Brief description of objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              <label className="form-label">Target Deadline</label>
              <input
                type="date"
                className="input"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">GitHub Repository URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Live Deployment URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={formData.deploy_url}
                onChange={(e) => setFormData({ ...formData, deploy_url: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project Color Accent</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['#606B3D', '#C8DEA0', '#849B54', '#22291F', '#4e5731', '#e09f3e'].map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setFormData({ ...formData, color: col })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: col,
                    border: formData.color === col ? '2px solid #FFFFFF' : '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingProjectId)}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={() => {
          if (deletingProjectId) deleteProject(deletingProjectId);
        }}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks, milestones, and documents will also be removed."
      />
    </div>
  );
}
