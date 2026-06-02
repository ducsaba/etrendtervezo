'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Sparkles, FileText } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Dokumentum } from '@/types'

export default function DokumentumReszletPage() {
  const { id } = useParams()
  const [dok, setDok] = useState<Dokumentum | null>(null)
  const [elemzesBetolt, setElemzesBetolt] = useState(false)
  const [fajlUrl, setFajlUrl] = useState<string | null>(null)

  const betoltes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('dokumentumok').select('*').eq('id', id).eq('felhaszt_id', user.id).single()
    if (data) {
      setDok(data as Dokumentum)
      const { data: urlData } = await supabase.storage.from('dokumentumok').createSignedUrl(data.storage_path, 3600)
      if (urlData) setFajlUrl(urlData.signedUrl)
    }
  }, [id])

  useEffect(() => { betoltes() }, [betoltes])

  async function elemez() {
    setElemzesBetolt(true)
    try {
      const res = await fetch('/api/ai/dokumentum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokumentumId: id }),
      })
      const { elemzes } = await res.json()
      if (elemzes) {
        setDok(d => d ? { ...d, ai_elemzes: elemzes, ai_elemzve_datum: new Date().toISOString() } : d)
      }
    } catch {
      alert('Hiba az elemzés során!')
    } finally {
      setElemzesBetolt(false)
    }
  }

  if (!dok) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
    </div>
  )

  const isKep = dok.fajl_tipus && ['jpg', 'jpeg', 'png', 'webp'].includes(dok.fajl_tipus)

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dokumentumok" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{dok.fajlnev}</h1>
          {dok.leiras && <p className="text-sm text-slate-500">{dok.leiras}</p>}
        </div>
      </div>

      {/* Fájl előnézet */}
      {fajlUrl && (
        <Card>
          <CardBody>
            {isKep ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fajlUrl} alt={dok.fajlnev} className="w-full rounded-xl max-h-96 object-contain" />
            ) : (
              <div className="text-center py-6">
                <FileText size={48} className="mx-auto text-blue-400 mb-3" />
                <p className="text-slate-600 font-medium">{dok.fajlnev}</p>
                <a href={fajlUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-500 hover:underline text-sm font-medium">
                  PDF megnyitása új lapon →
                </a>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* AI Elemzés */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" />
              <h2 className="font-semibold text-slate-700">AI Elemzés</h2>
              {dok.ai_elemzve_datum && (
                <Badge color="green">Elemezve: {new Date(dok.ai_elemzve_datum).toLocaleDateString('hu-HU')}</Badge>
              )}
            </div>
            <Button onClick={elemez} loading={elemzesBetolt} size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {dok.ai_elemzes ? '🔄 Újraelemzés' : '✨ Elemzés indítása'}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {elemzesBetolt && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full" />
              <p className="text-slate-500 text-sm">AI elemzés folyamatban... (ez 10-30 másodpercet vehet igénybe)</p>
            </div>
          )}
          {!elemzesBetolt && dok.ai_elemzes && (
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {dok.ai_elemzes}
            </div>
          )}
          {!elemzesBetolt && !dok.ai_elemzes && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🔬</div>
              <p className="text-slate-500 text-sm">Kattints az &quot;Elemzés indítása&quot; gombra a dokumentum AI-alapú elemzéséhez</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
