import { Link } from 'react-router-dom'
import { MatchupDataType, useScheduleData } from '../../api/queries/schedule'
import { TeamInfoType, useGSHLTeams } from '../../api/queries/teams'
import { LoadingSpinner } from './LoadingSpinner'

export default function MatchupScroller({
	season,
	weekNum,
	currentID,
	searchParams,
	prev,
}: {
	season: number
	weekNum: number
	currentID?: number
	searchParams: URLSearchParams
	prev: string
}) {
	const weeklyMatchups = useScheduleData({ season, weekNum })
	const pastMatchups = useScheduleData({ season, weekNum: weekNum - 1 })
	const teams = useGSHLTeams({})
	if (!weeklyMatchups.data || !pastMatchups.data || !teams.data) {
		return <LoadingSpinner />
	}
	return (
		<div className="flex flex-row overflow-auto whitespace-nowrap mt-2 flex-nowrap">
			<div className="shrink-0">
				<div className="font-oswald text-left px-4 font-bold text-base">Week {weeklyMatchups.data[0].WeekNum}</div>
				<div className="flex flex-row">
					{weeklyMatchups.data
						.sort((a, b) => a.MatchupNum - b.MatchupNum)
						.map(matchup => (
							<ScrollerItem {...{ matchup, teams: teams.data, currentID: currentID || 0, searchParams, prev }} />
						))}
				</div>
			</div>
			<div className="border-slate-400 border-r mx-8"></div>
			<div className="shrink-0">
				<div className="font-oswald text-left px-4 font-bold text-base">Week {pastMatchups.data[0].WeekNum}</div>
				<div className="flex flex-row">
					{pastMatchups.data
						.sort((a, b) => a.MatchupNum - b.MatchupNum)
						.map(matchup => (
							<ScrollerItem {...{ matchup, teams: teams.data, currentID: currentID || 0, searchParams, prev }} />
						))}
				</div>
			</div>
		</div>
	)
}
function ScrollerItem({
	matchup,
	teams,
	currentID,
	searchParams,
	prev,
}: {
	matchup: MatchupDataType
	teams: TeamInfoType[]
	currentID: number
	searchParams: URLSearchParams
	prev: string
}) {
	const homeTeam = teams.filter(obj => obj.id === matchup.HomeTeam)[0]
	const awayTeam = teams.filter(obj => obj.id === matchup.AwayTeam)[0]
	searchParams.set('prev',prev)
	return (
		<>
			{currentID === matchup.id ? (
				<div key={matchup.id} className="flex flex-col m-2 px-1 items-center shadow-emboss rounded-2xl shrink-0 bg-zinc-300">
					<Link to={'/matchup/' + matchup.id + '?' + searchParams.toString()}>
						<div className={`flex p-1 ${matchup.AwayWL === 'W' ? 'font-bold text-emerald-800' : matchup.AwayWL === 'L' ? 'text-rose-800' : ''}`}>
							{matchup.AwayRank && matchup.AwayRank <= 8 ? (
								<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">#{matchup.AwayRank}</div>
							) : (
								<div className="pl-5"></div>
							)}
							<img className="w-8 my-1 mx-1" src={awayTeam.LogoURL} alt="Away Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.AwayScore}</div>
						</div>
						<div className={`flex p-1 ${matchup.HomeWL === 'W' ? 'font-bold text-emerald-800' : matchup.HomeWL === 'L' ? 'text-rose-800' : ''}`}>
							{matchup.HomeRank && matchup.HomeRank <= 8 ? (
								<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">#{matchup.HomeRank}</div>
							) : (
								<div className="pl-5"></div>
							)}
							<img className="w-8 my-1 mx-1" src={homeTeam.LogoURL} alt="Home Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.HomeScore}</div>
						</div>
					</Link>
				</div>
			) : (
				<div key={matchup.id} className="flex flex-col m-2 px-1 items-center shadow-emboss rounded-2xl shrink-0 bg-gray-100">
					<Link to={'/matchup/' + matchup.id + '?' + searchParams.toString()}>
						<div className={`flex p-1 ${matchup.AwayWL === 'W' ? 'font-bold text-emerald-800' : matchup.AwayWL === 'L' ? 'text-rose-800' : ''}`}>
							{matchup.AwayRank && matchup.AwayRank <= 8 ? (
								<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">#{matchup.AwayRank}</div>
							) : (
								<div className="pl-5"></div>
							)}
							<img className="w-8 my-1 mx-1" src={awayTeam.LogoURL} alt="Away Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.AwayScore}</div>
						</div>
						<div className={`flex p-1 ${matchup.HomeWL === 'W' ? 'font-bold text-emerald-800' : matchup.HomeWL === 'L' ? 'text-rose-800' : ''}`}>
							{matchup.HomeRank && matchup.HomeRank <= 8 ? (
								<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">#{matchup.HomeRank}</div>
							) : (
								<div className="pl-5"></div>
							)}
							<img className="w-8 my-1 mx-1" src={homeTeam.LogoURL} alt="Home Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.HomeScore}</div>
						</div>
					</Link>
				</div>
			)}
		</>
	)
}
