---
description: Prépare et vérifie tout ce qu'il faut pour tester NOOR sur un téléphone via Expo Go
---

Tu dois préparer le projet NOOR pour un test sur téléphone via Expo Go, et guider l'utilisateur étape par étape. L'utilisateur n'est pas développeur de formation : explique chaque étape en une phrase simple, sans jargon inutile. Travaille dans le dossier du projet Expo (celui qui contient `package.json`, `app.json`, `src/` — généralement `noor-app/`). Suis ces étapes dans l'ordre, sans en sauter :

1. **Vérifier l'état du dépôt git**
   - Lance `git status` et `git log --oneline -5`.
   - Si la branche n'est pas à jour avec `origin` ou qu'il y a des changements non commités, préviens l'utilisateur avant de toucher à quoi que ce soit (ne jamais `git pull`, `checkout` ou `reset` sans confirmation explicite).

2. **Vérifier le fichier `.env`**
   - Vérifie si un fichier `.env` existe à la racine du projet Expo.
   - S'il n'existe pas : explique qu'il faut copier `.env.example` vers `.env` (`cp .env.example .env`) puis renseigner les vraies valeurs Supabase (Project URL et clé "publishable"/anon), trouvables sur supabase.com → le projet → Settings → API. Ne jamais écrire de vraie clé dans un fichier versionné (`.env` doit rester hors de git — vérifie qu'il est bien listé dans `.gitignore`).
   - S'il existe déjà : vérifie juste que les variables `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` sont présentes et non vides, sans jamais afficher leur valeur en clair dans la conversation.

3. **Vérifier les dépendances**
   - Si `node_modules/` n'existe pas, ou si `package-lock.json` est plus récent que `node_modules/`, lance `npm install`.

4. **Rappeler l'état de la base Supabase**
   - S'il existe un dossier `supabase/` avec des scripts `.sql`, rappelle à l'utilisateur de vérifier qu'ils ont bien été exécutés dans le SQL Editor de son dashboard Supabase (liste les fichiers trouvés). Ne te connecte jamais toi-même à la base et n'exécute jamais de SQL à sa place.

5. **Vérifier que le code compile**
   - Lance `npx tsc --noEmit`.
   - S'il y a des erreurs, propose de les corriger avant de continuer ; ne lance pas Expo avec un code cassé.

6. **Donner la commande de lancement**
   - Donne la commande exacte à taper : `npx expo start` (dans le dossier du projet Expo).
   - Rappelle comment scanner le QR code : appareil photo natif sur iPhone, bouton "Scan QR code" dans l'app Expo Go sur Android.
   - Rappelle que le téléphone et l'ordinateur doivent être sur le même réseau Wi-Fi.

7. **Résumé final**
   - Termine par un résumé court (3-4 lignes) : ce qui a été vérifié ou corrigé automatiquement, ce qu'il reste à faire manuellement (ex. remplir `.env`, exécuter un script SQL), et la commande exacte à lancer.

Règles importantes :
- Ne lance jamais `npx expo start` toi-même : c'est un processus interactif et long qui doit tourner dans le terminal de l'utilisateur, pas dans une commande ponctuelle.
- Ne commite et ne pousse rien pendant cette commande, sauf si l'utilisateur le demande explicitement.
- Si une étape révèle un vrai problème (erreur TypeScript, dépendance cassée, `.env` manquant), corrige ce qui est raisonnable de corriger directement (ex. `npm install`), mais laisse à l'utilisateur tout ce qui touche à ses propres identifiants ou à des décisions de produit.
