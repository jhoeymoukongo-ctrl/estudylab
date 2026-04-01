import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { generateAllContent } from "@/lib/ai/generation";

export const maxDuration = 300; // 5 minutes max (Vercel)

export async function POST() {
  // ── Auth check : admin uniquement ──
  try {
    const supabase = await creerClientServeur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Erreur d'authentification" }, { status: 401 });
  }

  // ── Client admin pour les insertions ──
  const adminSupabase = creerClientAdmin();

  // ── Stream SSE ──
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const result = await generateAllContent(adminSupabase, (progress) => {
          send({
            type: "progress",
            chapter: progress.chapterName,
            step: progress.step,
            current: progress.chapterIndex + 1,
            total: progress.totalChapters,
            itemsDone: progress.itemsDone,
            totalItems: progress.totalItems,
          });
        });

        send({
          type: "complete",
          totalInserted: result.totalInserted,
          totalSkipped: result.totalSkipped,
          errors: result.errors.length,
          errorDetails: result.errors,
        });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Erreur inconnue",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
