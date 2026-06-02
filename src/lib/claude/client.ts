import Anthropic from '@anthropic-ai/sdk'
import type { Profil, NaploBejegyzes } from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export function buildProfilKontextus(profil: Profil): string {
  const reszek = []

  if (profil.teljes_nev) reszek.push(`Név: ${profil.teljes_nev}`)
  if (profil.kor) reszek.push(`Kor: ${profil.kor} év`)
  if (profil.nem) reszek.push(`Nem: ${profil.nem === 'ferfi' ? 'Férfi' : 'Nő'}`)
  if (profil.magassag_cm) reszek.push(`Magasság: ${profil.magassag_cm} cm`)
  if (profil.testsuly_kg) reszek.push(`Testsúly: ${profil.testsuly_kg} kg`)
  if (profil.cel_kaloria) reszek.push(`Napi kalóriacél: ${profil.cel_kaloria} kcal`)
  if (profil.cel) {
    const celSzoveg = { fogyas: 'Fogyás', hizas: 'Izomnövelés/hízás', fittseg: 'Fittség', egeszsegtartas: 'Egészség megőrzése' }
    reszek.push(`Cél: ${celSzoveg[profil.cel]}`)
  }
  if (profil.cukorbeteg) reszek.push('Egészségügyi állapot: Cukorbeteg')
  if (profil.inzulinrezisztencia) reszek.push('Egészségügyi állapot: Inzulinrezisztencia')
  if (profil.dieta_tipusa?.length) reszek.push(`Diéta: ${profil.dieta_tipusa.join(', ')}`)
  if (profil.allergiak?.length) reszek.push(`Allergiák: ${profil.allergiak.join(', ')}`)
  if (profil.kedvelt_etelek) reszek.push(`Kedvelt ételek: ${profil.kedvelt_etelek}`)
  if (profil.kerulendom_etelek) reszek.push(`Kerülendő ételek: ${profil.kerulendom_etelek}`)

  return reszek.join('\n')
}

export function buildNaploKontextus(bejegyzesek: NaploBejegyzes[]): string {
  if (!bejegyzesek.length) return 'Ma még nem evett semmit.'

  const csoportok: Record<string, NaploBejegyzes[]> = {}
  for (const b of bejegyzesek) {
    if (!csoportok[b.etkezes_tipus]) csoportok[b.etkezes_tipus] = []
    csoportok[b.etkezes_tipus].push(b)
  }

  const sorok = Object.entries(csoportok).map(([tipus, etelek]) => {
    const lista = etelek.map(e => {
      const nev = e.egyedi_nev || e.elelmiszerek?.nev || 'Ismeretlen étel'
      return `  - ${nev} (${e.mennyiseg_g}g, ~${Math.round(e.kaloria || 0)} kcal)`
    }).join('\n')
    return `${tipus}:\n${lista}`
  })

  const ossz = bejegyzesek.reduce((acc, b) => acc + (b.kaloria || 0), 0)
  return sorok.join('\n') + `\n\nÖsszesen: ~${Math.round(ossz)} kcal`
}

export const DIETITIAN_SYSTEM_PROMPT = `Te egy tapasztalt, empátiával teli magyar dietetikus asszisztens vagy. Feladatod, hogy személyre szabott, tudományosan megalapozott táplálkozási tanácsokat adj magyarul.

Mindig figyelembe veszed:
- A felhasználó egészségügyi állapotát (cukorbetegség, inzulinrezisztencia stb.)
- Az allergiákat és intoleranciákat
- A személyes étkezési preferenciákat
- A napi kalóriacélt
- A már elfogyasztott ételeket

Stílusod:
- Barátságos, bátorító, soha nem ítélkező
- Konkrét, praktikus javaslatok
- Magyar ételeket is javasolsz
- Kcal és makró értékeket mindig feltünteted
- Mindig motiváló zárómondat

FONTOS: Orvosi diagnózist nem állítasz fel, és mindig ajánlod szakember felkeresését egészségügyi kérdésekben.`
