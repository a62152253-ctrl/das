import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

// Global state for toasts to allow usage outside of React tree if needed,
// but for simplicity we'll just use a basic singleton pattern with event listeners.
let toastQueue: ToastMessage[] = [];
let listeners: Array<(toasts: ToastMessage[]) => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastQueue]));
};

export const toast = {
  add: (title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    toastQueue = [...toastQueue, { id, title, message, type }];
    notifyListeners();
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.remove(id);
    }, 4000);
  },
  success: (title: string, message?: string) => toast.add(title, message, 'success'),
  error: (title: string, message?: string) => toast.add(title, message, 'error'),
  info: (title: string, message?: string) => toast.add(title, message, 'info'),
  remove: (id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notifyListeners();
  }
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setToasts([...toastQueue]);
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  return { toasts, removeToast: toast.remove };
}
