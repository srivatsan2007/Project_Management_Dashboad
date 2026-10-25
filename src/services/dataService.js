import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_KEYS = {
  PROJECTS: 'veroplan_projects',
  TASKS: 'veroplan_tasks',
  MILESTONES: 'veroplan_milestones',
  DOCUMENTS: 'veroplan_documents',
  NOTIFICATIONS: 'veroplan_notifications',
  ACTIVITY: 'veroplan_activity',
  PREFERENCES: 'veroplan_preferences',
  PRESETS: 'veroplan_presets',
  WORKSPACE: 'veroplan_workspace',
};

export const DEFAULT_DASHBOARD_LAYOUT = [
  { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
  { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'standard' },
  { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
  { id: 'widget-progress-chart', title: 'Project Progress Overview', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-velocity-chart', title: 'Task Completion Velocity', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 8, size: 'standard' },
  { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 4, size: 'standard' },
  { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-recent-docs', title: 'Project Documents Vault', visible: true, colSpan: 6, size: 'compact' },
];

export const DASHBOARD_PRESETS = [
  {
    id: 'preset-daily-planning',
    name: 'Daily Planning',
    is_system: true,
    layout: [
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'expanded' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 6, size: 'standard' },
    ]
  },
  {
    id: 'preset-project-overview',
    name: 'Project Overview',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 8, size: 'expanded' },
      { id: 'widget-progress-chart', title: 'Project Progress Overview', visible: true, colSpan: 4, size: 'standard' },
      { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-docs', title: 'Project Documents Vault', visible: true, colSpan: 6, size: 'standard' },
    ]
  },
  {
    id: 'preset-dev-workspace',
    name: 'Developer Workspace',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 8, size: 'standard' },
      { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 4, size: 'standard' },
    ]
  },
  {
    id: 'preset-minimal',
    name: 'Minimal Dashboard',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'standard' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
    ]
  }
];

