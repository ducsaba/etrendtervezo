-- ============================================
-- ÉTRENDTERVEZŐ – Adatbázis séma
-- Másold be a Supabase SQL Editor-ba és futtasd
-- ============================================

-- FELHASZNÁLÓI PROFILOK
CREATE TABLE IF NOT EXISTS profilok (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  teljes_nev          TEXT,
  magassag_cm         INTEGER,
  testsuly_kg         DECIMAL(5,2),
  kor                 INTEGER,
  nem                 TEXT CHECK (nem IN ('ferfi', 'no')),
  aktivitasi_szint    TEXT CHECK (aktivitasi_szint IN ('ulodominans','kicsit_aktiv','mérsékelten_aktiv','nagyon_aktiv','extra_aktiv')),
  cel                 TEXT CHECK (cel IN ('fogyas','hizas','fittseg','egeszsegtartas')),
  cukorbeteg          BOOLEAN DEFAULT FALSE,
  inzulinrezisztencia BOOLEAN DEFAULT FALSE,
  dieta_tipusa        TEXT[] DEFAULT '{}',
  allergiak           TEXT[] DEFAULT '{}',
  kedvelt_etelek      TEXT,
  kerulendom_etelek   TEXT,
  bmr_kaloria         INTEGER,
  tdee_kaloria        INTEGER,
  cel_kaloria         INTEGER,
  letrehozva          TIMESTAMPTZ DEFAULT NOW(),
  frissitve           TIMESTAMPTZ DEFAULT NOW()
);

-- ÉLELMISZER ADATBÁZIS
CREATE TABLE IF NOT EXISTS elelmiszerek (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nev           TEXT NOT NULL,
  mertekegyseg  TEXT DEFAULT 'g',
  kaloria_100g  DECIMAL(6,2),
  feherje_g     DECIMAL(6,2),
  szenhidrat_g  DECIMAL(6,2),
  zsir_g        DECIMAL(6,2),
  rost_g        DECIMAL(6,2),
  kategoria     TEXT,
  felhaszt_id   UUID REFERENCES profilok(id) ON DELETE CASCADE,
  letrehozva    TIMESTAMPTZ DEFAULT NOW()
);

-- ÉTKEZÉSI NAPLÓ
CREATE TABLE IF NOT EXISTS naplo_bejegyzesek (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  felhaszt_id     UUID NOT NULL REFERENCES profilok(id) ON DELETE CASCADE,
  datum           DATE NOT NULL DEFAULT CURRENT_DATE,
  etkezes_tipus   TEXT CHECK (etkezes_tipus IN ('reggeli','tizedora','ebed','uzsonna','vacsora','ejszakai')),
  elelmiszer_id   UUID REFERENCES elelmiszerek(id),
  egyedi_nev      TEXT,
  mennyiseg_g     DECIMAL(8,2) NOT NULL,
  kaloria         DECIMAL(7,2),
  feherje_g       DECIMAL(6,2),
  szenhidrat_g    DECIMAL(6,2),
  zsir_g          DECIMAL(6,2),
  megjegyzes      TEXT,
  letrehozva      TIMESTAMPTZ DEFAULT NOW()
);

-- SÚLYNAPLÓ
CREATE TABLE IF NOT EXISTS sulynaplo (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  felhaszt_id UUID NOT NULL REFERENCES profilok(id) ON DELETE CASCADE,
  datum       DATE NOT NULL DEFAULT CURRENT_DATE,
  suly_kg     DECIMAL(5,2) NOT NULL,
  megjegyzes  TEXT,
  letrehozva  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(felhaszt_id, datum)
);

-- ORVOSI DOKUMENTUMOK
CREATE TABLE IF NOT EXISTS dokumentumok (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  felhaszt_id       UUID NOT NULL REFERENCES profilok(id) ON DELETE CASCADE,
  fajlnev           TEXT NOT NULL,
  storage_path      TEXT NOT NULL,
  fajl_tipus        TEXT,
  fajl_meret_kb     INTEGER,
  ai_elemzes        TEXT,
  ai_elemzve_datum  TIMESTAMPTZ,
  leiras            TEXT,
  letrehozva        TIMESTAMPTZ DEFAULT NOW()
);

-- RECEPTBANK
CREATE TABLE IF NOT EXISTS receptek (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  felhaszt_id   UUID NOT NULL REFERENCES profilok(id) ON DELETE CASCADE,
  nev           TEXT NOT NULL,
  leiras        TEXT,
  hozzavalok    TEXT,
  elkeszites    TEXT,
  adag_gram     INTEGER,
  kaloria       DECIMAL(7,2),
  feherje_g     DECIMAL(6,2),
  szenhidrat_g  DECIMAL(6,2),
  zsir_g        DECIMAL(6,2),
  kep_url       TEXT,
  cimkek        TEXT[] DEFAULT '{}',
  letrehozva    TIMESTAMPTZ DEFAULT NOW(),
  frissitve     TIMESTAMPTZ DEFAULT NOW()
);

-- AI JAVASLAT ELŐZMÉNYEK
CREATE TABLE IF NOT EXISTS ai_javaslatok (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  felhaszt_id UUID NOT NULL REFERENCES profilok(id) ON DELETE CASCADE,
  kerdes      TEXT,
  valasz      TEXT NOT NULL,
  kontextus   JSONB,
  letrehozva  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profilok ENABLE ROW LEVEL SECURITY;
ALTER TABLE elelmiszerek ENABLE ROW LEVEL SECURITY;
ALTER TABLE naplo_bejegyzesek ENABLE ROW LEVEL SECURITY;
ALTER TABLE sulynaplo ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumentumok ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptek ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_javaslatok ENABLE ROW LEVEL SECURITY;

-- Profilok
CREATE POLICY "Saját profil" ON profilok FOR ALL USING (auth.uid() = id);

-- Élelmiszerek: mindenki olvashatja a közös ételeket, saját ételeit kezeli
CREATE POLICY "Elelmiszer olvasas" ON elelmiszerek FOR SELECT USING (felhaszt_id IS NULL OR auth.uid() = felhaszt_id);
CREATE POLICY "Elelmiszer iras" ON elelmiszerek FOR INSERT WITH CHECK (auth.uid() = felhaszt_id);
CREATE POLICY "Elelmiszer torles" ON elelmiszerek FOR DELETE USING (auth.uid() = felhaszt_id);
CREATE POLICY "Elelmiszer frissites" ON elelmiszerek FOR UPDATE USING (auth.uid() = felhaszt_id);

-- Napló
CREATE POLICY "Sajat naplo" ON naplo_bejegyzesek FOR ALL USING (auth.uid() = felhaszt_id);

-- Súlynapló
CREATE POLICY "Sajat sulynaplo" ON sulynaplo FOR ALL USING (auth.uid() = felhaszt_id);

-- Dokumentumok
CREATE POLICY "Sajat dokumentumok" ON dokumentumok FOR ALL USING (auth.uid() = felhaszt_id);

-- Receptek
CREATE POLICY "Sajat receptek" ON receptek FOR ALL USING (auth.uid() = felhaszt_id);

-- AI javaslatok
CREATE POLICY "Sajat javaslatok" ON ai_javaslatok FOR ALL USING (auth.uid() = felhaszt_id);

-- ============================================
-- AUTOMATIKUS PROFIL LÉTREHOZÁS REGISZTRÁCIÓKOR
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profilok (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
