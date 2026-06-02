'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2, ChefHat, Search } from 'lucide-react'
import type { Recept } from '@/types'

const CIMKEK = ['Gyors', 'Magas fehérje', 'Alacsony szénhidrát', 'Vegán', 'Vegetáriánus', 'Gluténmentes', 'Diétás', 'Ebéd', 'Vacsora', 'Snack']

export default function ReceptbankPage() {
  const [receptek, setReceptek] = useState<Recept[]>([])
  const [kereses, setKereses] = useState('')
  const [modal, setModal] = useState(false)
  const [szerkesztett, setSzerkesztett] = useState<Partial<Recept>>({})
  const [betolt, setBetolt] = useState(false)

  const betoltes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase.from('receptek').select('*').eq('felhaszt_id', user.id).order('letrehozva', { ascending: false })
    if (kereses) query = query.ilike('nev', `%${kereses}%`)

    const { data } = await query
    setReceptek((data || []) as Recept[])
  }, [kereses])

  useEffect(() => { betoltes() }, [betoltes])

  function ujRecept() {
    setSzerkesztett({ cimkek: [] })
    setModal(true)
  }

  function toggleCimke(c: string) {
    const lista = szerkesztett.cimkek || []
    setSzerkesztett(r => ({ ...r, cimkek: lista.includes(c) ? lista.filter(x => x !== c) : [...lista, c] }))
  }

  async function ment() {
    if (!szerkesztett.nev) return
    setBetolt(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (szerkesztett.id) {
      await supabase.from('receptek').update({ ...szerkesztett, frissitve: new Date().toISOString() }).eq('id', szerkesztett.id)
    } else {
      await supabase.from('receptek').insert({ ...szerkesztett, felhaszt_id: user.id })
    }

    setModal(false)
    setSzerkesztett({})
    setBetolt(false)
    betoltes()
  }

  async function torol(id: string) {
    if (!confirm('Biztosan törlöd ezt a receptet?')) return
    const supabase = createClient()
    await supabase.from('receptek').delete().eq('id', id)
    betoltes()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ChefHat size={24} className="text-amber-500" /> Receptbank
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kedvenc ételeid és saját receptjeid</p>
        </div>
        <Button onClick={ujRecept}>
          <Plus size={16} /> Recept
        </Button>
      </div>

      {/* Keresés */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={kereses}
          onChange={e => setKereses(e.target.value)}
          placeholder="Recept keresése..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Receptek rács */}
      {receptek.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <div className="text-4xl mb-3">👨‍🍳</div>
            <p className="text-slate-600 font-medium">Még nincs mentett recept</p>
            <p className="text-slate-400 text-sm mt-1">Add hozzá a kedvenc ételeidet!</p>
            <Button onClick={ujRecept} variant="secondary" className="mt-4">
              <Plus size={16} /> Első recept hozzáadása
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {receptek.map(r => (
            <Card key={r.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{r.nev}</h3>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => { setSzerkesztett(r); setModal(true) }}
                      className="text-slate-300 hover:text-blue-400 transition-colors text-xs px-2 py-1">✏️</button>
                    <button onClick={() => torol(r.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {r.leiras && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{r.leiras}</p>}

                {r.kaloria && (
                  <div className="flex gap-2 mb-2 text-xs">
                    <span className="text-orange-500 font-semibold">{r.kaloria} kcal</span>
                    {r.feherje_g && <span className="text-blue-500">{r.feherje_g}g F</span>}
                    {r.szenhidrat_g && <span className="text-amber-500">{r.szenhidrat_g}g Sz</span>}
                    {r.zsir_g && <span className="text-purple-500">{r.zsir_g}g Zs</span>}
                    {r.adag_gram && <span className="text-slate-400">({r.adag_gram}g/adag)</span>}
                  </div>
                )}

                {r.cimkek?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.cimkek.map(c => <Badge key={c} color="gray" className="text-xs">{c}</Badge>)}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{szerkesztett.id ? 'Recept szerkesztése' : 'Új recept'}</h3>
            <div className="flex flex-col gap-4">
              <Input label="Recept neve *" value={szerkesztett.nev || ''} onChange={e => setSzerkesztett(r => ({ ...r, nev: e.target.value }))} placeholder="Pl. Csirkemell citromos rizzsel" required />
              <Textarea label="Leírás" value={szerkesztett.leiras || ''} onChange={e => setSzerkesztett(r => ({ ...r, leiras: e.target.value }))} placeholder="Rövid leírás..." />
              <Textarea label="Hozzávalók" value={szerkesztett.hozzavalok || ''} onChange={e => setSzerkesztett(r => ({ ...r, hozzavalok: e.target.value }))} placeholder="Pl. 200g csirkemell, 100g rizs..." rows={4} />
              <Textarea label="Elkészítés" value={szerkesztett.elkeszites || ''} onChange={e => setSzerkesztett(r => ({ ...r, elkeszites: e.target.value }))} placeholder="Elkészítés lépései..." rows={4} />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Adagméret (g)" type="number" value={szerkesztett.adag_gram || ''} onChange={e => setSzerkesztett(r => ({ ...r, adag_gram: +e.target.value }))} />
                <Input label="Kalória (kcal/adag)" type="number" value={szerkesztett.kaloria || ''} onChange={e => setSzerkesztett(r => ({ ...r, kaloria: +e.target.value }))} />
                <Input label="Fehérje (g)" type="number" value={szerkesztett.feherje_g || ''} onChange={e => setSzerkesztett(r => ({ ...r, feherje_g: +e.target.value }))} />
                <Input label="Szénhidrát (g)" type="number" value={szerkesztett.szenhidrat_g || ''} onChange={e => setSzerkesztett(r => ({ ...r, szenhidrat_g: +e.target.value }))} />
                <Input label="Zsír (g)" type="number" value={szerkesztett.zsir_g || ''} onChange={e => setSzerkesztett(r => ({ ...r, zsir_g: +e.target.value }))} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Cimkék</p>
                <div className="flex flex-wrap gap-2">
                  {CIMKEK.map(c => (
                    <button key={c} type="button" onClick={() => toggleCimke(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        szerkesztett.cimkek?.includes(c)
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Mégse</Button>
                <Button className="flex-1" onClick={ment} loading={betolt} disabled={!szerkesztett.nev}>Mentés</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
