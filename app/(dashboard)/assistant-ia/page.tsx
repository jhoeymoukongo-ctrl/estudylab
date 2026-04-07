"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Loader2, User, Bot, RotateCcw } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";

export default function AssistantIAPage() {
  const { messages, ajouterMessage, mettreAJourDernier, viderConversation } = useChatStore();
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
    ajouterMessage({ role: "user", contenu: texte });
    setChargement(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texte }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        ajouterMessage({
          role: "assistant",
          contenu: data?.erreur === "quota_atteint"
            ? "Tu as atteint ton quota journalier. Reviens demain ou passe en Premium !"
            : (data?.erreur ?? "Une erreur est survenue. Reessaie."),
        });
        setChargement(false);
        return;
      }

      // Streaming
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reponse = "";

      // Ajouter un message assistant vide pour le streaming
      ajouterMessage({ role: "assistant", contenu: "" });

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reponse += decoder.decode(value, { stream: true });
          mettreAJourDernier(reponse);
        }
      }
    } catch {
      ajouterMessage({
        role: "assistant",
        contenu: "Erreur de connexion. Verifie ta connexion internet.",
      });
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Assistant IA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pose tes questions, je t&apos;explique tout !
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={viderConversation}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dark-border rounded-md px-2.5 py-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            Nouvelle conversation
          </button>
        )}
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
                generer des quiz ou creer des fiches de revision.
              </p>
            </CardContent>
          </Card>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
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
              <p className="whitespace-pre-wrap">{msg.contenu}</p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-bleu/10">
                <User size={16} className="text-brand-bleu" />
              </div>
            )}
          </div>
        ))}

        {chargement && messages.length > 0 && messages[messages.length - 1]?.contenu === "" && (
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
