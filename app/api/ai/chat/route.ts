// app/api/ai/chat/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appellerEliStream } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  const { message, matiere, niveau } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ erreur: "Message requis" }, { status: 400 });
  }

  try {
    await verifierEtIncrementerQuota(user.id, "chat");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  const stream = await appellerEliStream(message, {
    niveauScolaire: niveau ?? "non précisé",
    matiere: matiere ?? "non précisée",
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
