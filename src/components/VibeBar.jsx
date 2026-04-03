export default function VibeBar({ vibe, textLength }) {
  const active = vibe && textLength > 8

  return (
    <div className="vibe-bar">
      <div
        className="vibe-dot"
        style={{
          background: active ? vibe.color : '#888',
          boxShadow: active ? `0 0 8px ${vibe.color}80` : 'none',
        }}
      />
      <span className="vibe-label">{active ? vibe.label : 'Neutral'}</span>
      <span className="vibe-desc">
        {active ? vibe.desc : textLength > 3 ? 'Reading your energy...' : 'Start typing...'}
      </span>
    </div>
  )
}
