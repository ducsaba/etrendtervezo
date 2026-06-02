'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [nev, setNev] = useState('')
  const [email, setEmail] = useState('')
  const [jelszo, setJelszo] = useState('')
  const [hiba, setHiba] = useState('')
  const [betolt, setBetolt] = useState(false)
  const [siker, setSiker] = useState(false)

  async function regisztracio(e: React.FormEvent) {
    e.preventDefault()
    if (jelszo.length < 6) {
      setHiba('A jelszónak legalább 6 karakter hosszúnak kell lennie.')
      return
    }
    setBetolt(true)
    setHiba('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password: jelszo,
      options: { data: { teljes_nev: nev } }
    })

    if (error) {
      setHiba(error.message === 'User already registered' ? 'Ez az email cím már regisztrálva van.' : 'Hiba történt a regisztráció során.')
      setBetolt(false)
    } else {
      setSiker(true)
      setTimeout(() => router.push('/profil'), 2000)
    }
  }

  if (siker) {
    return (
      <Card>
        <CardBody className="p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sikeres regisztráció!</h2>
          <p className="text-slate-500 text-sm">Átirányítunk a profil beállításhoz...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Regisztráció</h2>
        <form onSubmit={regisztracio} className="flex flex-col gap-4">
          <Input
            label="Teljes neved"
            type="text"
            value={nev}
            onChange={e => setNev(e.target.value)}
            placeholder="Pl. Kovács Anna"
            required
          />
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
            placeholder="Min. 6 karakter"
            required
          />
          {hiba && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hiba}</p>}
          <Button type="submit" loading={betolt} size="lg" className="w-full mt-2">
            Fiók létrehozása
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Már van fiókod?{' '}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            Jelentkezz be
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
