import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 text-white text-3xl font-bold mb-6 shadow-xl">
          É
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-4 leading-tight">
          ÉtrendTervező
        </h1>
        <p className="text-xl text-slate-600 mb-3 max-w-2xl mx-auto">
          Személyre szabott AI étkezési asszisztens — figyelembe veszi egészségi állapotodat, céljaidat és preferenciáidat
        </p>
        <p className="text-slate-400 mb-10">Kalóriaszámlálás · Orvosi dokumentumok · AI javaslatok · Súlynapló</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow hover:from-orange-600 hover:to-pink-600">
            Ingyenes regisztráció →
          </Link>
          <Link href="/login"
            className="px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg shadow-md hover:shadow-lg transition-shadow border border-slate-100">
            Bejelentkezés
          </Link>
        </div>
      </div>

      {/* Funkciók */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-10">Minden amire szükséged van</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '🧠', title: 'AI Étrendi Javaslat', desc: 'Claude AI személyre szabott tanácsokat ad az egészségügyi állapotod és céljaid alapján' },
            { emoji: '📊', title: 'Kalóriaszámlálás', desc: 'Magyar élelmiszer adatbázisból étkezéseid naplózása, makrók és kalóriák automatikus számítása' },
            { emoji: '🏥', title: 'Egészségügyi Profil', desc: 'Cukorbetegség, inzulinrezisztencia, allergiák – az AI mindent figyelembe vesz' },
            { emoji: '📄', title: 'Orvosi Dokumentumok', desc: 'Laboreredmények, leletek feltöltése és AI-alapú értelmezése étkezési javaslatokkal' },
            { emoji: '👨‍🍳', title: 'Receptbank', desc: 'Saját kedvenc ételeid és receptjeid gyűjtése kalóriainformációkkal' },
            { emoji: '⚖️', title: 'Súlynapló', desc: 'Testsúlyod alakulásának követése grafikonon, BMR/TDEE automatikus számítás' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
