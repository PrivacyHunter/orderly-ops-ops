# Ambition Sports — cPanel (Hostinger) par host karne ka tareeqa

Ye site ek **Node.js app** hai. Admin panel, banners, products, visitor tracking —
sab server par chalte hain aur data database (Lovable Cloud / Supabase) mein hai.
Isliye sirf HTML files `public_html` mein daalne se kaam **nahi** chalega.

---

## Step 0 — Pehle ye check karein (zaroori)

cPanel mein login karke **Software** section dekhein:

- **"Setup Node.js App"** ya **"Node.js Selector"** mojood hai? → Step 1 par jayein.
- Nahi hai? → Aapka shared plan is app ko chala nahi sakta. Neeche
  "Agar Node.js support nahi hai" section padhein.

---

## Step 1 — Apne computer par build karein

```bash
npm install
npm run build:cpanel
```

Ye `.output/` folder banata hai:

- `.output/server/index.mjs` — Node server
- `.output/public/` — CSS, JS, images

> Note: `npm run build` (Lovable/Vercel ke liye) aur `npm run build:cpanel`
> (aapki hosting ke liye) alag hain. cPanel ke liye **hamesha** `build:cpanel`.

---

## Step 2 — cPanel mein Node.js app banayein

1. cPanel → **Setup Node.js App** → **Create Application**
2. **Node.js version**: 20 ya us se naya
3. **Application mode**: Production
4. **Application root**: `ambition` (koi bhi folder naam, `public_html` ke bahar)
5. **Application URL**: apna domain (ya subdomain)
6. **Application startup file**: `app.js`
7. **Create** dabayein

---

## Step 3 — Files upload karein

Application root folder (`ambition`) mein ye upload karein:

- `.output/` (poora folder — File Manager chhupi files bhi dikhaye, "Show Hidden Files" on karein)
- `app.js`
- `package.json`

Baaki kuch upload karne ki zaroorat nahi (`node_modules`, `src`, `dist` nahi chahiye —
server bundle self-contained hai).

Tip: zip banakar upload karein aur cPanel File Manager se **Extract** karein — tez hota hai.

---

## Step 4 — Environment variables set karein

Setup Node.js App → apni app kholein → **Environment variables** → ye 5 add karein:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | project ka Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key |
| `SUPABASE_URL` | wohi URL |
| `SUPABASE_PUBLISHABLE_KEY` | wohi publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (secret — kisi ko na dein) |

Values project ki `.env` file / Lovable Cloud settings mein milengi.
`SUPABASE_SERVICE_ROLE_KEY` ke baghair admin panel ka save/upload fail hoga.

Phir **Restart** dabayein.

---

## Step 5 — Domain kholein

Apna domain browser mein kholein. Site aur `/panel` (admin) dono chalne chahiye,
aur aapke saare banners/products **khud ba khud** aa jayenge — kyunki wo database
mein hain, hosting par sirf code hai.

---

## Har update ke baad (naya code deploy karna)

1. `npm run build:cpanel`
2. purana `.output` folder hosting se delete karein
3. naya `.output` upload karein
4. cPanel Node.js App → **Restart**

---

## Agar Node.js support nahi hai

Ye hosting ki limit hai, code ka masla nahi. Options:

1. **Hostinger VPS** (~$5–6/month) — poori access, Node chal jata hai.
   Vahan `npm install && npm run build:cpanel && node app.js` (PM2 ke saath) kaafi hai.
2. **Vercel free plan, client ke account mein** — account client ke email se banayein,
   client ko poora dashboard control mil jayega, custom domain free lagta hai,
   deploy automatic hota hai. Sab se sasta aur reliable.
3. **Lovable publish + custom domain** — sab se aasan, lekin hosting control Lovable ke paas.

---

## Troubleshooting

| Problem | Wajah / Hal |
|---|---|
| "Server bundle not found" | `.output` folder upload nahi hua ya galat jagah hai |
| Site khulti hai par admin data khali | Environment variables missing → Step 4 |
| Admin mein save/upload fail | `SUPABASE_SERVICE_ROLE_KEY` missing |
| 503 / "Passenger" error page | Node version purana (20+ karein) ya startup file `app.js` set nahi |
| CSS/images load nahi | `.output/public` upload nahi hua (hidden files show karein) |
