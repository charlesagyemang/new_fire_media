'use client'

import React, { useEffect, useState } from 'react'

type Announcement = {
  type?: string
  template?: string
  text?: string
}

export default function Marquee({ nowPlaying }: { nowPlaying?: string }) {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const res = await fetch('/announcements.json', { cache: 'no-store' })
        const body = await res.json()
        const ann: Announcement[] = body?.announcements || []

        const parsed = ann.map(a => {
          if (a.template) {
            return a.template.replace(/{{\s*nowPlaying\s*}}/g, nowPlaying || '')
          }
          return a.text || ''
        }).filter(Boolean)

        if (mounted && parsed.length) setItems(parsed)
      } catch (err) {
        // fallback default messages
        if (mounted) setItems([
          `Now playing: ${nowPlaying || '—'}`,
          'Contact 233266593915 more info'
        ])
      }
    }

    load()
    return () => { mounted = false }
  }, [nowPlaying])

  const [config, setConfig] = useState({ speed: 20, separator: '  ★  ' })

  useEffect(() => {
    let mounted = true

    const loadConfig = async () => {
      try {
        const res = await fetch('/announcements.json', { cache: 'no-store' })
        const body = await res.json()
        if (mounted && body?.config) {
          setConfig({
            speed: body.config.speed || 20,
            separator: body.config.separator || '  ★  '
          })
        }
      } catch (err) {
        // Use defaults
      }
    }

    loadConfig()
    return () => { mounted = false }
  }, [])

  if (!items.length) return null

  // Create a single long string with configured separator
  const line = items.join(config.separator)

  return (
    <div aria-hidden="true" className="w-full overflow-hidden bg-black/40 text-white/90 py-2 px-3 rounded-md mb-4">
      <div style={{ whiteSpace: 'nowrap' }}>
        <div
          className="marquee-track"
          style={{
            display: 'inline-block',
            paddingRight: '100%',
            animation: `marquee ${config.speed}s linear infinite`
          }}
        >
          <span style={{ paddingRight: '2rem' }}>{line}</span>
          <span style={{ paddingRight: '2rem' }}>{line}</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        /* Reduce motion preference */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important }
        }
      `}</style>
    </div>
  )
}
