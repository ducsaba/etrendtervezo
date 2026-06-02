'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Upload, FileText, Image, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Dokumentum } from '@/types'

export default function DokumentumokPage() {
  const [dokumentumok, setDokumentumok] = useState<Dokumentum[]>([])
  const [feltoltes, setFeltoltes] = useState(false)
  const [leiras, setLeiras] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const betoltes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('dokumentumok').select('*').eq('felhaszt_id', user.id).order('letrehozva', { ascending: false })
    setDokumentumok((data || []) as Dokumentum[])
  }, [])

  useEffect(() => { betoltes() }, [betoltes])

  async function fajlFeltolt(fajl: File) {
    if (fajl.size > 10 * 1024 * 1024) {
      alert('A fájl mérete nem haladhatja meg a 10MB-ot!')
      return
    }

    setFeltoltes(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const kiterjesztes = fajl.name.split('.').pop()?.toLowerCase() || ''
    const eleresiUt = `${user.id}/${Date.now()}-${fajl.name}`

    const { error: storageHiba } = await supabase.storage.from('dokumentumok').upload(eleresiUt, fajl)
    if (storageHiba) {
      alert('Fájl feltöltés sikertelen!')
      setFeltoltes(false)
      return
    }

    await supabase.from('dokumentumok').insert({
      felhaszt_id: user.id,
      fajlnev: fajl.name,
      storage_path: eleresiUt,
      fajl_tipus: kiterjesztes,
      fajl_meret_kb: Math.round(fajl.size / 1024),
      leiras: leiras || null,
    })

    setLeiras('')
    setFeltoltes(false)
    betoltes()
  }

  async function torol(dok: Dokumentum) {
    if (!confirm('Biztosan törlöd ezt a dokumentumot?')) return
    const supabase = createClient()
    await supabase.storage.from('dokumentumok').remove([dok.storage_path])
    await supabase.from('dokumentumok').delete().eq('id', dok.id)
    betoltes()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText size={24} className="text-blue-500" /> Orvosi dokumentumok
        </h1>
        <p className="text-slate-500 text-sm mt-1">Laboreredmények, leletek, orvosi vélemények tárolása és AI elemzése</p>
      </div>

      {/* Feltöltés */}
      <Card>
        <CardBody>
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) fajlFeltolt(f) }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
          >
            <Upload size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">Húzd ide a fájlt, vagy</p>
            <label className="mt-2 inline-block cursor-pointer">
              <span className="text-blue-500 hover:underline font-medium">kattints a böngészéshez</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) fajlFeltolt(f) }} />
            </label>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG – max. 10MB</p>
          </div>

          <div className="mt-3">
            <input value={leiras} onChange={e => setLeiras(e.target.value)} placeholder="Megjegyzés (pl. 2026 január - vércukor vizsgálat)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {feltoltes && <p className="text-sm text-blue-500 mt-2 text-center">Feltöltés folyamatban...</p>}
        </CardBody>
      </Card>

      {/* Dokumentumok listája */}
      {dokumentumok.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-slate-600 font-medium">Még nincs feltöltött dokumentum</p>
            <p className="text-slate-400 text-sm mt-1">Töltsd fel laboreredményeidet az AI elemzéshez</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {dokumentumok.map(d => (
            <Card key={d.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    {d.fajl_tipus === 'pdf' ? <FileText size={20} className="text-blue-500" /> : <Image size={20} className="text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{d.fajlnev}</p>
                    {d.leiras && <p className="text-xs text-slate-500 truncate">{d.leiras}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{new Date(d.letrehozva).toLocaleDateString('hu-HU')}</span>
                      {d.fajl_meret_kb && <span className="text-xs text-slate-400">{d.fajl_meret_kb} KB</span>}
                      {d.ai_elemzes ? (
                        <Badge color="green">AI elemezve</Badge>
                      ) : (
                        <Badge color="gray">Nincs elemzés</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/dokumentumok/${d.id}`}>
                      <Button variant="secondary" size="sm">Megnyit</Button>
                    </Link>
                    <button onClick={() => torol(d)} className="p-2 text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
