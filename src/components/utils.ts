export function formatTime(seconds?: number): string {
	if (seconds === undefined || Number.isNaN(seconds) || seconds < 0) return '00:00'
	const totalSeconds = Math.floor(seconds)
	const minutes = Math.floor(totalSeconds / 60)
	const secs = totalSeconds % 60
	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatQuality(quality: number) {
	if (quality === 0) return 'Auto'
	return quality < 1000 ? `${quality}p` : `${quality / 1000}k`
}

export const isMobileDevice = (): boolean => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent)

export function createThrottle<T extends (...args: unknown[]) => void>(func: T, delayMs: number): (...args: Parameters<T>) => void {
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

export async function requestFullscreen(element: HTMLDivElement): Promise<boolean> {
	interface FullscreenElement {
		requestFullscreen?: () => Promise<void>
		webkitRequestFullscreen?: () => Promise<void>
		webkitEnterFullscreen?: () => Promise<void>
		mozRequestFullScreen?: () => Promise<void>
		msRequestFullscreen?: () => Promise<void>
	}
	const el = element as FullscreenElement
	const requestMethod =
		el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
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

export async function exitFullscreen(): Promise<boolean> {
	interface ExitFullscreenElement {
		exitFullscreen?: () => Promise<void>
		webkitExitFullscreen?: () => Promise<void>
		mozCancelFullScreen?: () => Promise<void>
		msExitFullscreen?: () => Promise<void>
	}
	const doc = document as ExitFullscreenElement
	const exitMethod = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen
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

export function isFullscreenSupported(): boolean {
	interface FullScreenSupport {
		fullscreenEnabled?: boolean
		webkitFullscreenEnabled?: boolean
		mozFullScreenEnabled?: boolean
		msFullscreenEnabled?: boolean
	}
	const doc = document as FullScreenSupport
	return !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled || doc.mozFullScreenEnabled || doc.msFullscreenEnabled)
}

export async function requestPictureInPicture(video: HTMLVideoElement): Promise<PictureInPictureWindow | null> {
	if (!isPictureInPictureSupported()) {
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

export async function exitPictureInPicture(): Promise<boolean> {
	if ('pictureInPictureElement' in document && document.pictureInPictureElement) {
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

export function isPictureInPictureSupported(): boolean {
	return 'pictureInPictureEnabled' in document && 'requestPictureInPicture' in HTMLVideoElement.prototype
}

export async function lockOrientation(video: HTMLVideoElement, isFullscreen: boolean): Promise<void> {
	const isLandscape = video.videoWidth > video.videoHeight
	if (
		typeof window !== 'undefined' &&
		window.screen &&
		'orientation' in window.screen &&
		window.screen.orientation &&
		'lock' in window.screen.orientation &&
		typeof window.screen.orientation.lock === 'function'
	) {
		try {
			if (isFullscreen && isLandscape) await window.screen.orientation.lock('landscape')
			else window.screen.orientation.unlock()
		} catch (error) {
			console.warn('Failed to lock orientation:', error)
		}
	}
}
