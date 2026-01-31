interface IconProps {
	name:
		| 'pip'
		| 'play'
		| 'pause'
		| 'hide'
		| 'muted'
		| 'error'
		| 'volume'
		| 'setting'
		| 'restart'
		| 'loading'
		| 'fullscreen'
		| 'unfullscreen'
	size?: number
	bigger?: boolean
	className?: string
	onClick?: () => unknown
}

export default function Icon({ size, name, bigger, className, onClick }: IconProps) {
	if (name === 'loading')
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
				<circle
					fill='none'
					stroke='currentColor'
					strokeWidth='1'
					strokeMiterlimit='10'
					strokeDasharray='10,10'
					cx='50'
					cy='50'
					r='39'>
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
	if (name === 'hide') {
		return <></>
	}
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			strokeWidth={1.5}
			onClick={onClick}
			className={className}
			style={{
				display: 'block',
				width: `${size ? size.toString() : bigger ? '5' : '1.6'}em`
			}}
			stroke='white'>
			<title>{name}</title>
			{name === 'play' && (
				<path
					fill='#fff'
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
				/>
			)}
			{name === 'pause' && (
				<path
					strokeWidth={4}
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M16.4 5.25v13.5m-8.5-13.5v13.5'
				/>
			)}
			{name === 'fullscreen' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
				/>
			)}
			{name === 'unfullscreen' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25'
				/>
			)}
			{name === 'pip' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6'
				/>
			)}
			{name === 'muted' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
				/>
			)}
			{name === 'volume' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
				/>
			)}
			{name === 'restart' && (
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99'
				/>
			)}
			{name === 'setting' && (
				<>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z'
					/>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
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
		</svg>
	)
}
