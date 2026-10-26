import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit,
  Folder,
  Layers,
  Flag,
  FileText,
  Activity,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import QuickTaskModal from '../components/common/QuickTaskModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    milestones,
    documents,
    activityLogs,
    getProjectProgress,
    updateTaskStatus,
    deleteTask,
    toggleMilestoneCompletion,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'kanban' | 'milestones' | 'documents' | 'activity'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>Project Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>
          The requested project does not exist or has been removed.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const projectMilestones = milestones.filter((m) => m.project_id === project.id);
  const projectDocuments = documents.filter((d) => d.project_id === project.id);
  const projectActivity = activityLogs.filter(
    (a) => a.entity_id === project.id || a.details?.project_name === project.name
  );

  const progress = getProjectProgress(project.id);
  const completedTasksCount = projectTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ borderLeft: `6px solid ${project.color || 'var(--color-primary-olive)'}` }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '12px', paddingLeft: 0 }}
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className={`badge badge-status-${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
              <span className={`badge badge-priority-${project.priority.toLowerCase()}`}>
                {project.priority} Priority
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '720px' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="action-group" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                <GitBranch size={15} /> GitHub
              </a>
            )}
            {project.deploy_url && (
              <a href={project.deploy_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                <ExternalLink size={15} /> Live App
              </a>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setIsTaskModalOpen(true)}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Progress & Deadlines */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-card)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>
              {progress}% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({completedTasksCount}/{projectTasks.length} tasks)</span>
            </div>
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timeline</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {project.start_date || 'N/A'} → {project.deadline || 'No deadline set'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Estimate</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Personal Project ($0)'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-card)', gap: '8px', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview', icon: Folder },
          { key: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckCircle2 },
          { key: 'kanban', label: 'Kanban Board', icon: Layers },
          { key: 'milestones', label: `Milestones (${projectMilestones.length})`, icon: Flag },
          { key: 'documents', label: `Documents (${projectDocuments.length})`, icon: FileText },
          { key: 'activity', label: 'Activity Log', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="project-overview-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Project Notes & Architecture</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {project.notes || 'No project notes entered yet. Click Edit to add sprint notes, technical specs, or reference links.'}
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Quick Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Tasks:</span>
              <strong>{projectTasks.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Completed:</span>
              <strong style={{ color: 'var(--accent-color)' }}>{completedTasksCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Milestones:</span>
              <strong>{projectMilestones.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Attached Documents:</span>
              <strong>{projectDocuments.length}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card" style={{ padding: 0 }}>
          {projectTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No tasks associated with this project yet.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setIsTaskModalOpen(true)}>
                <Plus size={15} /> Add Task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {projectTasks.map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => updateTaskStatus(task.id, isDone ? 'To Do' : 'Completed')}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {task.due_date ? `Due ${task.due_date}` : 'No due date'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <span className={`badge badge-status-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={14} color="var(--color-status-danger)" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="kanban-board">
          {['To Do', 'In Progress', 'Testing', 'Completed'].map((status) => {
            const colTasks = projectTasks.filter((t) => t.status === status);
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{status}</span>
                  <span className="badge badge-pistachio" style={{ fontSize: '0.7rem' }}>{colTasks.length}</span>
                </div>
                {colTasks.map((task) => (
                  <div key={task.id} className="kanban-task-card">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.title}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <select
                        className="select"
                        style={{ padding: '2px 6px', fontSize: '0.7rem', width: 'auto' }}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Testing">Testing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="card">
          {projectMilestones.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No milestones set for this project.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projectMilestones.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {m.due_date}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleMilestoneCompletion(m.id)}>
                    {m.status === 'Completed' ? 'Mark Incomplete' : 'Complete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card">
          {projectDocuments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No documents uploaded for this project yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectDocuments.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="var(--accent-color)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doc.file_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(doc.file_size / 1024).toFixed(0)} KB</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          {projectActivity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No activity logged for this project yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projectActivity.map((log) => (
                <div key={log.id} style={{ fontSize: '0.825rem' }}>
                  <strong>{log.entity_title}</strong>: {log.action_type} {log.entity_type} at {new Date(log.created_at).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <QuickTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
