import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dataService } from '../services/dataService';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      const [ws, prjs, tsks, mls, docs, acts, notifs] = await Promise.all([
        dataService.getWorkspace(),
        dataService.getProjects(),
        dataService.getTasks(),
        dataService.getMilestones(),
        dataService.getDocuments(),
        dataService.getActivityLogs(),
        dataService.getNotifications(),
      ]);

      setWorkspace(ws);
      setProjects(prjs || []);
      setTasks(tsks || []);
      setMilestones(mls || []);
      setDocuments(docs || []);
      setActivityLogs(acts || []);
      setNotifications(notifs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
      setError(err.message || 'Error loading records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Listen for custom change events
    const handleChange = () => refreshData();
    window.addEventListener('projecthub:data-changed', handleChange);
    window.addEventListener('veroplan:data-changed', handleChange);
    return () => {
      window.removeEventListener('projecthub:data-changed', handleChange);
      window.removeEventListener('veroplan:data-changed', handleChange);
    };
  }, [refreshData]);

  // Project Progress Calculation: real tasks completed / total tasks in project
  const getProjectProgress = useCallback(
    (projectId) => {
      const projectTasks = tasks.filter((t) => t.project_id === projectId);
      if (projectTasks.length === 0) return 0;
      const completed = projectTasks.filter((t) => t.status === 'Completed').length;
      return Math.round((completed / projectTasks.length) * 100);
    },
    [tasks]
  );

  // Compute live dashboard metrics from actual database records
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'Active').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const planningProjects = projects.filter((p) => p.status === 'Planning').length;
    const onHoldProjects = projects.filter((p) => p.status === 'On Hold').length;

    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    
    const tasksDueToday = tasks.filter(
      (t) => t.due_date === todayStr && t.status !== 'Completed'
    ).length;

    const overdueTasks = tasks.filter(
      (t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed'
    ).length;

    const overallProgress =
      totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    const pendingMilestones = milestones.filter((m) => m.status !== 'Completed').length;
    const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      totalTasks,
      tasksCompleted,
      inProgressTasks,
      tasksDueToday,
      overdueTasks,
      overallProgress,
      pendingMilestones,
      completedMilestones,
    };
  }, [projects, tasks, milestones]);

  // CRUD Actions
  const createProject = async (data) => {
    const created = await dataService.createProject(data);
    await refreshData();
    return created;
  };

  const updateProject = async (id, updates) => {
    const updated = await dataService.updateProject(id, updates);
    await refreshData();
    return updated;
  };

  const deleteProject = async (id) => {
    await dataService.deleteProject(id);
    await refreshData();
    return true;
  };

  const createTask = async (data) => {
    const created = await dataService.createTask(data);
    await refreshData();
    return created;
  };

  const updateTask = async (id, updates) => {
    const updated = await dataService.updateTask(id, updates);
    await refreshData();
    return updated;
  };

  const updateTaskStatus = async (id, status) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completed_at: status === 'Completed' ? new Date().toISOString() : null,
            }
          : t
      )
    );
    try {
      const updated = await dataService.updateTaskStatus(id, status);
      await refreshData();
      return updated;
    } catch (err) {
      await refreshData(); // Rollback on failure
      throw err;
    }
  };

  const toggleMyDay = async (id) => {
    const updated = await dataService.toggleMyDay(id);
    await refreshData();
    return updated;
  };

  const deleteTask = async (id) => {
    await dataService.deleteTask(id);
    await refreshData();
    return true;
  };

  const createMilestone = async (data) => {
    const created = await dataService.createMilestone(data);
    await refreshData();
    return created;
  };

  const toggleMilestoneCompletion = async (id) => {
    const updated = await dataService.toggleMilestoneCompletion(id);
    await refreshData();
    return updated;
  };

  const deleteMilestone = async (id) => {
    await dataService.deleteMilestone(id);
    await refreshData();
    return true;
  };

  const uploadDocument = async (data) => {
    const created = await dataService.uploadDocument(data);
    await refreshData();
    return created;
  };

  const deleteDocument = async (id) => {
    await dataService.deleteDocument(id);
    await refreshData();
    return true;
  };

  const markNotificationAsRead = async (id) => {
    await dataService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    await dataService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        projects,
        tasks,
        milestones,
        documents,
        activityLogs,
        notifications,
        loading,
        error,
        stats,
        refreshData,
        getProjectProgress,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        updateTaskStatus,
        toggleMyDay,
        deleteTask,
        createMilestone,
        toggleMilestoneCompletion,
        deleteMilestone,
        uploadDocument,
        deleteDocument,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}
