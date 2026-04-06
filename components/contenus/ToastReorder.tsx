"use client";

import { useEffect, useRef } from "react";

interface Props {
  message: string | null;
  duree?: number;
  onDone: () => void;
}

export default function ToastReorder({ message, duree = 2000, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!message) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onDone, duree);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, duree, onDone]);

  if (!message) return null;

  return (
    <div className="toast-reorder">
      <span>{message}</span>

      <style>{`
        .toast-reorder {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 70;
          padding: 10px 20px;
          border-radius: 10px;
          background: #1E3A5F;
          color: #F0F4F8;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          pointer-events: none;
          animation: toastFadeIn 0.2s ease;
        }
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
