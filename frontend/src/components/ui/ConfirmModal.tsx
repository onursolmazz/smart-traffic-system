import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <div className="confirm-icon">
            <AlertTriangle size={22} />
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <div className="confirm-modal-content">
          <h2>{title}</h2>

          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
