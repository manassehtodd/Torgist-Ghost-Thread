import { useState, useRef } from 'react'
import { toPng } from "html-to-image";
import share from "/share.svg?url";
import download from "/download.svg?url";
import { AURAS } from './AuraSwitcher'

// ── Helpers ────────────────────────────────────────────────────

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
    const { r, g, b } = hexToRgb(colors[0])
    const darker = rgbToHex({ r: r * 0.5, g: g * 0.5, b: b * 0.5 })
    return [colors[0], darker]
  }
  const rgbs = colors.map(hexToRgb)
  const avg = {
    r: rgbs.reduce((s, c) => s + c.r, 0) / rgbs.length,
    g: rgbs.reduce((s, c) => s + c.g, 0) / rgbs.length,
    b: rgbs.reduce((s, c) => s + c.b, 0) / rgbs.length,
  }
  return [colors[0], rgbToHex(avg), colors[colors.length - 1]]
}

function getCardGradient(cardText) {
  const lower = cardText.toLowerCase()
  const matched = VIBE_COLORS.filter(v => v.keys.some(k => lower.includes(k)))
  if (matched.length === 0) return `linear-gradient(135deg, #0f0f1a, #1a1a2e)`
  const stops = blendColors(matched.map(v => v.color))
  const angle = matched.length > 1 ? '135deg' : '160deg'
  return `linear-gradient(${angle}, ${stops.join(', ')})`
}

// ✅ Moved out of blendColors — was incorrectly nested inside it
function getDotState(i, current, total, window = 5) {
  const half = Math.floor(window / 2)
  const start = Math.max(0, Math.min(current - half, total - window))
  const end   = Math.min(start + window - 1, total - 1)
  if (i < start || i > end) return 'hidden'
  if (i === current) return 'active'
  if ((i === start && start > 0) || (i === end && end < total - 1)) return 'edge'
  return 'normal'
}

const handleShareImage = async (ref, card) => {
  if (!ref.current) return
  try {
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], "card.png", { type: "image/png" })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Shared Card" })
    } else {
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = "card.png"
      link.click()
    }
  } catch (err) {
    console.error("Image share failed:", err)
    alert("Sorry, sharing failed. Please try downloading instead.")
  }
}

const handleDownloadImage = async (ref, card) => {
  if (!ref.current) return
  try {
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = "card.png"
    link.click()
  } catch (err) {
    console.error("Image download failed:", err)
    alert("Sorry, downloading failed. Please try again.")
  }
}

// ── Slide subcomponent — fixes the useRef-in-map violation ─────

function CarouselSlide({ card, index, total, onShare, onDownload }) {
  const cardRef = useRef(null)   // ✅ hook called at component level, not inside map
  const gradient = getCardGradient(card.text)

  return (
    <div
      ref={cardRef}
      className="carousel-slide xui-position-relative xui-p-2"
      style={{ background: gradient, color: '#f0f0f0' }}
    >
      <div className="card-num">Card {index + 1} of {total}</div>
      <span className="slide-emoji">{card.emoji}</span>
      <div className="slide-text" style={{ overflow: 'hidden' }}>{card.text}</div>
      <div className="xui-d-flex xui-flex-jc-space-between">
        <button
          className="share-button xui-p-0 xui-btn-small xui-bdr-style-hidden xui-d-flex xui-jc-center xui-w-20"
          onClick={() => onShare(cardRef, card)}
        >
          <img src={share} alt="Share" className="xui-text-white xui-h-20" />
        </button>
        <button
          className="download-button xui-btn-small xui-bdr-style-hidden xui-d-flex xui-jc-center xui-w-20"
          onClick={() => onDownload(cardRef, card)}
        >
          <img src={download} alt="Download" className="xui-text-white xui-h-20" />
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

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

        <div className="carousel xui-position-relative">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onTouchStart={handleTouchStart}
          >
            {cards.map((card, i) => (
              <CarouselSlide
                key={card.id}
                card={card}
                index={i}
                total={cards.length}
                onShare={handleShareImage}
                onDownload={handleDownloadImage}
              />
            ))}
          </div>
        </div>

        <div className="carousel-nav">
          <button className="nav-btn" onClick={prev} disabled={index === 0}>‹</button>
          <div className="nav-dots">
            {cards.map((card, i) => {
              const state = getDotState(i, index, cards.length)
              if (state === 'hidden') return null
              const gradient = getCardGradient(card.text)
              return (
                <div
                  key={i}
                  className={`nav-dot nav-dot--${state}`}
                  onClick={() => setIndex(i)}
                  style={state === 'active' ? { background: gradient } : {}}
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