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

## 🚀 Usage

### Basic Example

```tsx
import { VideoPlayer } from '@tiwz/react-video-player'

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

### Advanced Source Configuration

```tsx
import { VideoPlayer } from '@tiwz/react-video-player'

<VideoPlayer
  title="My Video"
  source={{
    link: 'https://example.com/video.webm',
    type: 'video/webm'
  }}
/>
```

---

## 🧩 Props

### VideoPlayerProps

| Prop | Type | Required | Description |
|-------|------|----------|--------------|
| title | string | ❌ | Video title overlay |
| source | string \| { link: string; type?: 'video/mp4' \| 'video/ogg' \| 'video/webm' } | ✅ | Video source |

---

## ⌨️ Keyboard Shortcuts (Desktop)

| Key | Action |
|------|---------|
| Space | Play / Pause |
| Arrow Left | Seek backward 10s |
| Arrow Right | Seek forward 10s |
| F | Toggle Fullscreen |
| P | Toggle Picture-in-Picture |

---

## 📱 Mobile Gestures

| Gesture | Action |
|------------|---------|
| Single Tap | Toggle controls |
| Double Tap (Left) | Seek backward 10s |
| Double Tap (Right) | Seek forward 10s |

---

## 🎥 Player Behavior

- Auto-hide controls after 2.5s inactivity
- Smooth seek stacking (+10, +20, -10, etc)
- Buffered range visualization
- Smart fullscreen orientation lock (landscape when video is wide)

---

## 🖥 Fullscreen Support

Supports:

- Standard Fullscreen API
- WebKit
- Mozilla
- MS prefixed APIs

With auto orientation lock on mobile landscape videos.

---

## 📺 Picture-in-Picture (PiP)

Supported on modern browsers:

```ts
document.pictureInPictureEnabled
```

Auto fallback handling included.

---

## 🛠 TypeScript Support

Fully typed out-of-the-box.

```ts
interface VideoPlayerProps {
  title?: string
  source: string | {
    link: string
    type?: 'video/mp4' | 'video/ogg' | 'video/webm'
  }
}
```

---

## ⚡ Performance

- Throttled mouse move handling
- Smart seek batching
- Minimal re-renders
- Zero unnecessary listeners on mobile

---

## 🧪 Browser Support

- Chrome
- Edge
- Firefox
- Safari
- Mobile Safari
- Chrome Android

---

## 🏗 Build

```bash
npm run rollup
```

Output:

```
dist/
 ├── index.js
 ├── index.mjs
 └── index.d.ts
```

---

## 📄 License

MIT © tiwz

---

## ⭐ Star the repo

If this project helps you, please consider starring ⭐ the repository to support development.
