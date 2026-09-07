# Ambition Sports ko apni cPanel hosting par deploy karna

## Seedhi baat pehle

Ye site ek **Node.js server app** hai (admin panel, banners, products, visitor tracking — sab live server par chalte hain aur aapka data Lovable Cloud database mein rehta hai). Isliye:

- **Plain static upload (`public_html` mein HTML files) kaam nahi karega** — admin panel aur saara data is tarah nahi chal sakta. Ye wohi wajah hai ke pichli baar custom domain par purana/khali version dikha.
- cPanel par ye tabhi chalegi jab aapki hosting **Node.js support** karti ho. Hostinger ki zyada tar shared plans par Node.js **nahi** hota (sirf VPS ya kuch specific plans par hota hai).

## Step 1 — Pehle ye check karein (2 minute)

cPanel mein login kar ke dekhein:

1. cPanel dashboard mein **"Setup Node.js App"** ya **"Node.js Selector"** ka option hai ya nahi (Software section mein).
2. Ya **"Terminal"** / **"SSH Access"** available hai ya nahi.

Mujhe bata dein kya dikha — usi ke hisaab se agla rasta final hoga.

## Step 2A — Agar Node.js Selector MIL JAYE

Main ye sab set kar dunga aur aapko step-by-step guide dunga:

1. **Build pack taiyar karna**: `npm run build` se `dist/` banegi; main ek `app.js` entry file aur cPanel ke liye zaroori config bana dunga taake Passenger (cPanel ka Node runner) app chala sake.
2. **Upload**: `dist/`, `package.json`, entry file ko cPanel File Manager ya FTP se upload karna.
3. **Environment variables** cPanel Node.js app settings mein dalni hongi (5 keys — main aapko list de dunga, values Lovable Cloud se aati hain):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. **Domain point**: cPanel mein domain/subdomain ko Node app se jorna.
5. Result: aapka saara data (banners, products, admin changes) **automatically live** — kuch bhi manually upload nahi karna padega, kyunki data database mein hai, hosting par sirf code hai.

## Step 2B — Agar Node.js Selector NAHI mile (sab se likely)

Shared cPanel par ye app chalana mumkin nahi — ye hosting ki technical limit hai, code ki kami nahi. Options:

1. **Hosting upgrade/change**: Hostinger VPS (~$5-6/mo) ya koi Node hosting (Railway, Render, Hostinger VPS) — client ko poori access mil jayegi, main deployment ke steps likh dunga.
2. **Vercel/Netlify free par host karein aur client ko uski access dein**: aap Vercel account client ke naam/email se bana sakte hain, main env vars aur deploy config set kar dunga — client ko poora dashboard control milega, custom domain free mein lag jayega, aur aapka saara data waise hi chalega. Ye **sab se sasta aur reliable** rasta hai.
3. **Lovable par hi rehne dein**: Publish + custom domain connect — sab se kam mehnat, lekin hosting access Lovable hi control karta hai.

## Kya main recommend karta hoon

Client ko hosting access chahiye + Node app + low cost → **Option 2 (Vercel, client ke account mein)** sab se behtar hai. Agar cPanel mein Node.js Selector mil jaye to apni hosting par hi sab set kar denge.

## Technical details (developer ke liye)

- Build: `vite build` → `dist/client` (assets) + `dist/server` (SSR server)
- cPanel Node selector: Passenger entry `app.js` jo built server ko import kare; startup file `dist/server` ka handler
- Env: 5 Supabase keys runtime par chahiye; bina `SUPABASE_SERVICE_ROLE_KEY` ke admin writes fail honge
- Static fallback (`.htaccess`/`_redirects`) approach is app ke liye galat hai — server functions ke bina admin/data kaam nahi karta
