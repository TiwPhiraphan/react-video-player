import { VideoPlayer } from '../../src'

function App() {

	return (
		<div style={{ width: '760px', maxWidth: '100%' }}>
			<VideoPlayer source={[
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
			]} />
		</div>
	)
}

export default App
