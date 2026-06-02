import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ETKEZES_TIPUSOK } from '@/types'
import type { NaploBejegyzes } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const ma = new Date().toISOString().split('T')[0]

  const [{ data: profil }, { data: bejegyzesek }, { data: sulynaplo }] = await Promise.all([
    supabase.from('profilok').select('*').eq('id', user.id).single(),
    supabase.from('naplo_bejegyzesek').select('*, elelmiszerek(nev)').eq('felhaszt_id', user.id).eq('datum', ma),
    supabase.from('sulynaplo').select('*').eq('felhaszt_id', user.id).order('datum', { ascending: false }).limit(1),
  ])

  const celKaloria = profil?.cel_kaloria || 1800
  const ossz = (bejegyzesek || []).reduce((acc: number, b: NaploBejegyzes) => acc + (b.kaloria || 0), 0)
  const maradek = Math.max(0, celKaloria - ossz)
  const szazalek = Math.min(100, Math.round((ossz / celKaloria) * 100))

  const ossz_feherje = (bejegyzesek || []).reduce((acc: number, b: NaploBejegyzes) => acc + (b.feherje_g || 0), 0)
  const ossz_szenhidrat = (bejegyzesek || []).reduce((acc: number, b: NaploBejegyzes) => acc + (b.szenhidrat_g || 0), 0)
  const ossz_zsir = (bejegyzesek || []).reduce((acc: number, b: NaploBejegyzes) => acc + (b.zsir_g || 0), 0)

  const nev = profil?.teljes_nev?.split(' ')[0] || 'Felhasználó'
  const ora = new Date().getHours()
  const koszones = ora < 12 ? 'Jó reggelt' : ora < 18 ? 'Jó napot' : 'Jó estét'

  const csoportok: Record<string, NaploBejegyzes[]> = {}
  for (const b of (bejegyzesek || []) as NaploBejegyzes[]) {
    if (!csoportok[b.etkezes_tipus]) csoportok[b.etkezes_tipus] = []
    csoportok[b.etkezes_tipus].push(b)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Fejléc */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{koszones}, {nev}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Kalória fő kártya */}
      <Card gradient>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Mai kalória</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-800">{Math.round(ossz)}</span>
                <span className="text-slate-400 mb-1">/ {celKaloria} kcal</span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#fed7aa" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#grad)" strokeWidth="8"
                  strokeDasharray={`${szazalek * 2.138} 213.8`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{szazalek}%</div>
            </div>
          </div>

          {/* Makrók */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Fehérje', value: ossz_feherje, color: 'from-blue-400 to-blue-500', unit: 'g' },
              { label: 'Szénhidrát', value: ossz_szenhidrat, color: 'from-amber-400 to-amber-500', unit: 'g' },
              { label: 'Zsír', value: ossz_zsir, color: 'from-purple-400 to-purple-500', unit: 'g' },
            ].map(({ label, value, color, unit }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                <div className={`text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{Math.round(value)}{unit}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Még fogyasztható: <strong className="text-slate-700">{Math.round(maradek)} kcal</strong></span>
            <Link href="/naplo" className="text-orange-500 font-medium hover:underline text-xs">+ Étel hozzáadása →</Link>
          </div>
        </CardBody>
      </Card>

      {/* Gyors elérés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/javaslat', emoji: '✨', label: 'AI Javaslat', desc: 'Mit egyek ma?', color: 'from-purple-50 to-pink-50 border-purple-100' },
          { href: '/naplo', emoji: '📝', label: 'Napló', desc: 'Étkezés felvitele', color: 'from-blue-50 to-cyan-50 border-blue-100' },
          { href: '/sulynaplo', emoji: '⚖️', label: 'Súlynapló', desc: sulynaplo?.[0] ? `${sulynaplo[0].suly_kg} kg` : 'Mérés hozzáadása', color: 'from-green-50 to-emerald-50 border-green-100' },
          { href: '/dokumentumok', emoji: '📄', label: 'Dokumentumok', desc: 'Labor, lelet', color: 'from-orange-50 to-amber-50 border-orange-100' },
        ].map(({ href, emoji, label, desc, color }) => (
          <Link key={href} href={href}
            className={`bg-gradient-to-br ${color} border rounded-2xl p-4 hover:shadow-md transition-shadow`}>
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="font-semibold text-sm text-slate-700">{label}</div>
            <div className="text-xs text-slate-500">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Mai étkezések */}
      {Object.keys(csoportok).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700">🍽️ Mai étkezések</h2>
              <Link href="/naplo" className="text-xs text-orange-500 hover:underline">Összes →</Link>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            {Object.entries(csoportok).map(([tipus, etelek]) => (
              <div key={tipus}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{ETKEZES_TIPUSOK[tipus as keyof typeof ETKEZES_TIPUSOK]}</p>
                {etelek.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700">{e.egyedi_nev || (e.elelmiszerek as { nev: string } | null)?.nev}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{e.mennyiseg_g}g</span>
                      <Badge color="orange">{Math.round(e.kaloria || 0)} kcal</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Ha nincs még étkezés */}
      {Object.keys(csoportok).length === 0 && (
        <Card>
          <CardBody className="text-center py-8">
            <div className="text-4xl mb-3">🌅</div>
            <p className="text-slate-600 font-medium">Ma még nem rögzítettél étkezést</p>
            <p className="text-slate-400 text-sm mt-1">Kezdd el a napot egy egészséges reggelivel!</p>
            <Link href="/naplo" className="inline-block mt-4 text-orange-500 font-medium hover:underline text-sm">
              Étkezés hozzáadása →
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Profil figyelmeztetés */}
      {!profil?.cel_kaloria && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="font-medium text-slate-700">Töltsd ki a profilod!</p>
              <p className="text-sm text-slate-500">A pontos kalóriaigény-számításhoz szükség van az adataidra.</p>
            </div>
            <Link href="/profil" className="ml-auto text-orange-500 font-medium text-sm hover:underline whitespace-nowrap">
              Profil →
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
