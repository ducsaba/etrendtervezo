import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildProfilKontextus, buildNaploKontextus, DIETITIAN_SYSTEM_PROMPT } from '@/lib/claude/client'
import type { NaploBejegyzes } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })

  const { kerdes } = await req.json()

  const ma = new Date().toISOString().split('T')[0]
  const [{ data: profil }, { data: bejegyzesek }] = await Promise.all([
    supabase.from('profilok').select('*').eq('id', user.id).single(),
    supabase.from('naplo_bejegyzesek').select('*, elelmiszerek(nev)').eq('felhaszt_id', user.id).eq('datum', ma),
  ])

  const profilSzoveg = profil ? buildProfilKontextus(profil) : 'Nincs profil megadva.'
  const naploSzoveg = buildNaploKontextus((bejegyzesek || []) as NaploBejegyzes[])

  const felhasznaloUzenet = `
FELHASZNÁLÓ PROFILJA:
${profilSzoveg}

MAI ÉTKEZÉSI NAPLÓ:
${naploSzoveg}

KÉRDÉS: ${kerdes || 'Mit egyek a nap hátralévő részében?'}
`

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: DIETITIAN_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: felhasznaloUzenet }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
