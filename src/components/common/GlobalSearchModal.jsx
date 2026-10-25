import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, CheckSquare, Flag, FileText, ArrowRight, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { projects, tasks, milestones, documents } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const cleanQuery = query.toLowerCase().trim();

  // Filter and group results
  const filteredProjects = cleanQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.description?.toLowerCase().includes(cleanQuery)
      )
    : projects.slice(0, 3);

  const filteredTasks = cleanQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) ||
          t.description?.toLowerCase().includes(cleanQuery)
      )
    : tasks.slice(0, 4);

  const filteredMilestones = cleanQuery
    ? milestones.filter((m) => m.title.toLowerCase().includes(cleanQuery))
    : milestones.slice(0, 2);

  const filteredDocuments = cleanQuery
    ? documents.filter(
        (d) =>
          d.file_name.toLowerCase().includes(cleanQuery) ||
          d.description?.toLowerCase().includes(cleanQuery)
      )
    : documents.slice(0, 2);

  // Flattened array for keyboard navigation
  const flatResults = [
    ...filteredProjects.map((p) => ({ type: 'project', id: p.id, title: p.name, link: `/projects/${p.id}`, icon: Folder, sub: p.status })),
    ...filteredTasks.map((t) => ({ type: 'task', id: t.id, title: t.title, link: '/tasks', icon: CheckSquare, sub: `${t.status} • ${t.priority}` })),
    ...filteredMilestones.map((m) => ({ type: 'milestone', id: m.id, title: m.title, link: '/milestones', icon: Flag, sub: `Due ${m.due_date}` })),
    ...filteredDocuments.map((d) => ({ type: 'document', id: d.id, title: d.file_name, link: '/documents', icon: FileText, sub: d.file_type })),
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      navigate(flatResults[selectedIndex].link);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="var(--accent-color)" />
          <input
            ref={inputRef}
            type="text"
            className="input"
            style={{ border: 'none', background: 'transparent', padding: '4px 0', fontSize: '1rem' }}
            placeholder="Search projects, tasks, milestones, documents... (Press Esc to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {flatResults.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No matching records found for "{query}"</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {flatResults.map((item, idx) => {
                const ItemIcon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      navigate(item.link);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--badge-bg)',
                          color: 'var(--accent-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ItemIcon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {item.type} • {item.sub}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={16} color="var(--accent-color)" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-card)',
            background: 'rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Use ↑ ↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
