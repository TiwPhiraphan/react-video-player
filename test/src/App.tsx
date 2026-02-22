import { VideoPlayer } from '../../src/index'

function App() {

	return (
		<div style={{ width: '760px', maxWidth: '100%' }}>
			{/* <VideoPlayer hls track={{ src: '/th.vtt', lang: 'th' }} source='https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' /> */}
			<VideoPlayer track={{ src: '/th.vtt', lang: 'th' }} source={[
				{
					src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
					quality: 720
				},
				{
					src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
					quality: 480
				},
				{
					src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
					quality: 360
				},
				{
					src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
					quality: 240
				},
				{
					src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
					quality: 144
				},
			]} />
		</div>
	)
}

export default App
