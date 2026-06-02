'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2, Search } from 'lucide-react'
import type { NaploBejegyzes, Elelmiszer, EtkezesTipus } from '@/types'
import { ETKEZES_TIPUSOK } from '@/types'

export default function NaploPage() {
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0])
  const [bejegyzesek, setBejegyzesek] = useState<NaploBejegyzes[]>([])
  const [modal, setModal] = useState(false)
  const [kereses, setKereses] = useState('')
  const [talalatok, setTalalatok] = useState<Elelmiszer[]>([])
  const [kivalasztott, setKivalasztott] = useState<Elelmiszer | null>(null)
  const [mennyiseg, setMennyiseg] = useState('100')
  const [etkezesTipus, setEtkezesTipus] = useState<EtkezesTipus>('ebed')
  const [egyediNev, setEgyediNev] = useState('')
  const [egyediKaloria, setEgyediKaloria] = useState('')
  const [modMod, setModMod] = useState<'kereses' | 'egyedi'>('kereses')
  const [betolt, setBetolt] = useState(false)

  const betoltesBejegyzesek = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('naplo_bejegyzesek')
      .select('*, elelmiszerek(nev, kaloria_100g, feherje_g, szenhidrat_g, zsir_g)')
      .eq('felhaszt_id', user.id)
      .eq('datum', datum)
      .order('letrehozva', { ascending: true })

    setBejegyzesek((data || []) as NaploBejegyzes[])
  }, [datum])

  useEffect(() => { betoltesBejegyzesek() }, [betoltesBejegyzesek])

  useEffect(() => {
    if (kereses.length < 2) { setTalalatok([]); return }
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('elelmiszerek')
        .select('*')
        .ilike('nev', `%${kereses}%`)
        .limit(8)
      setTalalatok((data || []) as Elelmiszer[])
    }, 300)
    return () => clearTimeout(timer)
  }, [kereses])

  async function hozzaad() {
    setBetolt(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let kal = null, feh = null, szenh = null, zsir = null

    if (kivalasztott) {
      const szorzo = +mennyiseg / 100
      kal = kivalasztott.kaloria_100g * szorzo
      feh = kivalasztott.feherje_g * szorzo
      szenh = kivalasztott.szenhidrat_g * szorzo
      zsir = kivalasztott.zsir_g * szorzo
    } else if (egyediKaloria) {
      kal = +egyediKaloria
    }

    await supabase.from('naplo_bejegyzesek').insert({
      felhaszt_id: user.id,
      datum,
      etkezes_tipus: etkezesTipus,
      elelmiszer_id: kivalasztott?.id || null,
      egyedi_nev: !kivalasztott ? egyediNev : null,
      mennyiseg_g: +mennyiseg,
      kaloria: kal,
      feherje_g: feh,
      szenhidrat_g: szenh,
      zsir_g: zsir,
    })

    setModal(false)
    setKereses('')
    setKivalasztott(null)
    setMennyiseg('100')
    setEgyediNev('')
    setEgyediKaloria('')
    setBetolt(false)
    betoltesBejegyzesek()
  }

  async function torol(id: string) {
    const supabase = createClient()
    await supabase.from('naplo_bejegyzesek').delete().eq('id', id)
    betoltesBejegyzesek()
  }

  const osszesites = bejegyzesek.reduce(
    (acc, b) => ({
      kaloria: acc.kaloria + (b.kaloria || 0),
      feherje: acc.feherje + (b.feherje_g || 0),
      szenhidrat: acc.szenhidrat + (b.szenhidrat_g || 0),
      zsir: acc.zsir + (b.zsir_g || 0),
    }),
    { kaloria: 0, feherje: 0, szenhidrat: 0, zsir: 0 }
  )

  const csoportok: Record<string, NaploBejegyzes[]> = {}
  for (const b of bejegyzesek) {
    if (!csoportok[b.etkezes_tipus]) csoportok[b.etkezes_tipus] = []
    csoportok[b.etkezes_tipus].push(b)
  }

  const etkezesSorrend: EtkezesTipus[] = ['reggeli', 'tizedora', 'ebed', 'uzsonna', 'vacsora', 'ejszakai']

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Étkezési napló</h1>
          <p className="text-slate-500 text-sm mt-1">Rögzítsd napi étkezéseidet</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus size={16} /> Étkezés
        </Button>
      </div>

      {/* Dátumválasztó */}
      <div className="flex items-center gap-3">
        <button onClick={() => setDatum(d => { const dt = new Date(d); dt.setDate(dt.getDate() - 1); return dt.toISOString().split('T')[0] })}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">←</button>
        <input type="date" value={datum} onChange={e => setDatum(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-center" />
        <button onClick={() => setDatum(d => { const dt = new Date(d); dt.setDate(dt.getDate() + 1); return dt.toISOString().split('T')[0] })}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">→</button>
      </div>

      {/* Összesítő sáv */}
      {bejegyzesek.length > 0 && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Kalória', value: Math.round(osszesites.kaloria), unit: 'kcal', color: 'text-orange-500' },
                { label: 'Fehérje', value: Math.round(osszesites.feherje), unit: 'g', color: 'text-blue-500' },
                { label: 'Szénhidrát', value: Math.round(osszesites.szenhidrat), unit: 'g', color: 'text-amber-500' },
                { label: 'Zsír', value: Math.round(osszesites.zsir), unit: 'g', color: 'text-purple-500' },
              ].map(({ label, value, unit, color }) => (
                <div key={label}>
                  <div className={`text-xl font-bold ${color}`}>{value}<span className="text-sm">{unit}</span></div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Étkezések listája */}
      {etkezesSorrend.filter(t => csoportok[t]).map(tipus => (
        <Card key={tipus}>
          <CardHeader>
            <h2 className="font-semibold text-slate-700">{ETKEZES_TIPUSOK[tipus]}</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            {csoportok[tipus].map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {b.egyedi_nev || (b.elelmiszerek as { nev: string } | null)?.nev || 'Étel'}
                  </p>
                  <p className="text-xs text-slate-400">{b.mennyiseg_g}g · {Math.round(b.feherje_g || 0)}g F · {Math.round(b.szenhidrat_g || 0)}g Sz · {Math.round(b.zsir_g || 0)}g Zs</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="orange">{Math.round(b.kaloria || 0)} kcal</Badge>
                  <button onClick={() => torol(b.id)} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      ))}

      {bejegyzesek.length === 0 && (
        <Card>
          <CardBody className="text-center py-10">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-slate-600 font-medium">Ezen a napon még nincs étkezés rögzítve</p>
            <Button onClick={() => setModal(true)} className="mt-4" variant="secondary">
              <Plus size={16} /> Első étkezés hozzáadása
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Étkezés hozzáadása</h3>

            <div className="flex flex-col gap-4">
              <Select label="Étkezés típusa" value={etkezesTipus} onChange={e => setEtkezesTipus(e.target.value as EtkezesTipus)}>
                {Object.entries(ETKEZES_TIPUSOK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>

              <div className="flex gap-2">
                <button onClick={() => setModMod('kereses')} className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${modMod === 'kereses' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                  <Search size={14} className="inline mr-1" /> Keresés
                </button>
                <button onClick={() => setModMod('egyedi')} className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${modMod === 'egyedi' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                  ✏️ Egyedi
                </button>
              </div>

              {modMod === 'kereses' && (
                <>
                  <div className="relative">
                    <Input label="Étel keresése" value={kereses} onChange={e => setKereses(e.target.value)} placeholder="Pl. csirkemell, alma, zabpehely..." />
                    {talalatok.length > 0 && !kivalasztott && (
                      <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {talalatok.map(e => (
                          <button key={e.id} onClick={() => { setKivalasztott(e); setKereses(e.nev); setTalalatok([]) }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 border-b border-slate-50 last:border-0">
                            <span className="font-medium">{e.nev}</span>
                            <span className="text-slate-400 ml-2">{e.kaloria_100g} kcal/100g</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {kivalasztott && (
                    <div className="bg-orange-50 rounded-xl p-3 text-sm">
                      <p className="font-medium text-orange-700">{kivalasztott.nev}</p>
                      <p className="text-orange-500 text-xs mt-0.5">{kivalasztott.kaloria_100g} kcal · {kivalasztott.feherje_g}g F · {kivalasztott.szenhidrat_g}g Sz · {kivalasztott.zsir_g}g Zs (100g-ra)</p>
                      <button onClick={() => { setKivalasztott(null); setKereses('') }} className="text-xs text-orange-400 mt-1 hover:underline">Másik étel választása</button>
                    </div>
                  )}
                </>
              )}

              {modMod === 'egyedi' && (
                <>
                  <Input label="Étel neve" value={egyediNev} onChange={e => setEgyediNev(e.target.value)} placeholder="Pl. Nagyi palacsintája" />
                  <Input label="Kalória (kcal)" type="number" value={egyediKaloria} onChange={e => setEgyediKaloria(e.target.value)} placeholder="Pl. 350" />
                </>
              )}

              <Input label="Mennyiség (g / ml)" type="number" value={mennyiseg} onChange={e => setMennyiseg(e.target.value)} />

              {kivalasztott && mennyiseg && (
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 text-center">
                  ≈ <strong>{Math.round(kivalasztott.kaloria_100g * +mennyiseg / 100)} kcal</strong> ({mennyiseg}g)
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Mégse</Button>
                <Button className="flex-1" onClick={hozzaad} loading={betolt}
                  disabled={modMod === 'kereses' ? !kivalasztott : !egyediNev}>
                  Hozzáadás
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
