import type { PlaybackAction, PlaybackState, UIAction, UIState } from './types'

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
	switch (action.type) {
		case 'SET_VOLUME':
			return { ...state, volume: action.volume }
		case 'SET_PAUSED':
			return { ...state, isPaused: action.isPaused }
		case 'SET_DURATION':
			return { ...state, durationTime: action.duration }
		case 'SET_CURRENT_TIME':
			return { ...state, currentTime: action.time }
		case 'SET_PLAYBACK_SPEED':
			return { ...state, playbackSpeed: action.speed }
		default:
			return state
	}
}

export function UIReducer(state: UIState, action: UIAction) {
	switch (action.type) {
		case 'SET_CONTROLS_VISIBLE':
			return { ...state, isControlsVisible: action.visible }
		case 'SET_SETTING_PANEL':
			return { ...state, settingPanel: action.name }
		case 'SET_HOVER_TIME':
			return { ...state, hoverTime: { x: action.x, time: action.time } }
		case 'SET_FULLSCREEN':
			return { ...state, isFullscreen: action.active }
		case 'SET_LOADING':
			return { ...state, isLoading: action.loading }
		case 'SET_SETTING':
			return { ...state, isSettingsVisible: action.active }
		case 'SET_MUTED':
			return { ...state, isMuted: action.muted }
		case 'SET_ERROR':
			return { ...state, isError: action.error, isLoading: false }
		case 'ADD_SEEK':
			return {
				...state,
				seekStack:
					action.amount > 0
						? state.seekStack < 0
							? action.amount
							: state.seekStack + action.amount
						: state.seekStack > 0
							? action.amount
							: state.seekStack + action.amount
			}
		case 'RESET_SEEK':
			return { ...state, seekStack: 0 }
		case 'SET_SEEK_MODE':
			return { ...state, isSeekMode: action.isActive }
		default:
			return state
	}
}
