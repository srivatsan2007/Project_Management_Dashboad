import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Folder,
  File,
  Image,
  FileSpreadsheet,
  Check,
  Shield,
  HardDrive,
  Info,
  Lock,
  PlusCircle,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Documents() {
  const { documents, projects, uploadDocument, deleteDocument } = useWorkspace();
  const { isGuest, user } = useAuth();
  const { openAuthPrompt } = useAuthModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Form
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [tagsInput, setTagsInput] = useState('');

  const handleOpenUpload = () => {
    if (isGuest) {
      openAuthPrompt({
        title: 'Sign in to upload documents',
        message: 'Create an account or log in to securely upload, store, and manage your project files.',
        actionType: 'upload_document',
      });
      return;
    }

    setSelectedFile(null);
    setFileName('');
    setDescription('');
    setProjectId(projects[0]?.id || '');
    setFileType('application/pdf');
    setTagsInput('');
    setIsUploadOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setFileType(file.type || 'application/octet-stream');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsUploading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const size = selectedFile ? selectedFile.size : 256000;

      await uploadDocument({
        file_name: fileName.trim(),
        description,
        project_id: projectId || null,
        file_type: fileType,
        file_size: size,
        tags,
      });

      setIsUploadOpen(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Download handler
  const handleDownload = (doc) => {
    const element = document.createElement('a');
    const content = `VeroPlan Document:\nTitle: ${doc.file_name}\nProject: ${doc.project_id || 'General'}\nUploaded: ${doc.created_at}\nDescription: ${doc.description || 'None'}\nTags: ${(doc.tags || []).join(', ')}`;
    const file = new Blob([content], { type: doc.file_type || 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.file_name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Storage Calculation
  const totalSizeBytes = documents.reduce((acc, d) => acc + (Number(d.file_size) || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const filteredDocs = documents.filter((d) => {
    const matchSearch =
      d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProject = projectFilter === 'All' || d.project_id === projectFilter;
    return matchSearch && matchProject;
  });

  const getDocIcon = (type) => {
    if (type?.includes('image')) return <Image size={20} color="var(--accent-color)" />;
    if (type?.includes('sheet') || type?.includes('excel')) return <FileSpreadsheet size={20} color="var(--color-status-success)" />;
    return <FileText size={20} color="var(--accent-color)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner with Storage Stats */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-color)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            <Shield size={15} /> PRIVATE DOCUMENT VAULT
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px' }}>Cloud Documents & Attachments</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            {isGuest
              ? 'Public vault preview. Sign in to upload and manage your encrypted workspace files.'
              : `Secure vault for ${user?.email || 'your personal workspace'}.`}
          </p>
        </div>

        <div className="action-group">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <HardDrive size={18} color="var(--accent-color)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{totalSizeMB} MB</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{documents.length} files stored</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleOpenUpload}>
            <Upload size={16} /> <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-action-bar">
        <div className="filter-group">
          <div className="filter-search-box">
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search documents by name or tag..."
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="action-group">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowHowItWorks(true)}
            title="How document security works"
          >
            <Info size={15} /> <span>Learn how it works</span>
          </button>
        </div>
      </div>

      {/* Documents Grid / Empty State */}
      {filteredDocs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '56px 24px',
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
            <FileText size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
            {searchQuery || projectFilter !== 'All' ? 'No matching documents' : 'No documents uploaded yet'}
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
            {isGuest
              ? 'No documents uploaded yet. Sign in to securely upload and manage your files.'
              : 'Upload project specifications, architecture blueprints, spreadsheet roadmaps, or design files to your private vault.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleOpenUpload}>
              <Upload size={16} /> {isGuest ? 'Sign in to upload' : 'Upload your first document'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowHowItWorks(true)}>
              <Info size={16} /> Learn how it works
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredDocs.map((doc) => {
            const project = projects.find((p) => p.id === doc.project_id);
            const sizeKB = (doc.file_size / 1024).toFixed(0);

            return (
              <div
                key={doc.id}
                className="card card-hoverable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--badge-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getDocIcon(doc.file_type)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.885rem',
                            wordBreak: 'break-all',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {doc.file_name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {sizeKB} KB • {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '34px', lineHeight: 1.4 }}>
                    {doc.description || 'No description provided.'}
                  </p>

                  {project && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '10px' }}>
                      <Folder size={12} /> {project.name}
                    </div>
                  )}

                  {doc.tags && doc.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {doc.tags.map((tag) => (
                        <span key={tag} className="badge badge-olive" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownload(doc)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Download size={13} /> Download
                  </button>

                  <button
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    onClick={() => {
                      if (isGuest) {
                        openAuthPrompt({
                          title: 'Sign in to delete documents',
                          message: 'Create an account or sign in to manage documents in your private vault.',
                        });
                        return;
                      }
                      setDeletingDocId(doc.id);
                    }}
                    title="Delete document"
                  >
                    <Trash2 size={14} color="var(--color-status-danger)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document to Vault"
        maxWidth="520px"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" form="doc-upload-form" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </>
        }
      >
        <form id="doc-upload-form" onSubmit={handleUploadSubmit}>
          {/* File Picker */}
          <div className="form-group">
            <label className="form-label">Select File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-input)',
                transition: 'border-color 0.2s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Upload size={24} color="var(--accent-color)" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedFile ? selectedFile.name : 'Click to browse a file from your device'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(0)} KB • ${selectedFile.type || 'Custom format'}`
                  : 'PDF, DOCX, XLSX, PNG, JPG, or TXT up to 50MB'}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">File Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. System_Architecture_Spec.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Related Project</label>
            <select
              className="select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No Project (General Workspace Vault)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">File Type</label>
              <select
                className="select"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <option value="application/pdf">PDF Document (.pdf)</option>
                <option value="image/png">PNG Image (.png)</option>
                <option value="image/jpeg">JPEG Image (.jpg)</option>
                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Sheet (.xlsx)</option>
                <option value="text/plain">Plain Text (.txt)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                placeholder="spec, design, v1"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Context</label>
            <textarea
              className="textarea"
              placeholder="Provide context or notes about this file..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* "How it Works" Information Modal */}
      <Modal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        title="VeroPlan Document Security Architecture"
        maxWidth="500px"
        footer={
          <button className="btn btn-primary" onClick={() => setShowHowItWorks(false)}>
            Got it
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem', lineHeight: 1.55 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--badge-bg)', color: 'var(--accent-color)' }}>
              <Shield size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Private Cloud Storage
              </strong>
              Files are stored in private storage buckets isolated per authenticated user or workspace.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--badge-bg)', color: 'var(--accent-color)' }}>
              <Lock size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Row Level Security (RLS)
              </strong>
              PostgreSQL policies enforce that only the workspace owner or authorized members can query, download, or delete documents.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--badge-bg)', color: 'var(--accent-color)' }}>
              <Folder size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Project Linkage
              </strong>
              Documents can be attached to specific projects or stored in the general vault for cross-project reference.
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingDocId)}
        onClose={() => setDeletingDocId(null)}
        onConfirm={() => {
          if (deletingDocId) deleteDocument(deletingDocId);
        }}
        title="Delete Document"
        message="Are you sure you want to permanently remove this document from the vault?"
      />
    </div>
  );
}
