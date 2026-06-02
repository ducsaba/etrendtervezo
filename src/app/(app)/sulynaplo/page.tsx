'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Sulynaplo } from '@/types'

export default function SulynaplopPage() {
  const [meresek, setMeresek] = useState<Sulynaplo[]>([])
  const [modal, setModal] = useState(false)
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0])
  const [suly, setSuly] = useState('')
  const [megjegyzes, setMegjegyzes] = useState('')
  const [betolt, setBetolt] = useState(false)
  const [celSuly, setCelSuly] = useState<number | null>(null)

  const betoltes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('sulynaplo').select('*').eq('felhaszt_id', user.id).order('datum', { ascending: true }),
      supabase.from('profilok').select('testsuly_kg').eq('id', user.id).single(),
    ])

    setMeresek((m || []) as Sulynaplo[])
    if (p?.testsuly_kg) setCelSuly(p.testsuly_kg)
  }, [])

  useEffect(() => { betoltes() }, [betoltes])

  async function ment() {
    if (!suly) return
    setBetolt(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('sulynaplo').upsert({
      felhaszt_id: user.id, datum, suly_kg: +suly, megjegyzes: megjegyzes || null,
    })

    setModal(false)
    setSuly('')
    setMegjegyzes('')
    setBetolt(false)
    betoltes()
  }

  async function torol(id: string) {
    const supabase = createClient()
    await supabase.from('sulynaplo').delete().eq('id', id)
    betoltes()
  }

  const grafikonAdatok = meresek.map(m => ({
    datum: new Date(m.datum).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
    suly: m.suly_kg,
  }))

  const legutobbiSuly = meresek[meresek.length - 1]?.suly_kg
  const elsoSuly = meresek[0]?.suly_kg
  const valtozas = legutobbiSuly && elsoSuly ? +(legutobbiSuly - elsoSuly).toFixed(1) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Súlynapló</h1>
          <p className="text-slate-500 text-sm mt-1">Kövesd nyomon a testsúlyod alakulását</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus size={16} /> Mérés
        </Button>
      </div>

      {/* Statisztika */}
      {meresek.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Jelenlegi', value: `${legutobbiSuly} kg`, color: 'text-slate-800' },
            { label: 'Változás', value: valtozas !== null ? `${valtozas > 0 ? '+' : ''}${valtozas} kg` : '–', color: valtozas !== null && valtozas < 0 ? 'text-green-600' : 'text-orange-500' },
            { label: 'Mérések száma', value: `${meresek.length} db`, color: 'text-slate-800' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardBody className="text-center py-3">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Grafikon */}
      {meresek.length >= 2 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-700">📈 Súlyváltozás</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={grafikonAdatok}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Súly']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="suly" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Mérések listája */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-700">Mérési előzmények</h2></CardHeader>
        <CardBody>
          {meresek.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">⚖️</div>
              <p className="text-slate-500 text-sm">Még nincs rögzített mérés</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...meresek].reverse().map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <span className="font-semibold text-slate-700">{m.suly_kg} kg</span>
                    {m.megjegyzes && <p className="text-xs text-slate-400 mt-0.5">{m.megjegyzes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="gray">{new Date(m.datum).toLocaleDateString('hu-HU')}</Badge>
                    <button onClick={() => torol(m.id)} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Új mérés rögzítése</h3>
            <div className="flex flex-col gap-4">
              <Input label="Dátum" type="date" value={datum} onChange={e => setDatum(e.target.value)} />
              <Input label="Súly (kg)" type="number" step="0.1" min="20" max="300" value={suly} onChange={e => setSuly(e.target.value)} placeholder="Pl. 78.5" />
              <Input label="Megjegyzés (opcionális)" value={megjegyzes} onChange={e => setMegjegyzes(e.target.value)} placeholder="Pl. Reggel, éhgyomorra" />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Mégse</Button>
                <Button className="flex-1" onClick={ment} loading={betolt} disabled={!suly}>Mentés</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
