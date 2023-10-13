import { NavLink, useSearchParams } from 'react-router-dom'

export default function MobileNavbar() {
	const searchParams = useSearchParams()
	const paramString =
		'?' +
		(searchParams[0].get('season') ? 'season=' + searchParams[0].get('season') : '') +
		'&' +
		(searchParams[0].get('teamID') ? 'teamID=' + searchParams[0].get('teamID') : '')
	return (
		<div className="">
			<div className="w-full h-16 bg-gray-200 shadow-inv flex justify-evenly items-center fixed bottom-0 z-50">
				<NavLink
					to={`/${paramString === '?' ? '' : paramString}`}
					className={navData =>
						navData.isActive
							? "invert before:content-[''] before:inline-block before:absolute before:w-14 before:h-14 before:z-[-1] before:bg-gray-200 before:transform before:translate-x-navbarActiveLg before:translate-y-navbarActiveLg before:rounded-xl"
							: ''
					}>
					<img className="h-12" alt="PGC logo" src="https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/logo512.png" />
				</NavLink>
				<span className="h-4/6 border-1 border-gray-400" />
				<NavLink
					to={`/schedule${paramString === '?' ? '' : paramString}`}
					className={navData =>
						navData.isActive
							? "invert before:content-[''] before:inline-block before:absolute before:w-14 before:h-14 before:z-[-1] before:bg-gray-200 before:transform before:translate-x-navbarActive before:translate-y-navbarActive before:rounded-xl"
							: ''
					}>
					<img
						className="h-10"
						alt="Leaderboard logo"
						src="https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/ScheduleIcon.png"
					/>
				</NavLink>
				<span className="h-4/6 border-1 border-gray-400" />
				<NavLink
					to={`/standings${paramString === '?' ? '' : paramString}`}
					className={navData =>
						navData.isActive
							? "invert before:content-[''] before:inline-block before:absolute before:w-14 before:h-14 before:z-[-1] before:bg-gray-200 before:transform before:translate-x-navbarActive before:translate-y-navbarActive before:rounded-xl"
							: ''
					}>
					<img
						className="h-10"
						alt="Standings logo"
						src="https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/StandingsIcon.png"
					/>
				</NavLink>
				<span className="h-4/6 border-1 border-gray-400" />
				<NavLink
					to={`/lockerroom${paramString === '?' ? '' : paramString}`}
					className={navData =>
						navData.isActive
							? "invert before:content-[''] before:inline-block before:absolute before:w-14 before:h-14 before:z-[-1] before:bg-gray-200 before:transform before:translate-x-navbarActive before:translate-y-navbarActive before:rounded-xl"
							: ''
					}>
					<img
						className="h-10"
						alt="Golfer Stats logo"
						src="https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/LockerRoomIcon.png"
					/>
				</NavLink>
				<span className="h-4/6 border-1 border-gray-400" />
				<NavLink
					to={`/leagueoffice${paramString === '?' ? '' : paramString}`}
					className={navData =>
						navData.isActive
							? "invert before:content-[''] before:inline-block before:absolute before:w-14 before:h-14 before:z-[-1] before:bg-gray-200 before:transform before:translate-x-navbarActive before:translate-y-navbarActive before:rounded-xl"
							: ''
					}>
					<img
						className="h-10"
						alt="Rulebook logo"
						src="https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/LeagueOfficeIcon.png"
					/>
				</NavLink>
			</div>
		</div>
	)
}
