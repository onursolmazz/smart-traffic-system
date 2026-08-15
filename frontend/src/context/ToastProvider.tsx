import { useState } from "react";

import type { ReactNode } from "react";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

import { ToastContext } from "./toastContext";

import type { ToastType } from "./toastContext";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProviderProps {
  children: ReactNode;
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const getIcon = (type: ToastType) => {
    if (type === "success") {
      return <CheckCircle2 size={20} />;
    }

    if (type === "error") {
      return <CircleAlert size={20} />;
    }

    return <Info size={20} />;
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">{getIcon(toast.type)}</div>

            <span>{toast.message}</span>

            <button
              type="button"
              aria-label="Bildirimi kapat"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
