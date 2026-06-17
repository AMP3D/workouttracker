import { signal } from '@preact/signals-react';

export const isLoading = signal<boolean>(false);
export const menuOpen = signal<boolean>(false);
export const toastMessage = signal<string>('');

export const showToast = (message: string): void => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};
