import { toastMessage } from '../../state/app-state';
import './toast.scss';

export const Toast = () => {
  if (!toastMessage.value) {
    return null;
  }

  return <div className="toast">{toastMessage.value}</div>;
};
