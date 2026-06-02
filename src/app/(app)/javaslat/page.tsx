'use client'
import { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, Send } from 'lucide-react'

const GYORS_KERDESEK = [
  'Mit egyek reggelire?',
  'Javasolj ebédet!',
  'Mit egyek vacsorára?',
  'Javasolj egy egészséges snacket!',
  'Hogyan állok a mai kalóriával?',
  'Mit egyem a nap hátralévő részében?',
]

export default function JavaslatPage() {
  const [kerdes, setKerdes] = useState('')
  const [valasz, setValasz] = useState('')
  const [betolt, setBetolt] = useState(false)

  async function kuldKerdes(k?: string) {
    const szoveg = k || kerdes
    if (!szoveg.trim()) return

    setBetolt(true)
    setValasz('')

    try {
      const res = await fetch('/api/ai/javaslat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kerdes: szoveg }),
      })

      if (!res.ok) throw new Error('Hiba a javaslat kérésekor')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setValasz(v => v + decoder.decode(value))
        }
      }
    } catch {
      setValasz('Sajnos hiba történt a javaslat lekérésekor. Kérlek próbáld újra!')
    } finally {
      setBetolt(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles size={24} className="text-purple-500" /> AI Étrendi Javaslat
        </h1>
        <p className="text-slate-500 text-sm mt-1">Személyre szabott tanácsok a profilod alapján</p>
      </div>

      {/* Gyors kérdések */}
      <div>
        <p className="text-sm font-medium text-slate-600 mb-2">Gyors kérdések:</p>
        <div className="flex flex-wrap gap-2">
          {GYORS_KERDESEK.map(q => (
            <button key={q} onClick={() => { setKerdes(q); kuldKerdes(q) }}
              disabled={betolt}
              className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100 hover:bg-purple-100 transition-colors disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Kérdés bevitel */}
      <Card>
        <CardBody>
          <div className="flex gap-3">
            <input
              value={kerdes}
              onChange={e => setKerdes(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !betolt && kuldKerdes()}
              placeholder="Pl. Mit egyek ma ebédre? Hogyan csökkenthetem a kalóriabevitelemet?"
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <Button onClick={() => kuldKerdes()} loading={betolt} disabled={!kerdes.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shrink-0">
              <Send size={16} />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Válasz megjelenítése */}
      {(valasz || betolt) && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs">AI</div>
              <span className="font-semibold text-slate-700 text-sm">Dietetikus asszisztens</span>
            </div>
            {betolt && !valasz && (
              <div className="flex gap-1 py-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
            {valasz && (
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {valasz}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {!valasz && !betolt && (
        <Card>
          <CardBody className="text-center py-10">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-slate-600 font-medium">Kérdezz az AI asszisztensedtől!</p>
            <p className="text-slate-400 text-sm mt-1">Figyelembe veszi a profilodat, egészségügyi állapotodat és a mai étkezéseidet</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
