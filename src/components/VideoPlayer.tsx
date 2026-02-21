import Hls from 'hls.js'
import type { ChangeEvent, CSSProperties, MouseEvent, SyntheticEvent } from 'react'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { playbackReducer, UIReducer } from './reducer'
import SvgIcon from './SvgIcon'
import style from './style.module.css'
import type { VideoPlayerProps } from './types'
import {
	createThrottle,
	exitFullscreen,
	exitPictureInPicture,
	formatQuality,
	formatTime,
	isFullscreenSupported,
	isMobileDevice,
	isPictureInPictureSupported,
	lockOrientation,
	requestFullscreen,
	requestPictureInPicture
} from './utils'

export function VideoPlayer({ title, poster, source, track, hls }: VideoPlayerProps) {
	const resumeTimeRef = useRef(0)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)
	const controlHideTimerRef = useRef<NodeJS.Timeout | null>(null)
	const videoSourcesRef = useRef(typeof source === 'string' ? [{ src: source, quality: 0 }] : [...source].sort((a, b) => b.quality - a.quality))
	const hlsRef = useRef<import('hls.js').default | null>(null)
	const isMobile = useMemo(() => isMobileDevice(), [])

	const [playbackState, dispatchPlayback] = useReducer(playbackReducer, {
		volume: 1,
		isPaused: true,
		currentTime: 0,
		durationTime: 0,
		isLoaded: false,
		playbackSpeed: 1
	})

	const [uiState, dispatchUI] = useReducer(UIReducer, {
		seekStack: 0,
		isMuted: false,
		isError: false,
		isLoading: true,
		isSubtitle: true,
		isSeekMode: false,
		settingPanel: null,
		isFullscreen: false,
		isControlsVisible: true,
		isSettingsVisible: false,
		hoverTime: { x: null, time: 0 }
	})

	const [quality, setQuality] = useState(0)
	const [currentSubtitle, setCurrentSubtitle] = useState('')

	useEffect(() => {
		const video = videoRef.current
		if (!video || !hls) return
		const src = videoSourcesRef.current[quality].src

		if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = src
			return
		}

		if (!Hls.isSupported()) return

		hlsRef.current?.destroy()
		const instance = new Hls(typeof hls === 'object' ? hls : {})
		hlsRef.current = instance
		instance.loadSource(src)
		instance.attachMedia(video)
		instance.on(Hls.Events.ERROR, (_, data) => {
			if (!data.fatal) return
			switch (data.type) {
				case Hls.ErrorTypes.NETWORK_ERROR:
				case Hls.ErrorTypes.MEDIA_ERROR:
					dispatchUI({ type: 'SET_ERROR', error: true })
					break
			}
		})
		instance.on(Hls.Events.MANIFEST_PARSED, () => {
			if (resumeTimeRef.current > 0) {
				video.currentTime = resumeTimeRef.current
				video.play()
			}
		})

		return () => {
			hlsRef.current?.destroy()
			hlsRef.current = null
		}
	}, [quality, hls])

	const withVideo = useCallback(async <T,>(operation: (video: HTMLVideoElement) => Promise<T> | T): Promise<T | null> => {
		if (videoRef.current) {
			try {
				return await operation(videoRef.current)
			} catch (error) {
				console.error('Video operation failed:', error)
				return null
			}
		}
		return null
	}, [])

	const currentTimeRef = useRef(playbackState.currentTime)
	const isControlsVisibleRef = useRef(uiState.isControlsVisible)

	useEffect(() => {
		currentTimeRef.current = playbackState.currentTime
		isControlsVisibleRef.current = uiState.isControlsVisible
	}, [playbackState.currentTime, uiState.isControlsVisible])

	const handleTimeUpdate = useCallback((event: SyntheticEvent<HTMLVideoElement>) => {
		if (!isControlsVisibleRef.current) return
		const newTime = event.currentTarget.currentTime
		const timeDifference = Math.abs(newTime - currentTimeRef.current)
		if (timeDifference > 1 || Math.floor(newTime) !== Math.floor(currentTimeRef.current)) {
			dispatchPlayback({ type: 'SET_CURRENT_TIME', time: newTime })
		}
	}, [])

	const handleTogglePlayPause = useCallback(() => {
		withVideo(async (video) => {
			if (video.paused) {
				await video.play()
			} else {
				video.pause()
			}
		})
	}, [withVideo])

	const handleToggleFullscreen = useCallback(async () => {
		if (!isFullscreenSupported() || !wrapperRef.current) return
		if (document.fullscreenElement) {
			await exitFullscreen()
		} else {
			await requestFullscreen(wrapperRef.current)
		}
	}, [])

	const handleToggleMute = useCallback(() => {
		withVideo((video) => {
			if (!video.muted && video.volume === 0) {
				video.volume = 1
				video.muted = false
				dispatchUI({ type: 'SET_MUTED', muted: false })
			} else {
				video.muted = !video.muted
				dispatchUI({ type: 'SET_MUTED', muted: video.muted })
			}
		})
	}, [])

	const handleTogglePIP = useCallback(async () => {
		withVideo(async (video) => {
			if (!isPictureInPictureSupported()) return
			if (document.pictureInPictureElement === video) await exitPictureInPicture()
			else await requestPictureInPicture(video)
		})
	}, [])

	const hideControls = useCallback(() => {
		dispatchUI({ type: 'SET_CONTROLS_VISIBLE', visible: false })
		if (controlHideTimerRef.current) {
			clearTimeout(controlHideTimerRef.current)
			controlHideTimerRef.current = null
		}
	}, [])

	const showControls = useCallback(
		(hideDelayMs = 2500) => {
			if (controlHideTimerRef.current) {
				clearTimeout(controlHideTimerRef.current)
			}
			dispatchUI({ type: 'SET_CONTROLS_VISIBLE', visible: true })
			controlHideTimerRef.current = setTimeout(hideControls, hideDelayMs)
		},
		[hideControls]
	)

	const seekToTime = useCallback(
		(time: number) => {
			if (!uiState.isControlsVisible) return
			withVideo((video) => {
				video.currentTime = time
				dispatchPlayback({ type: 'SET_CURRENT_TIME', time })
				showControls()
			})
		},
		[withVideo, uiState.isControlsVisible, showControls]
	)

	const throttledMouseMove = useMemo(
		() =>
			createThrottle(() => {
				showControls()
			}, 200),
		[showControls]
	)

	const handleMouseMove = useCallback(() => {
		throttledMouseMove()
	}, [throttledMouseMove])

	const handleMouseLeave = useCallback(() => {
		hideControls()
	}, [hideControls])

	const handleProgressBarHover = useCallback(
		(e: MouseEvent<HTMLInputElement>) => {
			const target = e.currentTarget
			const rect = target.getBoundingClientRect()
			const x = e.clientX - rect.left
			const percentage = Math.min(Math.max(x / rect.width, 0), 1)
			const time = percentage * playbackState.durationTime
			dispatchUI({ type: 'SET_HOVER_TIME', x, time })
		},
		[playbackState.durationTime]
	)

	const handleProgressBarTouchMove = useCallback(
		(e: React.TouchEvent<HTMLInputElement>) => {
			const target = e.currentTarget
			const rect = target.getBoundingClientRect()
			const x = e.touches[0].clientX - rect.left
			const percentage = Math.min(Math.max(x / rect.width, 0), 1)
			const time = percentage * playbackState.durationTime
			dispatchUI({ type: 'SET_HOVER_TIME', x, time })
			seekToTime(time)
		},
		[playbackState.durationTime, seekToTime]
	)

	const handleProgressBarBlur = useCallback(() => {
		dispatchUI({ type: 'SET_HOVER_TIME', x: null, time: 0 })
	}, [])

	const handleVolumeChange = useCallback((e: ChangeEvent<HTMLVideoElement>) => {
		dispatchPlayback({ type: 'SET_VOLUME', volume: e.currentTarget.volume })
	}, [])

	const handleSeekVolume = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		withVideo((video) => {
			video.volume = +e.currentTarget.value
		})
	}, [])

	const handleVolumeTouchMove = useCallback(
		(e: React.TouchEvent<HTMLInputElement>) => {
			if (!isMobile) return
			withVideo((video) => {
				showControls()
				const target = e.currentTarget
				const rect = target.getBoundingClientRect()
				const x = e.touches[0].clientX - rect.left
				const percentage = Math.min(Math.max(x / rect.width, 0), 1)
				video.volume = percentage
			})
		},
		[withVideo, showControls]
	)

	const handleVideoLoading = useCallback((loading: boolean) => {
		dispatchUI({ type: 'SET_LOADING', loading })
	}, [])

	const handleQualityChange = useCallback(
		(quality: number) => {
			withVideo((video) => {
				resumeTimeRef.current = video.currentTime
				const index = videoSourcesRef.current.findIndex((s) => s.quality === quality)
				if (index < 0) return
				handleVideoLoading(true)
				setQuality(index)
			})
		},
		[withVideo, handleVideoLoading]
	)

	useEffect(() => {
		const video = videoRef.current
		if (!video || resumeTimeRef.current === 0) return
		const loaded = () => {
			video.currentTime = resumeTimeRef.current
			video.play()
		}
		video.addEventListener('loadedmetadata', loaded, { once: true })
		return () => video.removeEventListener('loadedmetadata', loaded)
	}, [quality])

	const handlePlaybackSpeed = useCallback((e: ChangeEvent<HTMLVideoElement>) => {
		dispatchPlayback({ type: 'SET_PLAYBACK_SPEED', speed: e.currentTarget.playbackRate })
	}, [])

	const handlePlaybackSpeedChange = useCallback((speed: number) => {
		withVideo((video) => {
			video.playbackRate = speed
		})
	}, [])

	const handleToggleSetting = useCallback(() => {
		dispatchUI({ type: 'SET_SETTING', active: !uiState.isSettingsVisible })
	}, [uiState.isSettingsVisible])

	const bufferedPercentage = useMemo(() => {
		if (!videoRef.current || !playbackState.durationTime) return 0
		const buffered = videoRef.current.buffered
		if (buffered.length === 0) return 0
		let bufferedEnd = 0
		for (let i = 0; i < buffered.length; i++) {
			if (buffered.start(i) <= playbackState.currentTime && buffered.end(i) > playbackState.currentTime) {
				bufferedEnd = buffered.end(i)
				break
			}
		}
		return (bufferedEnd / playbackState.durationTime) * 100
	}, [playbackState.currentTime, playbackState.durationTime])

	const videoPercentage = useMemo(() => {
		if (!playbackState.durationTime) return 0
		return (playbackState.currentTime / playbackState.durationTime) * 100
	}, [playbackState.currentTime, playbackState.durationTime])

	const seekModeTimerRef = useRef<NodeJS.Timeout | null>(null)

	const handleSeekModeChange = useCallback(() => {
		if (seekModeTimerRef.current) {
			clearTimeout(seekModeTimerRef.current)
		}
		dispatchUI({ type: 'SET_SEEK_MODE', isActive: true })
		seekModeTimerRef.current = setTimeout(() => {
			dispatchUI({ type: 'SET_SEEK_MODE', isActive: false })
			dispatchUI({ type: 'RESET_SEEK' })
			seekModeTimerRef.current = null
		}, 1200)
	}, [])

	const seekVideo = useCallback(
		(direction: '-' | '+') => {
			withVideo((video) => {
				const seekAmount = direction === '+' ? 10 : -10
				video.currentTime += seekAmount
				dispatchUI({ type: 'ADD_SEEK', amount: seekAmount })
				handleSeekModeChange()
			})
		},
		[withVideo, handleSeekModeChange]
	)

	const lastDoubleTapTimeRef = useRef(0)
	const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null)

	const handleDoubleTapSeek = useCallback(
		(direction: '-' | '+') => {
			if (!isMobile) return
			const now = Date.now()
			const timeSinceLastTap = now - lastDoubleTapTimeRef.current
			const isDoubleTap = timeSinceLastTap > 0 && timeSinceLastTap < 300
			const shouldSeek = isDoubleTap || uiState.isSeekMode
			if (shouldSeek) {
				if (singleTapTimerRef.current) {
					clearTimeout(singleTapTimerRef.current)
					singleTapTimerRef.current = null
				}
				if (!uiState.isSeekMode) {
					dispatchUI({ type: 'SET_SEEK_MODE', isActive: true })
				}
				seekVideo(direction)
			} else {
				singleTapTimerRef.current = setTimeout(() => {
					if (uiState.isControlsVisible) hideControls()
					else showControls()
					singleTapTimerRef.current = null
				}, 300)
			}
			lastDoubleTapTimeRef.current = now
		},
		[isMobile, uiState.isSeekMode, uiState.isControlsVisible, seekVideo, showControls, hideControls]
	)

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			if (!isMobile) return
			const target = e.target as HTMLElement
			const isInteractive = target.closest('button, input, [data-no-toggle=true]')
			if (isInteractive) return showControls()
			if (uiState.isControlsVisible) hideControls()
			else showControls()
		},
		[isMobile, uiState.isControlsVisible, showControls, hideControls]
	)

	useEffect(() => {
		if (!playbackState.isLoaded) return
		const video = videoRef.current
		if (!video) return
		const track = video.textTracks[0]
		if (!track) return
		track.mode = uiState.isSubtitle ? 'hidden' : 'disabled'
		const handleCueChange = () => {
			const cue = track.activeCues?.[0] as VTTCue | undefined
			setCurrentSubtitle(cue?.text ?? '')
		}
		track.addEventListener('cuechange', handleCueChange)
		return () => {
			track.removeEventListener('cuechange', handleCueChange)
		}
	}, [playbackState.isLoaded])

	useEffect(() => {
		const video = videoRef.current
		if (!video) return
		const track = video.textTracks[0]
		if (!track) return
		track.mode = uiState.isSubtitle ? 'hidden' : 'disabled'
		if (!uiState.isSubtitle) {
			setCurrentSubtitle('')
		}
	}, [uiState.isSubtitle])

	const isControlsShown = uiState.isControlsVisible
	const effectiveVolume = uiState.isMuted ? 0 : playbackState.volume

	useEffect(() => {
		if (isMobile) return
		const handleKeyDown = (event: KeyboardEvent) => {
			if ([' ', 'f', 'p', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
				event.preventDefault()
				showControls()
			}
			switch (event.key) {
				case ' ':
					handleTogglePlayPause()
					break
				case 'f':
					handleToggleFullscreen()
					break
				case 'p':
					handleTogglePIP()
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
	}, [handleTogglePlayPause, handleToggleFullscreen, handleTogglePIP, showControls, seekVideo])

	useEffect(() => {
		const handleFullScreenState = async () => {
			const isFullscreen = document.fullscreenElement === wrapperRef.current
			dispatchUI({ type: 'SET_FULLSCREEN', active: isFullscreen })
			if (videoRef.current) {
				void lockOrientation(videoRef.current, isFullscreen)
			}
		}
		document.addEventListener('fullscreenchange', handleFullScreenState)
		return () => {
			document.removeEventListener('fullscreenchange', handleFullScreenState)
			if (controlHideTimerRef.current) {
				clearTimeout(controlHideTimerRef.current)
			}
		}
	}, [])

	return (
		<div
			ref={wrapperRef}
			onMouseMove={!isMobile && !uiState.isError ? handleMouseMove : undefined}
			onMouseLeave={!isMobile && !uiState.isError ? handleMouseLeave : undefined}
			onTouchEnd={isMobile && !uiState.isError ? handleTouchEnd : undefined}
			className={style.PlayerWrapper + (!isMobile ? ` ${style.PlayerDesktop}` : '')}>
			<video
				ref={videoRef}
				poster={poster}
				controls={false}
				preload='metadata'
				onContextMenu={() => false}
				className={style.PlayerVideo}
				src={!hls ? videoSourcesRef.current[quality].src : undefined}
				onWaiting={() => handleVideoLoading(true)}
				onPlaying={() => handleVideoLoading(false)}
				onCanPlay={() => handleVideoLoading(false)}
				onLoadedData={() => handleVideoLoading(false)}
				onError={() => dispatchUI({ type: 'SET_ERROR', error: true })}
				onTimeUpdate={handleTimeUpdate}
				onVolumeChange={handleVolumeChange}
				onRateChange={handlePlaybackSpeed}
				onPlay={() => dispatchPlayback({ type: 'SET_PAUSED', isPaused: false })}
				onPause={() => dispatchPlayback({ type: 'SET_PAUSED', isPaused: true })}
				onDurationChange={(e) => dispatchPlayback({ type: 'SET_DURATION', duration: e.currentTarget.duration })}
				onLoadedMetadata={(e) => {
					dispatchPlayback({ type: 'SET_DURATION', duration: e.currentTarget.duration })
					dispatchPlayback({ type: 'SET_LOADED', active: true })
				}}>
				{track && <track key={track.src} label='subtitles' kind='subtitles' id='subtitles' srcLang={track.lang} src={track.src} />}
			</video>
			<div
				className={style.PlayerSubtitle + (isControlsShown ? ` ${style.SubtitleFloat}` : '')}
				style={{ display: currentSubtitle === '' || !uiState.isSubtitle ? 'none' : undefined }}>
				{currentSubtitle}
			</div>
			<div className={style.PlayerControls + (isControlsShown && !uiState.isError ? ` ${style.PlayerShown}` : '')}>
				<div className={style.PlayerPanelTop}>
					<article className={style.PlayerTitle}>{title}</article>
					<button
						type='button'
						className={style.PlayerButton}
						onClick={(e) => {
							e.stopPropagation()
							handleToggleSetting()
						}}
						onFocus={(e) => e.currentTarget.blur()}>
						<SvgIcon name='setting' />
					</button>
				</div>
				<div className={style.PlayerPanelCenter} onClick={!isMobile ? handleTogglePlayPause : undefined}>
					<div className={style.PlayerSeekArea} data-no-toggle onTouchEnd={() => handleDoubleTapSeek('-')}>
						{uiState.seekStack < 0 && (
							<div inert key={uiState.seekStack} className={style.seekLeft}>
								{uiState.seekStack.toString()}
							</div>
						)}
					</div>
					<div className={style.PlayerSeekArea} data-no-toggle onTouchEnd={() => handleDoubleTapSeek('+')}>
						{uiState.seekStack > 0 && (
							<div inert key={uiState.seekStack} className={style.seekRight}>
								{`+${uiState.seekStack.toString()}`}
							</div>
						)}
					</div>
				</div>
				<div className={style.PlayerPanelBottom}>
					<div className={style.PlayerCurrentTime}>{formatTime(playbackState.currentTime)}</div>
					<div className={style.PlayerSeekTime}>
						<div
							className={style.PlayerHoverTime}
							style={
								{
									display: uiState.hoverTime.x === null ? 'none' : undefined,
									'--player-hover-position': `${uiState.hoverTime.x}px`
								} as CSSProperties
							}>
							{formatTime(uiState.hoverTime.time)}
						</div>
						<input
							step='any'
							type='range'
							onFocus={(e) => e.currentTarget.blur()}
							max={playbackState.durationTime}
							value={playbackState.currentTime}
							className={style.PlayerRangeTime}
							onMouseMove={!isMobile ? handleProgressBarHover : undefined}
							onMouseLeave={!isMobile ? handleProgressBarBlur : undefined}
							onTouchMove={isMobile ? handleProgressBarTouchMove : undefined}
							onTouchEnd={isMobile ? handleProgressBarBlur : undefined}
							onTouchCancel={isMobile ? handleProgressBarBlur : undefined}
							onChange={(e) => seekToTime(+e.currentTarget.value)}
							style={
								{
									'--player-buffer-position': `${bufferedPercentage}%`,
									'--player-time-position': `${videoPercentage}%`
								} as CSSProperties
							}
						/>
						<div className={style.PlayerRangeThumb} style={{ '--player-thumb-position': `${videoPercentage}%` } as CSSProperties} />
					</div>
					<div className={style.PlayerDurationTime}>{formatTime(playbackState.durationTime)}</div>
					<div className={style.PlayerVolume}>
						<button
							type='button'
							className={style.PlayerButton}
							onClick={(e) => {
								e.stopPropagation()
								handleToggleMute()
							}}
							onFocus={(e) => e.currentTarget.blur()}>
							<SvgIcon name={uiState.isMuted || playbackState.volume === 0 ? 'unmute' : 'mute'} />
						</button>
						<div className={style.PlayerVolumeZone}>
							<input
								style={
									{
										'--player-buffer-position': `${effectiveVolume * 100}%`,
										'--player-time-position': `${effectiveVolume * 100}%`
									} as CSSProperties
								}
								onFocus={(e) => e.currentTarget.blur()}
								onChange={handleSeekVolume}
								onTouchMove={handleVolumeTouchMove}
								className={style.PlayerRangeVolume}
								value={effectiveVolume}
								type='range'
								step='any'
								max={1}
							/>
							<div
								className={style.PlayerRangeThumb}
								style={{ '--player-thumb-position': `${effectiveVolume * 100}%` } as CSSProperties}
							/>
						</div>
					</div>
					<button
						type='button'
						className={style.PlayerButton}
						onClick={(e) => {
							e.stopPropagation()
							handleTogglePIP()
						}}
						onFocus={(e) => e.currentTarget.blur()}>
						<SvgIcon name='picture-in-picture' />
					</button>
					<button
						type='button'
						className={style.PlayerButton}
						onClick={(e) => {
							e.stopPropagation()
							handleToggleFullscreen()
						}}
						onFocus={(e) => e.currentTarget.blur()}>
						<SvgIcon name={uiState.isFullscreen ? 'exit-fullscreen' : 'fullscreen'} />
					</button>
				</div>
				<div className={style.PlayerCenter} data-no-toggle onClick={handleTogglePlayPause}>
					<SvgIcon name={playbackState.isPaused ? 'play' : 'pause'} bigger />
				</div>
			</div>
			<div
				className={style.PlayerSetting}
				style={{ display: !uiState.isSettingsVisible ? 'none' : undefined }}
				onClick={() => {
					dispatchUI({ type: 'SET_SETTING', active: false })
					dispatchUI({ type: 'SET_SETTING_PANEL', name: null })
				}}
				onMouseMove={(e) => e.stopPropagation()}>
				<div
					className={style.PlayerSettingPanel}
					onClick={(e) => e.stopPropagation()}
					style={{ display: uiState.settingPanel === null ? undefined : 'none' }}>
					<div className={style.PlayerSettingList} style={{ display: videoSourcesRef.current.length < 2 ? 'none' : undefined }}>
						<SvgIcon name='quality' style={{ stroke: '#000' }} />
						<div className={style.PlayerSettingDisplay} onClick={() => dispatchUI({ type: 'SET_SETTING_PANEL', name: 'quality' })}>
							<span>Video quality</span>
							<span>{formatQuality(videoSourcesRef.current[quality].quality)}</span>
						</div>
					</div>
					<div className={style.PlayerSettingList}>
						<SvgIcon name='playback' style={{ stroke: '#000' }} />
						<div className={style.PlayerSettingDisplay} onClick={() => dispatchUI({ type: 'SET_SETTING_PANEL', name: 'speed' })}>
							<span>Playback speed</span>
							<span>{playbackState.playbackSpeed}x</span>
						</div>
					</div>
					<div className={style.PlayerSettingList}>
						<SvgIcon name='subtitle' style={{ stroke: '#000', display: 'block' }} />
						<div className={style.PlayerSettingDisplay} onClick={() => dispatchUI({ type: 'SET_SUBTITLE', state: !uiState.isSubtitle })}>
							<span>Subtitle</span>
							<span>{uiState.isSubtitle ? 'on' : 'off'}</span>
						</div>
					</div>
				</div>
				<div
					className={style.PlayerSettingPanelSpeed}
					onClick={(e) => e.stopPropagation()}
					style={{ display: uiState.settingPanel === 'speed' ? undefined : 'none' }}>
					<div className={style.PlayerSpeedShow}>Speed {playbackState.playbackSpeed}x</div>
					<div className={style.PlayerPlayback}>
						<button
							type='button'
							className={style.PlayerButtonCursor}
							onClick={() =>
								handlePlaybackSpeedChange(playbackState.playbackSpeed === 0.25 ? 0.25 : playbackState.playbackSpeed - 0.25)
							}
							onFocus={(e) => e.currentTarget.blur()}>
							<SvgIcon name='minus' />
						</button>
						<input
							max={4}
							min={0.25}
							step={0.25}
							type='range'
							onFocus={(e) => e.currentTarget.blur()}
							style={
								{
									'--spped-thumb-position': `${((playbackState.playbackSpeed - 0.25) / 3.75) * 100}%`
								} as CSSProperties
							}
							className={style.PlayerRangeSpeed}
							onChange={(e) => handlePlaybackSpeedChange(+e.currentTarget.value)}
							value={playbackState.playbackSpeed}
						/>
						<button
							type='button'
							className={style.PlayerButtonCursor}
							onClick={() => handlePlaybackSpeedChange(playbackState.playbackSpeed === 4 ? 4 : playbackState.playbackSpeed + 0.25)}
							onFocus={(e) => e.currentTarget.blur()}>
							<SvgIcon name='plus' />
						</button>
					</div>
				</div>
				<div
					className={style.PlayerSettingPanelQuality}
					onClick={(e) => e.stopPropagation()}
					style={{ display: uiState.settingPanel === 'quality' ? undefined : 'none' }}>
					<div className={style.PlayerSpeedShow}>Quality {formatQuality(videoSourcesRef.current[quality].quality)}</div>
					<div className={style.PlayerQualityList}>
						{videoSourcesRef.current.map((source) => (
							<div
								key={source.quality}
								className={style.PlayerSettingList}
								onClick={() => {
									handleQualityChange(source.quality)
									dispatchUI({ type: 'SET_SETTING', active: false })
									dispatchUI({ type: 'SET_SETTING_PANEL', name: null })
								}}>
								<input
									type='checkbox'
									readOnly
									onFocus={(e) => e.currentTarget.blur()}
									className={style.PlayerCheckbox}
									checked={videoSourcesRef.current[quality].quality === source.quality}
								/>
								{formatQuality(source.quality)}
							</div>
						))}
					</div>
				</div>
			</div>
			<div className={style.PlayerLoading} style={{ display: !uiState.isLoading || uiState.isControlsVisible ? 'none' : undefined }}>
				<SvgIcon name='loading' style={{ width: '100%' }} />
			</div>
			{uiState.isError && (
				<div className={style.PlayerError}>
					<SvgIcon name='error' style={{ width: '80px' }} />
					<span>Unable to play video</span>
				</div>
			)}
		</div>
	)
}
