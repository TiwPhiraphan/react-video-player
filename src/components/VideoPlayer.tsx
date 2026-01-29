import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import style from './VideoPlayer.module.css'

interface VideoPlayerProps {
	title?: string
	source: string | { link: string; type?: 'video/mp4' | 'video/ogg' | 'video/webm' }
}

function throttle<T extends (...args: unknown[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null
	let lastRan = 0

	return function (this: unknown, ...args: Parameters<T>) {
		const now = Date.now()

		if (!lastRan) {
			func.apply(this, args)
			lastRan = now
		} else {
			if (timeoutId) clearTimeout(timeoutId)

			timeoutId = setTimeout(
				() => {
					if (now - lastRan >= delay) {
						func.apply(this, args)
						lastRan = now
					}
				},
				delay - (now - lastRan)
			)
		}
	}
}

export default function VideoPlayer({ source, title }: VideoPlayerProps) {
	const videoLink = typeof source === 'string' ? source : source.link
	const videoType =
		typeof source === 'object' && typeof source.type === 'string' ? source.type : 'video/mp4'

	const timing = useRef<NodeJS.Timeout | null>(null)
	const seeking = useRef<NodeJS.Timeout | null>(null)
	const videoRef = useRef<HTMLVideoElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const lastSeekTap = useRef(0)

	const rafRef = useRef<number | null>(null)

	const [isMobile, setIsMobile] = useState(true)
	const [seekStack, setSeekStack] = useState(0)
	const [seekMode, setSeekMode] = useState(false)
	const [isControlShown, setIsControlShown] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [isPlayFirst, setIsPlayFirst] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [isEnded, setIsEnded] = useState(false)
	const [isPaused, setIsPaused] = useState(true)
	const [isRanging, setIsRanging] = useState(false)
	const [volume, setVolume] = useState(1)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [speed, setSpeed] = useState(1)
	const [isSetting, setIsSetting] = useState(false)
	const [openAreaSetting, setOpenAreaSetting] = useState<'speed' | null>(null)
	const [hoverTime, setHoverTime] = useState<number | null>(null)
	const [hoverX, setHoverX] = useState(0)

	useEffect(() => {
		setIsPlayFirst(false)
		setIsEnded(false)
		setIsLoading(false)
		setDuration(0)
		setCurrentTime(0)
		setSeekStack(0)
		setSeekMode(false)
		setIsRanging(false)
		setIsSetting(false)
		setOpenAreaSetting(null)
	}, [videoLink])

	useEffect(() => {
		return () => {
			if (timing.current) {
				clearTimeout(timing.current)
				timing.current = null
			}
			if (seeking.current) {
				clearTimeout(seeking.current)
				seeking.current = null
			}
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current)
				rafRef.current = null
			}
		}
	}, [])

	function formatTime(sec?: number) {
		if (sec === undefined || Number.isNaN(sec) || sec < 0) return '00:00'
		const total = Math.floor(sec)
		const minutes = Math.floor(total / 60)
		const secs = total % 60
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	async function setCallback<E extends unknown>(
		ref: React.RefObject<E | null>,
		callback: (ref: E) => Promise<void> | void
	) {
		if (ref.current) {
			await callback(ref.current)
		}
	}

	const handleSeekChange = useCallback(() => {
		if (seeking.current) {
			clearTimeout(seeking.current)
			seeking.current = null
		}
		setSeekMode(true)
		seeking.current = setTimeout(() => {
			setSeekMode(false)
			setSeekStack(0)
			seeking.current = null
		}, 1500)
	}, [])

	const togglePlay = useCallback(() => {
		setCallback(videoRef, async (video) => {
			try {
				video.paused ? await video.play() : video.pause()
			} catch {
				return void 0
			}
		})
	}, [])

	const seekAction = useCallback(
		(active: '-' | '+') => {
			setCallback(videoRef, (video) => {
				setSeekStack((prev) => {
					const newValue =
						active === '+' ? (prev < 0 ? 10 : prev + 10) : prev > 0 ? -10 : prev - 10
					video.currentTime += active === '+' ? 10 : -10
					return newValue
				})
				handleSeekChange()
			})
		},
		[handleSeekChange]
	)

	useEffect(() => {
		const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(
			window.navigator.userAgent
		)
		setIsMobile(mobile)

		async function handleFullScreenChange() {
			if (wrapperRef.current && videoRef.current) {
				const fullscreen = document.fullscreenElement === wrapperRef.current
				setIsFullscreen(document.fullscreenEnabled && fullscreen)
				const isLandscape = videoRef.current.videoWidth > videoRef.current.videoHeight
				if (
					typeof window !== 'undefined' &&
					window.screen &&
					'orientation' in window.screen &&
					window.screen.orientation &&
					'lock' in window.screen.orientation &&
					typeof window.screen.orientation.lock === 'function' &&
					isLandscape &&
					fullscreen
				) {
					try {
						;(await window.screen.orientation.lock('landscape')) as Promise<void>
					} catch {
						return false
					}
				}
			}
		}
		document.addEventListener('fullscreenchange', handleFullScreenChange)

		function handleShortKey(event: KeyboardEvent) {
			if ([' ', 'f', 'p', 'ArrowLeft', 'ArrowRight'].includes(event.key))
				event.preventDefault()
			setCallback(videoRef, (video) => {
				switch (event.key) {
					case ' ':
						togglePlay()
						break
					case 'f':
						toggleFullScreen()
						break
					case 'p':
						togglePictureInPicture()
						break
					case 'ArrowLeft':
						setSeekStack((prev) => {
							const newValue = prev > 0 ? -10 : prev - 10
							video.currentTime -= 10
							return newValue
						})
						handleSeekChange()
						break
					case 'ArrowRight':
						setSeekStack((prev) => {
							const newValue = prev < 0 ? 10 : prev + 10
							video.currentTime += 10
							return newValue
						})
						handleSeekChange()
						break
				}
			})
		}
		!mobile && window.addEventListener('keydown', handleShortKey)

		return () => {
			document.removeEventListener('fullscreenchange', handleFullScreenChange)
			!mobile && window.removeEventListener('keydown', handleShortKey)
		}
	}, [videoLink, togglePlay, handleSeekChange])

	function playVideo() {
		setCallback(videoRef, async (video) => {
			try {
				await video.play()
			} catch {
				return void 0
			}
		})
	}

	function toggleMute() {
		setCallback(videoRef, (video) => {
			video.muted = !video.muted
			setIsMuted(video.muted)
		})
	}

	async function requestFullScreen(element: HTMLDivElement) {
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
			} catch {
				console.error('Failed to enter fullscreen')
				return
			}
		}
	}

	async function exitFullScreen() {
		interface ExitFullscreenElement {
			exitFullscreen?: () => Promise<void>
			webkitExitFullscreen?: () => Promise<void>
			mozCancelFullScreen?: () => Promise<void>
			msExitFullscreen?: () => Promise<void>
		}
		const el = document as ExitFullscreenElement
		const exitMethod =
			el.exitFullscreen ||
			el.webkitExitFullscreen ||
			el.mozCancelFullScreen ||
			el.msExitFullscreen
		if (exitMethod) {
			try {
				await exitMethod.call(el)
			} catch {
				console.error('Failed to exit fullscreen')
				return
			}
		}
	}

	function toggleFullScreen() {
		interface FullScreenSupport {
			fullscreenEnabled?: boolean
			webkitFullscreenEnabled?: boolean
			mozFullScreenEnabled?: boolean
			msFullscreenEnabled?: boolean
		}
		const doc = document as FullScreenSupport
		const isFullScreenSupport = !!(
			doc.fullscreenEnabled ||
			doc.webkitFullscreenEnabled ||
			doc.mozFullScreenEnabled ||
			doc.msFullscreenEnabled
		)
		if (isFullScreenSupport) {
			setCallback(wrapperRef, (wrapper) => {
				if (document.fullscreenElement) {
					exitFullScreen()
				} else {
					requestFullScreen(wrapper)
				}
			})
		}
	}

	async function requestPictureInPicture(
		videoElement: HTMLVideoElement
	): Promise<PictureInPictureWindow | null> {
		if (
			!('pictureInPictureEnabled' in document) ||
			typeof videoElement.requestPictureInPicture !== 'function'
		) {
			console.error('Picture-in-Picture is not supported in this browser')
			return null
		}
		try {
			if (videoElement.paused) {
				await videoElement.play().catch(() => {
					console.warn('Auto-play was prevented')
				})
			}
			return await videoElement.requestPictureInPicture()
		} catch {
			console.error('Failed to enter Picture-in-Picture')
			return null
		}
	}

	async function exitPictureInPicture(videoElement: HTMLVideoElement): Promise<void> {
		if (
			videoElement.disablePictureInPicture === false &&
			'pictureInPictureElement' in document &&
			document.pictureInPictureElement
		) {
			try {
				await document.exitPictureInPicture()
			} catch {
				console.error('Failed to exit Picture-in-Picture')
				return
			}
		}
	}

	function togglePictureInPicture() {
		const isSupported =
			'pictureInPictureEnabled' in document &&
			'requestPictureInPicture' in HTMLVideoElement.prototype
		if (isSupported) {
			setCallback(videoRef, (video) => {
				if (document.pictureInPictureElement) {
					exitPictureInPicture(video)
				} else {
					requestPictureInPicture(video)
				}
			})
		}
	}

	function handleInputRange(action: 'volume' | 'time', value: number) {
		setCallback(videoRef, (video) => {
			if (action === 'time') {
				setCurrentTime(value)
				video.currentTime = value
			} else {
				setVolume(value)
				video.volume = value
				if (video.muted) {
					video.muted = false
					setIsMuted(false)
				}
			}
		})
	}

	function handleControlShown(timeout = 2500) {
		if (isPaused) return
		if (timing.current) {
			clearTimeout(timing.current)
			timing.current = null
		}
		setIsControlShown(true)
		timing.current = setTimeout(() => {
			if (!isRanging) {
				setIsControlShown(false)
			}
			timing.current = null
		}, timeout)
	}

	const handleMouseMove = useCallback(
		throttle(() => {
			if (!isPaused) {
				handleControlShown()
			}
		}, 200),
		[isPaused, isRanging]
	)

	const handleMouseLeave = useCallback(() => {
		setIsControlShown(false)
		if (timing.current) {
			clearTimeout(timing.current)
			timing.current = null
		}
	}, [])

	useEffect(() => {
		if (isRanging) {
			handleControlShown(1000)
		}
	}, [isRanging])

	const handleTimeUpdate = useCallback(
		(event: React.SyntheticEvent<HTMLVideoElement>) => {
			const newTime = event.currentTarget.currentTime
			const newTimeFloored = Math.floor(newTime)
			const currentTimeFloored = Math.floor(currentTime)

			if (newTimeFloored !== currentTimeFloored || Math.abs(newTime - currentTime) > 1) {
				setCurrentTime(newTime)
			}
		},
		[currentTime]
	)

	const bufferedProgressPercentage = useMemo(() => {
		if (!videoRef.current || !duration) return 0
		const buffered = videoRef.current.buffered
		if (buffered.length === 0) return 0
		let bufferedEnd = 0
		for (let i = 0; i < buffered.length; i++) {
			if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime) {
				bufferedEnd = buffered.end(i)
				break
			}
		}
		return (bufferedEnd / duration) * 100
	}, [currentTime, duration])

	const progressPercentage = useMemo(() => {
		return duration > 0 ? (currentTime / duration) * 100 : 0
	}, [currentTime, duration])

	const handleDoubleSeek = useCallback(
		(active: '-' | '+') => {
			if (!isMobile) return

			const now = Date.now()
			const diff = now - lastSeekTap.current

			const isDoubleTap = diff > 0 && diff < 300
			const shouldSeek = isDoubleTap || seekMode

			if (shouldSeek) {
				if (!seekMode) setSeekMode(true)
				seekAction(active)
			}

			lastSeekTap.current = now
		},
		[isMobile, seekMode, seekAction]
	)

	function handleSpeed(pad: number) {
		setSpeed(pad)
		setIsSetting(false)
		setOpenAreaSetting(null)
	}

	function toggleSettings() {
		setIsRanging(!isRanging)
		setIsSetting(!isSetting)
		setOpenAreaSetting(null)
	}

	const handleRangeHover = (e: React.MouseEvent<HTMLInputElement>) => {
		if (rafRef.current) return
		const target = e.currentTarget
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null
			const rect = target.getBoundingClientRect()
			const x = e.clientX - rect.left
			const percent = Math.min(Math.max(x / rect.width, 0), 1)
			const time = percent * duration
			setHoverX(x)
			setHoverTime(time)
		})
	}

	const handleRangeLeave = () => {
		setHoverTime(null)
	}

	useEffect(() => {
		setCallback(videoRef, (video) => {
			video.playbackRate = speed
		})
	}, [speed])

	return (
		<div className={style.videoContainer} key={videoLink}>
			<div
				className={style.wrapper}
				ref={wrapperRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}>
				<video
					playsInline
					preload='none'
					ref={videoRef}
					controls={false}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
					onVolumeChange={(event) => setVolume(event.currentTarget.volume)}
					onCanPlayThrough={() => setIsLoading(false)}
					onCanPlay={() => setIsLoading(false)}
					onWaiting={() => setIsLoading(true)}
					onPlaying={() => setIsLoading(false)}
					onLoadStart={() => setIsEnded(false)}
					onEnded={() => setIsEnded(true)}
					onPlay={() => {
						setIsEnded(false)
						setIsPaused(false)
						setIsPlayFirst(true)
					}}
					onPause={() => setIsPaused(true)}
					className={style.video}>
					<source src={videoLink} type={videoType} />
				</video>
				<div
					className={`${style.controller} ${isMobile ? (isPaused || isControlShown ? style.visit : style.invisit) : isPaused || isControlShown ? style.opacity1 : style.opacity0}`}>
					<h1 className={style.title}>
						<p>{title}</p>
					</h1>
					<div className={style.center} onClick={!isMobile ? togglePlay : undefined}>
						<div onClick={() => handleDoubleSeek('-')} />
						<div onClick={() => handleDoubleSeek('+')} />
					</div>
					<div className={style.controls}>
						<div className={style.timeWrapper}>
							<article>{formatTime(currentTime)}</article>
							<div className={style.timeControl}>
								<div className={style.backProcess} />
								<div
									className={style.progressBar}
									style={{ width: `${bufferedProgressPercentage}%` }}
								/>
								<div className={style.hoverTime} style={{ left: hoverX - 25, display: !hoverTime ? 'none' : undefined }}>
									{formatTime(hoverTime || 0)}
								</div>
								<input
									type='range'
									step='any'
									max={duration}
									value={currentTime}
									onFocus={(e) => e.currentTarget.blur()}
									className={style.rangeTime}
									onPointerDown={() => setIsRanging(true)}
									onPointerUp={() => setIsRanging(false)}
									onPointerCancel={() => setIsRanging(false)}
									onChange={(event) =>
										handleInputRange('time', +event.currentTarget.value)
									}
									onMouseLeave={handleRangeLeave}
									onMouseMove={handleRangeHover}
									style={{
										backgroundImage: `linear-gradient(to right, #00b2ff ${progressPercentage}%, #0000 ${progressPercentage}%)`
									}}
								/>
							</div>
							<article>{formatTime(duration)}</article>
						</div>
						<div className={style.volumeWrapper}>
							<button
								type='button'
								onClick={toggleMute}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name={isMuted || volume === 0 ? 'muted' : 'volume'} />
							</button>
							<input
								max={1}
								type='range'
								step='any'
								value={isMuted ? 0 : volume}
								onFocus={(e) => e.currentTarget.blur()}
								className={
									style.rangeVolume + (isMobile ? ` ${style.hideOnMobile}` : '')
								}
								style={{
									backgroundImage: `linear-gradient(to right, #00b2ff ${!isMuted ? volume * 100 : 0}%, #fff5 ${!isMuted ? volume * 100 : 0}%)`
								}}
								onChange={(event) =>
									handleInputRange('volume', +event.currentTarget.value)
								}
							/>
						</div>
						<div>
							<button
								type='button'
								onClick={togglePictureInPicture}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name='pip' />
							</button>
						</div>
						<div>
							<button
								type='button'
								onClick={toggleFullScreen}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name={isFullscreen ? 'unfullscreen' : 'fullscreen'} />
							</button>
						</div>
						<div className={style.btnSetting}>
							<button
								type='button'
								onClick={toggleSettings}
								onFocus={(e) => e.currentTarget.blur()}>
								<Icon name='setting' />
							</button>
							<div className={style.customSelect} style={{ display: !isSetting ? 'none' : undefined }}>
								<div onClick={() => setOpenAreaSetting(openAreaSetting === 'speed' ? null : 'speed')}>ความเร็วในการเล่น</div>
								{openAreaSetting === 'speed' && (
									<ul>
										<li style={{ backgroundColor: speed === 0.25 ? '#eeee' : undefined }} onClick={() => handleSpeed(0.25)}>0.25</li>
										<li style={{ backgroundColor: speed === 0.5 ? '#eeee' : undefined }} onClick={() => handleSpeed(0.5)}>0.5</li>
										<li style={{ backgroundColor: speed === 0.75 ? '#eeee' : undefined }} onClick={() => handleSpeed(0.75)}>0.75</li>
										<li style={{ backgroundColor: speed === 1 ? '#eeee' : undefined }} onClick={() => handleSpeed(1)}>1</li>
										<li style={{ backgroundColor: speed === 1.25 ? '#eeee' : undefined }} onClick={() => handleSpeed(1.25)}>1.25</li>
										<li style={{ backgroundColor: speed === 1.5 ? '#eeee' : undefined }} onClick={() => handleSpeed(1.5)}>1.5</li>
										<li style={{ backgroundColor: speed === 1.75 ? '#eeee' : undefined }} onClick={() => handleSpeed(1.75)}>1.75</li>
										<li style={{ backgroundColor: speed === 2 ? '#eeee' : undefined }} onClick={() => handleSpeed(2)}>2</li>
									</ul>
								)}
							</div>
						</div>
					</div>
					<Icon
						name={isLoading ? 'hide' : isEnded ? 'restart' : isPaused ? 'play' : 'pause'}
						bigger
						className={style.absoluteCenter}
						onClick={togglePlay}
					/>
				</div>
				{seekStack < 0 && (
					<div inert key={seekStack} className={style.seekLeft}>
						{seekStack.toString()}
					</div>
				)}
				{seekStack > 0 && (
					<div
						inert
						key={seekStack}
						className={style.seekRight}>{`+${seekStack.toString()}`}</div>
				)}
				{isLoading && (
					<div className={style.loadingContainer}>
						<Icon name='loading' />
					</div>
				)}
				{!isPlayFirst && (
					<div className={style.playFirstContainer}>
						<button
							type='button'
							onFocus={(e) => e.currentTarget.blur()}
							onClick={() => {
								setIsPlayFirst(true)
								playVideo()
							}}>
							<Icon name='play' bigger />
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
