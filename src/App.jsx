import { useState, useCallback } from 'react'
import GhostInput from './components/GhostInput'
import CardDeck from './components/CardDeck'
import AuraSwitcher from './components/AuraSwitcher'
import VibeBar from './components/VibeBar'
import StoryPreview from './components/StoryPreview'
import { useAutoSlicer } from './hooks/useAutoSlicer'
import { useAuraEngine } from './hooks/useAuraEngine'
import './App.css'

export default function App() {
  const [text, setText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [currentAura, setCurrentAura] = useState(0)

  const { cards, setCards } = useAutoSlicer(text)
  const { vibe } = useAuraEngine(text)

  const handleDeleteCard = useCallback((index) => {
    setCards(prev => prev.filter((_, i) => i !== index))
  }, [setCards])

  const handleReorderCards = useCallback((from, to) => {
    setCards(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [setCards])

  return (
    <div className="app" data-aura={currentAura}>
      <div className="bg-layer" />
      <div className="grain" />

      <div>
        <header className="logo xui-container xui-pt-3">
          <span className="logo-dot" />
          Torgist
        </header>

      <div className='content'>
        <div className="ghost-badge">👻 Ghost-Thread · Anonymous Mode</div>

        <h1 className="headline">
          Spill the tea.<br />We&apos;ll slice it.
        </h1>
        <p className="sub">
          Type your story. Watch it turn into swipeable cards.
          No names. No avatars. Just vibes.
        </p>

        <AuraSwitcher current={currentAura} onChange={setCurrentAura} />

        <GhostInput value={text} onChange={setText} />

        <VibeBar vibe={vibe} textLength={text.length} />

        <CardDeck
          cards={cards}
          auraIndex={currentAura}
          onDelete={handleDeleteCard}
          onReorder={handleReorderCards}
        />

        <button
          className="preview-btn"
          disabled={cards.length === 0}
          onClick={() => setShowPreview(true)}
        >
          ✦ Preview Story Carousel
        </button>
      </div>

      {showPreview && (
        <StoryPreview
          cards={cards}
          auraIndex={currentAura}
          onClose={() => setShowPreview(false)}
        />
      )}
      </div>
    </div>
  )
}
