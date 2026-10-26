import React, { useState } from 'react';
import {
  Sun,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Calendar,
  Sparkles,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

export default function MyDay() {
  const { tasks, updateTaskStatus, toggleMyDay, createTask, deleteTask } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();

  const [quickTitle, setQuickTitle] = useState('');
  const [dailyNote, setDailyNote] = useState(() => {
    return localStorage.getItem('veroplan_daily_note') || '';
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleSaveNote = (text) => {
    setDailyNote(text);
    localStorage.setItem('veroplan_daily_note', text);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    try {
      await createTask({
        title: quickTitle.trim(),
        is_my_day: true,
        is_daily_priority: true,
        due_date: todayStr,
        priority: 'High',
        status: 'To Do',
        estimated_hours: 1,
      });
      setQuickTitle('');
    } catch (err) {
      console.error('MyDay quick add error:', err);
    }
  };

  // Today's tasks: tasks flagged for My Day OR tasks due today
  const myDayTasks = tasks.filter((t) => t.is_my_day || t.due_date === todayStr);
  const completedToday = myDayTasks.filter((t) => t.status === 'Completed');
  const pendingToday = myDayTasks.filter((t) => t.status !== 'Completed');

  // Overdue tasks that need attention
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed'
  );

  const totalEstimatedHours = myDayTasks.reduce(
    (acc, t) => acc + (Number(t.estimated_hours) || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(96, 107, 61, 0.4) 0%, rgba(34, 41, 31, 0.9) 100%)',
          border: '1px solid var(--border-strong)',
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sun size={18} /> MY DAY FOCUS
          </div>
          <h1 style={{ fontSize: '1.85rem', margin: '0 0 6px', color: 'var(--text-primary)' }}>{formattedToday}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            {completedToday.length} of {myDayTasks.length} tasks completed today. Estimated effort:{' '}
            <strong style={{ color: 'var(--accent-color)' }}>{totalEstimatedHours} hours</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ textAlign: 'center', padding: '10px 18px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-color)' }}>
              {pendingToday.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Remaining</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 18px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-status-success)' }}>
              {completedToday.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Focus Tasks & Daily Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
        {/* Left Column: Focus Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Add To My Day Form */}
          <form onSubmit={handleQuickAdd} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Plus size={18} color="var(--accent-color)" />
              <input
                type="text"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '6px 0', fontSize: '0.95rem', flex: 1, minWidth: 0 }}
                placeholder="Add a task to focus on today..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} disabled={!quickTitle.trim()}>
                Add
              </button>
            </div>
          </form>

          {/* Overdue Alert banner if any */}
          {overdueTasks.length > 0 && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(217, 93, 93, 0.1)',
                border: '1px solid rgba(217, 93, 93, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} color="var(--color-status-danger)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  You have <strong>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</strong> from previous days.
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  overdueTasks.forEach((t) => {
                    if (!t.is_my_day) toggleMyDay(t.id);
                  });
                }}
              >
                Pull to My Day
              </button>
            </div>
          )}

          {/* Pending Tasks List */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Active Priorities</h3>
            {pendingToday.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--badge-bg)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Sun size={24} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  No tasks scheduled for today
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '340px', margin: 0 }}>
                  Add a task above to plan your day, or mark tasks from your project backlog.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingToday.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {
                          updateTaskStatus(task.id, 'Completed');
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {task.estimated_hours}h estimated • {task.priority} Priority
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => toggleMyDay(task.id)}
                        title="Remove from My Day"
                      >
                        <Sun size={14} color="var(--accent-color)" />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={14} color="var(--color-status-danger)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Today List */}
          {completedToday.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Completed Today ({completedToday.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {completedToday.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0,0,0,0.1)',
                      opacity: 0.75,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={16} color="var(--accent-color)" />
                      <span style={{ textDecoration: 'line-through', fontSize: '0.85rem' }}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => updateTaskStatus(task.id, 'To Do')}
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Daily Focus Notes & Sprint Target */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Daily Focus Notes</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Keep your intentions and scratchpad notes front and center.
            </p>
            <textarea
              className="textarea"
              style={{ minHeight: '160px', fontSize: '0.875rem' }}
              value={dailyNote}
              onChange={(e) => handleSaveNote(e.target.value)}
              placeholder="What is your singular priority today? Jot down thoughts, blockers, or reference keys..."
            />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Productivity Tips</h3>
            <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Group similar tasks together to minimize context switching.</li>
              <li>Aim for 3 high-impact deliverables per day.</li>
              <li>Check off subtasks as you proceed to maintain momentum.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
