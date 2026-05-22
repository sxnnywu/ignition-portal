import { CloseIcon } from './Icons';
import './ConfirmModal.css';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', isDestructive = false }) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel}>
          <CloseIcon size={20} />
        </button>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`confirm-modal-btn ${isDestructive ? 'confirm-modal-btn--destructive' : 'confirm-modal-btn--confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
