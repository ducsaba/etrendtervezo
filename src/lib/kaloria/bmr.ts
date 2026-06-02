import type { Profil, AktivitasiSzint, Cel } from '@/types'

const AKTIVITAS_SZORZO: Record<AktivitasiSzint, number> = {
  ulodominans: 1.2,
  kicsit_aktiv: 1.375,
  mérsékelten_aktiv: 1.55,
  nagyon_aktiv: 1.725,
  extra_aktiv: 1.9,
}

const CEL_KALORIA_MODOSITO: Record<Cel, number> = {
  fogyas: -500,
  hizas: +500,
  fittseg: 0,
  egeszsegtartas: 0,
}

export function szamitBMR(profil: Partial<Profil>): number | null {
  if (!profil.testsuly_kg || !profil.magassag_cm || !profil.kor || !profil.nem) return null

  // Mifflin-St Jeor képlet
  if (profil.nem === 'ferfi') {
    return Math.round(10 * profil.testsuly_kg + 6.25 * profil.magassag_cm - 5 * profil.kor + 5)
  } else {
    return Math.round(10 * profil.testsuly_kg + 6.25 * profil.magassag_cm - 5 * profil.kor - 161)
  }
}

export function szamitTDEE(bmr: number, aktivitasiSzint: AktivitasiSzint): number {
  return Math.round(bmr * AKTIVITAS_SZORZO[aktivitasiSzint])
}

export function szamitCelKaloria(tdee: number, cel: Cel): number {
  return tdee + CEL_KALORIA_MODOSITO[cel]
}

export function szamitOsszesKaloria(profil: Partial<Profil>): { bmr: number; tdee: number; celKaloria: number } | null {
  const bmr = szamitBMR(profil)
  if (!bmr || !profil.aktivitasi_szint || !profil.cel) return null

  const tdee = szamitTDEE(bmr, profil.aktivitasi_szint)
  const celKaloria = szamitCelKaloria(tdee, profil.cel)

  return { bmr, tdee, celKaloria }
}

export function szamitMakrocelok(celKaloria: number, cel: Cel) {
  // Makró arányok cél szerint
  const aranyok: Record<Cel, { feherje: number; szenhidrat: number; zsir: number }> = {
    fogyas: { feherje: 0.35, szenhidrat: 0.35, zsir: 0.30 },
    hizas: { feherje: 0.30, szenhidrat: 0.45, zsir: 0.25 },
    fittseg: { feherje: 0.30, szenhidrat: 0.40, zsir: 0.30 },
    egeszsegtartas: { feherje: 0.25, szenhidrat: 0.45, zsir: 0.30 },
  }

  const a = aranyok[cel]
  return {
    feherje_g: Math.round((celKaloria * a.feherje) / 4),
    szenhidrat_g: Math.round((celKaloria * a.szenhidrat) / 4),
    zsir_g: Math.round((celKaloria * a.zsir) / 9),
  }
}
