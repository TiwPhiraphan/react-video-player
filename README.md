# @tiwz/react-video-player

A modern, fully-featured, and mobile-friendly React video player component with custom controls, double-tap seek, keyboard shortcuts, fullscreen, Picture-in-Picture (PiP), and smooth UX — built for both desktop and mobile.

---

## ✨ Features

- 🎮 Custom video controls (no native controls UI)
- 📱 Mobile optimized (double-tap to seek ±10s)
- ⌨️ Keyboard shortcuts support (desktop)
- 🖥 Fullscreen & Picture-in-Picture (PiP)
- 🔊 Volume control + mute toggle
- 🕒 Seek bar with buffered progress indicator
- 🚀 Smooth UX with throttled interactions
- 💡 Auto hide controls on inactivity
- 🧭 Landscape lock on fullscreen (mobile)
- 🎯 Fully typed with TypeScript

---

## 📦 Installation

```bash
npm install @tiwz/react-video-player
```

or

```bash
bun add @tiwz/react-video-player
```

or

```bash
yarn add @tiwz/react-video-player
```

---

## 🚀 Quick Start

```tsx
import { VideoPlayer } from '@tiwz/react-video-player'
import '@tiwz/react-video-player/style'

export default function App() {
  return (
    <VideoPlayer
      title="Demo Video"
      source="https://www.w3schools.com/html/mov_bbb.mp4"
    />
  )
}
```

---

## 🧩 Props

### VideoPlayerProps

| Prop | Type | Required | Description |
|--------|------|----------|--------------|
| `hls` | `boolean \| Partial<HlsConfig>` | ❌ | Using hls.js |
| `title` | `string` | ❌ | Video title overlay |
| `source` | `string \| { link: string; type?: 'video/mp4' \| 'video/ogg' \| 'video/webm' }` | ✅ | Video source |

---

## 🎥 Player Controls

### Desktop

| Action | Control |
|---------|----------|
| Play / Pause | Click center / Space |
| Seek backward | ← Arrow (10s) |
| Seek forward | → Arrow (10s) |
| Fullscreen | F |
| Picture-in-Picture | P |

---

### Mobile

| Gesture | Action |
|------------|---------|
| Single Tap | Toggle controls |
| Double Tap (Left) | Seek backward 10s |
| Double Tap (Right) | Seek forward 10s |

---

## 🖥 Fullscreen

Supports all modern browsers including:

- Chrome
- Edge
- Firefox
- Safari
- Mobile Safari
- Chrome Android

Includes automatic **orientation lock** for landscape videos on mobile.

---

## 📺 Picture-in-Picture (PiP)

Automatically enables PiP when supported by the browser.

Works on:

- Chrome
- Edge
- Safari (desktop & iPadOS)

---

## ⚡ Performance

- Throttled mouse movement
- Optimized re-rendering
- Smart seek stacking
- Minimal event listeners

---

## 🧪 Browser Support

- Chrome
- Edge
- Firefox
- Safari
- Mobile Safari
- Chrome Android

---

## 📄 License

MIT © tiwz