// Helper to safely read localStorage
function getLocalItem(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key}:`, e);
    return fallback;
  }
}

function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('veroplan:data-changed', { detail: { key } }));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// Clean any old legacy mock seed keys from prior builds
export function cleanLegacyStorage() {
  const legacyKeys = [
    'projecthub_projects',
    'projecthub_tasks',
    'projecthub_milestones',
    'projecthub_documents',
    'projecthub_notifications',
    'projecthub_activity',
    'projecthub_auth_user',
    'projecthub_workspace'
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
}

cleanLegacyStorage();

export const dataService = {
  isLive: isSupabaseConfigured,

  async getCurrentUser() {
    if (this.isLive && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        return user || null;
      } catch (err) {
        return null;
      }
    }
    return null;
  },

  // ================= Workspace & Profile =================
  async getWorkspace() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (data) {
          try {
            await supabase.from('workspace_members').upsert({
              workspace_id: data.id,
              user_id: user.id,
              role: 'owner',
            }, { onConflict: 'workspace_id, user_id' });
          } catch (e) {
            // Ignore if already member
          }
          return data;
        }

        // Auto-provision personal workspace for new authenticated user
        if (!error && !data) {
          const { data: newWs, error: insertErr } = await supabase
            .from('workspaces')
            .insert({
              name: 'Personal Workspace',
              slug: 'personal',
              description: 'My primary personal project workspace.',
              owner_id: user.id,
            })
            .select()
            .single();

          if (!insertErr && newWs) {
            await supabase.from('workspace_members').insert({
              workspace_id: newWs.id,
              user_id: user.id,
              role: 'owner',
            });
            return newWs;
          }
        }
      } catch (e) {
        console.warn('Workspace fetch error:', e);
      }
    }

    if (user) {
      return getLocalItem(STORAGE_KEYS.WORKSPACE, {
        id: `ws-${user.id}`,
        name: 'Personal Workspace',
        owner_id: user.id,
      });
    }

    // Guest workspace
    return {
      id: 'guest-ws',
      name: 'Guest Workspace',
      description: 'Explore VeroPlan features. Sign in to save private projects and tasks to the cloud database.',
      role: 'guest',
    };
  },

  async getProfile() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) return data;
      } catch (e) {
        // Table may still be empty
      }
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      };
    }
    return null; // Guest profile is null
  },

  // Migrate any locally created guest records into Supabase cloud database
  async syncLocalToCloud(user) {
    if (!this.isLive || !supabase || !user) return;
    try {
      const localProjects = getLocalItem(STORAGE_KEYS.PROJECTS, []);
      if (localProjects.length > 0) {
        const ws = await this.getWorkspace();
        for (const lp of localProjects) {
          const { id, ...cleanProj } = lp;
          cleanProj.workspace_id = ws.id;
          await supabase.from('projects').insert([cleanProj]);
        }
        setLocalItem(STORAGE_KEYS.PROJECTS, []);
      }

      const localTasks = getLocalItem(STORAGE_KEYS.TASKS, []);
      if (localTasks.length > 0) {
        const ws = await this.getWorkspace();
        for (const lt of localTasks) {
          const { id, ...cleanTask } = lt;
          cleanTask.workspace_id = ws.id;
          await supabase.from('tasks').insert([cleanTask]);
        }
        setLocalItem(STORAGE_KEYS.TASKS, []);
      }
    } catch (err) {
      console.warn('Error syncing local guest data to Supabase cloud:', err);
    }
  },

  // ================= Projects =================
  async getProjects() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase projects query error:', e);
      }
    }
    return getLocalItem(STORAGE_KEYS.PROJECTS, []);
  },

  async createProject(projectData) {
    const user = await this.getCurrentUser();
    const ws = await this.getWorkspace();
    const newProject = {
      name: projectData.name,
      description: projectData.description || '',
      status: projectData.status || 'Planning',
      priority: projectData.priority || 'Medium',
      color: projectData.color || '#606B3D',
      icon: projectData.icon || 'Folder',
      start_date: projectData.start_date || new Date().toISOString().split('T')[0],
      deadline: projectData.deadline || null,
      budget: Number(projectData.budget) || 0,
      github_url: projectData.github_url || '',
      deploy_url: projectData.deploy_url || '',
      notes: projectData.notes || '',
      workspace_id: ws.id,
    };

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
      if (error) {
        console.error('Supabase project creation error:', error);
        throw error;
      }
      await this.logActivity('create', 'project', data.id, data.name);
      return data;
    }

    const localList = getLocalItem(STORAGE_KEYS.PROJECTS, []);
    const record = { id: `proj-${Date.now()}`, ...newProject, created_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.PROJECTS, [record, ...localList]);
    await this.logActivity('create', 'project', record.id, record.name);
    return record;
  },

  async updateProject(projectId, updates) {
    const user = await this.getCurrentUser();
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdates)
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      await this.logActivity('update', 'project', projectId, updates.name || 'Project updated');
      return data;
    }

    const list = getLocalItem(STORAGE_KEYS.PROJECTS, []);
    const updated = list.map((p) => (p.id === projectId ? { ...p, ...cleanUpdates } : p));
    setLocalItem(STORAGE_KEYS.PROJECTS, updated);
    return updated.find((p) => p.id === projectId);
  },

  async deleteProject(projectId) {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
    }

    const list = getLocalItem(STORAGE_KEYS.PROJECTS, []);
    setLocalItem(STORAGE_KEYS.PROJECTS, list.filter((p) => p.id !== projectId));

    // Also remove associated tasks locally
    const tasks = getLocalItem(STORAGE_KEYS.TASKS, []);
    setLocalItem(STORAGE_KEYS.TASKS, tasks.filter((t) => t.project_id !== projectId));

    await this.logActivity('delete', 'project', projectId, 'Project deleted');
    return true;
  },

  // ================= Tasks =================
  async getTasks() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, subtasks(*)')
          .order('order_index', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase tasks query error:', e);
      }
    }
    return getLocalItem(STORAGE_KEYS.TASKS, []);
  },

  async createTask(taskData) {
    const user = await this.getCurrentUser();
    const ws = await this.getWorkspace();
    const newTask = {
      workspace_id: ws.id,
      project_id: taskData.project_id || null,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      start_date: taskData.start_date || new Date().toISOString().split('T')[0],
      due_date: taskData.due_date || null,
      estimated_hours: Number(taskData.estimated_hours) || 0,
      actual_hours: 0,
      notes: taskData.notes || '',
      is_my_day: Boolean(taskData.is_my_day),
      is_daily_priority: Boolean(taskData.is_daily_priority),
      order_index: 0,
      completed_at: taskData.status === 'Completed' ? new Date().toISOString() : null,
    };

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
      if (error) throw error;
      await this.logActivity('create', 'task', data.id, data.title);
      return data;
    }

    const list = getLocalItem(STORAGE_KEYS.TASKS, []);
    const record = { id: `task-${Date.now()}`, ...newTask, created_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.TASKS, [record, ...list]);
    await this.logActivity('create', 'task', record.id, record.title);
    return record;
  },

  async updateTask(taskId, updates) {
    const user = await this.getCurrentUser();
    const fields = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === 'Completed' && !updates.completed_at) {
      fields.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'Completed') {
      fields.completed_at = null;
    }

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase.from('tasks').update(fields).eq('id', taskId).select().single();
      if (error) throw error;
      return data;
    }

    const list = getLocalItem(STORAGE_KEYS.TASKS, []);
    const updated = list.map((t) => (t.id === taskId ? { ...t, ...fields } : t));
    setLocalItem(STORAGE_KEYS.TASKS, updated);
    return updated.find((t) => t.id === taskId);
  },

  async updateTaskStatus(taskId, newStatus) {
    const isCompleted = newStatus === 'Completed';
    return this.updateTask(taskId, {
      status: newStatus,
      completed_at: isCompleted ? new Date().toISOString() : null,
    });
  },

  async toggleMyDay(taskId) {
    const tasks = await this.getTasks();
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return null;
    return this.updateTask(taskId, { is_my_day: !current.is_my_day });
  },

  async deleteTask(taskId) {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    }

    const list = getLocalItem(STORAGE_KEYS.TASKS, []);
    setLocalItem(STORAGE_KEYS.TASKS, list.filter((t) => t.id !== taskId));
    await this.logActivity('delete', 'task', taskId, 'Task deleted');
    return true;
  },

  // ================= Milestones =================
  async getMilestones() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase.from('milestones').select('*').order('due_date', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Milestones query error:', e);
      }
    }
    return getLocalItem(STORAGE_KEYS.MILESTONES, []);
  },

  async createMilestone(data) {
    const user = await this.getCurrentUser();
    const ws = await this.getWorkspace();
    const newMilestone = {
      workspace_id: ws.id,
      project_id: data.project_id,
      title: data.title,
      description: data.description || '',
      due_date: data.due_date,
      status: 'Upcoming',
    };

    if (this.isLive && supabase && user) {
      const { data: created, error } = await supabase.from('milestones').insert([newMilestone]).select().single();
      if (error) throw error;
      await this.logActivity('create', 'milestone', created.id, created.title);
      return created;
    }

    const list = getLocalItem(STORAGE_KEYS.MILESTONES, []);
    const record = { id: `m-${Date.now()}`, ...newMilestone, created_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.MILESTONES, [...list, record]);
    await this.logActivity('create', 'milestone', record.id, record.title);
    return record;
  },

  async toggleMilestoneCompletion(milestoneId) {
    const list = await this.getMilestones();
    const target = list.find((m) => m.id === milestoneId);
    if (!target) return null;
    const isCompleted = target.status === 'Completed';
    const updates = {
      status: isCompleted ? 'In Progress' : 'Completed',
      completion_date: isCompleted ? null : new Date().toISOString().split('T')[0],
    };

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase.from('milestones').update(updates).eq('id', milestoneId).select().single();
      if (error) throw error;
      return data;
    }

    const updated = list.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m));
    setLocalItem(STORAGE_KEYS.MILESTONES, updated);
    return updated.find((m) => m.id === milestoneId);
  },

  async deleteMilestone(milestoneId) {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      await supabase.from('milestones').delete().eq('id', milestoneId);
    }
    const list = getLocalItem(STORAGE_KEYS.MILESTONES, []);
    setLocalItem(STORAGE_KEYS.MILESTONES, list.filter((m) => m.id !== milestoneId));
    return true;
  },

  // ================= Documents =================
  async getDocuments() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase.from('project_documents').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Documents query error:', e);
      }
    }
    return getLocalItem(STORAGE_KEYS.DOCUMENTS, []);
  },

  async uploadDocument(fileData) {
    const user = await this.getCurrentUser();
    const ws = await this.getWorkspace();
    const newDoc = {
      workspace_id: ws.id,
      project_id: fileData.project_id || null,
      file_name: fileData.file_name,
      file_size: fileData.file_size || 150000,
      file_type: fileData.file_type || 'application/pdf',
      storage_path: fileData.storage_path || `vault/${fileData.file_name}`,
      description: fileData.description || '',
      tags: fileData.tags || ['document'],
    };

    if (this.isLive && supabase && user) {
      const { data, error } = await supabase.from('project_documents').insert([newDoc]).select().single();
      if (error) throw error;
      await this.logActivity('upload', 'document', data.id, data.file_name);
      return data;
    }

    const list = getLocalItem(STORAGE_KEYS.DOCUMENTS, []);
    const record = { id: `doc-${Date.now()}`, ...newDoc, created_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.DOCUMENTS, [record, ...list]);
    await this.logActivity('upload', 'document', record.id, record.file_name);
    return record;
  },

  async deleteDocument(docId) {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      await supabase.from('project_documents').delete().eq('id', docId);
    }
    const list = getLocalItem(STORAGE_KEYS.DOCUMENTS, []);
    setLocalItem(STORAGE_KEYS.DOCUMENTS, list.filter((d) => d.id !== docId));
    await this.logActivity('delete', 'document', docId, 'Document deleted');
    return true;
  },

  // ================= Notifications =================
  async getNotifications() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        // Table empty
      }
    }
    return getLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  async markAsRead(notifId) {
    if (this.isLive && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    }
    const list = getLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, list.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    return true;
  },

  async markAllAsRead() {
    if (this.isLive && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    }
    const list = getLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, list.map((n) => ({ ...n, is_read: true })));
    return true;
  },

  // ================= Activity Logs =================
  async getActivityLogs() {
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(40);
        if (!error && data) return data;
      } catch (e) {
        // Table empty
      }
    }
    if (user) {
      return getLocalItem(STORAGE_KEYS.ACTIVITY, []);
    }
    // Guest starts with completely empty activity
    return [];
  },

  async logActivity(action_type, entity_type, entity_id, entity_title, details = {}) {
    const user = await this.getCurrentUser();
    if (!user) return; // Do not log guest view actions

    const ws = await this.getWorkspace();
    const entry = {
      workspace_id: ws.id,
      user_id: user.id,
      action_type,
      entity_type,
      entity_id,
      entity_title,
      details,
      created_at: new Date().toISOString(),
    };

    if (this.isLive && supabase) {
      try {
        await supabase.from('activity_logs').insert([entry]);
      } catch (e) {
        console.warn('Activity log insert error:', e);
      }
    }
    const logs = getLocalItem(STORAGE_KEYS.ACTIVITY, []);
    setLocalItem(STORAGE_KEYS.ACTIVITY, [entry, ...logs].slice(0, 40));
  },

  // ================= Preferences & Presets =================
  async getPreferences() {
    return getLocalItem(STORAGE_KEYS.PREFERENCES, {
      theme: 'dark-olive',
      accent_color: '#C8DEA0',
      sidebar_collapsed: false,
      dashboard_preset: 'Daily Planning',
      card_radius: 'medium',
      density: 'comfortable',
      animation_enabled: true,
      dashboard_layout: DEFAULT_DASHBOARD_LAYOUT,
    });
  },

  async savePreferences(prefs) {
    const current = await this.getPreferences();
    const updated = { ...current, ...prefs };
    setLocalItem(STORAGE_KEYS.PREFERENCES, updated);
    const user = await this.getCurrentUser();
    if (this.isLive && supabase && user) {
      try {
        await supabase.from('user_preferences').upsert({ user_id: user.id, ...updated });
      } catch (e) {
        // Safe fallback
      }
    }
    return updated;
  },

  async getPresets() {
    return getLocalItem(STORAGE_KEYS.PRESETS, DASHBOARD_PRESETS);
  },

  async savePreset(name, layout) {
    const newPreset = {
      id: `preset-${Date.now()}`,
      name,
      is_system: false,
      layout,
    };
    const presets = getLocalItem(STORAGE_KEYS.PRESETS, DASHBOARD_PRESETS);
    const updated = [...presets, newPreset];
    setLocalItem(STORAGE_KEYS.PRESETS, updated);
    return newPreset;
  },
};
