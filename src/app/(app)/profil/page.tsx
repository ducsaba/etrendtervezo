'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { szamitOsszesKaloria } from '@/lib/kaloria/bmr'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Profil, AktivitasiSzint, Cel, Nem } from '@/types'
import { AKTIVITAS_SZINTEK, CELOK } from '@/types'

const DIETA_OPCIOK = ['Vegetáriánus', 'Vegán', 'Gluténmentes', 'Laktózmentes', 'Ketogén', 'Mediterrán', 'Paleo', 'Diabetikus diéta']
const ALLERGIA_OPCIOK = ['Tej', 'Tojás', 'Búza/Gluten', 'Mogyoró', 'Dió', 'Hal', 'Rák/Tenger gyümölcsei', 'Szója']

export default function ProfilPage() {
  const [profil, setProfil] = useState<Partial<Profil>>({})
  const [betolt, setBetolt] = useState(false)
  const [mentve, setMentve] = useState(false)
  const [hiba, setHiba] = useState('')

  useEffect(() => {
    async function betoltesProfil() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profilok').select('*').eq('id', user.id).single()
      if (data) setProfil(data)
    }
    betoltesProfil()
  }, [])

  function toggleDieta(d: string) {
    const lista = profil.dieta_tipusa || []
    setProfil(p => ({
      ...p,
      dieta_tipusa: lista.includes(d) ? lista.filter(x => x !== d) : [...lista, d]
    }))
  }

  function toggleAllergia(a: string) {
    const lista = profil.allergiak || []
    setProfil(p => ({
      ...p,
      allergiak: lista.includes(a) ? lista.filter(x => x !== a) : [...lista, a]
    }))
  }

  async function ment(e: React.FormEvent) {
    e.preventDefault()
    setBetolt(true)
    setHiba('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const kalorian = szamitOsszesKaloria(profil)
    const frissitett = {
      ...profil,
      id: user.id,
      bmr_kaloria: kalorian?.bmr || null,
      tdee_kaloria: kalorian?.tdee || null,
      cel_kaloria: kalorian?.celKaloria || null,
      frissitve: new Date().toISOString(),
    }

    const { error } = await supabase.from('profilok').upsert(frissitett)

    if (error) {
      setHiba('Hiba a mentés során.')
    } else {
      setMentve(true)
      setTimeout(() => setMentve(false), 3000)
    }
    setBetolt(false)
  }

  const kalorian = szamitOsszesKaloria(profil)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profilom</h1>
        <p className="text-slate-500 text-sm mt-1">Add meg adataidat a pontos kalóriaigény-számításhoz</p>
      </div>

      <form onSubmit={ment} className="flex flex-col gap-6">
        {/* Alapadatok */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-700">👤 Alapadatok</h2></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input label="Teljes neved" value={profil.teljes_nev || ''} onChange={e => setProfil(p => ({ ...p, teljes_nev: e.target.value }))} placeholder="Kovács Anna" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Kor (év)" type="number" min={10} max={120} value={profil.kor || ''} onChange={e => setProfil(p => ({ ...p, kor: +e.target.value }))} />
              <Select label="Nem" value={profil.nem || ''} onChange={e => setProfil(p => ({ ...p, nem: e.target.value as Nem }))}>
                <option value="">Válassz...</option>
                <option value="ferfi">Férfi</option>
                <option value="no">Nő</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Magasság (cm)" type="number" min={100} max={250} value={profil.magassag_cm || ''} onChange={e => setProfil(p => ({ ...p, magassag_cm: +e.target.value }))} />
              <Input label="Testsúly (kg)" type="number" min={20} max={300} step={0.1} value={profil.testsuly_kg || ''} onChange={e => setProfil(p => ({ ...p, testsuly_kg: +e.target.value }))} />
            </div>
            <Select label="Aktivitási szint" value={profil.aktivitasi_szint || ''} onChange={e => setProfil(p => ({ ...p, aktivitasi_szint: e.target.value as AktivitasiSzint }))}>
              <option value="">Válassz...</option>
              {Object.entries(AKTIVITAS_SZINTEK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select label="Cél" value={profil.cel || ''} onChange={e => setProfil(p => ({ ...p, cel: e.target.value as Cel }))}>
              <option value="">Válassz...</option>
              {Object.entries(CELOK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </CardBody>
        </Card>

        {/* Kalória becslés */}
        {kalorian && (
          <Card gradient>
            <CardBody>
              <h2 className="font-semibold text-slate-700 mb-3">🔥 Kalóriaigény becslés</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'BMR (alap)', value: kalorian.bmr, hint: 'Pihenő anyagcsere' },
                  { label: 'TDEE (napi)', value: kalorian.tdee, hint: 'Aktivitással együtt' },
                  { label: 'Cél kalória', value: kalorian.celKaloria, hint: 'Javasolt bevitel' },
                ].map(({ label, value, hint }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-orange-500">{value}</div>
                    <div className="text-xs font-medium text-slate-700">{label}</div>
                    <div className="text-xs text-slate-400">{hint}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Egészségügyi állapot */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-700">🏥 Egészségügyi állapot</h2></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {[
                { key: 'cukorbeteg', label: 'Cukorbetegség (1. vagy 2. típusú)' },
                { key: 'inzulinrezisztencia', label: 'Inzulinrezisztencia' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!profil[key as keyof Profil]}
                    onChange={e => setProfil(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Diéta típusa</p>
              <div className="flex flex-wrap gap-2">
                {DIETA_OPCIOK.map(d => (
                  <button key={d} type="button" onClick={() => toggleDieta(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      profil.dieta_tipusa?.includes(d)
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Allergiák / intoleranciák</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGIA_OPCIOK.map(a => (
                  <button key={a} type="button" onClick={() => toggleAllergia(a)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      profil.allergiak?.includes(a)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-red-200'
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Preferenciák */}
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-700">🍽️ Étkezési preferenciák</h2></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Textarea label="Kedvelt ételek" value={profil.kedvelt_etelek || ''} onChange={e => setProfil(p => ({ ...p, kedvelt_etelek: e.target.value }))} placeholder="Pl. csirkemell, tészta, gyümölcsök, görög joghurt..." hint="Ezeket az ételeket előnyben részesíti az AI javaslatakor" />
            <Textarea label="Kerülendő ételek / nem elérhető" value={profil.kerulendom_etelek || ''} onChange={e => setProfil(p => ({ ...p, kerulendom_etelek: e.target.value }))} placeholder="Pl. sertéshús, savanyúság, belsőségek..." hint="Ezeket az AI nem fogja javasolni" />
          </CardBody>
        </Card>

        {hiba && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{hiba}</p>}
        {mentve && <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl">✓ Profil sikeresen mentve!</p>}

        <Button type="submit" loading={betolt} size="lg">Profil mentése</Button>
      </form>
    </div>
  )
}
