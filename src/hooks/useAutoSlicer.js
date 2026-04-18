import { useState, useEffect } from 'react'

const CHAR_LIMIT = 200
const GHOSTS = ['👻', '🌑', '🎭', '🌫️', '💭', '🫥', '🕳️']

const VIBES = [
  { keys: ['angry', 'hate', 'furious', 'rage', 'mad', 'done with', 'pissed'], emoji: ['😤', '💢', '🔥', '😡'] },
  { keys: ['sad', 'crying', 'cry', 'tears', 'depressed', 'heartbreak', 'lonely'], emoji: ['😢', '💔', '🌧️', '😞'] },
  { keys: ['blushing', 'crush', 'blush', 'nervous', 'butterflies', 'omg', 'love'], emoji: ['🥰', '💕', '🌸', '😳'] },
  { keys: ['lol', 'lmao', 'dead', 'bruh', 'funny', 'hilarious', 'haha'], emoji: ['💀', '😭', '🤣', '😂'] },
  { keys: ['scared', 'terrified', 'scary', 'horror', 'nightmare', 'chills'], emoji: ['👻', '😱', '🕷️', '🌑'] },
  { keys: ['happy', 'excited', 'amazing', 'best day', 'omg yes', 'winning'], emoji: ['🎉', '✨', '🌟', '💫'] },
]

function sliceText(text) {
  if (!text.trim()) return []
  const results = []
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [text]
  let current = ''

  for (const sentence of sentences) {
    const endsWithPunct = /[.!?\n]$/.test(sentence)

    if ((current + sentence).length > CHAR_LIMIT && current.trim()) {
      results.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }

    if (endsWithPunct && current.trim().length >= 80) {
      results.push(current.trim())
      current = ''
    }

    while (current.length > CHAR_LIMIT) {
      results.push(current.slice(0, CHAR_LIMIT).trim())
      current = current.slice(CHAR_LIMIT)
    }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

function detectVibeEmoji(text, index) {
  const lower = text.toLowerCase()
  for (const v of VIBES) {
    if (v.keys.some(k => lower.includes(k))) {
      return v.emoji[index % v.emoji.length]
    }
  }
  return GHOSTS[index % GHOSTS.length]
}

export function useAutoSlicer(text) {
  const [cards, setCards] = useState([])

  useEffect(() => {
    const slices = sliceText(text)
    const built = slices.map((content, i) => ({
      id: `${i}-${Date.now()}`,
      text: content,
      emoji: detectVibeEmoji(text, i),
    }))
    setCards(built)
  }, [text])

  return { cards, setCards }
}
