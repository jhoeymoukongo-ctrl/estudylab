"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Loader2, User, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantIAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chargement, setChargement] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function envoyer() {
    const texte = input.trim();
    if (!texte || chargement) return;

    setInput("");
    const nouveauxMessages: Message[] = [...messages, { role: "user", content: texte }];
    setMessages(nouveauxMessages);
    setChargement(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texte }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessages([
          ...nouveauxMessages,
          {
            role: "assistant",
            content: data?.error ?? "Une erreur est survenue. Réessaie.",
          },
        ]);
        setChargement(false);
        return;
      }

      // Streaming
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
        { role: "assistant", content: "Erreur de connexion. Vérifie ta connexion internet." },
      ]);
    }
    setChargement(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">Assistant IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pose tes questions, je t&apos;explique tout !
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-8 text-center">
              <Brain size={40} className="mx-auto mb-4 text-brand-vert" />
              <h3 className="font-display font-semibold mb-2">
                Comment puis-je t&apos;aider ?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Je peux t&apos;expliquer des concepts, corriger tes exercices,
                générer des quiz ou créer des fiches de révision.
              </p>
            </CardContent>
          </Card>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-vert/10">
                <Bot size={16} className="text-brand-vert" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-vert text-white"
                  : "bg-dark-card border border-dark-border"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-bleu/10">
                <User size={16} className="text-brand-bleu" />
              </div>
            )}
          </div>
        ))}

        {chargement && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-vert/10">
              <Bot size={16} className="text-brand-vert" />
            </div>
            <div className="rounded-2xl bg-dark-card border border-dark-border px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-dark-border">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pose ta question..."
          rows={1}
          className="min-h-[44px] max-h-32 resize-none bg-dark-card border-dark-border"
        />
        <Button
          onClick={envoyer}
          disabled={!input.trim() || chargement}
          size="icon"
          className="shrink-0 h-[44px] w-[44px]"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
