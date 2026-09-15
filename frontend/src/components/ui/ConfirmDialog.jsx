import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action will proceed with the selected operation.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          padding: '0.65rem',
          borderRadius: '12px',
          backgroundColor: isDanger ? 'var(--danger-bg)' : 'var(--info-bg)',
          border: `1px solid ${isDanger ? 'var(--danger-border)' : 'var(--info-border)'}`,
          color: isDanger ? 'var(--danger)' : 'var(--info)',
          flexShrink: 0
        }}>
          {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
