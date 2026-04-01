"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  FileText,
  MessageSquare,
  ScanLine,
  TrendingUp,
  User,
  Menu,
  X,
  Shield,
  PenSquare,
  ShieldCheck,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const liens = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutDashboard },
  { label: "Matières", href: "/matieres", icon: BookOpen },
  { label: "Quiz", href: "/quiz", icon: Brain },
  { label: "Fiches", href: "/fiches", icon: FileText },
  { label: "Assistant IA", href: "/assistant-ia", icon: MessageSquare },
  { label: "Scan", href: "/scan", icon: ScanLine },
  { label: "Progression", href: "/progression", icon: TrendingUp },
  { label: "Profil", href: "/profil", icon: User },
];

const liensAdmin = [
  { label: "Dashboard", href: "/admin", icon: Shield },
  { label: "Contenus", href: "/admin/contenus", icon: PenSquare },
  { label: "Modération", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export default function MobileNav({ estAdmin = false }: { estAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bottom bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-dark-border bg-dark-card md:hidden">
        {liens.slice(0, 5).map((lien) => {
          const actif = pathname.startsWith(lien.href);
          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]",
                actif ? "text-brand-vert" : "text-muted-foreground"
              )}
            >
              <lien.icon size={20} />
              <span>{lien.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground"
        >
          <Menu size={20} />
          <span>Plus</span>
        </button>
      </nav>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-dark-card border-l border-dark-border p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-bold text-brand-vert">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <ul className="space-y-1">
              {liens.map((lien) => {
                const actif = pathname.startsWith(lien.href);
                return (
                  <li key={lien.href}>
                    <Link
                      href={lien.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        actif
                          ? "bg-brand-vert/10 text-brand-vert"
                          : "text-muted-foreground hover:bg-dark-elevated hover:text-foreground"
                      )}
                    >
                      <lien.icon size={20} />
                      <span>{lien.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Section Admin */}
            {estAdmin && (
              <>
                <div className="my-4 border-t border-dark-border" />
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Administration
                </p>
                <ul className="space-y-1">
                  {liensAdmin.map((lien) => {
                    const actif = lien.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(lien.href);
                    return (
                      <li key={lien.href}>
                        <Link
                          href={lien.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            actif
                              ? "bg-brand-violet/10 text-brand-violet"
                              : "text-muted-foreground hover:bg-dark-elevated hover:text-foreground"
                          )}
                        >
                          <lien.icon size={20} />
                          <span>{lien.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
