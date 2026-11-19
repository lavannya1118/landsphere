# LandSphere (DEMO PROTOTYPE)
One Map. One Record. Smarter Land Governance. All data is fictional and not official.

## Run locally
1. Install Node.js 18+ then `npm install`
2. Copy `.env.example` to `.env.local`.
3. `npm run dev` → http://localhost:3000. Without Firebase, the app is a citizen-only demo.

## Local Firebase emulators
The checked-in emulator configuration uses the non-production `demo-landsphere` project ID. Start the local Auth, Firestore, and Storage emulators with JDK 21+:

```powershell
npm run emulators
```

The Emulator UI is at http://localhost:4000. The local `.env.local` enables the app to connect to the emulators; no Firebase login or cloud project is needed for local testing. Alternatively, with JDK 21 on `PATH`, run `npx --yes firebase-tools emulators:start --project demo-landsphere`.

## Enable Google sign-in and roles
1. Create a Firebase project and register a Web app. Enable Google under Authentication → Sign-in method and create the Firestore database.
2. Add the five `NEXT_PUBLIC_FIREBASE_*` Web app settings from Firebase to local `.env.local` and Vercel Production environment variables.
3. Add the production Vercel domain to Firebase Authentication's authorized domains.
4. For Vercel redirect sign-in, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to the deployed app's host. Keep the `/__/auth/:path*` rewrite in `next.config.js` pointed at `<firebase-project-id>.firebaseapp.com`, and add the app origin and `https://<app-host>/__/auth/handler` to the Google OAuth client's authorized origins and redirect URIs.
5. Sign in with the verified Google account `lavannya1118@gmail.com` to bootstrap the first administrator. Other users start as citizens.
6. Deploy `firestore.rules`. The administrator can then assign `citizen`, `officer`, or `admin` roles from the Admin page. The bootstrap account cannot be demoted.

## Enable general AI chat
Set `ANTHROPIC_API_KEY` as a server-only Vercel Production environment variable, then redeploy. Without it, chat only searches demo parcels and explains a few land terms; general answers are unavailable. The chat can respond in English, Hindi, or Marathi. AI answers are informational and not legal advice.

## Deploy (Vercel, free)
1. Push to GitHub. 2. vercel.com → Import repo → add env vars → Deploy.
Alternatives: Firebase App Hosting, Netlify, Render.

## Extra features included
Dark mode, app-wide EN/HI/MR language selector, multilingual chat with voice input/output, OCR (images), QR-verified PDF reports, Excel export, GPS locate, audit log, role-gated pages, broadcast notifications.

## Installable web app (PWA)
Deployed over HTTPS, LandSphere can be installed: Chrome/Edge show an "Install LandSphere app" button; on iPhone use Share → Add to Home Screen. It has an icon, runs full-screen, and reopens previously visited pages offline.
