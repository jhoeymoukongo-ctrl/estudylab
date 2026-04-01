"use client";

import { Brain } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const estAssistant = role === "assistant";

  return (
    <div className={`flex gap-3 ${estAssistant ? "" : "justify-end"}`}>
      {estAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-violet/10">
          <Brain size={16} className="text-brand-violet" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          estAssistant
            ? "bg-dark-elevated border border-dark-border"
            : "bg-brand-violet/20 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
