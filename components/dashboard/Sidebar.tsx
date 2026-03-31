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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const liens = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutDashboard },
  { label: "Matieres", href: "/matieres", icon: BookOpen },
  { label: "Quiz", href: "/quiz", icon: Brain },
  { label: "Fiches", href: "/fiches", icon: FileText },
  { label: "Assistant IA", href: "/assistant-ia", icon: MessageSquare },
  { label: "Scan", href: "/scan", icon: ScanLine },
  { label: "Progression", href: "/progression", icon: TrendingUp },
  { label: "Profil", href: "/profil", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [reduit, setReduit] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-dark-border bg-dark-card transition-all duration-200",
        reduit ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-dark-border">
        {!reduit && (
          <Link href="/tableau-de-bord" className="font-display text-lg font-bold text-brand-vert">
            E-StudyLab
          </Link>
        )}
        <button
          onClick={() => setReduit(!reduit)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={reduit ? "Agrandir" : "Reduire"}
        >
          {reduit ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {liens.map((lien) => {
            const actif = pathname.startsWith(lien.href);
            return (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    actif
                      ? "bg-brand-vert/10 text-brand-vert"
                      : "text-muted-foreground hover:bg-dark-elevated hover:text-foreground",
                    reduit && "justify-center px-0"
                  )}
                  title={reduit ? lien.label : undefined}
                >
                  <lien.icon size={20} />
                  {!reduit && <span>{lien.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
