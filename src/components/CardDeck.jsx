import { useRef } from 'react'
import { AURAS } from './AuraSwitcher'

export default function CardDeck({ cards, auraIndex, onDelete, onReorder }) {
  const dragFrom = useRef(null)
  const aura = AURAS[auraIndex]

  if (cards.length === 0) {
    return (
      <>
        <div className="empty-state">
          <span className="empty-icon">🃏</span>
          <p className="empty-text">
            Your cards will stack here as you type.<br />
            Every 150 chars = a new card.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="deck-header">
        <span className="deck-title">Your cards</span>
        <span className="deck-count">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="deck">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="card"
            draggable
            style={{
              background: aura.card,
              color: aura.text,
              animationDelay: `${i * 0.05}s`,
            }}
            onDragStart={() => { dragFrom.current = i }}
            onDragEnd={() => { dragFrom.current = null }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragFrom.current !== null && dragFrom.current !== i) {
                onReorder(dragFrom.current, i)
              }
            }}
          >
            <div className="card-num">Card {i + 1}</div>
            <button
              className="card-del"
              onClick={() => onDelete(i)}
              title="Delete card"
            >
              ✕
            </button>
            <span className="card-emoji">{card.emoji}</span>
            <div>{card.text}</div>
          </div>
        ))}
      </div>
    </>
  )
}
