'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type State = { toasts: ToasterToast[] };

let toastCount = 0;
let toastState: State = { toasts: [] };
const stateListeners = new Set<(state: State) => void>();

const generateId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
};

const updateState = (newState: State) => {
  toastState = newState;
  stateListeners.forEach((listener) => listener(toastState));
};

const scheduleRemoval = (toastId: string) => {
  setTimeout(() => {
    updateState({ toasts: toastState.toasts.filter((t) => t.id !== toastId) });
  }, TOAST_REMOVE_DELAY);
};

export function useToast() {
  const [state, setState] = React.useState<State>(toastState);

  React.useEffect(() => {
    stateListeners.add(setState);
    return () => { stateListeners.delete(setState); };
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
            toasts: toastState.toasts.map((t) =>
              t.id === id ? { ...t, open: false } : t
            ),
          });
          scheduleRemoval(id);
        }
      },
    };

    updateState({
      toasts: [newToast, ...toastState.toasts].slice(0, TOAST_LIMIT),
    });

    return {
      id,
      dismiss: () => newToast.onOpenChange?.(false),
      update: (props: Partial<ToasterToast>) =>
        updateState({
          toasts: toastState.toasts.map((t) =>
            t.id === id ? { ...t, ...props } : t
          ),
        }),
    };
  }, []);

  const dismiss = (toastId?: string) => {
    if (toastId) {
      state.toasts.find((t) => t.id === toastId)?.onOpenChange?.(false);
    } else {
      state.toasts.forEach((t) => t.onOpenChange?.(false));
    }
  };

  return { toasts: state.toasts, toast, dismiss };
}
