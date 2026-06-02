# ÉtrendTervező – Teljes Projekt Összefoglaló

## Mi ez az app?

Magyar nyelvű, AI-alapú étrendtervező webapp, amit Csaba (dudascsaba68@gmail.com) épített kis csoport számára.
Személyre szabott étkezési javaslatokat ad Claude AI segítségével, figyelembe véve az egészségügyi állapotokat, allergiákat, célokat és preferenciákat.

---

## 🌐 Élő linkek

| | |
|---|---|
| **Élő app** | https://etrendtervezo.vercel.app |
| **GitHub repo** | https://github.com/ducsaba/etrendtervezo |
| **Supabase projekt** | https://supabase.com/dashboard/project/oziqkznumwragizirjgw |
| **Vercel dashboard** | https://vercel.com/dudascsaba68-4935s-projects/etrendtervezo |
| **Anthropic console** | https://console.anthropic.com |

---

## ✅ Mi van KÉSZ (100%)

- **Kódbázis** – Next.js 16 + Tailwind CSS + TypeScript, teljesen elkészült
- **Auth** – Regisztráció / bejelentkezés (Supabase Auth, email megerősítéssel)
- **Dashboard** – Napi kalória kör, makrók, gyors elérések
- **Étkezési napló** – Ételek hozzáadása, kalória/makró számítás, dátumválasztó
- **AI javaslat** – Claude API streaming, személyre szabott tanácsok
- **Receptbank** – Saját receptek CRUD
- **Súlynapló** – Mérések + Recharts grafikon
- **Orvosi dokumentumok** – PDF/kép feltöltés + AI elemzés
- **Profil wizard** – BMR/TDEE kalóriaszámítás, egészségügyi állapot, preferenciák
- **Supabase adatbázis** – Összes tábla létrehozva, RLS beállítva
- **Élelmiszer adatok** – 70+ magyar étel feltöltve
- **Storage bucket** – `dokumentumok` private bucket létrehozva
- **GitHub** – Kód feltöltve, README megírva
- **Vercel deployment** – Élőben fut, env variables beállítva
- **Supabase Auth URL** – Vercel domain engedélyezve

---

## 🛠️ Tech Stack

| Technológia | Szerepe | Verzió |
|---|---|---|
| Next.js | Frontend + Backend (App Router) | 16.2.6 |
| Supabase | Adatbázis + Auth + Storage | latest |
| Tailwind CSS | Stílusok | 4 |
| Claude API | AI javaslatok + dok. elemzés | claude-haiku-4-5 |
| Recharts | Súlynapló grafikon | 3 |
| Vercel | Hosting | Hobby (ingyenes) |

---

## 📁 Projekt helye a gépen

```
/Users/csaba/CLAUDE mappa/etrendtervezo/
```

### Fontos fájlok

| Fájl | Tartalom |
|---|---|
| `.env.local` | API kulcsok (Supabase + Anthropic) – NEM kerül Git-be |
| `src/proxy.ts` | Útvonalvédelem (bejelentkezés ellenőrzés) |
| `src/lib/claude/client.ts` | Claude API kliens + prompt builder |
| `src/lib/kaloria/bmr.ts` | BMR/TDEE számítás (Mifflin-St Jeor) |
| `src/types/index.ts` | TypeScript típusdefiníciók |
| `supabase/migrations/` | SQL séma és élelmiszer seed adatok |
| `PROJEKT_OSSZEFOGLALAS.md` | Ez a fájl |

### Oldalak

| URL | Funkció |
|---|---|
| `/` | Landing oldal |
| `/register` | Regisztráció |
| `/login` | Bejelentkezés |
| `/dashboard` | Főoldal – napi kalória, makrók |
| `/naplo` | Étkezési napló |
| `/javaslat` | AI étrendi javaslat |
| `/receptbank` | Saját receptek |
| `/sulynaplo` | Súlynapló + grafikon |
| `/dokumentumok` | Orvosi dokumentumok |
| `/profil` | Profil beállítások |

---

## 🗄️ Supabase adatbázis

**Projekt ID:** `oziqkznumwragizirjgw`
**URL:** `https://oziqkznumwragizirjgw.supabase.co`

### Táblák

| Tábla | Tartalom |
|---|---|
| `profilok` | Felhasználói adatok, egészségügyi állapot, kalóriacél |
| `elelmiszerek` | Magyar élelmiszer adatbázis (70+ közös étel + saját ételek) |
| `naplo_bejegyzesek` | Napi étkezési napló |
| `sulynaplo` | Súlymérések idősorban |
| `dokumentumok` | Orvosi iratok metaadatai + AI elemzés szövege |
| `receptek` | Saját receptek |
| `ai_javaslatok` | AI válaszok előzményei |

### Storage
- Bucket neve: `dokumentumok` (private)
- Max fájlméret: 50MB

---

## 🔑 Environment Variables

A `.env.local` fájlban (lokális) és a Vercel dashboard-on (production) be van állítva:

```
NEXT_PUBLIC_SUPABASE_URL=https://oziqkznumwragizirjgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 💻 Az app indítása (gépi újraindítás után)

```bash
cd "/Users/csaba/CLAUDE mappa/etrendtervezo"
npm run dev
# → http://localhost:3000
```

Vagy Claude Code-ban megnyitva automatikusan elindul.

---

## 🚀 Fejlesztési lehetőségek (következő fázisok)

Ezek vannak tervben, de még nem valósultak meg:

1. **Vízfogyasztás tracker** – Napi vízivás követése
2. **Mozgásnapló** – Edzés + kalóriaelégetés
3. **Heti tervezés** – Előre megtervezett étrend + bevásárlólista generálás
4. **Étkezési emlékeztetők** – Push értesítések
5. **Tápanyaghiány figyelmeztetés** – Ha rendszeresen kevés vasat, vitamint visz be
6. **Gyógyszer-étel interakciók** – Figyelmeztetés bizonyos kombinációkra
7. **Közösségi receptmegosztás** – Felhasználók megoszthatják receptjeiket
8. **Étterem mód** – Éttermi ételek keresése és kalóriabecslés
9. **Időszakos böjt tracker** – 16:8 böjt követése
10. **Google/Apple bejelentkezés** – OAuth integráció

---

## ⚠️ Fontos tudnivalók

- A `.env.local` fájlt **soha ne töltsd fel** Git-be
- Az orvosi dokumentum elemzés **nem helyettesíti az orvosi véleményt**
- A böngészőben megjelenő "hydration warning" (piros N ikon) egy böngészőbővítménytől jön (`data-moat-theme`), nem kódhiba — figyelmen kívül hagyható
- A Supabase ingyenes projekt **1 hét inaktivitás után szünetelhet** — havonta legalább egyszer be kell lépni
- Az Anthropic API fizetős, de nagyon olcsó (~$1/hó 10 felhasználóval)

---

## 📝 Ha folytatni szeretnéd a fejlesztést

1. Nyisd meg a Claude Code-ot ebben a mappában: `/Users/csaba/CLAUDE mappa/etrendtervezo/`
2. Mutasd meg ezt a fájlt: `PROJEKT_OSSZEFOGLALAS.md`
3. Mondd el mit szeretnél fejleszteni — innen folytatjuk!
