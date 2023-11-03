import { SecondaryPageToolbar, TeamsToggle, WeeksToggle } from './ui/PageNavBar'
import { seasons } from '../utils/constants'
import { TeamInfoType, useGSHLTeams } from '../api/queries/teams'
import { Link, SetURLSearchParams, useSearchParams } from 'react-router-dom'
import { ScheduleWeekType, useWeeksData } from '../api/queries/weeks'
import { TeamsTogglePropsType, WeeksTogglePropsType } from '../utils/types'
import { SeasonInfoDataType } from '../api/types'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { MatchupDataType, useScheduleData } from '../api/queries/schedule'

export default function Schedule() {
	const [searchParams, setSearchParams] = useSearchParams()
	const scheduleType = searchParams.get('schedType') || (searchParams.get('teamID') ? 'Team' : 'Week')
	const season = seasons.filter(obj => obj.Season === Number(searchParams.get('season')))[0] || seasons.slice(-1)[0]
	const currentTeamData = useGSHLTeams({ season, teamID: Number(searchParams.get('teamID')) }).data
	const currentWeekData = useWeeksData({ season, WeekNum: Number(searchParams.get('weekNum')) }).data
	if (!currentWeekData || !currentTeamData) return <LoadingSpinner />
	const currentWeek = searchParams.get('weekNum') ? currentWeekData[0] : undefined
	const currentTeam = searchParams.get('teamID') ? currentTeamData[0] : undefined
	const pageToolbarProps = {
		activeKey: scheduleType,
		seasonActiveKey: season,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'schedType', value: 'Week' },
			{ key: 'schedType', value: 'Team' },
		],
	}
	return (
		<div className="my-4 mx-2">
			<SecondaryPageToolbar {...pageToolbarProps} />
			{scheduleType === 'Week' ? (
				<WeeklyScheduleContainer
					{...{
						currentWeek,
						currentSeason: season,
						paramState: [searchParams, setSearchParams],
					}}
				/>
			) : (
				<TeamScheduleContainer
					{...{
						currentTeam,
						currentSeason: season,
						paramState: [searchParams, setSearchParams],
					}}
				/>
			)}
		</div>
	)
}

function WeeklyScheduleContainer(props: {
	currentWeek: ScheduleWeekType | undefined
	currentSeason: SeasonInfoDataType
	paramState: (URLSearchParams | SetURLSearchParams)[]
}) {
	const weeksToggleProps: WeeksTogglePropsType = {
		activeKey: props.currentWeek,
		seasonActiveKey: props.currentSeason,
		paramState: props.paramState,
		weekOptions: { season: props.currentSeason },
	}
	const currentWeekData = useWeeksData({ season: props.currentSeason, Date: new Date() }).data
	const scheduleWeek = props.currentWeek || !currentWeekData ? props.currentWeek : currentWeekData[0]
	const matchups = useScheduleData({ season: props.currentSeason, weekNum: scheduleWeek?.WeekNum })
	if (matchups.data) {
		matchups.data.sort((a, b) => (a.MatchupRtg && b.MatchupRtg ? b.MatchupRtg - a.MatchupRtg : -1))
	}
	return (
		<div>
			<WeeksToggle {...weeksToggleProps} />
			{matchups.data &&
				matchups.data.filter(obj => obj.MatchupRtg).map(matchup => <WeekScheduleItem {...{ matchup, season: props.currentSeason }} />)}
		</div>
	)
}

