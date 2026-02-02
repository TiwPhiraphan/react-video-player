import { VideoPlayer } from '../../src/index'
import './App.css'

function App() {
  return (
    <div style={{ width: '90%', maxWidth: '1024px', marginInline: 'auto' }}>
      <VideoPlayer hls source='https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' />
    </div>
  )
}

export default App
