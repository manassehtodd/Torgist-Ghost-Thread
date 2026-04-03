export const AURAS = [
  { name: 'Void',   a: '#0a0a0a', b: '#1a1a2e', accent: '#7c3aed', text: '#f0f0f0', card: 'linear-gradient(135deg,#1a1a2e,#0f0f23)' },
  { name: 'Blush',  a: '#1a0a0f', b: '#2d1020', accent: '#e91e8c', text: '#ffe4f0', card: 'linear-gradient(135deg,#2d1020,#1a0a0f)' },
  { name: 'Rage',   a: '#120404', b: '#2a0808', accent: '#ff3b3b', text: '#ffe0e0', card: 'linear-gradient(135deg,#2a0808,#120404)' },
  { name: 'Ocean',  a: '#030d18', b: '#061a2e', accent: '#0ea5e9', text: '#e0f4ff', card: 'linear-gradient(135deg,#061a2e,#030d18)' },
  { name: 'Forest', a: '#040d06', b: '#0a1f0d', accent: '#22c55e', text: '#e0ffe8', card: 'linear-gradient(135deg,#0a1f0d,#040d06)' },
  { name: 'Y2K',   a: '#0d0015', b: '#1a003a', accent: '#ff00ff', text: '#f8e8ff', card: 'linear-gradient(135deg,#1a003a,#0d0015)' },
  { name: 'Amber',  a: '#0f0800', b: '#1f1200', accent: '#f59e0b', text: '#fff5cc', card: 'linear-gradient(135deg,#1f1200,#0f0800)' },
]

export default function AuraSwitcher({ current, onChange }) {
  return (
    <div className="aura-row">
      {AURAS.map((aura, i) => (
        <button
          key={aura.name}
          className={`aura-btn${i === current ? ' active' : ''}`}
          style={{ background: aura.accent, borderColor: i === current ? aura.text : 'transparent' }}
          title={aura.name}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  )
}