function WeekScheduleItem({ matchup, season }: { matchup: MatchupDataType; season: SeasonInfoDataType }) {
	const homeTeamData = useGSHLTeams({ season, teamID: matchup.HomeTeam || undefined }).data
	const awayTeamData = useGSHLTeams({ season, teamID: matchup.AwayTeam || undefined }).data
	const homeTeam: TeamInfoType | undefined = homeTeamData && homeTeamData[0]
	const awayTeam: TeamInfoType | undefined = awayTeamData && awayTeamData[0]

	const conf: string = matchup.GameType + awayTeam?.Conf + homeTeam?.Conf
	let bgClass: string = ''

	switch (conf) {
		case 'CCSVSV':
			bgClass = 'bg-sunview-50 bg-opacity-50'
			break
		case 'CCHHHH':
			bgClass = 'bg-hotel-50 bg-opacity-50'
			break
		case 'NCSVHH':
			bgClass = 'bg-gradient-to-r from-sunview-50 to-hotel-50 bg-opacity-10'
			break
		case 'NCHHSV':
			bgClass = 'bg-gradient-to-r from-hotel-50 to-sunview-50 bg-opacity-10'
			break
		case 'QFSVSV':
		case 'QFHHHH':
		case 'QFHHSV':
		case 'QFSVHH':
			bgClass = 'bg-orange-200 bg-opacity-30'
			break
		case 'SFSVSV':
		case 'SFHHHH':
		case 'SFHHSV':
		case 'SFSVHH':
			bgClass = 'bg-slate-200 bg-opacity-30'
			break
		case 'FSVSV':
		case 'FHHHH':
		case 'FHHSV':
		case 'FSVHH':
			bgClass = 'bg-yellow-200 bg-opacity-30'
			break
		case 'LTSVSV':
		case 'LTHHHH':
		case 'LTHHSV':
		case 'LTSVHH':
			bgClass = 'bg-brown-200 bg-opacity-40'
			break
		default:
			bgClass = 'bg-gray-100'
			break
	}

	if (!homeTeam || !awayTeam) {
		return <></>
	}
	return (
		<Link className={`grid grid-cols-7 mb-3 py-2 mx-2 items-center shadow-md rounded-xl ${bgClass}`} to={'/matchup/' + matchup.id}>
			<div className={'col-span-3 flex flex-col whitespace-nowrap text-center p-2 gap-2 items-center justify-center ' + matchup.HomeWL}>
				{matchup.AwayRank && +matchup.AwayRank <= 8 && matchup.AwayRank ? (
					<div className="flex flex-row">
						<span className="text-sm xs:text-base text-black font-bold font-oswald pr-1">{'#' + matchup.AwayRank}</span>
						<img className="w-12 xs:w-16" src={awayTeam?.LogoURL} alt="Away Team Logo" />
					</div>
				) : (
					<img className="w-12 xs:w-16" src={awayTeam?.LogoURL} alt="Away Team Logo" />
				)}
				<div className={'text-base xs:text-lg font-oswald'}>{awayTeam?.TeamName}</div>
			</div>
			<div className="text-2xl xs:text-xl font-oswald text-center">
				{matchup.HomeScore || matchup.AwayScore ? (
					<>
						<span className={matchup.AwayWL === 'W' ? 'text-emerald-700 font-bold' : matchup.AwayWL === 'L' ? 'text-rose-800' : ''}>
							{matchup.AwayScore}
						</span>
						{' - '}
						<span className={matchup.HomeWL === 'W' ? 'text-emerald-700 font-bold' : matchup.HomeWL === 'L' ? 'text-rose-800' : ''}>
							{matchup.HomeScore}
						</span>
					</>
				) : (
					'@'
				)}
			</div>
			<div className={'col-span-3 flex flex-col whitespace-nowrap text-center p-2 gap-2 items-center justify-center ' + matchup.HomeWL}>
				{matchup.HomeRank && +matchup.HomeRank <= 8 && matchup.HomeRank ? (
					<div className="flex flex-row">
						<span className="text-sm xs:text-base text-black font-bold font-oswald pr-1">{'#' + matchup.HomeRank}</span>
						<img className="w-12 xs:w-16" src={homeTeam.LogoURL} alt="Home Team Logo" />
					</div>
				) : (
					<img className="w-12 xs:w-16" src={homeTeam.LogoURL} alt="Home Team Logo" />
				)}
				<div className={'text-base xs:text-lg font-oswald'}>{homeTeam.TeamName}</div>
			</div>
		</Link>
	)
}

