import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Flag,
  Calendar,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ArrowUpRight,
  Plus,
  FileText,
  Activity,
  Check,
  Sun,
  Shield,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useTheme } from '../context/ThemeContext';
import { dataService } from '../services/dataService';
import { DEFAULT_DASHBOARD_LAYOUT, DASHBOARD_PRESETS } from '../lib/seedData';
import StatCard from '../components/common/StatCard';
import GeometricSculpture from '../components/3d/GeometricSculpture';
import WidgetCustomizer from '../components/dashboard/WidgetCustomizer';

export default function Dashboard() {
  const {
    projects,
    tasks,
    milestones,
    documents,
    activityLogs,
    stats,
    updateTaskStatus,
    toggleMyDay,
    toggleMilestoneCompletion,
    getProjectProgress,
  } = useWorkspace();

  const { user, isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const { accentColor } = useTheme();
  const navigate = useNavigate();

  const [layout, setLayout] = useState(DEFAULT_DASHBOARD_LAYOUT);
  const [presets, setPresets] = useState(DASHBOARD_PRESETS);
  const [activePreset, setActivePreset] = useState('Daily Planning');
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load saved preferences layout
  useEffect(() => {
    async function loadConfig() {
      const prefs = await dataService.getPreferences();
      if (prefs?.dashboard_layout?.length > 0) {
        setLayout(prefs.dashboard_layout);
      }
      if (prefs?.dashboard_preset) {
        setActivePreset(prefs.dashboard_preset);
      }
      const savedPresets = await dataService.getPresets();
      if (savedPresets?.length > 0) {
        setPresets(savedPresets);
      }
    }
    loadConfig();
  }, []);

  // Save layout changes to persistence
  const handleSaveLayout = async (newLayout) => {
    setLayout(newLayout);
    await dataService.savePreferences({ dashboard_layout: newLayout });
  };

  const handleApplyPreset = async (preset) => {
    setActivePreset(preset.name);
    setLayout(preset.layout);
    await dataService.savePreferences({
      dashboard_preset: preset.name,
      dashboard_layout: preset.layout,
    });
  };

  const handleSaveNewPreset = async (name) => {
    const saved = await dataService.savePreset(name, layout);
    setPresets((prev) => [...prev, saved]);
    setActivePreset(name);
  };

  const handleRestoreDefaults = async () => {
    setLayout(DEFAULT_DASHBOARD_LAYOUT);
    setActivePreset('Daily Planning');
    await dataService.savePreferences({
      dashboard_layout: DEFAULT_DASHBOARD_LAYOUT,
      dashboard_preset: 'Daily Planning',
    });
  };

  // Date formatting for header
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Genuine velocity chart data computed purely from real tasks completed
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const velocityData = daysOfWeek.map((day, i) => {
    const completedCount = tasks.filter(
      (t) => t.status === 'Completed' && new Date(t.completed_at || t.updated_at).getDay() === (i + 1) % 7
    ).length;
    return {
      day,
      completed: completedCount,
      target: 3,
    };
  });

  const totalCompletedVelocity = velocityData.reduce((acc, curr) => acc + curr.completed, 0);

  // Project progress comparison data (only genuine projects)
  const projectChartData = projects.slice(0, 5).map((p) => ({
    name: p.name.length > 14 ? `${p.name.substring(0, 14)}...` : p.name,
    progress: getProjectProgress(p.id),
  }));

  const handleProtectedAction = (actionTitle, actionMsg, redirectPath) => {
    if (isGuest) {
      openAuthPrompt({
        title: actionTitle,
        message: actionMsg,
      });
    } else {
      navigate(redirectPath);
    }
  };

  // Render specific widgets by id
  const renderWidget = (item) => {
    if (!item.visible) return null;

    const spanClass = `col-span-${item.colSpan || 12}`;

    switch (item.id) {
      case 'widget-stats':
        return (
          <div key={item.id} className={`${spanClass}`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
              <StatCard
                title="Active Projects"
                value={stats.activeProjects}
                subtitle={`${stats.totalProjects} total projects`}
                icon={FolderKanban}
                onClickTo="/projects"
                accent={true}
              />
              <StatCard
                title="Completed Tasks"
                value={`${stats.tasksCompleted} / ${stats.totalTasks}`}
                subtitle={`${stats.overallProgress}% task completion`}
                icon={CheckCircle2}
                trend={`${stats.overallProgress}%`}
                trendPositive={stats.overallProgress > 50}
                onClickTo="/tasks"
              />
              <StatCard
                title="Tasks Due Today"
                value={stats.tasksDueToday}
                subtitle="Scheduled for today"
                icon={Clock}
                onClickTo="/my-day"
              />
              <StatCard
                title="Overdue Tasks"
                value={stats.overdueTasks}
                subtitle={stats.overdueTasks > 0 ? 'Requires attention' : 'All up to date'}
                icon={AlertCircle}
                trend={stats.overdueTasks > 0 ? 'Urgent' : 'Clear'}
                trendPositive={stats.overdueTasks === 0}
                onClickTo="/tasks"
              />
              <StatCard
                title="Pending Milestones"
                value={stats.pendingMilestones}
                subtitle={`${stats.completedMilestones} completed`}
                icon={Flag}
                onClickTo="/milestones"
              />
            </div>
          </div>
        );

      case 'widget-my-day': {
        const todayTasks = tasks.filter((t) => t.is_my_day || t.is_daily_priority);
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Today's Focus & Priorities</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Personal tasks flagged for today
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/my-day')}
              >
                View My Day <ArrowUpRight size={14} />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <Sun size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>No tasks scheduled for today</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '340px', margin: '0 0 16px' }}>
                  Add a task to your daily focus and start planning your work.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleProtectedAction('Sign in to schedule tasks', 'Create an account to add tasks to your daily workspace.', '/tasks')}
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayTasks.slice(0, 5).map((task) => {
                  const isDone = task.status === 'Completed';
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          style={{
                            border: `1px solid ${isDone ? 'var(--accent-color)' : 'var(--border-strong)'}`,
                            background: isDone ? 'var(--accent-color)' : 'transparent',
                            color: isDone ? 'var(--accent-text-color)' : 'transparent',
                          }}
                          onClick={() => updateTaskStatus(task.id, isDone ? 'To Do' : 'Completed')}
                        >
                          <Check size={13} />
                        </button>
                        <div style={{ overflow: 'hidden' }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                            }}
                          >
                            {task.title}
                          </span>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            {task.due_date ? `Due ${task.due_date}` : 'No date'} • {task.priority} Priority
                          </div>
                        </div>
                      </div>
                      <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'widget-deadlines': {
        const upcoming = tasks
          .filter((t) => t.due_date && t.status !== 'Completed')
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 4);

        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Upcoming Deadlines</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent deliverables</p>
              </div>
              <Calendar size={18} color="var(--accent-color)" />
            </div>

            {upcoming.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <Calendar size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>No upcoming deadlines</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '320px', margin: 0 }}>
                  Tasks with scheduled due dates will appear here automatically.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcoming.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate('/tasks')}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                      <span className="badge badge-pistachio" style={{ fontSize: '0.7rem' }}>
                        {task.due_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'widget-progress-chart':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Project Progress Overview</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Computed from completed tasks / total tasks
                </p>
              </div>
              <span className="badge badge-olive">{stats.overallProgress}% Overall</span>
            </div>

            {projectChartData.length === 0 ? (
              <div
                style={{
                  height: 210,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <FolderKanban size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  No projects to display
                </h4>
                <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 0 14px' }}>
                  Create your first project to visualize progress and roadmap metrics.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleProtectedAction('Sign in to create projects', 'Create an account to start planning projects.', '/projects')}
                >
                  <Plus size={14} /> Create Project
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={90} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(val) => [`${val}%`, 'Progress']}
                    />
                    <Bar dataKey="progress" fill="var(--color-primary-olive)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case 'widget-velocity-chart':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Task Completion Velocity</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Velocity trend across sprint days</p>
              </div>
              <TrendingUp size={18} color="var(--accent-color)" />
            </div>

            {totalCompletedVelocity === 0 ? (
              <div
                style={{
                  height: 210,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <TrendingUp size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  No velocity data yet
                </h4>
                <p style={{ fontSize: '0.8rem', maxWidth: '340px', margin: 0 }}>
                  Your analytics will appear as you create projects and complete tasks.
                </p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke={accentColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#velocityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case 'widget-recent-projects':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Active Projects</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Personal initiatives in progress
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
                All Projects <ArrowUpRight size={14} />
              </button>
            </div>

            {projects.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <FolderKanban size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>No projects yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '340px', margin: '0 0 16px' }}>
                  Your workspace is ready. Create your first project to get started.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleProtectedAction('Sign in to create projects', 'Create an account to start tracking projects in VeroPlan.', '/projects')}
                >
                  <Plus size={14} /> Create your first project
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {projects.slice(0, 3).map((project) => {
                  const progress = getProjectProgress(project.id);
                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {project.name}
                        </span>
                        <span className={`badge badge-status-${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                          <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{progress}%</span>
                        </div>
                        <div className="progress-container">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'widget-milestones':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Milestones Radar</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Key roadmap checkpoints</p>
              </div>
              <Flag size={18} color="var(--accent-color)" />
            </div>

            {milestones.length === 0 ? (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <Flag size={20} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>No milestones yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.785rem', maxWidth: '300px', margin: '0 0 12px' }}>
                  Set checkpoints and sprint milestones for your projects.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleProtectedAction('Sign in to add milestones', 'Create an account to track milestones in VeroPlan.', '/milestones')}
                >
                  <Plus size={13} /> Add Milestone
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {milestones.slice(0, 4).map((m) => {
                  const isCompleted = m.status === 'Completed';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-icon-sm"
                          style={{
                            border: `1px solid ${isCompleted ? 'var(--accent-color)' : 'var(--border-strong)'}`,
                            background: isCompleted ? 'var(--accent-color)' : 'transparent',
                            color: isCompleted ? 'var(--accent-text-color)' : 'transparent',
                          }}
                          onClick={() => toggleMilestoneCompletion(m.id)}
                        >
                          <Check size={12} />
                        </button>
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Due: {m.due_date}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-pistachio" style={{ fontSize: '0.675rem' }}>
                        {m.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'widget-recent-activity':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Activity Stream</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit log of system actions</p>
              </div>
              <Activity size={18} color="var(--accent-color)" />
            </div>

            {activityLogs.length === 0 ? (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <Activity size={20} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>No recent activity yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.785rem', maxWidth: '300px', margin: 0 }}>
                  Actions like creating projects or completing tasks will be tracked here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.8rem' }}>
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                        marginTop: '6px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.entity_title}</span>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>({log.action_type} {log.entity_type})</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'widget-recent-docs':
        return (
          <div key={item.id} className={`${spanClass} card`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Project Documents Vault</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recent project attachments</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/documents')}>
                Vault <ArrowUpRight size={14} />
              </button>
            </div>

            {documents.length === 0 ? (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <FileText size={20} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>No documents uploaded yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.785rem', maxWidth: '300px', margin: '0 0 12px' }}>
                  Sign in to securely upload and manage your files.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/documents')}
                >
                  Go to Vault
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate('/documents')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--accent-color)" />
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{doc.file_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {(doc.file_size / 1024).toFixed(0)} KB • {doc.tags?.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const displayName = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ')[0]
    : user?.email
    ? user.email.split('@')[0]
    : 'Creator';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner with 3D Visual Accent */}
      <div className="card dashboard-welcome-banner">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--badge-bg)', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
            <img src="/logo.jpg" alt="VeroPlan" style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} />
            <span>VEROPLAN</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Plan • Track • Achieve</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span>
            <Sparkles size={12} /> {todayFormatted}
          </div>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px', color: '#F2F4EB' }}>
            {isGuest ? 'Welcome to VeroPlan' : `Welcome back, ${displayName}`}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: '0 0 16px', maxWidth: '580px', lineHeight: 1.5 }}>
            {isGuest ? (
              <span>
                Explore the VeroPlan dashboard and workspaces with clean zero-data state. Sign in or create an account anytime to save private projects, tasks, and documents.
              </span>
            ) : (
              <span>
                You have <strong>{stats.tasksDueToday} tasks scheduled for today</strong> across{' '}
                <strong>{stats.activeProjects} active projects</strong>. Overall roadmap completion is currently at{' '}
                <strong style={{ color: 'var(--accent-color)' }}>{stats.overallProgress}%</strong>.
              </span>
            )}
          </p>
          <div className="dashboard-banner-actions">
            <button className="btn btn-accent btn-sm" onClick={() => navigate('/my-day')}>
              Open Today's Workspace
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCustomizing(true)}
            >
              <SlidersHorizontal size={14} color="var(--accent-color)" /> Customize Layout ({activePreset})
            </button>
          </div>
        </div>

        {/* 3D Sculpture Component */}
        <div className="dashboard-sculpture-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GeometricSculpture height={170} interactive={true} />
        </div>
      </div>

      {/* Dynamic Grid Layout */}
      <div className="dashboard-grid">
        {layout.map((item) => renderWidget(item))}
      </div>

      {/* Widget Customizer Drawer */}
      <WidgetCustomizer
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        layout={layout}
        setLayout={handleSaveLayout}
        presets={presets}
        activePreset={activePreset}
        onApplyPreset={handleApplyPreset}
        onSaveNewPreset={handleSaveNewPreset}
        onRestoreDefaults={handleRestoreDefaults}
      />
    </div>
  );
}
