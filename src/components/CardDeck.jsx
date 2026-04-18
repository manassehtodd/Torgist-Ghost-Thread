import { useRef, useState, useEffect, useCallback } from 'react'
import { AURAS } from './AuraSwitcher'

const PEEK_Y = 15
const PEEK_SC = 0.048
const PEEK_OP = 0.2
const MAX_PEEK = 2
const THRESH = 55

export default function CardDeck({ cards, auraIndex }) {
  const [current, setCurrent] = useState(0)
  const cardRefs = useRef({})
  const isDragging = useRef(false)
  const startY = useRef(0)
  const lastDY = useRef(0)
  const animating = useRef(false)
  const aura = AURAS[auraIndex]

  function getT(i, dy = 0) {
    const off = i - current
    if (off < 0 || off > MAX_PEEK) return null
    return {
      ty: off * PEEK_Y + (off === 0 ? dy : 0),
      sc: 1 - off * PEEK_SC,
      op: 1 - off * PEEK_OP,
      z:  10 - off,
    }
  }

  function applyEl(el, ty, sc, op, z, tr = '') {
    el.style.transform  = `translateY(${ty}px) scale(${sc})`
    el.style.opacity    = op
    el.style.zIndex     = z
    el.style.transition = tr
    el.style.visibility = 'visible'
  }

  const settle = useCallback((skip = -1) => {
    cards.forEach((_, i) => {
      const el = cardRefs.current[i]
      if (!el) return
      const t = getT(i)
      if (!t) { el.style.visibility = 'hidden'; return }
      if (i === skip) return
      applyEl(el, t.ty, t.sc, t.op, t.z,
        'transform .38s cubic-bezier(.34,1.4,.64,1), opacity .25s ease')
    })
  }, [current, cards])

  useEffect(() => { settle() }, [current])

  // Swipe up: card flies up and rotates off screen
  function animSwipeUp(idx, done) {
    const el = cardRefs.current[idx]
    if (!el) return done()
    const curTy = parseFloat(el.style.transform.match(/translateY\(([^p]+)px\)/)?.[1] ?? 0)
    el.style.transition = 'transform .45s cubic-bezier(.4,0,.2,1), opacity .3s ease'
    el.style.transform  = `translateY(${curTy - 220}px) scale(0.82) rotate(-6deg)`
    el.style.opacity    = 0
    setTimeout(() => { el.style.visibility = 'hidden'; done() }, 450)
  }

  // Swipe down: card swoops in from above with a rotation
  function animSwipeDown(idx, done) {
    const el = cardRefs.current[idx]
    if (!el) return done()
    const t = getT(idx)
    if (!t) return done()
    el.style.transition  = 'none'
    el.style.transform   = `translateY(${t.ty - 220}px) scale(0.82) rotate(6deg)`
    el.style.opacity     = 0
    el.style.visibility  = 'visible'
    el.style.zIndex      = t.z
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'transform .4s cubic-bezier(.34,1.4,.64,1), opacity .3s ease'
        el.style.transform  = `translateY(${t.ty}px) scale(${t.sc})`
        el.style.opacity    = t.op
        setTimeout(done, 400)
      })
    })
  }

  function goNext() {
    if (animating.current || current >= cards.length - 1) return
    animating.current = true
    const leaving = current
    setCurrent(c => c + 1)
    settle(leaving)
    animSwipeUp(leaving, () => {
      animating.current = false
    })
  }

  function goPrev() {
    if (animating.current || current <= 0) return
    animating.current = true
    const target = current - 1
    setCurrent(target)
    settle(target)
    animSwipeDown(target, () => {
      animating.current = false
    })
  }

  function onPointerDown(e) {
    if (animating.current) return
    isDragging.current = true
    startY.current = e.touches ? e.touches[0].clientY : e.clientY
    lastDY.current = 0
    const el = cardRefs.current[current]
    if (el) el.style.transition = 'none'
  }

  function onPointerMove(e) {
    if (!isDragging.current) return
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const dy = clientY - startY.current
    lastDY.current = dy
    const el = cardRefs.current[current]
    if (!el) return

    // Rotate slightly in direction of drag
    const rot = dy * 0.04
    const t = getT(current, dy)
    if (t) {
      el.style.transform = `translateY(${t.ty}px) scale(${t.sc}) rotate(${rot}deg)`
      el.style.opacity   = t.op
    }

    // Animate the peek card rising toward its promoted position
    const peekIdx = dy < 0 ? current + 1 : current - 1
    if (peekIdx >= 0 && peekIdx < cards.length) {
      const pEl   = cardRefs.current[peekIdx]
      const baseT = getT(peekIdx)
      if (pEl && baseT) {
        const nextOff = (peekIdx - current) - Math.sign(dy)
        const progress = Math.min(1, Math.abs(dy) / THRESH) * 0.4
        applyEl(
          pEl,
          baseT.ty + (nextOff * PEEK_Y - baseT.ty) * progress,
          baseT.sc + ((1 - nextOff * PEEK_SC) - baseT.sc) * progress,
          baseT.op + ((1 - nextOff * PEEK_OP) - baseT.op) * progress,
          baseT.z, 'none'
        )
      }
    }
  }

  function onPointerUp() {
    if (!isDragging.current) return
    isDragging.current = false
    const dy = lastDY.current

    if (dy < -THRESH) {
      goNext()
    } else if (dy > THRESH) {
      goPrev()
    } else {
      // Snap back with spring
      const el = cardRefs.current[current]
      if (el) {
        el.style.transition = 'transform .35s cubic-bezier(.34,1.4,.64,1), opacity .2s'
        const t = getT(current)
        if (t) applyEl(el, t.ty, t.sc, t.op, t.z)
      }
      settle(current)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🃏</span>
        <p className="empty-text">Your cards will stack here as you type.<br/>Every 150 chars = a new card.</p>
      </div>
    )
  }

  return (
    <div className="deck-wrap">
      <div className="deck-header">
        <span className="deck-title">Your cards</span>
        <span className="deck-count">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
      </div>

      <div
        className="stack-stage"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        {cards.map((card, i) => {
          const t = getT(i)
          return (
            <div
              key={card.id}
              ref={el => { cardRefs.current[i] = el }}
              className="card"
              style={{
                background:  aura.card,
                color:       aura.text,
                transform:   t ? `translateY(${t.ty}px) scale(${t.sc})` : undefined,
                opacity:     t ? t.op : 0,
                zIndex:      t ? t.z  : 0,
                visibility:  t ? 'visible' : 'hidden',
                transformOrigin: 'center bottom',
              }}
            >
              <div className="card-num">Card {i + 1}</div>
              <span className="card-emoji">{card.emoji}</span>
              <div className="card-text">{card.text}</div>
            </div>
          )
        })}
      </div>

      <div className="nav-dots">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => {
              if (!animating.current && i !== current) {
                setCurrent(i)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}