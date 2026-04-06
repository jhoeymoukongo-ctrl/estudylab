"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import MessageBubble from "@/components/ia/MessageBubble";
import QuickActions from "@/components/ia/QuickActions";
import QuotaIndicator from "@/components/ia/QuotaIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chargement, setChargement] = useState(false);
  const [refreshQuota, setRefreshQuota] = useState(0);
  const [inputBloque, setInputBloque] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function envoyer(texte?: string) {
    const message = (texte ?? input).trim();
    if (!message || chargement) return;

    setInput("");
    const nouveauxMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
    ];
    setMessages(nouveauxMessages);
    setChargement(true);

    try {
      const res = await fetch("/api/ai/expliquer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessages([
          ...nouveauxMessages,
          {
            role: "assistant",
            content: data?.error ?? "Une erreur est survenue. R\u00e9essaie plus tard.",
          },
        ]);
        setChargement(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reponse = "";

      setMessages([...nouveauxMessages, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reponse += decoder.decode(value, { stream: true });
          setMessages([
            ...nouveauxMessages,
            { role: "assistant", content: reponse },
          ]);
        }
      }
    } catch {
      setMessages([
        ...nouveauxMessages,
        {
          role: "assistant",
          content: "Erreur de connexion. V\u00e9rifie ta connexion internet.",
        },
      ]);
    }
    setChargement(false);
    setRefreshQuota(prev => prev + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* En-t\u00eate avec quota */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Assistant IA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pose tes questions, je t&apos;explique tout !
          </p>
        </div>
        <QuotaIndicator refreshTrigger={refreshQuota} onQuotaEpuise={setInputBloque} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-8">
            <p className="text-sm text-muted-foreground">
              Choisis une suggestion ou \u00e9cris ta question :
            </p>
            <QuickActions onSelect={(prompt) => envoyer(prompt)} />
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {chargement && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-violet/10">
              <Loader2 size={16} className="animate-spin text-brand-violet" />
            </div>
            <div className="rounded-2xl bg-dark-elevated border border-dark-border px-4 py-3">
              <Loader2
                size={16}
                className="animate-spin text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Saisie */}
      <div className="flex gap-2 pt-4 border-t border-dark-border">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pose ta question..."
          rows={1}
          disabled={inputBloque}
          className="min-h-[44px] max-h-32 resize-none bg-dark-card border-dark-border"
        />
        <Button
          onClick={() => envoyer()}
          disabled={!input.trim() || chargement || inputBloque}
          size="icon"
          className="shrink-0 h-[44px] w-[44px]"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
