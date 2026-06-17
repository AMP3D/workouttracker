import type { ReactNode } from 'react';
import { XMarkIcon } from '../../assets/icons';
import './modal.scss';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  title: string;
}

export const Modal = ({ children, onClose, showCloseButton = false, title }: ModalProps) => (
  <div className="modal">
    <div className="modal__overlay" onClick={onClose} />

    <div className="modal__content">
      <div className="modal__header">
        <h3 className="modal__title">{title}</h3>

        {showCloseButton && (
          <button className="modal__close-btn" onClick={onClose} type="button">
            <XMarkIcon />
          </button>
        )}
      </div>

      <div className="modal__body">{children}</div>
    </div>
  </div>
);