function TeamScheduleContainer(props: {
	currentTeam: TeamInfoType | undefined
	currentSeason: SeasonInfoDataType
	paramState: (URLSearchParams | SetURLSearchParams)[]
}) {
	const teamsToggleProps: TeamsTogglePropsType = {
		activeKey: props.currentTeam,
		seasonActiveKey: props.currentSeason,
		paramState: props.paramState,
		teamOptions: { season: props.currentSeason },
	}
	const scheduleData = useScheduleData({ season: props.currentSeason, teamID: props.currentTeam?.id }).data
	return (
		<>
			<TeamsToggle {...teamsToggleProps} />
			<div className="my-10">
				{props.currentTeam && (
					<>
						<div className="text-xl text-center font-bold font-varela mt-10">{props.currentTeam.TeamName + ' Schedule'}</div>
						<div className="grid grid-cols-9 items-center text-center font-bold mt-2 mb-2">
							<div className="text-xs">Week</div>
							<div className="text-xs col-span-6">Opponent</div>
							<div className="text-xs col-span-2">Score</div>
						</div>
						{scheduleData?.map(
							matchup => props.currentTeam && <TeamScheduleItem {...{ matchup, team: props.currentTeam }} season={props.currentSeason} />
						)}
					</>
				)}
			</div>
		</>
	)
}

function TeamScheduleItem({ matchup, team, season }: { matchup: MatchupDataType; team: TeamInfoType; season: SeasonInfoDataType }) {
	const gshlTeams = useGSHLTeams({ season }).data
	const opponent =
		matchup.AwayTeam === team.id ? gshlTeams?.filter(obj => obj.id === matchup.HomeTeam)[0] : gshlTeams?.filter(obj => obj.id === matchup.AwayTeam)[0]
	let output = []
	switch (matchup.GameType) {
		case 'QF':
			output = ['QF', 'text-orange-800 bg-orange-100']
			break
		case 'SF':
			output = ['SF', 'text-slate-700 bg-slate-100']
			break
		case 'F':
			output = ['F', 'text-yellow-800 bg-yellow-100']
			break
		case 'LT':
			output = ['LT', 'text-brown-800 bg-brown-100']
			break
		default:
			output = [matchup.WeekNum, opponent?.Conf === 'HH' ? 'text-hotel-800' : 'text-sunview-800']
			break
	}
	if (!opponent) {
		return <></>
	}
	return (
		<Link to={'/matchup/' + matchup.id}>
			<div className={`grid grid-cols-9 py-2 border-b ${output[1]}`}>
				<div className="place-self-center font-varela">{output[0]}</div>
				<div className="col-span-6 text-base place-self-center font-varela">
					{matchup.AwayTeam === team.id
						? '@ ' + (matchup.HomeRank ? '#' + matchup.HomeRank + ' ' : '') + opponent.TeamName
						: 'v ' + (matchup.AwayRank ? '#' + matchup.AwayRank + ' ' : '') + opponent.TeamName}
				</div>
				{(matchup.HomeScore || matchup.AwayScore) && (
					<div
						className={`text-sm col-span-2 my-auto text-center font-varela ${
							(matchup.HomeTeam === team.id ? matchup.HomeWL : matchup.AwayWL) === 'W'
								? 'text-emerald-700 font-semibold'
								: (matchup.HomeTeam === team.id ? matchup.HomeWL : matchup.AwayWL) === 'L'
								? 'text-rose-800'
								: 'text-gray-500'
						}`}>
						<span className="pr-2">{matchup.HomeTeam === team.id ? matchup.HomeWL : matchup.AwayWL}</span>
						<span>
							{matchup.HomeTeam === team.id ? matchup.HomeScore + ' - ' + matchup.AwayScore : matchup.AwayScore + ' - ' + matchup.HomeScore}
						</span>
					</div>
				)}
			</div>
		</Link>
	)
}
