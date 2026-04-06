# Torgist — Ghost Thread

**Anonymous emotional storytelling for Gen Z.**

Torgist lets you drop your stories without your name attached. You write, the app slices your text into cards, reads the emotional energy behind each one, and gives it a visual vibe — color, gradient, aura. Then you share it or let it vanish.

No usernames. No followers. Just the story.

**URL :-** [Torgist-Ghost.vercel.app]()

---

## What It Does

- **Auto-Slice Engine** — pastes your text and splits it into cards automatically, one beat per card
- **Aura Engine** — detects the emotional tone of each card (rage, grief, joy, numbness, etc.) and maps it to a gradient theme
- **Drag-and-Drop Deck** — reorder your cards before you share
- **Swipeable Preview Carousel** — see how your story flows before it goes out
- **Canvas Card Export** — export individual cards as images to share anywhere

---

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- Canvas 2D API (card export)
- Custom hooks: `useAutoSlicer`, `useAuraEngine`

---

## Getting Started

```bash
git clone https://github.com/manassehtodd/torgist.git
cd torgist
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
src/
├── assets/
├── components/   
├── hooks/
│   ├── useAutoSlicer.ts  # Text-to-card splitting logic
│   └── useAuraEngine.ts  # Emotion detection + gradient mapping
├── App.css
└── App.tsx
```

---

## How the Aura Engine Works

Each card gets analyzed for emotional tone after slicing. The engine maps detected emotions to a gradient palette — so a card dripping with grief looks different from one that's just numb, or one that's quietly angry.

The mappings live in `useAuraEngine.ts` and are easy to extend.

---

## Roadmap

- [ ] Backend + anonymous post persistence
- [ ] Story feed (public ghost threads)
- [ ] Expiring stories (threads that delete after 24h)
- [ ] Sound auras (audio textures per emotion)
- [ ] Mobile app (React Native)

---

Built by [Manasseh Todd](https://manasseh-dev.vercel.app)
