"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-dark-border bg-dark-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4">
      {type === "success" ? (
        <CheckCircle size={18} className="text-brand-vert shrink-0" />
      ) : (
        <XCircle size={18} className="text-destructive shrink-0" />
      )}
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}

// Hook pour gérer les toasts
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function afficherToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  function fermerToast() {
    setToast(null);
  }

  return { toast, afficherToast, fermerToast };
}
