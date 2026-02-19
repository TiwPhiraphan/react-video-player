import type { HlsConfig } from 'hls.js'

export type VideoSourceQuality = {
	src: string
	quality: number
}

export type VideoPlayerProps = {
	title?: string
	poster?: string
	hls?: boolean | Partial<HlsConfig>
	source: string | VideoSourceQuality[]
}

export type PlaybackState = {
	volume: number
	isPaused: boolean
	currentTime: number
	durationTime: number
	playbackSpeed: number
}

export type PlaybackAction =
	| { type: 'SET_VOLUME'; volume: number }
	| { type: 'SET_PAUSED'; isPaused: boolean }
	| { type: 'SET_DURATION'; duration: number }
	| { type: 'SET_CURRENT_TIME'; time: number }
	| { type: 'SET_PLAYBACK_SPEED'; speed: number }

export type UIState = {
	isMuted: boolean
	isError: boolean
	seekStack: number
	isLoading: boolean
	isSeekMode: boolean
	isFullscreen: boolean
	isSettingsVisible: boolean
	isControlsVisible: boolean
	settingPanel: 'speed' | 'quality' | null
	hoverTime: { x: number | null; time: number }
}

export type UIAction =
	| { type: 'SET_SETTING_PANEL'; name: UIState['settingPanel'] }
	| { type: 'SET_HOVER_TIME'; x: number | null; time: number }
	| { type: 'SET_CONTROLS_VISIBLE'; visible: boolean }
	| { type: 'SET_SEEK_MODE'; isActive: boolean }
	| { type: 'SET_FULLSCREEN'; active: boolean }
	| { type: 'SET_LOADING'; loading: boolean }
	| { type: 'SET_SETTING'; active: boolean }
	| { type: 'SET_ERROR'; error: boolean }
	| { type: 'SET_MUTED'; muted: boolean }
	| { type: 'ADD_SEEK'; amount: number }
	| { type: 'RESET_SEEK' }
