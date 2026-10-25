import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderPlus,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const STATUS_COLORS = {
  Planning: '#849B54',
  Active: '#606B3D',
  'On Hold': '#e09f3e',
  Completed: '#C8DEA0',
  Archived: '#828F75',
};

const PRIORITY_COLORS = {
  Low: '#7ab95f',
  Medium: '#72a5f5',
  High: '#e5a448',
  Urgent: '#f07b7b',
};

export default function Analytics() {
  const { projects, tasks, milestones, stats, getProjectProgress } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');

  // Distribution Data: Project Status
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const projectStatusData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: STATUS_COLORS[status] || '#606B3D',
  }));

  // Distribution Data: Task Priority
  const priorityCounts = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});
  const taskPriorityData = Object.keys(priorityCounts).map((priority) => ({
    name: priority,
    value: priorityCounts[priority],
    color: PRIORITY_COLORS[priority] || '#C8DEA0',
  }));

  // Real Task Status Velocity Metrics (zero fake hardcoded numbers)
  const taskStatusBreakdown = [
    { name: 'To Do', count: tasks.filter((t) => t.status === 'To Do').length },
    { name: 'In Progress', count: tasks.filter((t) => t.status === 'In Progress').length },
    { name: 'Testing', count: tasks.filter((t) => t.status === 'Testing').length },
    { name: 'Completed', count: tasks.filter((t) => t.status === 'Completed').length },
  ];

  // CSV Export Handler
  const exportToCSV = () => {
    const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- PROJECT SUMMARY ---\n';
    csvContent += 'ID,Name,Status,Priority,Progress %,Budget,Deadline\n';

    projects.forEach((p) => {
      csvContent += `${escapeCSV(p.id)},${escapeCSV(p.name)},${escapeCSV(p.status)},${escapeCSV(p.priority)},${getProjectProgress(p.id)},${p.budget || 0},${escapeCSV(p.deadline)}\n`;
    });

    csvContent += '\n--- TASK DETAILS ---\n';
    csvContent += 'ID,Title,Project,Status,Priority,Due Date,Estimated Hours\n';

    tasks.forEach((t) => {
      const prj = projects.find((p) => p.id === t.project_id);
      csvContent += `${escapeCSV(t.id)},${escapeCSV(t.title)},${escapeCSV(prj?.name || 'General')},${escapeCSV(t.status)},${escapeCSV(t.priority)},${escapeCSV(t.due_date)},${t.estimated_hours || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VeroPlan_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = projects.length > 0 || tasks.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner & Export */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px' }}>Analytics & Productivity Reports</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Metrics compiled in real-time from active project records and task logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          {hasData && (
            <button className="btn btn-primary" onClick={exportToCSV}>
              <Download size={15} /> Export CSV Report
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Success Rate</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-color)', margin: '6px 0' }}>
            {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {stats.completedProjects} of {stats.totalProjects} projects marked completed
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Task Execution Velocity</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0' }}>
            {stats.overallProgress}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {stats.tasksCompleted} of {stats.totalTasks} tasks completed to date
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Urgent & Overdue Attention</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stats.overdueTasks > 0 ? 'var(--color-status-danger)' : 'var(--color-status-success)', margin: '6px 0' }}>
            {stats.overdueTasks}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {stats.overdueTasks === 0 ? 'All deadlines are on schedule' : 'Tasks requiring immediate delivery'}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roadmap Milestones</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-color)', margin: '6px 0' }}>
            {stats.completedMilestones} / {milestones.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {milestones.length > 0 ? Math.round((stats.completedMilestones / milestones.length) * 100) : 0}% milestones completed
          </p>
        </div>
      </div>

      {/* Main Charts or Empty State */}
      {!hasData ? (
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
            <BarChart3 size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
            No analytics yet
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
            Your analytics will appear as you create projects and complete tasks.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isGuest) {
                openAuthPrompt({
                  title: 'Sign in to create projects',
                  message: 'Create an account to start tracking analytics and productivity metrics in VeroPlan.',
                });
              } else {
                navigate('/projects');
              }
            }}
          >
            <Plus size={16} /> Create your first project
          </button>
        </div>
      ) : (
        <>
          {/* Visual Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Project Status Pie Chart */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Project Status Distribution</h3>
              <div style={{ width: '100%', height: 260 }}>
                {projectStatusData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No project status data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Task Priority Distribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Task Priority Distribution</h3>
              <div style={{ width: '100%', height: 260 }}>
                {taskPriorityData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No task priority data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskPriorityData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Task Status Breakdown Bar Chart */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Current Task Status Allocation</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusBreakdown} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary-olive)" name="Task Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
