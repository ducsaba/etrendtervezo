import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildProfilKontextus, DIETITIAN_SYSTEM_PROMPT } from '@/lib/claude/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })

  const { dokumentumId } = await req.json()

  const [{ data: dok }, { data: profil }] = await Promise.all([
    supabase.from('dokumentumok').select('*').eq('id', dokumentumId).eq('felhaszt_id', user.id).single(),
    supabase.from('profilok').select('*').eq('id', user.id).single(),
  ])

  if (!dok) return NextResponse.json({ error: 'Dokumentum nem található' }, { status: 404 })

  const { data: fajlBytes } = await supabase.storage.from('dokumentumok').download(dok.storage_path)
  if (!fajlBytes) return NextResponse.json({ error: 'Fájl nem tölthető le' }, { status: 500 })

  const profilSzoveg = profil ? buildProfilKontextus(profil) : 'Nincs profil megadva.'

  let uzenet
  const fajlTipus = dok.fajl_tipus?.toLowerCase() || ''

  if (fajlTipus === 'pdf') {
    // PDF esetén szövegként küldjük (pdf-parse nem fut Edge runtime-ban, egyszerűsített verzió)
    const szoveg = await fajlBytes.text()
    uzenet = [
      {
        role: 'user' as const,
        content: `FELHASZNÁLÓ PROFILJA:\n${profilSzoveg}\n\nDOKUMENTUM TARTALMA (PDF szöveg):\n${szoveg.slice(0, 8000)}\n\nKérlek elemezd ezt a dokumentumot!`,
      },
    ]
  } else {
    // Kép esetén Claude Vision
    const buffer = await fajlBytes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType: 'image/png' | 'image/jpeg' = fajlTipus === 'png' ? 'image/png' : 'image/jpeg'

    uzenet = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: { type: 'base64' as const, media_type: mediaType, data: base64 },
          },
          {
            type: 'text' as const,
            text: `FELHASZNÁLÓ PROFILJA:\n${profilSzoveg}\n\nKérlek elemezd ezt az orvosi dokumentumot/laboreredményt!`,
          },
        ],
      },
    ]
  }

  const elemzesPrompt = `${DIETITIAN_SYSTEM_PROMPT}

DOKUMENTUMELEMZÉSI INSTRUKCIÓK:
Elemezd az orvosi dokumentumot a következő struktúrában:

## 📋 Dokumentum összefoglalója
[Rövid összefoglaló miről szól a dokumentum]

## ✅ Normál tartományban lévő értékek
[Lista a rendben lévő értékekről]

## ⚠️ Figyelmet igénylő értékek
[Lista a referencia értéken kívüli vagy aggasztó adatokról - magyarázattal]

## 🥗 Étrendi javaslatok a dokumentum alapján
[Konkrét táplálkozási ajánlások a felhasználó profiljára szabva]

## ⚕️ Fontos megjegyzés
Ez az elemzés tájékoztató jellegű és nem helyettesíti az orvosi véleményt. Kérd ki kezelőorvosod vagy dietetikusod tanácsát!`

  try {
    const valasz = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [{ type: 'text', text: elemzesPrompt, cache_control: { type: 'ephemeral' } }],
      messages: uzenet,
    })

    const elemzes = valasz.content[0].type === 'text' ? valasz.content[0].text : ''

    await supabase.from('dokumentumok').update({
      ai_elemzes: elemzes,
      ai_elemzve_datum: new Date().toISOString(),
    }).eq('id', dokumentumId)

    return NextResponse.json({ elemzes })
  } catch (error) {
    console.error('AI elemzés hiba:', error)
    return NextResponse.json({ error: 'AI elemzés sikertelen' }, { status: 500 })
  }
}
