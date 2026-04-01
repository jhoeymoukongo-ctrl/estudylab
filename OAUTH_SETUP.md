# Configuration OAuth — Google & Apple

Guide pour activer la connexion Google et Apple sur E-StudyLab via Supabase.

---

## 1. Google OAuth

### a) Creer un projet Google Cloud

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Creer un nouveau projet (ou utiliser un existant)
3. Activer l'API **Google Identity** (ou "Google+ API")

### b) Configurer l'ecran de consentement OAuth

1. **APIs & Services > OAuth consent screen**
2. Choisir "External"
3. Remplir : nom de l'app ("E-StudyLab"), email de support, logo
4. Ajouter les scopes : `email`, `profile`, `openid`
5. Ajouter les domaines autorises : votre domaine Vercel + `localhost`

### c) Creer les identifiants OAuth

1. **APIs & Services > Credentials > Create Credentials > OAuth client ID**
2. Type : "Web application"
3. Nom : "E-StudyLab"
4. **Authorized redirect URIs** :
   ```
   https://<votre-projet>.supabase.co/auth/v1/callback
   ```
   (Remplacez `<votre-projet>` par votre ID de projet Supabase)
5. Copier le **Client ID** et le **Client Secret**

### d) Configurer dans Supabase

1. Aller dans **Supabase Dashboard > Authentication > Providers**
2. Activer **Google**
3. Coller le Client ID et le Client Secret
4. Sauvegarder

---

## 2. Apple OAuth

### a) Prerequis

- Un compte Apple Developer ($99/an) : [developer.apple.com](https://developer.apple.com)

### b) Configurer un Service ID

1. **Certificates, Identifiers & Profiles > Identifiers**
2. Cliquer sur "+" > **Services IDs**
3. Description : "E-StudyLab"
4. Identifier : `com.estudylab.auth` (ou similaire)
5. Enregistrer, puis cliquer dessus pour configurer :
   - Cocher **Sign In with Apple**
   - Cliquer **Configure**
   - **Primary App ID** : votre App ID
   - **Domains and Subdomains** : `<votre-projet>.supabase.co`
   - **Return URLs** :
     ```
     https://<votre-projet>.supabase.co/auth/v1/callback
     ```
6. Sauvegarder

### c) Creer une cle privee

1. **Keys** > Cliquer sur "+"
2. Nom : "E-StudyLab Sign In"
3. Cocher **Sign In with Apple** > Configure > selectionner votre App ID
4. Telecharger le fichier `.p8` (ne le perdez pas !)
5. Noter le **Key ID**

### d) Configurer dans Supabase

1. Aller dans **Supabase Dashboard > Authentication > Providers**
2. Activer **Apple**
3. Remplir :
   - **Service ID** : `com.estudylab.auth`
   - **Team ID** : votre Team ID Apple (visible dans le coin superieur droit du portail Apple Developer)
   - **Key ID** : le Key ID de l'etape c)
   - **Private Key** : le contenu du fichier `.p8`
4. Sauvegarder

---

## 3. Variables d'environnement

Aucune variable d'environnement supplementaire n'est necessaire cote Next.js.
Toute la configuration OAuth est geree par Supabase.

Les variables existantes suffisent :
```env
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-cle-anon>
```

---

## 4. Callback URL

Le callback est deja gere par `/auth/callback/route.ts` dans l'application.
Il echange le code OAuth contre une session Supabase et redirige vers `/onboarding`.

---

## 5. Test

1. Lancez l'app en local : `npm run dev`
2. Allez sur `/connexion` ou `/inscription`
3. Cliquez sur "Continuer avec Google" ou "Continuer avec Apple"
4. Vous devriez etre redirige vers le fournisseur puis revenir connecte

---

## Depannage

- **Erreur "redirect_uri_mismatch"** : Verifiez que l'URL de callback dans Google/Apple correspond exactement a `https://<votre-projet>.supabase.co/auth/v1/callback`
- **Erreur 400 sur Apple** : Verifiez que le Service ID, Team ID et Key ID sont corrects
- **Utilisateur cree sans profil** : Le trigger `handle_new_user` dans la migration SQL cree automatiquement un `user_profile` pour chaque nouvel utilisateur
