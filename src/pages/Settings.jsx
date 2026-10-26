import React, { useState } from 'react';
import {
  Palette,
  User,
  Sliders,
  Shield,
  Database,
  Cloud,
  Check,
  RotateCcw,
  Download,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

const ACCENT_PRESETS = [
  { name: 'Pistachio Green (Default)', hex: '#C8DEA0' },
  { name: 'Muted Olive Sage', hex: '#849B54' },
  { name: 'Amber Gold', hex: '#E09F3E' },
  { name: 'Spring Emerald', hex: '#6BA84F' },
  { name: 'Aegean Sky', hex: '#5B92E5' },
  { name: 'Coral Rose', hex: '#E06C75' },
];

export default function Settings() {
  const {
    theme,
    accentColor,
    cardRadius,
    density,
    animationEnabled,
    updateTheme,
    updateAccentColor,
    updateCardRadius,
    updateDensity,
    updateAnimationEnabled,
  } = useTheme();

  const { user, isSupabaseLive, signOut } = useAuth();
  const { workspace, projects, tasks, milestones, documents, refreshData } = useWorkspace();

  const [activeTab, setActiveTab] = useState('appearance');
  const [displayName, setDisplayName] = useState(user?.full_name || 'Alex Rivera');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup Export
  const handleExportFullBackup = () => {
    const backupData = {
      workspace,
      projects,
      tasks,
      milestones,
      documents,
      exported_at: new Date().toISOString(),
      system_version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VeroPlan_Workspace_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo projects and tasks to factory defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.35rem', margin: '0 0 6px' }}>Settings & System Preferences</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
          Personalize visual themes, manage cloud integration, and export workspace data.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-card)', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
        {[
          { key: 'appearance', label: 'Appearance & Identity', icon: Palette },
          { key: 'profile', label: 'Profile & Account', icon: User },
          { key: 'workspace', label: 'Workspace Details', icon: Layers },
          { key: 'cloud', label: 'Supabase Cloud Integration', icon: Cloud },
          { key: 'data', label: 'Data & Security', icon: Database },
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
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.885rem',
                borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Appearance & Themes Tab */}
      {activeTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme Mode Selector */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Visual Color Theme</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Choose between the flagship dark olive theme, airy light sage, or custom accent mode.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Dark Olive */}
              <div
                onClick={() => updateTheme('dark-olive')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#22291F',
                  border: theme === 'dark-olive' ? '2px solid #C8DEA0' : '1px solid rgba(200, 222, 160, 0.2)',
                  cursor: 'pointer',
                  boxShadow: theme === 'dark-olive' ? '0 0 16px rgba(200, 222, 160, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#F2F4EB', fontWeight: 700, fontSize: '0.95rem' }}>Dark Olive</span>
                  <Moon size={16} color="#C8DEA0" />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#606B3D' }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#C8DEA0' }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#22291F' }} />
                </div>
              </div>

              {/* Light Sage */}
              <div
                onClick={() => updateTheme('light-sage')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#F3F5E9',
                  border: theme === 'light-sage' ? '2px solid #606B3D' : '1px solid rgba(96, 107, 61, 0.2)',
                  cursor: 'pointer',
                  boxShadow: theme === 'light-sage' ? '0 0 16px rgba(96, 107, 61, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#26351D', fontWeight: 700, fontSize: '0.95rem' }}>Light Sage</span>
                  <Sun size={16} color="#606B3D" />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#606B3D' }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#E7EED8' }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#FFFFFF' }} />
                </div>
              </div>

              {/* Custom Accent */}
              <div
                onClick={() => updateTheme('custom-accent')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#22291F',
                  border: theme === 'custom-accent' ? `2px solid ${accentColor}` : '1px solid rgba(200, 222, 160, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#F2F4EB', fontWeight: 700, fontSize: '0.95rem' }}>Custom Accent</span>
                  <Sparkles size={16} color={accentColor} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: accentColor }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#606B3D' }} />
                  <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: '#22291F' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Custom Accent Highlight Color</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Used for progress indicators, active markers, badges, and 3D geometric highlights.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateAccentColor(preset.hex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: accentColor === preset.hex ? `2px solid ${preset.hex}` : '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: preset.hex,
                      display: 'inline-block',
                    }}
                  />
                  {preset.name}
                </button>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom Hex:</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => updateAccentColor(e.target.value)}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Corner Radius & Density Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Card Corner Radius</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['small', 'medium', 'large'].map((r) => (
                  <button
                    key={r}
                    className={`btn btn-sm ${cardRadius === r ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => updateCardRadius(r)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Layout Density</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['compact', 'comfortable', 'spacious'].map((d) => (
                  <button
                    key={d}
                    className={`btn btn-sm ${density === d ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => updateDensity(d)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Animation & Reduced Motion */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Micro-Animations & 3D Render Effects</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="anim-toggle"
                checked={animationEnabled}
                onChange={(e) => updateAnimationEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
              />
              <label htmlFor="anim-toggle" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                Enable smooth UI transitions, 3D rotating kinetic sculpture, and chart entrances
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Account Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Personal Profile</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
            <img
              src={user?.avatar_url}
              alt="Avatar"
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid var(--accent-color)', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{displayName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              const updated = { ...user, full_name: displayName };
              localStorage.setItem('projecthub_auth_user', JSON.stringify(updated));
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 2000);
            }}
          >
            {savedSuccess ? 'Saved!' : 'Update Profile'}
          </button>
        </div>
      )}

      {/* Workspace Details Tab */}
      {activeTab === 'workspace' && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Workspace Information</h3>
          <div className="form-group">
            <label className="form-label">Workspace Name</label>
            <input type="text" className="input" defaultValue={workspace?.name} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="textarea" defaultValue={workspace?.description} />
          </div>
          <div className="form-group">
            <label className="form-label">Workspace Role</label>
            <input type="text" className="input" value="Workspace Owner (Personal Plan)" disabled />
          </div>
        </div>
      )}

      {/* Supabase Cloud Integration Tab */}
      {activeTab === 'cloud' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Cloud size={24} color="var(--accent-color)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Supabase PostgreSQL & Cloud Storage</h3>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: isSupabaseLive ? 'rgba(107, 168, 79, 0.15)' : 'rgba(200, 222, 160, 0.08)',
              border: `1px solid ${isSupabaseLive ? 'rgba(107, 168, 79, 0.4)' : 'var(--border-strong)'}`,
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSupabaseLive ? 'var(--color-status-success)' : 'var(--accent-color)', marginBottom: '4px' }}>
              Status: {isSupabaseLive ? 'Live Supabase Connection Active' : 'Local Workspace Engine Active (Supabase Ready)'}
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {isSupabaseLive
                ? 'All projects, tasks, milestones, and document metadata are synchronizing directly to your Supabase PostgreSQL cluster and private storage buckets.'
                : 'VeroPlan is currently operating in high-performance local workspace storage mode with full persistence. You can connect your live Supabase cloud anytime by setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
            </p>
          </div>

          <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Setup Guide for Supabase:</h4>
          <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <li>Create a new project in your Supabase dashboard (<a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>).</li>
            <li>Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> into your local <code>.env</code> file.</li>
            <li>Open the Supabase SQL Editor and execute the migration file located at: <code>supabase/migrations/20261025000001_initial_schema.sql</code>.</li>
            <li>Create a private storage bucket named <code>project-documents</code>.</li>
            <li>Restart Vite dev server (<code>npm run dev</code>). VeroPlan will automatically establish the live cloud connection!</li>
          </ol>
        </div>
      )}

      {/* Data & Security Tab */}
      {activeTab === 'data' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px' }}>Export Workspace Data</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Download a complete JSON snapshot containing all your projects, tasks, milestones, and vault records.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={handleExportFullBackup}>
              <Download size={15} /> Export Complete JSON Backup
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px' }}>Reset Workspace Data</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Restore the initial starter projects, tasks, and presets.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={handleResetData}>
              <RotateCcw size={15} /> Reset Factory Seed Data
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--color-status-danger)' }}>Sign Out</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Terminate current session.
            </p>
            <button className="btn btn-danger btn-sm" onClick={signOut}>
              <LogOut size={15} /> Sign Out of VeroPlan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
