'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Sparkles, ChefHat, User } from 'lucide-react'

const tabpontok = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/naplo', icon: BookOpen, label: 'Napló' },
  { href: '/javaslat', icon: Sparkles, label: 'AI' },
  { href: '/receptbank', icon: ChefHat, label: 'Receptek' },
  { href: '/profil', icon: User, label: 'Profil' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabpontok.map(({ href, icon: Icon, label }) => {
          const aktiv = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                aktiv ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={20} strokeWidth={aktiv ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
