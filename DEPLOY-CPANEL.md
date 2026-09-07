# Ambition Sports — cPanel (Node.js) par GitHub se host karne ki guide

Ye site ek **Node.js app** hai (admin panel, banners, products, visitor tracking
sab server par chalte hain, data Lovable Cloud / Supabase database mein hai).
Aapki hosting Node.js support karti hai — is liye ye poori tarah chalegi.

Tested: build + server dono verify ho chuke hain (`/` aur `/panel` = 200 OK).

---

## Zaroori cheezein

- cPanel → **Setup Node.js App** (Node 20 ya naya)
- cPanel → **Git Version Control** (GitHub se clone karne ke liye)
- Project ka GitHub repo (Lovable → GitHub sync)

---

## Step 1 — cPanel mein repo clone karein (GitHub se)

1. cPanel → **Git Version Control** → **Create**
2. **Clone URL**: `https://github.com/<aapka-user>/<repo>.git`
3. **Repository Path**: `ambition` (public_html ke **bahar**)
4. **Create** dabayein — code clone ho jayega.

> Private repo ho to GitHub par ek Personal Access Token banayein aur URL aise dein:
> `https://<token>@github.com/<user>/<repo>.git`

---

## Step 2 — Node.js app banayein

cPanel → **Setup Node.js App** → **Create Application**

| Field | Value |
|---|---|
| Node.js version | 20 (ya naya) |
| Application mode | Production |
| Application root | `ambition` (Step 1 ka path) |
| Application URL | aapka domain / subdomain |
| Application startup file | `app.js` |

**Create** dabayein.

---

## Step 3 — Environment variables set karein

Usi app screen par **Environment variables** mein ye 5 add karein
(values project ki `.env` file / Lovable Cloud settings se):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key |
| `SUPABASE_URL` | wohi URL |
| `SUPABASE_PUBLISHABLE_KEY` | wohi publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (secret — kisi ko na dein) |
| `NODE_ENV` | `production` |

`SUPABASE_SERVICE_ROLE_KEY` ke baghair admin panel ka save/upload fail hoga.

---

## Step 4 — Install + build (ek hi dafa)

cPanel → **Terminal** (ya Node.js App page par "Run NPM Install" + Terminal):

```bash
cd ~/ambition
source /home/<cpanel-user>/nodevenv/ambition/20/bin/activate   # Node.js App page par ye line likhi hoti hai
npm install
npm run build:node
```

`npm run build:node` banata hai:

- `.output/server/index.mjs` — Node server
- `.output/public/` — CSS, JS, images

> Ek hi command mein: `npm install && npm run build:node`

---

## Step 5 — Restart aur domain kholein

Setup Node.js App → **Restart**. Phir apna domain kholein.

- Home page + saare pages chalne chahiye
- `/panel` (admin) bhi khulna chahiye
- Aapke banners/products **khud ba khud** aa jayenge (wo database mein hain)

---

## Har update ke baad (naya code deploy)

```bash
cd ~/ambition
source /home/<cpanel-user>/nodevenv/ambition/20/bin/activate
git pull
npm install
npm run build:node
```

Phir cPanel → Setup Node.js App → **Restart**.

(cPanel Git Version Control se bhi "Update from Remote" + "Deploy HEAD Commit" chal jata hai.)

---

## Commands ka khulasa

| Command | Kis ke liye |
|---|---|
| `npm run dev` | local development |
| `npm run build` | Lovable / Vercel / Cloudflare (output: `dist/`) |
| `npm run build:node` | **aapki cPanel hosting** (output: `.output/`) |
| `npm run start:node` | built Node server chalana (`node app.js`) |

---

## Troubleshooting

| Problem | Wajah / Hal |
|---|---|
| "Server bundle not found" | `npm run build:node` chalaya nahi gaya |
| Site khulti hai par data khali | Environment variables missing → Step 3 |
| Admin mein save/upload fail | `SUPABASE_SERVICE_ROLE_KEY` missing |
| 503 / Passenger error | Node version purana, ya startup file `app.js` set nahi, ya Restart baqi hai |
| CSS/images load nahi | build adhoora — `npm run build:node` dobara chalayein |
| `npm install` memory error | Terminal mein `npm install --no-audit --no-fund` try karein |
| Port ka masla | Kuch set na karein — Passenger `PORT` khud deta hai |
