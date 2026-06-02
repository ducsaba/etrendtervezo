# 🥗 ÉtrendTervező

Magyar nyelvű, AI-alapú személyre szabott étrendtervező webapp. Figyelembe veszi az egészségügyi állapotokat, allergiákat, célokat és preferenciákat — Claude AI segítségével ad napi étkezési javaslatokat.

**Élő app:** [etrendtervezo.vercel.app](https://etrendtervezo.vercel.app)

---

## ✨ Funkciók

- **🧠 AI Étrendi Javaslat** – Claude AI személyre szabott tanácsokat ad a profilod, egészségi állapotod és a napi étkezéseid alapján
- **📊 Étkezési Napló** – Napi étkezések rögzítése, kalória és makró (fehérje, szénhidrát, zsír) automatikus számítása
- **🏥 Egészségügyi Profil** – Cukorbetegség, inzulinrezisztencia, allergiák, diéta típusa figyelembevétele
- **📄 Orvosi Dokumentumok** – Laboreredmények, leletek feltöltése és AI-alapú értelmezése étkezési javaslatokkal
- **👨‍🍳 Receptbank** – Saját kedvenc ételek és receptek gyűjtése kalóriainformációkkal
- **⚖️ Súlynapló** – Testsúly alakulásának követése grafikonon, BMR/TDEE automatikus számítás
- **🎯 Kalóriacél** – Személyre szabott napi kalóriaigény számítás (Mifflin-St Jeor képlet)
- **📱 Mobil + Desktop** – Reszponzív dizájn, mobilos tab bar navigáció

---

## 🛠️ Tech Stack

| Technológia | Szerepe |
|---|---|
| [Next.js 16](https://nextjs.org/) | Frontend + Backend (App Router) |
| [Supabase](https://supabase.com/) | Adatbázis (PostgreSQL) + Auth + Fájltárolás |
| [Tailwind CSS](https://tailwindcss.com/) | Stílusok |
| [Claude API](https://anthropic.com/) | AI javaslatok + dokumentumelemzés |
| [Recharts](https://recharts.org/) | Súlynapló grafikon |
| [Vercel](https://vercel.com/) | Hosting |

---

## 🚀 Helyi fejlesztői indítás

### 1. Klónozd le a repót

```bash
git clone https://github.com/ducsaba/etrendtervezo.git
cd etrendtervezo
```

### 2. Telepítsd a függőségeket

```bash
npm install
```

### 3. Hozd létre a `.env.local` fájlt

```bash
cp .env.local.example .env.local
```

Töltsd ki a szükséges értékekkel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Supabase adatbázis beállítása

Futtasd le a migrációkat a [Supabase SQL Editorban](https://app.supabase.com):

- `supabase/migrations/001_initial_schema.sql` – táblák és RLS szabályok
- `supabase/migrations/002_seed_elelmiszerek.sql` – 70+ magyar élelmiszer adat

Hozz létre egy **`dokumentumok`** nevű **private** Storage bucketet is.

### 5. Indítsd el az appot

```bash
npm run dev
```

Nyisd meg: [http://localhost:3000](http://localhost:3000)

---

## 📁 Projekt struktúra

```
src/
├── app/
│   ├── (auth)/          # Bejelentkezés, regisztráció
│   ├── (app)/           # Védett oldalak (dashboard, napló, stb.)
│   └── api/ai/          # Claude API backend route-ok
├── components/
│   ├── ui/              # Button, Card, Input, Badge
│   └── layout/          # Sidebar, MobileNav
├── lib/
│   ├── supabase/        # Supabase kliensek
│   ├── claude/          # Anthropic SDK + prompt builder
│   └── kaloria/         # BMR/TDEE számítás
└── types/               # TypeScript típusdefiníciók

supabase/
└── migrations/          # SQL séma és seed adatok
```

---

## 🌍 Deployment (Vercel)

1. Importáld a GitHub repót a [Vercel](https://vercel.com)-en
2. Add meg az Environment Variables-t:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
3. Deploy!

---

## 📋 Adatbázis táblák

| Tábla | Tartalom |
|---|---|
| `profilok` | Felhasználói adatok, egészségügyi állapot, kalóriacél |
| `elelmiszerek` | Magyar élelmiszer adatbázis (70+ étel) |
| `naplo_bejegyzesek` | Napi étkezési napló |
| `sulynaplo` | Súlymérések idősorban |
| `dokumentumok` | Orvosi iratok (Storage + AI elemzés) |
| `receptek` | Saját receptek |
| `ai_javaslatok` | AI válaszok előzményei |

---

## ⚠️ Fontos

- A `.env.local` fájlt **soha ne töltsd fel** Git-be (benne vannak az API kulcsok)
- Az orvosi dokumentum elemzés tájékoztató jellegű, **nem helyettesíti az orvosi véleményt**
- Az app ingyenes Supabase és Vercel tier-en fut

---

## 📧 Kapcsolat

Fejlesztő: Csaba Dudás – dudascsaba68@gmail.com
