"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "E-StudyLab est-il vraiment gratuit ?",
    answer:
      "Oui ! Le plan gratuit te donne accès à 2 matières, 10 requêtes IA par jour, des quiz illimités et le suivi de progression. Tu peux passer en premium pour débloquer toutes les matières et les fonctionnalités avancées.",
  },
  {
    question: "Quels niveaux scolaires sont couverts ?",
    answer:
      "E-StudyLab couvre de la 6ème à la Licence 3, en passant par les filières générales, technologiques (STI2D, STMG) et les BTS/BUT. Les contenus sont adaptés au programme français et les quiz IA s'ajustent automatiquement à ton niveau.",
  },
  {
    question: "Comment fonctionne l'assistant IA ?",
    answer:
      "L'assistant IA utilise Claude, un modèle d'intelligence artificielle avancé. Il peut t'expliquer des concepts, corriger tes exercices, générer des quiz et créer des fiches de révision adaptées à ton niveau.",
  },
  {
    question: "Puis-je scanner mes propres cours ?",
    answer:
      "Absolument ! Tu peux importer tes cours en photo ou PDF. L'IA analyse le document, extrait le contenu et génère automatiquement des quiz et fiches de révision à partir de tes supports.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Oui. Tes données sont hébergées sur Supabase avec un chiffrement de bout en bout. Nous ne partageons jamais tes informations personnelles et tu peux supprimer ton compte à tout moment.",
  },
  {
    question: "Puis-je utiliser E-StudyLab sur mobile ?",
    answer:
      "Oui, E-StudyLab est entièrement responsive et fonctionne sur tous les appareils : ordinateur, tablette et smartphone. Pas besoin d'installer d'application.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tout ce que tu as besoin de savoir
          </p>
        </div>

        <Accordion className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-dark-border"
            >
              <AccordionTrigger className="text-left font-display text-base font-semibold hover:text-brand-vert">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
