"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/lib/useSiteContent";

export default function Hero() {
  const { t } = useSiteContent();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand-vert/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-40 h-[400px] w-[400px] rounded-full bg-brand-violet/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-vert/20 bg-brand-vert/10 px-4 py-1.5 text-sm text-brand-vert">
          <Sparkles size={14} />
          Propulsé par l&apos;intelligence artificielle
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Apprends plus{" "}
          <span className="text-brand-vert">intelligemment</span>
          <br />
          avec l&apos;IA
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t("hero_sous_titre")}
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/inscription"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 text-base")}
          >
            {t("hero_cta_principal")}
            <ArrowRight size={18} />
          </Link>
          <a
            href="#comment-ca-marche"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "text-base"
            )}
          >
            {t("hero_cta_secondaire")}
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-muted-foreground">
          {t("hero_social_proof")}
        </p>
      </div>
    </section>
  );
}
