'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Sparkles, FileText, ChefHat, TrendingDown, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menupontok = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/naplo', icon: BookOpen, label: 'Étkezési napló' },
  { href: '/javaslat', icon: Sparkles, label: 'AI Javaslat' },
  { href: '/receptbank', icon: ChefHat, label: 'Receptbank' },
  { href: '/sulynaplo', icon: TrendingDown, label: 'Súlynapló' },
  { href: '/dokumentumok', icon: FileText, label: 'Dokumentumok' },
  { href: '/profil', icon: User, label: 'Profil' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function kijelentkezes() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 px-4 py-6">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">É</div>
          <span className="font-bold text-slate-800 text-lg">ÉtrendTervező</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {menupontok.map(({ href, icon: Icon, label }) => {
          const aktiv = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                aktiv
                  ? 'bg-gradient-to-r from-orange-50 to-pink-50 text-orange-600 border border-orange-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={kijelentkezes}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
      >
        <LogOut size={18} />
        Kijelentkezés
      </button>
    </aside>
  )
}
