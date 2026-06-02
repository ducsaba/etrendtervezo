# ÉtrendTervező – Projekt Összefoglaló

## Mi ez az app?

Magyar nyelvű, AI-alapú étrendtervező webapp, amit Csaba épített kis csoport (néhány ember) számára.
Személyre szabott étkezési javaslatokat ad, figyelembe veszi az egészségügyi állapotokat, allergiákat, célokat.

---

## Jelenlegi állapot (2026. június)

**✅ TELJESEN KÉSZ és MŰKÖDIK lokálisan**
- Az app fut: `http://localhost:3000`
- Regisztráció / bejelentkezés működik (email megerősítés szükséges)
- Dashboard, napló, AI javaslat, receptbank, súlynapló, dokumentumok – mind elkészült
- Supabase és Anthropic API kulcsok be vannak állítva

**⏳ MÉG NEM KÉSZ:**
- Supabase SQL migrációk futtatása (adatbázis táblák létrehozása) – lásd lent
- Vercel deployment (jelenleg csak lokálisan fut)
- Profil kitöltése (az AI javaslatok ettől lesznek személyre szabottak)

---

## Tech stack

| Rész | Technológia |
|---|---|
| Frontend + Backend | Next.js 16 (App Router) |
| Adatbázis + Auth + Storage | Supabase (PostgreSQL) |
| Stílusok | Tailwind CSS |
| AI javaslatok | Claude API (Anthropic, claude-haiku-4-5) |
| Grafikonok | Recharts |
| Hosting (tervezett) | Vercel (ingyenes Hobby tier) |

---

## Fájlstruktúra – fontos helyek

```
/Users/csaba/CLAUDE mappa/etrendtervezo/
│
├── .env.local                  ← API kulcsok (Supabase + Anthropic) – NE commitold!
├── .env.local.example          ← Sablon a kulcsokhoz
│
├── supabase/migrations/
│   ├── 001_initial_schema.sql  ← Adatbázis táblák + RLS – ezt kell futtatni Supabase-ben!
│   └── 002_seed_elelmiszerek.sql ← 70+ magyar élelmiszer alap adatok
│
├── src/
│   ├── app/
│   │   ├── (auth)/login        ← Bejelentkezés
│   │   ├── (auth)/register     ← Regisztráció
│   │   ├── (app)/dashboard     ← Főoldal – napi kalória, makrók
│   │   ├── (app)/naplo         ← Étkezési napló
│   │   ├── (app)/javaslat      ← AI étrendi javaslat (Claude streaming)
│   │   ├── (app)/receptbank    ← Saját receptek
│   │   ├── (app)/sulynaplo     ← Súlynapló + grafikon
│   │   ├── (app)/dokumentumok  ← Orvosi dok. feltöltés + AI elemzés
│   │   ├── (app)/profil        ← Profil wizard (kalória, egészség, preferenciák)
│   │   └── api/ai/             ← Claude API backend route-ok
│   │
│   ├── lib/
│   │   ├── supabase/           ← Supabase kliens (böngésző + szerver)
│   │   ├── claude/client.ts    ← Anthropic SDK + prompt építő függvények
│   │   └── kaloria/bmr.ts      ← BMR/TDEE számítás (Mifflin-St Jeor)
│   │
│   ├── components/ui/          ← Button, Card, Input, Badge komponensek
│   ├── components/layout/      ← Sidebar (desktop) + MobileNav (telefon)
│   ├── types/index.ts          ← TypeScript típusdefiníciók
│   └── proxy.ts                ← Útvonalvédelem (bejelentkezés ellenőrzés)
```

---

## Supabase beállítások

**Projekt URL:** `https://oziqkznumwragizirjgw.supabase.co`

**Elvégzett lépések:**
- ✅ Supabase projekt létrehozva
- ✅ API kulcsok beállítva a `.env.local`-ban
- ✅ Email megerősítés aktív (regisztrációnál megerősítő email megy)

**MÉG SZÜKSÉGES:**
- ⏳ SQL Editor → `001_initial_schema.sql` futtatása (táblák + RLS)
- ⏳ SQL Editor → `002_seed_elelmiszerek.sql` futtatása (élelmiszer adatok)
- ⏳ Storage → `dokumentumok` nevű **private** bucket létrehozása

---

## Az app indítása (gépi újraindítás után)

```bash
cd "/Users/csaba/CLAUDE mappa/etrendtervezo"
npm run dev
# → http://localhost:3000
```

Vagy Claude Code-ban: a projekt megnyitásakor automatikusan elindul.

---

## Következő tennivalók fontossági sorrendben

1. **Supabase migrációk futtatása** – nélkülük az étkezési napló, receptbank stb. nem ment adatot
2. **Supabase Storage bucket** létrehozása (`dokumentumok`, private) – orvosi dok. feltöltéshez
3. **Profil kitöltése** – AI javaslatok személyre szabásához
4. **Vercel deployment** – hogy ne kelljen lokálisan futtatni, mindig elérhető legyen

---

## Adatbázis táblák (amik létrejönnek a migráció után)

| Tábla | Tartalom |
|---|---|
| `profilok` | Felhasználói adatok, egészségügyi állapot, célok, kalóriaigény |
| `elelmiszerek` | Magyar élelmiszer adatbázis (közös + saját ételek) |
| `naplo_bejegyzesek` | Napi étkezési napló |
| `sulynaplo` | Súlymérések idősorban |
| `dokumentumok` | Orvosi iratok (Supabase Storage + AI elemzés) |
| `receptek` | Saját receptek |
| `ai_javaslatok` | AI válaszok előzményei |

---

## Fontos tudnivalók a kódról

- A **proxy.ts** fájl védi a bejelentkezett oldalakat – ha valaki nem jelentkezett be, `/login`-ra irányít
- A **Claude API** prompt caching-et használ → olcsóbb API hívások
- Az AI dokumentumelemzésnél mindig ki van írva: *"Ez nem orvosi vélemény"*
- A hydration warning (böngészőben piros N ikon) egy böngészőbővítménytől jön, nem hibából
- A `.env.local` fájlt **soha ne commitold** Git-be (benne vannak az API kulcsok)

---

## Kontaktinfo

- **Fejlesztő:** Csaba (dudascsaba68@gmail.com)
- **Supabase projekt:** oziqkznumwragizirjgw
- **Anthropic konzol:** console.anthropic.com
