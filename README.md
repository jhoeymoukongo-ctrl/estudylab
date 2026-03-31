# E-StudyLab

Plateforme educative propulsee par l'IA pour les collegiens, lyceens et etudiants. Cours structures, quiz interactifs, fiches de revision, assistant IA pedagogique et scan de documents.

## Stack technique

- **Framework** : Next.js 15 (App Router)
- **UI** : Tailwind CSS v4, Shadcn/ui (base-ui), Lucide Icons
- **Backend** : Supabase (PostgreSQL, Auth, Storage, RLS)
- **IA** : Claude API (Anthropic) avec streaming
- **Validation** : Zod
- **Polices** : Fredoka (display) + DM Sans (body)
- **Theme** : Dark mode par defaut (#0F1923)

## Fonctionnalites

- Inscription / connexion avec email
- Onboarding (selection du niveau scolaire)
- Tableau de bord avec statistiques
- Navigation cours : matieres → chapitres → lecons
- Quiz interactifs avec correction et explications
- Assistant IA avec streaming en temps reel
- Scan de documents (upload PDF/images)
- Fiches de revision
- Suivi de progression par matiere
- Profil utilisateur editable
- Interface d'administration
- RLS sur toutes les tables (isolation des donnees)
- Quotas : plan gratuit (2 matieres, 10 req IA/jour) vs premium

## Prerequis

- Node.js 18+
- Compte [Supabase](https://supabase.com)
- Cle API [Anthropic](https://console.anthropic.com)

## Installation

```bash
# Cloner le repo
git clone <url-du-repo>
cd estudylab

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local
```

## Configuration Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Executer les migrations SQL dans l'ordre :

```bash
# Via Supabase CLI
supabase db reset

# Ou manuellement dans l'editeur SQL de Supabase :
# 1. supabase/migrations/001_schema.sql
# 2. supabase/migrations/002_rls.sql
# 3. supabase/migrations/003_seed.sql
```

3. Copier l'URL du projet et la cle anon dans `.env.local`
4. Activer l'authentification email dans Authentication > Providers

### Creer un admin

Dans l'editeur SQL de Supabase, apres avoir cree un compte utilisateur :

```sql
UPDATE user_profiles SET role = 'admin' WHERE user_id = '<user-uuid>';
```

## Demarrage

```bash
# Mode developpement
npm run dev

# Build production
npm run build
npm start
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Deploiement sur Vercel

1. Importer le repo sur [vercel.com](https://vercel.com)
2. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (l'URL de deploiement Vercel)
3. Deployer

## Structure du projet

```
app/
  (auth)/              — Pages authentification (inscription, connexion, onboarding)
  (dashboard)/         — Pages protegees (tableau de bord, matieres, quiz, IA, scan, etc.)
  api/ai/              — API routes IA (chat streaming)
  auth/callback/       — Route handler OAuth
  mentions-legales/    — Pages legales
  confidentialite/
  cgu/

components/
  landing/             — 8 composants de la landing page
  dashboard/           — Sidebar, Header, MobileNav
  ui/                  — Composants Shadcn/ui

lib/
  supabase/            — Clients Supabase (browser + server)
  ai/                  — Claude API (streaming, prompts)
  utils/               — Validation Zod, formatage

supabase/migrations/   — 3 fichiers SQL (schema, RLS, seed)
types/                 — Types TypeScript metier
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role (server-side only) |
| `ANTHROPIC_API_KEY` | Cle API Anthropic pour Claude |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application |

## Licence

Projet prive — tous droits reserves.
