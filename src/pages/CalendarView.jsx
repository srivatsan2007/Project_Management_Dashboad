import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flag,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useNavigate } from 'react-router-dom';

export default function CalendarView() {
  const { tasks, projects, milestones, getProjectProgress } = useWorkspace();
  const { isGuest } = useAuth();
  const { openAuthPrompt } = useAuthModal();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month' | 'timeline'
  const [selectedProject, setSelectedProject] = useState('All');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  // Calculate calendar days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Pad blank days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Map events for each date string YYYY-MM-DD
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayTasks = tasks
      .filter((t) => (selectedProject === 'All' || t.project_id === selectedProject))
      .filter((t) => t.due_date === dateStr)
      .map((t) => ({ ...t, eventType: 'task' }));

    const dayMilestones = milestones
      .filter((m) => (selectedProject === 'All' || m.project_id === selectedProject))
      .filter((m) => m.due_date === dateStr)
      .map((m) => ({ ...m, eventType: 'milestone' }));

    const dayProjects = projects
      .filter((p) => (selectedProject === 'All' || p.id === selectedProject))
      .filter((p) => p.deadline === dateStr)
      .map((p) => ({ ...p, eventType: 'project' }));

    return [...dayProjects, ...dayMilestones, ...dayTasks];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, minWidth: '180px' }}>{monthName}</h2>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn btn-secondary btn-icon btn-icon-sm" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={setToday}>
              Today
            </button>
            <button className="btn btn-secondary btn-icon btn-icon-sm" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-card)' }}>
            <button
              className={`btn btn-ghost btn-sm ${viewType === 'month' ? 'active' : ''}`}
              style={{ background: viewType === 'month' ? 'var(--bg-card-hover)' : 'transparent' }}
              onClick={() => setViewType('month')}
            >
              Month Grid
            </button>
            <button
              className={`btn btn-ghost btn-sm ${viewType === 'timeline' ? 'active' : ''}`}
              style={{ background: viewType === 'timeline' ? 'var(--bg-card-hover)' : 'transparent' }}
              onClick={() => setViewType('timeline')}
            >
              Timeline / Gantt
            </button>
          </div>
        </div>
      </div>

      {/* Empty Calendar Notice */}
      {tasks.length === 0 && (
        <div
          className="card"
          style={{
            padding: '12px 18px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={16} color="var(--accent-color)" />
            <span>No scheduled tasks yet. Add a task with a due date to see it here.</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (isGuest) {
                openAuthPrompt({
                  title: 'Sign in to schedule tasks',
                  message: 'Create an account to schedule tasks with due dates in VeroPlan.',
                });
              } else {
                navigate('/tasks');
              }
            }}
          >
            Add Task
          </button>
        </div>
      )}

      {/* Month Grid View */}
      {viewType === 'month' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Day of Week Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              background: 'var(--bg-input)',
              borderBottom: '1px solid var(--border-card)',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              padding: '10px 0',
            }}
          >
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: 'var(--border-card)',
              gap: '1px',
            }}
          >
            {calendarDays.map((day, idx) => {
              const events = getEventsForDay(day);
              const dateStr = day
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : '';
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '110px',
                    background: 'var(--bg-card)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    position: 'relative',
                  }}
                >
                  {day && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isToday ? 800 : 500,
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isToday ? 'var(--accent-color)' : 'transparent',
                          color: isToday ? 'var(--accent-text-color)' : 'var(--text-primary)',
                        }}
                      >
                        {day}
                      </span>
                    </div>
                  )}

                  {events.slice(0, 3).map((ev) => {
                    let badgeStyle = {
                      background: 'rgba(96, 107, 61, 0.25)',
                      color: 'var(--accent-color)',
                      border: '1px solid rgba(200, 222, 160, 0.2)',
                    };
                    if (ev.eventType === 'project') {
                      badgeStyle = {
                        background: 'rgba(200, 222, 160, 0.2)',
                        color: 'var(--accent-color)',
                        border: '1px solid var(--accent-color)',
                      };
                    } else if (ev.eventType === 'milestone') {
                      badgeStyle = {
                        background: 'rgba(224, 159, 62, 0.2)',
                        color: '#f0ad4e',
                        border: '1px solid rgba(224, 159, 62, 0.4)',
                      };
                    }

                    return (
                      <div
                        key={`${ev.eventType}-${ev.id}`}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          ...badgeStyle,
                        }}
                        title={`${ev.eventType.toUpperCase()}: ${ev.title || ev.name}`}
                      >
                        {ev.eventType === 'milestone' && '⚑ '}
                        {ev.title || ev.name}
                      </div>
                    );
                  })}

                  {events.length > 3 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      +{events.length - 3} more
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Timeline / Gantt Style View */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Project & Milestone Schedules</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sequential timelines and milestone deadlines
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
                  No scheduled projects yet. Create a project with start dates and deadlines to view timelines here.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (isGuest) {
                      openAuthPrompt({
                        title: 'Sign in to create projects',
                        message: 'Create an account to start scheduling projects.',
                      });
                    } else {
                      navigate('/projects');
                    }
                  }}
                >
                  Create Project
                </button>
              </div>
            ) : (
              projects.map((p) => {
                const progress = getProjectProgress(p.id);
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>
                        {p.start_date || 'N/A'} → {p.deadline || 'No deadline'} • {progress}%
                      </span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
