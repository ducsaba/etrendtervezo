'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [jelszo, setJelszo] = useState('')
  const [hiba, setHiba] = useState('')
  const [betolt, setBetolt] = useState(false)

  async function bejelentkezes(e: React.FormEvent) {
    e.preventDefault()
    setBetolt(true)
    setHiba('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: jelszo })

    if (error) {
      setHiba('Hibás email cím vagy jelszó.')
      setBetolt(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Bejelentkezés</h2>
        <form onSubmit={bejelentkezes} className="flex flex-col gap-4">
          <Input
            label="Email cím"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="pelda@email.hu"
            required
          />
          <Input
            label="Jelszó"
            type="password"
            value={jelszo}
            onChange={e => setJelszo(e.target.value)}
            placeholder="••••••••"
            required
          />
          {hiba && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hiba}</p>}
          <Button type="submit" loading={betolt} size="lg" className="w-full mt-2">
            Bejelentkezés
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Nincs még fiókod?{' '}
          <Link href="/register" className="text-orange-500 font-medium hover:underline">
            Regisztrálj itt
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
