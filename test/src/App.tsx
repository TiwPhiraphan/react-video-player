import { VideoPlayer } from '../../src/index'

function App() {

	return (
		<div style={{ width: '760px', maxWidth: '100%' }}>
			<VideoPlayer hls track={{ src: '/th.vtt', lang: 'th' }} source='https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' />
			{/* <VideoPlayer source={[
				{
					src: './Big Buck Bunny 720p.mp4',
					quality: 720
				},
				{
					src: './Big Buck Bunny 480p.mp4',
					quality: 480
				},
				{
					src: './Big Buck Bunny 360p.mp4',
					quality: 360
				},
				{
					src: './Big Buck Bunny 240p.mp4',
					quality: 240
				},
				{
					src: './Big Buck Bunny 144p.mp4',
					quality: 144
				},
			]} /> */}
		</div>
	)
}

export default App
