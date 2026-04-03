import { useMemo } from 'react'

const VIBE_MAP = [
  {
    keys: ['angry', 'hate', 'furious', 'rage', 'mad', 'done with', 'pissed', 'killing me'],
    color: '#ef4444', label: '🔥 Rage', desc: 'Deep red activated',
  },
  {
    keys: ['sad', 'crying', 'cry', 'tears', 'depressed', 'heartbreak', 'heartbroken', 'lonely', 'hurts'],
    color: '#6366f1', label: '💜 Sad Hours', desc: 'Soft indigo for the feels',
  },
  {
    keys: ['blushing', 'crush', 'blush', 'nervous', 'butterflies', 'omg', 'he texted', 'she texted', 'love'],
    color: '#ec4899', label: '🌸 Soft Panic', desc: 'Pink gradient incoming',
  },
  {
    keys: ['lol', 'lmao', 'dead', 'bruh', 'funny', 'hilarious', 'haha'],
    color: '#f59e0b', label: '😭 LOL', desc: 'Chaos energy rising',
  },
  {
    keys: ['scared', 'terrified', 'fear', 'scary', 'horror', 'ghost', 'nightmare', 'chills'],
    color: '#1f2937', label: '👻 Spooked', desc: 'Dark mode: activated',
  },
  {
    keys: ['happy', 'excited', 'thrilled', 'amazing', 'best day', 'omg yes', 'winning'],
    color: '#22c55e', label: '✨ Vibing', desc: 'Good energy detected',
  },
]

export function useAuraEngine(text) {
  const vibe = useMemo(() => {
    if (text.length < 8) return null
    const lower = text.toLowerCase()
    return VIBE_MAP.find(v => v.keys.some(k => lower.includes(k))) || null
  }, [text])

  return { vibe }
}
