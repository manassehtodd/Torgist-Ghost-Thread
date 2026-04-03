import { useRef } from 'react'

const CHAR_LIMIT = 150

export default function GhostInput({ value, onChange }) {
  const ref = useRef(null)
  const currentLen = value.length % CHAR_LIMIT
  const near = currentLen > 120 && currentLen < CHAR_LIMIT

  return (
    <div className="input-wrap">
      <textarea
        ref={ref}
        className="torg-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Start typing your Torg... no judgment, no names. Just let it out."
        rows={6}
        spellCheck={false}
      />
      <span className={`char-indicator${near ? ' near' : ''}`}>
        {currentLen} / {CHAR_LIMIT}
      </span>
    </div>
  )
}
