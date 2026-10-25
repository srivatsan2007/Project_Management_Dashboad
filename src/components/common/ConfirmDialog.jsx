import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to perform this action? This operation cannot be undone.',
  confirmText = 'Delete',
  isDestructive = true,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            background: isDestructive ? 'var(--color-status-danger-bg)' : 'var(--badge-bg)',
            color: isDestructive ? 'var(--color-status-danger)' : 'var(--accent-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            display: 'flex',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
        </div>
      </div>
    </Modal>
  );
}
