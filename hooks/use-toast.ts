'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

// Configurações
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000; // Reduzido para 3 segundos

// Tipos
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type State = {
  toasts: ToasterToast[];
};

// Gerenciamento de Estado
let toastCount = 0;
let toastState: State = { toasts: [] };
const stateListeners = new Set<(state: State) => void>();

// Funções auxiliares
const generateId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
};

const scheduleToastRemoval = (toastId: string) => {
  setTimeout(() => {
    updateState({
      toasts: toastState.toasts.filter(t => t.id !== toastId)
    });
  }, TOAST_REMOVE_DELAY);
};

const updateState = (newState: State) => {
  toastState = newState;
  stateListeners.forEach(listener => listener(toastState));
};

// Hook principal
export function useToast() {
  const [state, setState] = React.useState<State>(toastState);

  React.useEffect(() => {
    stateListeners.add(setState);
    return () => {
      stateListeners.delete(setState);
    };
  }, []);

  const toast = React.useCallback((props: Omit<ToasterToast, 'id'>) => {
    const id = generateId();
    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          updateState({
            toasts: toastState.toasts.map(t =>
              t.id === id ? { ...t, open: false } : t
            )
          });
          scheduleToastRemoval(id);
        }
      }
    };

    updateState({
      toasts: [newToast, ...toastState.toasts].slice(0, TOAST_LIMIT)
    });

    return {
      id,
      dismiss: () => newToast.onOpenChange?.(false),
      update: (props: Partial<ToasterToast>) =>
        updateState({
          toasts: toastState.toasts.map(t =>
            t.id === id ? { ...t, ...props } : t
          )
        })
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        const toast = state.toasts.find(t => t.id === toastId);
        toast?.onOpenChange?.(false);
      } else {
        state.toasts.forEach(t => t.onOpenChange?.(false));
      }
    }
  };
}

// Exporta função toast para uso sem hook
export const toast = (props: Omit<ToasterToast, 'id'>) => {
  const { toast: hookToast } = useToast();
  return hookToast(props);
};

