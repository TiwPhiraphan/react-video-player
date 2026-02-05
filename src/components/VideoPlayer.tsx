import Hls, { type HlsConfig } from 'hls.js'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import Icon from './Icon'
import style from './VideoPlayer.module.css'

// Constants
const SEEK_SECONDS = 10
const DOUBLE_TAP_THRESHOLD_MS = 300
const CONTROL_HIDE_DELAY_MS = 2500
const CONTROL_HIDE_DELAY_WHILE_RANGING_MS = 1000
const MOUSE_MOVE_THROTTLE_MS = 200
const SEEK_MODE_TIMEOUT_MS = 1500

// Types
interface VideoPlayerProps {
	title?: string
	hls?: boolean | Partial<HlsConfig>
	source: string | { link: string; type?: 'video/mp4' | 'video/ogg' | 'video/webm' }
}

type PlaybackState = {
	isPlaying: boolean
	isEnded: boolean
	isError: boolean
	isLoading: boolean
	isMuted: boolean
	hasStartedPlaying: boolean
	currentTime: number
	duration: number
	volume: number
	playbackSpeed: number
}

type UIState = {
	isControlVisible: boolean
	isFullscreen: boolean
	isRanging: boolean
	isSettingsOpen: boolean
	activeSettingPanel: 'speed' | null
	seekStack: number
	isSeekMode: boolean
	hoverTime: number | null
	hoverX: number
}

type VideoAction =
	| { type: 'PLAY' }
	| { type: 'PAUSE' }
	| { type: 'END' }
	| { type: 'ERROR'; isLoading: boolean }
	| { type: 'LOADING'; isLoading: boolean }
	| { type: 'MUTE'; isMuted: boolean }
	| { type: 'SET_TIME'; time: number }
	| { type: 'SET_DURATION'; duration: number }
	| { type: 'SET_VOLUME'; volume: number }
	| { type: 'SET_SPEED'; speed: number }
	| { type: 'RESET' }

type UIAction =
	| { type: 'SHOW_CONTROLS' }
	| { type: 'HIDE_CONTROLS' }
	| { type: 'SET_FULLSCREEN'; isFullscreen: boolean }
	| { type: 'SET_RANGING'; isRanging: boolean }
	| { type: 'TOGGLE_SETTINGS' }
	| { type: 'CLOSE_SETTINGS' }
	| { type: 'SET_SETTING_PANEL'; panel: 'speed' | null }
	| { type: 'ADD_SEEK'; amount: number }
	| { type: 'RESET_SEEK' }
	| { type: 'SET_SEEK_MODE'; isActive: boolean }
	| { type: 'SET_HOVER'; time: number | null; x: number }

