import { Modal } from '../Modal/Modal';
import './confirm-dialog.scss';

interface ConfirmDialogProps {
  confirmLabel?: string;
  danger?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export const ConfirmDialog = ({
  confirmLabel = 'Confirm',
  danger = false,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) => (
  <Modal onClose={onCancel} title={title}>
    <p className="confirm-dialog__message">{message}</p>

    <div className="modal__actions">
      <button className="modal__btn-cancel" onClick={onCancel} type="button">
        Cancel
      </button>

      <button
        className={danger ? 'modal__btn-danger' : 'modal__btn-confirm'}
        onClick={onConfirm}
        type="button"
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
