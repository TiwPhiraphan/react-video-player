# @tiwz/react-video-player

A modern, fully-featured, and mobile-friendly React video player component with custom controls, double-tap seek, keyboard shortcuts, fullscreen, Picture-in-Picture (PiP), and smooth UX — built for both desktop and mobile.

---

## ✨ Features

- 🎮 Custom video controls (no native controls UI)
- 📱 Mobile optimized (double-tap to seek ±10s, touch to toggle controls)
- ⌨️ Keyboard shortcuts support (desktop)
- 🖥 Fullscreen & Picture-in-Picture (PiP)
- 🔊 Volume control + mute toggle
- 🎯 Multi-quality source switching (resumes from same timestamp)
- ⚡ Playback speed control (0.25x – 4x)
- 📡 HLS streaming support via `hls.js` (optional)
- 🕒 Seek bar with buffered progress indicator
- 🚀 Smooth UX with throttled interactions
- 💡 Auto-hide controls on inactivity
- 🧭 Landscape lock on fullscreen (mobile)
- 🔄 Loading indicator on buffering
- ❌ Error state UI when video fails to load
- 🧩 Fully typed with TypeScript

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
import '@tiwz/react-video-player/style.css'

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
|------|------|----------|-------------|
| `source` | `string \| VideoSourceQuality[]` | ✅ | Single URL or array of quality sources |
| `title` | `string` | ❌ | Video title shown in top bar |
| `poster` | `string` | ❌ | Thumbnail image shown before playback |
| `hls` | `boolean \| Partial<HlsConfig>` | ❌ | Enable HLS streaming via hls.js |

### VideoSourceQuality

```ts
type VideoSourceQuality = {
  src: string      // Video URL
  quality: number  // e.g. 1080, 720, 480. Use 0 for Auto
}
```

**Example with multiple qualities:**

```tsx
<VideoPlayer
  title="My Video"
  poster="/thumbnail.jpg"
  source={[
    { src: '/video-1080p.mp4', quality: 1080 },
    { src: '/video-720p.mp4',  quality: 720  },
    { src: '/video-480p.mp4',  quality: 480  },
    { src: '/video-auto.mp4',  quality: 0    }, // Auto
  ]}
/>
```

> Quality sources are automatically sorted highest to lowest. Switching quality resumes from the same timestamp.

---

## 📡 HLS Streaming

HLS support requires `hls.js` to be installed separately (optional peer dependency):

```bash
npm install hls.js
```

```tsx
// Basic HLS
<VideoPlayer
  title="Live Stream"
  source="/stream.m3u8"
  hls
/>

// HLS with custom config
<VideoPlayer
  title="Live Stream"
  source="/stream.m3u8"
  hls={{ maxBufferLength: 30 }}
/>
```

> Safari uses native HLS automatically — `hls.js` is not required on Safari.
> If `hls.js` is not installed and `hls` prop is set, falls back to native `src` with a console warning.

---

## 🎥 Player Controls

### Desktop

| Action | Control |
|--------|---------|
| Play / Pause | Click center or `Space` |
| Seek backward 10s | `←` Arrow |
| Seek forward 10s | `→` Arrow |
| Toggle fullscreen | `F` |
| Toggle Picture-in-Picture | `P` |

### Mobile

| Gesture | Action |
|---------|--------|
| Single tap | Show / hide controls |
| Double tap left | Seek backward 10s |
| Double tap right | Seek forward 10s |
| Consecutive taps | Stacked seek (±20s, ±30s, ...) |
| Drag seek bar | Seek with live preview |

---

## 🖥 Fullscreen

Supports all modern browsers including:

- Chrome / Edge / Firefox
- Safari (desktop)
- Mobile Safari / Chrome Android

Includes automatic **orientation lock** to landscape for landscape videos on mobile.

---

## 📺 Picture-in-Picture (PiP)

Works on:

- Chrome / Edge
- Safari (desktop & iPadOS)

> Automatically resumes playback when entering PiP if the video is paused.

---

## ⚡ Performance

- Throttled mouse movement (200ms)
- Optimized re-rendering via `useReducer` + `useRef`
- Stale closure prevention with refs for hot-path callbacks
- Smart seek stacking with auto-reset
- HLS loaded via dynamic `import()` — zero cost if unused
- Minimal event listeners

---

## 🧪 Browser Support

| Browser | Fullscreen | PiP | HLS | Orientation Lock |
|---------|-----------|-----|-----|-----------------|
| Chrome | ✅ | ✅ | ✅ (hls.js) | ✅ |
| Edge | ✅ | ✅ | ✅ (hls.js) | ✅ |
| Firefox | ✅ | ✅ | ✅ (hls.js) | ⚠️ Partial |
| Safari (desktop) | ✅ | ✅ | ✅ (native) | — |
| Mobile Safari | ✅ | ✅ (iPadOS) | ✅ (native) | ✅ |
| Chrome Android | ✅ | ✅ | ✅ (hls.js) | ✅ |

---

## 📄 License

MIT © 2026 tiwz
