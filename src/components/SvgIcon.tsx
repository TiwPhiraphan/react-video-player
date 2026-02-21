type SvgIconProps = {
	name:
		| 'play'
		| 'pause'
		| 'mute'
		| 'plus'
		| 'error'
		| 'minus'
		| 'unmute'
		| 'setting'
		| 'quality'
		| 'loading'
		| 'playback'
		| 'subtitle'
		| 'fullscreen'
		| 'exit-fullscreen'
		| 'picture-in-picture'
	style?: React.CSSProperties
	bigger?: boolean
}

const fullFill = ['play', 'pause']

export default function SvgIcon({ name, style, bigger }: SvgIconProps) {
	if (name === 'loading') {
		return (
			<svg
				version='1.1'
				id='L1'
				xmlns='http://www.w3.org/2000/svg'
				xmlnsXlink='http://www.w3.org/1999/xlink'
				x='0px'
				y='0px'
				viewBox='0 0 100 100'
				enableBackground='new 0 0 100 100'
				xmlSpace='preserve'>
				<title>loading</title>
				<circle
					fill='none'
					stroke='currentColor'
					strokeWidth='6'
					strokeMiterlimit='15'
					strokeDasharray='14.2472,14.2472'
					cx='50'
					cy='50'
					r='47'>
					<animateTransform
						attributeName='transform'
						attributeType='XML'
						type='rotate'
						dur='5s'
						from='0 50 50'
						to='360 50 50'
						repeatCount='indefinite'
					/>
				</circle>
				<circle fill='none' stroke='currentColor' strokeWidth='1' strokeMiterlimit='10' strokeDasharray='10,10' cx='50' cy='50' r='39'>
					<animateTransform
						attributeName='transform'
						attributeType='XML'
						type='rotate'
						dur='5s'
						from='0 50 50'
						to='-360 50 50'
						repeatCount='indefinite'
					/>
				</circle>
				<g fill='currentColor'>
					<rect x='30' y='35' width='5' height='30'>
						<animateTransform
							attributeName='transform'
							dur='1s'
							type='translate'
							values='0 5 ; 0 -5; 0 5'
							repeatCount='indefinite'
							begin='0.1'
						/>
					</rect>
					<rect x='40' y='35' width='5' height='30'>
						<animateTransform
							attributeName='transform'
							dur='1s'
							type='translate'
							values='0 5 ; 0 -5; 0 5'
							repeatCount='indefinite'
							begin='0.2'
						/>
					</rect>
					<rect x='50' y='35' width='5' height='30'>
						<animateTransform
							attributeName='transform'
							dur='1s'
							type='translate'
							values='0 5 ; 0 -5; 0 5'
							repeatCount='indefinite'
							begin='0.3'
						/>
					</rect>
					<rect x='60' y='35' width='5' height='30'>
						<animateTransform
							attributeName='transform'
							dur='1s'
							type='translate'
							values='0 5 ; 0 -5; 0 5'
							repeatCount='indefinite'
							begin='0.4'
						/>
					</rect>
					<rect x='70' y='35' width='5' height='30'>
						<animateTransform
							attributeName='transform'
							dur='1s'
							type='translate'
							values='0 5 ; 0 -5; 0 5'
							repeatCount='indefinite'
							begin='0.5'
						/>
					</rect>
				</g>
			</svg>
		)
	} else {
		return (
			<svg
				fill={fullFill.includes(name) ? 'currentColor' : 'none'}
				strokeWidth={1.5}
				width={bigger ? 56 : 24}
				viewBox='0 0 24 24'
				stroke='currentColor'
				style={style}
				xmlns='http://www.w3.org/2000/svg'>
				<title>{name}</title>
				{name === 'play' && (
					<path
						fillRule='evenodd'
						d='M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z'
						clipRule='evenodd'
					/>
				)}
				{name === 'pause' && (
					<path
						fillRule='evenodd'
						d='M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z'
						clipRule='evenodd'
					/>
				)}
				{name === 'subtitle' && (
					<>
						<rect x='3' y='6' width='18' height='12' rx='2' />
						<g transform='translate(1, 0)'>
							<path
								d='M9.5 12a1.5 1.5 0 1 1 0-2.5M9.5 12a1.5 1.5 0 1 0 0 2.5M14.5 12a1.5 1.5 0 1 1 0-2.5M14.5 12a1.5 1.5 0 1 0 0 2.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</g>
					</>
				)}
				{name === 'setting' && (
					<>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z'
						/>
						<path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
					</>
				)}
				{name === 'fullscreen' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
					/>
				)}
				{name === 'exit-fullscreen' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25'
					/>
				)}
				{name === 'mute' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
					/>
				)}
				{name === 'unmute' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
					/>
				)}
				{name === 'picture-in-picture' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6'
					/>
				)}
				{name === 'quality' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75'
					/>
				)}
				{name === 'playback' && (
					<>
						<path strokeLinecap='round' strokeLinejoin='round' d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z'
						/>
					</>
				)}
				{name === 'error' && (
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
					/>
				)}
				{name === 'plus' && <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />}
				{name === 'minus' && <path strokeLinecap='round' strokeLinejoin='round' d='M5 12h14' />}
			</svg>
		)
	}
}
