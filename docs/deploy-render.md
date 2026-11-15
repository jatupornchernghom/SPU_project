# Deploy to Render (demo)

Render runs this app as a normal long-lived Node process (not serverless), which is exactly what the real-time features need — no code changes required. This guide gets a demo instance live.

## 0. Why Render (quick recap)

Live queue updates (`/api/orders/[id]/stream`, `/api/restaurants/[id]/stream`) use an in-memory event bus (`src/lib/eventBus.ts`) that needs one persistent process. Render's Web Service type keeps a single instance running, so this works out of the box — on a serverless host (Vercel's default) it would not.

**Free-tier caveat**: Render's free web services spin down after ~15 minutes with no traffic, and the first request after that takes ~30–50s to spin back up (and would drop any open SSE connection along with it). Fine for a demo people visit occasionally; not fine for a 24/7 production deployment.

## 1. Push the repo to GitHub

Render deploys from a connected Git repo.

```bash
git init
git add .
git commit -m "Initial commit"
```

Then create an empty repo on GitHub (via github.com → New repository — don't initialize it with a README) and push:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

> Double check `git status` before committing — `.env.local` (your real MongoDB URI / secrets) must NOT appear in the list. It's covered by `.gitignore`, but worth a glance since it holds real credentials.

## 2. Allow Render to reach your MongoDB Atlas cluster

Render's outbound IPs aren't static on the free plan, so:

1. Atlas → your cluster → **Network Access** → **Add IP Address**
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`)

This is fine for a demo cluster with a throwaway password; don't do this on a cluster holding real/sensitive data.

## 3. Create the Render service

**Option A — Blueprint (recommended, uses the included `render.yaml`)**

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint**
2. Connect your GitHub account/repo if you haven't, then select this repo
3. Render reads `render.yaml` and proposes a Web Service named `spu-skipq`. It will prompt you for the three env vars marked `sync: false` — fill them in now or after creation (step 4)
4. Click **Apply**

**Option B — Manual Web Service**

1. **New +** → **Web Service** → connect this repo
2. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free

## 4. Set environment variables

In the service's **Environment** tab:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | Your Atlas connection string, including a database name (e.g. `.../spu-skipq?...`) |
| `AUTH_SECRET` | Generate one locally: `npx auth secret` (prints a value — paste it here) |
| `NEXTAUTH_URL` | Your Render URL, e.g. `https://spu-skipq.onrender.com` — you won't know the exact URL until after the first deploy, so deploy once, copy the assigned URL, paste it here, then trigger **Manual Deploy → Deploy latest commit** to pick it up |

### Optional: "Sign in with Google"

Students can sign in with their `@spumail.net` Google account. Without these two variables the Google button simply doesn't appear.

1. [Google Cloud Console](https://console.cloud.google.com) → create (or pick) a project
2. **APIs & Services → OAuth consent screen**: user type **External**, fill in the app name and support email, add scopes `email` and `profile`, then **Publish app** (in "Testing" mode only listed test users can sign in)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**
   - **Authorized JavaScript origins**: `https://<your-app>.onrender.com` (and `http://localhost:3000` for local dev)
   - **Authorized redirect URIs**: `https://<your-app>.onrender.com/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google`)
4. Copy the client ID / secret into Render:

| Key | Value |
| --- | --- |
| `AUTH_GOOGLE_ID` | OAuth client ID (`....apps.googleusercontent.com`) |
| `AUTH_GOOGLE_SECRET` | OAuth client secret |

For local dev put the same two lines in `.env.local`.

Rules: a Google account whose email already has an account here signs in as that account (so admin-created staff / restaurant accounts can use Google too). Otherwise only `@spumail.net` addresses can sign up, always as students. Accounts created through Google have no password.

## 5. Seed the database

The seed script (`npm run seed`) just needs `MONGODB_URI` in its environment — run it **from your own machine** against the same Atlas cluster (it already points there via your local `.env.local`), no need to run it on Render itself:

```bash
npm run seed
```

Demo accounts (password `password123` for all): `student@spumail.net`, `staff@spumail.net`, `admin@spumail.net`, `restaurant@spumail.net`.

## 6. Verify

Open the Render URL and walk through the demo flow from the main [README](../README.md#9-testing-the-live-queue) — login, order, and confirm the live queue updates between a customer tab and `/restaurant/dashboard` still work with no refresh.

## Updating the deployment later

Render auto-deploys on every push to the connected branch (`main` by default). Just `git push` and it rebuilds.
