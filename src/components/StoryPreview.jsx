import { useState } from 'react'
import { AURAS } from './AuraSwitcher'

// Same vibe colors as useAuraEngine
const VIBE_COLORS = [
  { keys: ['angry','hate','furious','rage','mad','done with','pissed'], color: '#ef4444' },
  { keys: ['sad','crying','cry','tears','depressed','heartbreak','lonely'], color: '#6366f1' },
  { keys: ['blushing','crush','blush','nervous','butterflies','omg','love'], color: '#ec4899' },
  { keys: ['lol','lmao','dead','bruh','funny','hilarious','haha'], color: '#f59e0b' },
  { keys: ['scared','terrified','scary','horror','nightmare','chills'], color: '#1f2937' },
  { keys: ['happy','excited','amazing','best day','omg yes','winning'], color: '#22c55e' },
]

const FALLBACK_COLOR = '#1a1a2e'

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function blendColors(colors) {
  if (colors.length === 0) return [FALLBACK_COLOR, FALLBACK_COLOR]
  if (colors.length === 1) {
    // Darken the single color for the second gradient stop
    const { r, g, b } = hexToRgb(colors[0])
    const darker = rgbToHex({ r: r * 0.5, g: g * 0.5, b: b * 0.5 })
    return [colors[0], darker]
  }

  // Blend all colors into one averaged color
  const rgbs = colors.map(hexToRgb)
  const avg = {
    r: rgbs.reduce((s, c) => s + c.r, 0) / rgbs.length,
    g: rgbs.reduce((s, c) => s + c.g, 0) / rgbs.length,
    b: rgbs.reduce((s, c) => s + c.b, 0) / rgbs.length,
  }

  // Use first and last dominant colors as gradient poles, blended avg as midpoint
  return [colors[0], rgbToHex(avg), colors[colors.length - 1]]
}

function getCardGradient(cardText) {
  const lower = cardText.toLowerCase()
  const matched = VIBE_COLORS.filter(v => v.keys.some(k => lower.includes(k)))

  if (matched.length === 0) {
    return `linear-gradient(135deg, #0f0f1a, #1a1a2e)`
  }

  const stops = blendColors(matched.map(v => v.color))
  const angle = matched.length > 1 ? '135deg' : '160deg'
  return `linear-gradient(${angle}, ${stops.join(', ')})`
}

export default function StoryPreview({ cards, auraIndex, onClose }) {
  const [index, setIndex] = useState(0)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(cards.length - 1, i + 1))

  const handleTouchStart = (e) => {
    const startX = e.touches[0].clientX
    const handleEnd = (endE) => {
      const dx = endE.changedTouches[0].clientX - startX
      if (dx < -50) next()
      if (dx > 50) prev()
      e.target.removeEventListener('touchend', handleEnd)
    }
    e.target.addEventListener('touchend', handleEnd)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header xui-pb-2">
          <span className="modal-title">Story Preview</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="carousel">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onTouchStart={handleTouchStart}
          >
            {cards.map((card, i) => {
              const gradient = getCardGradient(card.text)
              return (
                <div
                  key={card.id}
                  className="carousel-slide xui-p-2"
                  style={{ background: gradient, color: '#f0f0f0' }}
                >
                  <div className="card-num">Card {i + 1} of {cards.length}</div>
                  <span className="slide-emoji">{card.emoji}</span>
                  <div className="slide-text">{card.text}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="carousel-nav">
          <button className="nav-btn" onClick={prev} disabled={index === 0}>‹</button>
          <div className="nav-dots">
            {cards.map((card, i) => {
              const gradient = getCardGradient(card.text)
              return (
                <div
                  key={i}
                  className={`nav-dot${i === index ? ' active' : ''}`}
                  onClick={() => setIndex(i)}
                  style={i === index ? { background: gradient, width: '18px' } : {}}
                />
              )
            })}
          </div>
          <button className="nav-btn" onClick={next} disabled={index === cards.length - 1}>›</button>
        </div>
      </div>
    </div>
  )
}