// Utility Functions
function formatTime(seconds?: number): string {
	if (seconds === undefined || Number.isNaN(seconds) || seconds < 0) return '00:00'
	const totalSeconds = Math.floor(seconds)
	const minutes = Math.floor(totalSeconds / 60)
	const secs = totalSeconds % 60
	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function isMobileDevice(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(
		navigator.userAgent
	)
}

function createThrottle<T extends (...args: unknown[]) => void>(
	func: T,
	delayMs: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null
	let lastExecutionTime = 0

	return function (this: unknown, ...args: Parameters<T>) {
		const now = Date.now()

		if (!lastExecutionTime) {
			func.apply(this, args)
			lastExecutionTime = now
		} else {
			if (timeoutId) clearTimeout(timeoutId)

			timeoutId = setTimeout(
				() => {
					if (now - lastExecutionTime >= delayMs) {
						func.apply(this, args)
						lastExecutionTime = now
					}
				},
				delayMs - (now - lastExecutionTime)
			)
		}
	}
}

// Fullscreen API helpers
async function requestFullscreen(element: HTMLDivElement): Promise<boolean> {
	interface FullscreenElement {
		requestFullscreen?: () => Promise<void>
		webkitRequestFullscreen?: () => Promise<void>
		webkitEnterFullscreen?: () => Promise<void>
		mozRequestFullScreen?: () => Promise<void>
		msRequestFullscreen?: () => Promise<void>
	}
	const el = element as FullscreenElement
	const requestMethod =
		el.requestFullscreen ||
		el.webkitRequestFullscreen ||
		el.webkitEnterFullscreen ||
		el.mozRequestFullScreen ||
		el.msRequestFullscreen

	if (requestMethod) {
		try {
			await requestMethod.call(el)
			return true
		} catch (error) {
			console.error('Failed to enter fullscreen:', error)
			return false
		}
	}
	return false
}

async function exitFullscreen(): Promise<boolean> {
	interface ExitFullscreenElement {
		exitFullscreen?: () => Promise<void>
		webkitExitFullscreen?: () => Promise<void>
		mozCancelFullScreen?: () => Promise<void>
		msExitFullscreen?: () => Promise<void>
	}
	const doc = document as ExitFullscreenElement
	const exitMethod =
		doc.exitFullscreen ||
		doc.webkitExitFullscreen ||
		doc.mozCancelFullScreen ||
		doc.msExitFullscreen

	if (exitMethod) {
		try {
			await exitMethod.call(doc)
			return true
		} catch (error) {
			console.error('Failed to exit fullscreen:', error)
			return false
		}
	}
	return false
}

function isFullscreenSupported(): boolean {
	interface FullScreenSupport {
		fullscreenEnabled?: boolean
		webkitFullscreenEnabled?: boolean
		mozFullScreenEnabled?: boolean
		msFullscreenEnabled?: boolean
	}
	const doc = document as FullScreenSupport
	return !!(
		doc.fullscreenEnabled ||
		doc.webkitFullscreenEnabled ||
		doc.mozFullScreenEnabled ||
		doc.msFullscreenEnabled
	)
}

// Picture-in-Picture API helpers
async function requestPictureInPicture(
	video: HTMLVideoElement
): Promise<PictureInPictureWindow | null> {
	if (
		!('pictureInPictureEnabled' in document) ||
		typeof video.requestPictureInPicture !== 'function'
	) {
		console.error('Picture-in-Picture is not supported')
		return null
	}

	try {
		if (video.paused) {
			await video.play().catch(() => {
				console.warn('Auto-play was prevented')
			})
		}
		return await video.requestPictureInPicture()
	} catch (error) {
		console.error('Failed to enter Picture-in-Picture:', error)
		return null
	}
}

async function exitPictureInPicture(video: HTMLVideoElement): Promise<boolean> {
	if (
		video.disablePictureInPicture === false &&
		'pictureInPictureElement' in document &&
		document.pictureInPictureElement
	) {
		try {
			await document.exitPictureInPicture()
			return true
		} catch (error) {
			console.error('Failed to exit Picture-in-Picture:', error)
			return false
		}
	}
	return false
}

function isPictureInPictureSupported(): boolean {
	return (
		'pictureInPictureEnabled' in document &&
		'requestPictureInPicture' in HTMLVideoElement.prototype
	)
}

// Screen Orientation API helper
async function lockOrientation(video: HTMLVideoElement, isFullscreen: boolean): Promise<void> {
	const isLandscape = video.videoWidth > video.videoHeight

	if (
		typeof window !== 'undefined' &&
		window.screen &&
		'orientation' in window.screen &&
		window.screen.orientation &&
		'lock' in window.screen.orientation &&
		typeof window.screen.orientation.lock === 'function' &&
		isLandscape &&
		isFullscreen
	) {
		try {
			await window.screen.orientation.lock('landscape')
		} catch (error) {
			console.warn('Failed to lock orientation:', error)
		}
	}
}

// Reducers
function playbackReducer(state: PlaybackState, action: VideoAction): PlaybackState {
	switch (action.type) {
		case 'PLAY':
			return { ...state, isPlaying: true, isEnded: false, hasStartedPlaying: true }
		case 'PAUSE':
			return { ...state, isPlaying: false }
		case 'END':
			return { ...state, isEnded: true, isPlaying: false }
		case 'ERROR':
			return {
				...state,
				isError: true,
				isLoading: false,
				isEnded: true,
				hasStartedPlaying: false
			}
		case 'LOADING':
			return { ...state, isLoading: action.isLoading }
		case 'MUTE':
			return { ...state, isMuted: action.isMuted }
		case 'SET_TIME':
			return { ...state, currentTime: action.time }
		case 'SET_DURATION':
			return { ...state, duration: action.duration }
		case 'SET_VOLUME':
			return { ...state, volume: action.volume }
		case 'SET_SPEED':
			return { ...state, playbackSpeed: action.speed }
		case 'RESET':
			return {
				isPlaying: false,
				isEnded: false,
				isLoading: false,
				isError: false,
				isMuted: state.isMuted,
				hasStartedPlaying: false,
				currentTime: 0,
				duration: 0,
				volume: state.volume,
				playbackSpeed: state.playbackSpeed
			}
		default:
			return state
	}
}

function uiReducer(state: UIState, action: UIAction): UIState {
	switch (action.type) {
		case 'SHOW_CONTROLS':
			return { ...state, isControlVisible: true }
		case 'HIDE_CONTROLS':
			return { ...state, isControlVisible: false }
		case 'SET_FULLSCREEN':
			return { ...state, isFullscreen: action.isFullscreen }
		case 'SET_RANGING':
			return { ...state, isRanging: action.isRanging }
		case 'TOGGLE_SETTINGS':
			return {
				...state,
				isSettingsOpen: !state.isSettingsOpen,
				isRanging: !state.isRanging,
				activeSettingPanel: state.isSettingsOpen ? null : state.activeSettingPanel
			}
		case 'CLOSE_SETTINGS':
			return { ...state, isSettingsOpen: false, activeSettingPanel: null }
		case 'SET_SETTING_PANEL':
			return { ...state, activeSettingPanel: action.panel }
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
		case 'SET_HOVER':
			return { ...state, hoverTime: action.time, hoverX: action.x }
		default:
			return state
	}
}

export default function VideoPlayer({ source, title, hls }: VideoPlayerProps) {
	// Parse source
	const videoUrl = typeof source === 'string' ? source : source.link
	const videoMimeType =
		typeof source === 'object' && typeof source.type === 'string' ? source.type : 'video/mp4'

	// Refs
	const videoRef = useRef<HTMLVideoElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const controlHideTimerRef = useRef<NodeJS.Timeout | null>(null)
	const seekModeTimerRef = useRef<NodeJS.Timeout | null>(null)
	const animationFrameRef = useRef<number | null>(null)
	const lastDoubleTapTimeRef = useRef(0)
	const hlsInstanceRef = useRef<Hls | null>(null)
	const isMobile = useRef(isMobileDevice())

	// State
	const [playbackState, dispatchPlayback] = useReducer(playbackReducer, {
		isPlaying: false,
		isEnded: false,
		isLoading: false,
		isError: false,
		isMuted: false,
		hasStartedPlaying: false,
		currentTime: 0,
		duration: 0,
		volume: 1,
		playbackSpeed: 1
	})

	const [uiState, dispatchUI] = useReducer(uiReducer, {
		isControlVisible: false,
		isFullscreen: false,
		isRanging: false,
		isSettingsOpen: false,
		activeSettingPanel: null,
		seekStack: 0,
		isSeekMode: false,
		hoverTime: null,
		hoverX: 0
	})

	// Helper to safely execute video operations
	const executeVideoOperation = useCallback(
		async <T,>(operation: (video: HTMLVideoElement) => Promise<T> | T): Promise<T | null> => {
			if (videoRef.current) {
				try {
					return await operation(videoRef.current)
				} catch (error) {
					console.error('Video operation failed:', error)
					return null
				}
			}
			return null
		},
		[]
	)

	// Playback controls
	const togglePlayPause = useCallback(() => {
		executeVideoOperation(async (video) => {
			if (video.paused) {
				await video.play()
			} else {
				video.pause()
			}
		})
	}, [executeVideoOperation])

	const play = useCallback(() => {
		executeVideoOperation(async (video) => {
			await video.play()
		})
	}, [executeVideoOperation])

	const toggleMute = useCallback(() => {
		executeVideoOperation((video) => {
			video.muted = !video.muted
			dispatchPlayback({ type: 'MUTE', isMuted: video.muted })
		})
	}, [executeVideoOperation])

	const setVolume = useCallback(
		(newVolume: number) => {
			executeVideoOperation((video) => {
				video.volume = newVolume
				dispatchPlayback({ type: 'SET_VOLUME', volume: newVolume })
				if (video.muted) {
					video.muted = false
					dispatchPlayback({ type: 'MUTE', isMuted: false })
				}
			})
		},
		[executeVideoOperation]
	)

	const setCurrentTime = useCallback(
		(time: number) => {
			executeVideoOperation((video) => {
				video.currentTime = time
				dispatchPlayback({ type: 'SET_TIME', time })
			})
		},
		[executeVideoOperation]
	)

	const setPlaybackSpeed = useCallback(
		(speed: number) => {
			executeVideoOperation((video) => {
				video.playbackRate = speed
				dispatchPlayback({ type: 'SET_SPEED', speed })
			})
			dispatchUI({ type: 'CLOSE_SETTINGS' })
		},
		[executeVideoOperation]
	)

	// Seek functionality
	const handleSeekModeChange = useCallback(() => {
		if (seekModeTimerRef.current) {
			clearTimeout(seekModeTimerRef.current)
		}

		dispatchUI({ type: 'SET_SEEK_MODE', isActive: true })

		seekModeTimerRef.current = setTimeout(() => {
			dispatchUI({ type: 'SET_SEEK_MODE', isActive: false })
			dispatchUI({ type: 'RESET_SEEK' })
			seekModeTimerRef.current = null
		}, SEEK_MODE_TIMEOUT_MS)
	}, [])

	const seekVideo = useCallback(
		(direction: '-' | '+') => {
			executeVideoOperation((video) => {
				const seekAmount = direction === '+' ? SEEK_SECONDS : -SEEK_SECONDS
				video.currentTime += seekAmount
				dispatchUI({ type: 'ADD_SEEK', amount: seekAmount })
				handleSeekModeChange()
			})
		},
		[executeVideoOperation, handleSeekModeChange]
	)

	const handleDoubleTapSeek = useCallback(
		(direction: '-' | '+') => {
			if (!isMobile.current) return

			const now = Date.now()
			const timeSinceLastTap = now - lastDoubleTapTimeRef.current
			const isDoubleTap = timeSinceLastTap > 0 && timeSinceLastTap < DOUBLE_TAP_THRESHOLD_MS
			const shouldSeek = isDoubleTap || uiState.isSeekMode

			if (shouldSeek) {
				if (!uiState.isSeekMode) {
					dispatchUI({ type: 'SET_SEEK_MODE', isActive: true })
				}
				seekVideo(direction)
			}

			lastDoubleTapTimeRef.current = now
		},
		[uiState.isSeekMode, seekVideo]
	)

	// Fullscreen controls
	const toggleFullscreen = useCallback(() => {
		if (!isFullscreenSupported() || !containerRef.current) return

		if (document.fullscreenElement) {
			exitFullscreen()
		} else {
			requestFullscreen(containerRef.current)
		}
	}, [])

	// Picture-in-Picture controls
	const togglePictureInPicture = useCallback(() => {
		if (!isPictureInPictureSupported() || !videoRef.current) return

		if (document.pictureInPictureElement) {
			exitPictureInPicture(videoRef.current)
		} else {
			requestPictureInPicture(videoRef.current)
		}
	}, [])

	// Control visibility management
	const showControls = useCallback(
		(hideDelayMs = CONTROL_HIDE_DELAY_MS) => {
			if (!playbackState.isPlaying) return

			if (controlHideTimerRef.current) {
				clearTimeout(controlHideTimerRef.current)
			}

			dispatchUI({ type: 'SHOW_CONTROLS' })

			controlHideTimerRef.current = setTimeout(() => {
				if (!uiState.isRanging) {
					dispatchUI({ type: 'HIDE_CONTROLS' })
				}
				controlHideTimerRef.current = null
			}, hideDelayMs)
		},
		[playbackState.isPlaying, uiState.isRanging]
	)

	const hideControls = useCallback(() => {
		dispatchUI({ type: 'HIDE_CONTROLS' })
		if (controlHideTimerRef.current) {
			clearTimeout(controlHideTimerRef.current)
			controlHideTimerRef.current = null
		}
	}, [])

	// Mouse/touch handlers
	const handleMouseMove = useMemo(
		() =>
			createThrottle(() => {
				if (playbackState.isPlaying) {
					showControls()
				}
			}, MOUSE_MOVE_THROTTLE_MS),
		[playbackState.isPlaying, showControls]
	)

	const handleProgressBarHover = useCallback(
		(e: React.MouseEvent<HTMLInputElement>) => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}

			const target = e.currentTarget
			animationFrameRef.current = requestAnimationFrame(() => {
				animationFrameRef.current = null
				const rect = target.getBoundingClientRect()
				const x = e.clientX - rect.left
				const percentage = Math.min(Math.max(x / rect.width, 0), 1)

				const video = videoRef.current
				let time = 0
	
				if (video && video.seekable.length > 0) {
					const start = video.seekable.start(0)
					const end = video.seekable.end(video.seekable.length - 1)
					time = start + percentage * (end - start)
				} else {
					time = percentage * playbackState.duration
				}

				dispatchUI({ type: 'SET_HOVER', time, x })
			})
		},
		[playbackState.duration]
	)

	const handleProgressBarLeave = useCallback(() => {
		dispatchUI({ type: 'SET_HOVER', time: null, x: 0 })
	}, [])

	// Video event handlers
	const handleTimeUpdate = useCallback(
		(event: React.SyntheticEvent<HTMLVideoElement>) => {
			const newTime = event.currentTarget.currentTime
			const timeDifference = Math.abs(newTime - playbackState.currentTime)

			// Only update if time changed by more than 1 second or crossed a second boundary
			if (
				timeDifference > 1 ||
				Math.floor(newTime) !== Math.floor(playbackState.currentTime)
			) {
				dispatchPlayback({ type: 'SET_TIME', time: newTime })
			}
		},
		[playbackState.currentTime]
	)

	// Computed values
	const bufferedPercentage = useMemo(() => {
		if (!videoRef.current || !playbackState.duration) return 0

		const buffered = videoRef.current.buffered
		if (buffered.length === 0) return 0

		let bufferedEnd = 0
		for (let i = 0; i < buffered.length; i++) {
			if (
				buffered.start(i) <= playbackState.currentTime &&
				buffered.end(i) > playbackState.currentTime
			) {
				bufferedEnd = buffered.end(i)
				break
			}
		}

		return (bufferedEnd / playbackState.duration) * 100
	}, [playbackState.currentTime, playbackState.duration])

	const progressPercentage = useMemo(() => {
		return playbackState.duration > 0
			? (playbackState.currentTime / playbackState.duration) * 100
			: 0
	}, [playbackState.currentTime, playbackState.duration])

	// Initialize HLS
	useEffect(() => {
		dispatchPlayback({ type: 'RESET' })
		dispatchUI({ type: 'RESET_SEEK' })
		dispatchUI({ type: 'SET_SEEK_MODE', isActive: false })
		dispatchUI({ type: 'SET_RANGING', isRanging: false })
		dispatchUI({ type: 'CLOSE_SETTINGS' })

		if (hls && Hls.isSupported() && videoRef.current) {
			const hlsInstance = new Hls(typeof hls === 'boolean' ? undefined : hls)
			hlsInstanceRef.current = hlsInstance
			hlsInstance.loadSource(videoUrl)
			hlsInstance.attachMedia(videoRef.current)
			hlsInstance.on(Hls.Events.ERROR, () =>
				dispatchPlayback({ type: 'ERROR', isLoading: false })
			)
			// Stop loading when video ends (for live streams without EXT-X-ENDLIST)
			const handleVideoEnded = () => {
				if (hlsInstance) {
					hlsInstance.stopLoad()
				}
			}

			hlsInstance.on(Hls.Events.ERROR, (event, data) => {
				console.error('HLS Error:', event, data)
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							console.error('Fatal network error, trying to recover...')
							hlsInstance.startLoad()
							break
						case Hls.ErrorTypes.MEDIA_ERROR:
							console.error('Fatal media error, trying to recover...')
							hlsInstance.recoverMediaError()
							break
						default:
							console.error('Fatal error, cannot recover')
							hlsInstance.destroy()
							break
					}
				}
			})

			if (videoRef.current) {
				videoRef.current.addEventListener('ended', handleVideoEnded)
			}

			return () => {
				if (videoRef.current) {
					videoRef.current.removeEventListener('ended', handleVideoEnded)
				}
				hlsInstance.destroy()
				hlsInstanceRef.current = null
			}
		}
	}, [videoUrl, hls])

	// Sync playback speed
	useEffect(() => {
		executeVideoOperation((video) => {
			video.playbackRate = playbackState.playbackSpeed
		})
	}, [playbackState.playbackSpeed, executeVideoOperation])

	// Show controls when ranging
	useEffect(() => {
		if (uiState.isRanging) {
			showControls(CONTROL_HIDE_DELAY_WHILE_RANGING_MS)
		}
	}, [uiState.isRanging, showControls])

	// Fullscreen change handler
	useEffect(() => {
		const handleFullscreenChange = async () => {
			if (containerRef.current && videoRef.current) {
				const isCurrentlyFullscreen = document.fullscreenElement === containerRef.current
				dispatchUI({ type: 'SET_FULLSCREEN', isFullscreen: isCurrentlyFullscreen })

				if (isCurrentlyFullscreen) {
					await lockOrientation(videoRef.current, true)
				}
			}
		}

		document.addEventListener('fullscreenchange', handleFullscreenChange)
		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange)
		}
	}, [])

	// Keyboard shortcuts (desktop only)
	useEffect(() => {
		if (isMobile.current) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if ([' ', 'f', 'p', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
				event.preventDefault()
			}

			switch (event.key) {
				case ' ':
					togglePlayPause()
					break
				case 'f':
					toggleFullscreen()
					break
				case 'p':
					togglePictureInPicture()
					break
				case 'ArrowLeft':
					seekVideo('-')
					break
				case 'ArrowRight':
					seekVideo('+')
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [togglePlayPause, toggleFullscreen, togglePictureInPicture, seekVideo])

	// Cleanup timers and animation frames
	useEffect(() => {
		return () => {
			if (controlHideTimerRef.current) {
				clearTimeout(controlHideTimerRef.current)
			}
			if (seekModeTimerRef.current) {
				clearTimeout(seekModeTimerRef.current)
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [])

	// Determine control visibility class
	const controlVisibilityClass = isMobile.current
		? !playbackState.isPlaying || uiState.isControlVisible
			? style.visit
			: style.invisit
		: !playbackState.isPlaying || uiState.isControlVisible
			? style.opacity1
			: style.opacity0

	return (
		<div className={style.videoContainer} key={videoUrl}>
			<div
				className={style.wrapper}
				ref={containerRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={hideControls}>
				<video
					ref={videoRef}
					playsInline
					preload='metadata'
					controls={false}
					className={style.video}
					onTimeUpdate={handleTimeUpdate}
					onDurationChange={(e) =>
						dispatchPlayback({
							type: 'SET_DURATION',
							duration: e.currentTarget.duration
						})
					}
					onLoadedMetadata={(e) =>
						dispatchPlayback({
							type: 'SET_DURATION',
							duration: e.currentTarget.duration
						})
					}
					onVolumeChange={(e) =>
						dispatchPlayback({ type: 'SET_VOLUME', volume: e.currentTarget.volume })
					}
					onCanPlayThrough={() => dispatchPlayback({ type: 'LOADING', isLoading: false })}
					onCanPlay={() => dispatchPlayback({ type: 'LOADING', isLoading: false })}
					onWaiting={() => dispatchPlayback({ type: 'LOADING', isLoading: true })}
					onPlaying={() => dispatchPlayback({ type: 'LOADING', isLoading: false })}
					onLoadStart={() => dispatchPlayback({ type: 'RESET' })}
					onError={() => dispatchPlayback({ type: 'ERROR', isLoading: false })}
					onEnded={() => dispatchPlayback({ type: 'END' })}
					onPlay={() => dispatchPlayback({ type: 'PLAY' })}
					onPause={() => dispatchPlayback({ type: 'PAUSE' })}>
					<source src={hls ? undefined : videoUrl} type={videoMimeType} />
				</video>

				{/* Controls overlay */}
				<div className={`${style.controller} ${controlVisibilityClass}`}>
					{/* Title */}
					<h1 className={style.title}>
						<p>{title}</p>
					</h1>

					{/* Center tap areas for mobile seek */}
					<div
						className={style.center}
						onClick={!isMobile.current ? togglePlayPause : undefined}>
						<div onClick={() => handleDoubleTapSeek('-')} />
						<div onClick={() => handleDoubleTapSeek('+')} />
					</div>

					{/* Bottom controls */}
					<div className={style.controls}>
						{/* Progress bar */}
						<div className={style.timeWrapper}>
							<article>{formatTime(playbackState.currentTime)}</article>
							<div className={style.timeControl}>
								<div className={style.backProcess} />
								<div
									className={style.progressBar}
									style={{ width: `${bufferedPercentage}%` }}
								/>
								<div
									className={style.hoverTime}
									style={{
										left: uiState.hoverX - 27,
										display: !uiState.hoverTime ? 'none' : undefined
									}}>
									{formatTime(uiState.hoverTime || 0)}
								</div>
								<input
									type='range'
									step='any'
									max={playbackState.duration}
									value={playbackState.currentTime}
									className={style.rangeTime}
									aria-label='Video progress'
									onFocus={(e) => e.currentTarget.blur()}
									onPointerDown={() =>
										dispatchUI({ type: 'SET_RANGING', isRanging: true })
									}
									onPointerUp={() =>
										dispatchUI({ type: 'SET_RANGING', isRanging: false })
									}
									onPointerCancel={() =>
										dispatchUI({ type: 'SET_RANGING', isRanging: false })
									}
									onChange={(e) => setCurrentTime(+e.currentTarget.value)}
									onMouseMove={handleProgressBarHover}
									onMouseLeave={handleProgressBarLeave}
									style={{
										backgroundImage: `linear-gradient(to right, #00b2ff ${progressPercentage}%, #0000 ${progressPercentage}%)`
									}}
								/>
							</div>
							<article>{formatTime(playbackState.duration)}</article>
						</div>

						{/* Volume control */}
						<div className={style.volumeWrapper}>
							<button
								type='button'
								onClick={toggleMute}
								aria-label={playbackState.isMuted ? 'Unmute' : 'Mute'}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon
									name={
										playbackState.isMuted || playbackState.volume === 0
											? 'muted'
											: 'volume'
									}
								/>
							</button>
							<input
								type='range'
								max={1}
								step='any'
								value={playbackState.isMuted ? 0 : playbackState.volume}
								className={
									style.rangeVolume +
									(isMobile.current ? ` ${style.hideOnMobile}` : '')
								}
								aria-label='Volume'
								onFocus={(e) => e.currentTarget.blur()}
								onChange={(e) => setVolume(+e.currentTarget.value)}
								style={{
									backgroundImage: `linear-gradient(to right, #00b2ff ${!playbackState.isMuted ? playbackState.volume * 100 : 0}%, #fff5 ${!playbackState.isMuted ? playbackState.volume * 100 : 0}%)`
								}}
							/>
						</div>

						{/* Picture-in-Picture button */}
						<div>
							<button
								type='button'
								onClick={togglePictureInPicture}
								aria-label='Picture in Picture'
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name='pip' />
							</button>
						</div>

						{/* Fullscreen button */}
						<div>
							<button
								type='button'
								onClick={toggleFullscreen}
								aria-label={uiState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name={uiState.isFullscreen ? 'unfullscreen' : 'fullscreen'} />
							</button>
						</div>

						{/* Settings button */}
						<div className={style.btnSetting}>
							<button
								type='button'
								onClick={() => dispatchUI({ type: 'TOGGLE_SETTINGS' })}
								aria-label='Settings'
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name='setting' />
							</button>
							<div
								className={style.customSelect}
								style={{ display: !uiState.isSettingsOpen ? 'none' : undefined }}>
								<div
									className={style.speedControl}
									onClick={() =>
										dispatchUI({
											type: 'SET_SETTING_PANEL',
											panel:
												uiState.activeSettingPanel === 'speed'
													? null
													: 'speed'
										})
									}>
									ความเร็วในการเล่น
								</div>
								{uiState.activeSettingPanel === 'speed' && (
									<ul className={style.speedList}>
										{[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((speed) => (
											<li
												key={speed}
												className={style.speedMenu}
												style={{
													backgroundColor:
														playbackState.playbackSpeed === speed
															? '#eeee'
															: undefined
												}}
												onClick={() => setPlaybackSpeed(speed)}>
												{speed}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>

					{/* Center play/pause button */}
					<Icon
						name={
							playbackState.isLoading
								? 'hide'
								: playbackState.isEnded
									? 'restart'
									: !playbackState.isPlaying
										? 'play'
										: 'pause'
						}
						bigger
						className={style.absoluteCenter}
						onClick={togglePlayPause}
					/>
				</div>

				{/* Seek indicators */}
				{uiState.seekStack < 0 && (
					<div inert key={uiState.seekStack} className={style.seekLeft}>
						{uiState.seekStack.toString()}
					</div>
				)}
				{uiState.seekStack > 0 && (
					<div inert key={uiState.seekStack} className={style.seekRight}>
						{`+${uiState.seekStack.toString()}`}
					</div>
				)}

				{/* Loading indicator */}
				{playbackState.isLoading && (
					<div className={style.loadingContainer}>
						<Icon name='loading' />
					</div>
				)}

				{/* Initial play button */}
				{!playbackState.hasStartedPlaying && (
					<div className={style.playFirstContainer}>
						<button
							type='button'
							aria-label='Play video'
							className={style.btnCenterPlay}
							style={{ cursor: playbackState.isError ? 'default' : 'pointer' }}
							onFocus={(e) => e.currentTarget.blur()}
							onClick={() => {
								if (!playbackState.isError) {
									dispatchPlayback({ type: 'PLAY' })
									play()
								}
							}}>
							<Icon name={playbackState.isError ? 'error' : 'play'} bigger size={6} />
							{playbackState.isError && (
								<p className={style.errorMessage}>Can't play this video</p>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
