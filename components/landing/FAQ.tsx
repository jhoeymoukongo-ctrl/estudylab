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
      "Oui ! Le plan gratuit te donne acces a 2 matieres, 10 requetes IA par jour, des quiz illimites et le suivi de progression. Tu peux passer en premium pour debloquer toutes les matieres et les fonctionnalites avancees.",
  },
  {
    question: "Quels niveaux scolaires sont couverts ?",
    answer:
      "E-StudyLab couvre de la 6eme a la Licence 3. Les contenus sont adaptes au programme francais et les quiz IA s'ajustent automatiquement a ton niveau.",
  },
  {
    question: "Comment fonctionne l'assistant IA ?",
    answer:
      "L'assistant IA utilise Claude, un modele d'intelligence artificielle avance. Il peut t'expliquer des concepts, corriger tes exercices, generer des quiz et creer des fiches de revision adaptees a ton niveau.",
  },
  {
    question: "Puis-je scanner mes propres cours ?",
    answer:
      "Absolument ! Tu peux importer tes cours en photo ou PDF. L'IA analyse le document, extrait le contenu et genere automatiquement des quiz et fiches de revision a partir de tes supports.",
  },
  {
    question: "Mes donnees sont-elles en securite ?",
    answer:
      "Oui. Tes donnees sont hebergees sur Supabase avec un chiffrement de bout en bout. Nous ne partageons jamais tes informations personnelles et tu peux supprimer ton compte a tout moment.",
  },
  {
    question: "Puis-je utiliser E-StudyLab sur mobile ?",
    answer:
      "Oui, E-StudyLab est entierement responsive et fonctionne sur tous les appareils : ordinateur, tablette et smartphone. Pas besoin d'installer d'application.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Questions frequentes
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
