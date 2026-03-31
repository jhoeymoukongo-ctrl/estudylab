"use client";

import { useRouter } from "next/navigation";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header({ displayName }: { displayName?: string }) {
  const router = useRouter();

  async function handleDeconnexion() {
    const supabase = creerClientSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark-border bg-dark-card px-4 sm:px-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Bonjour{displayName ? `, ${displayName}` : ""} !
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDeconnexion} className="gap-2">
        <LogOut size={16} />
        <span className="hidden sm:inline">Deconnexion</span>
      </Button>
    </header>
  );
}
