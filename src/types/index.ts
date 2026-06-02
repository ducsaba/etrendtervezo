export type Nem = 'ferfi' | 'no'
export type AktivitasiSzint = 'ulodominans' | 'kicsit_aktiv' | 'mérsékelten_aktiv' | 'nagyon_aktiv' | 'extra_aktiv'
export type Cel = 'fogyas' | 'hizas' | 'fittseg' | 'egeszsegtartas'
export type EtkezesTipus = 'reggeli' | 'tizedora' | 'ebed' | 'uzsonna' | 'vacsora' | 'ejszakai'

export interface Profil {
  id: string
  teljes_nev: string | null
  magassag_cm: number | null
  testsuly_kg: number | null
  kor: number | null
  nem: Nem | null
  aktivitasi_szint: AktivitasiSzint | null
  cel: Cel | null
  cukorbeteg: boolean
  inzulinrezisztencia: boolean
  dieta_tipusa: string[]
  allergiak: string[]
  kedvelt_etelek: string | null
  kerulendom_etelek: string | null
  bmr_kaloria: number | null
  tdee_kaloria: number | null
  cel_kaloria: number | null
  letrehozva: string
  frissitve: string
}

export interface Elelmiszer {
  id: string
  nev: string
  mertekegyseg: string
  kaloria_100g: number
  feherje_g: number
  szenhidrat_g: number
  zsir_g: number
  rost_g: number | null
  kategoria: string | null
  felhaszt_id: string | null
}

export interface NaploBejegyzes {
  id: string
  felhaszt_id: string
  datum: string
  etkezes_tipus: EtkezesTipus
  elelmiszer_id: string | null
  egyedi_nev: string | null
  mennyiseg_g: number
  kaloria: number | null
  feherje_g: number | null
  szenhidrat_g: number | null
  zsir_g: number | null
  megjegyzes: string | null
  letrehozva: string
  elelmiszerek?: Elelmiszer
}

export interface Sulynaplo {
  id: string
  felhaszt_id: string
  datum: string
  suly_kg: number
  megjegyzes: string | null
  letrehozva: string
}

export interface Dokumentum {
  id: string
  felhaszt_id: string
  fajlnev: string
  storage_path: string
  fajl_tipus: string | null
  fajl_meret_kb: number | null
  ai_elemzes: string | null
  ai_elemzve_datum: string | null
  leiras: string | null
  letrehozva: string
}

export interface Recept {
  id: string
  felhaszt_id: string
  nev: string
  leiras: string | null
  hozzavalok: string | null
  elkeszites: string | null
  adag_gram: number | null
  kaloria: number | null
  feherje_g: number | null
  szenhidrat_g: number | null
  zsir_g: number | null
  kep_url: string | null
  cimkek: string[]
  letrehozva: string
  frissitve: string
}

export interface NapiOsszesito {
  kaloria: number
  feherje_g: number
  szenhidrat_g: number
  zsir_g: number
  etkezesek: Record<EtkezesTipus, NaploBejegyzes[]>
}

export const AKTIVITAS_SZINTEK: Record<AktivitasiSzint, string> = {
  ulodominans: 'Ülő munkát végzek (irodai munka)',
  kicsit_aktiv: 'Kicsit aktív (könnyű testmozgás 1-3x/hét)',
  mérsékelten_aktiv: 'Mérsékelten aktív (edzés 3-5x/hét)',
  nagyon_aktiv: 'Nagyon aktív (intenzív edzés 6-7x/hét)',
  extra_aktiv: 'Extra aktív (fizikai munka vagy napi edzés)',
}

export const CELOK: Record<Cel, string> = {
  fogyas: 'Fogyás',
  hizas: 'Hízás / Izomnövelés',
  fittseg: 'Fittség megőrzése',
  egeszsegtartas: 'Egészség megőrzése',
}

export const ETKEZES_TIPUSOK: Record<EtkezesTipus, string> = {
  reggeli: 'Reggeli',
  tizedora: 'Tízórai',
  ebed: 'Ebéd',
  uzsonna: 'Uzsonna',
  vacsora: 'Vacsora',
  ejszakai: 'Éjszakai snack',
}
