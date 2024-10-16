import { useSearchParams } from 'react-router-dom'
import { CapOverview } from './LockerRoom'
import { getSeason, seasonToNumber, useCurrentWeek } from '../lib/utils'
import { TeamInfoType, TeamSeasonType, TeamWeekType, useGSHLTeams, useTeamSeasons, useTeamWeeks } from '../api/queries/teams'
import { seasons } from '../lib/constants'
import { usePlayerDays } from '../api/queries/players'
import MatchupScroller from './ui/MatchupScroller'
import { StandingsInfoType, useStandingsData } from '../api/queries/standings'
import { useScheduleData } from '../api/queries/schedule'
import { HeadlineType, useHeadlineData } from '../api/queries/leagueinfo'
import { useState } from 'react'

function Home() {
	const currentWeek = useCurrentWeek()
	const [searchParams, setSearchParams] = useSearchParams()
	if (!currentWeek) {
		return <></>
	}
	return (
		<div className="flex flex-col justify-center">
			<MatchupScroller {...{ season: currentWeek?.Season.Season, weekNum: currentWeek?.WeekNum, searchParams, prev: 'home' }} />
			<MissedStarts />
			<Headlines />
			<PowerRankings />
			<CapOverview {...{ paramState: [searchParams, setSearchParams] }} />
		</div>
	)
}

export default Home

function MissedStarts() {
	let yesterday = new Date()
	yesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getHours() < 5 ? yesterday.getDate() - 2 : yesterday.getDate() - 1)

	const teams = useGSHLTeams({ season: seasons.slice(-1)[0] })
	const playerDaysData = usePlayerDays({ season: seasonToNumber(), Date: yesterday })
	const missedStarts = playerDaysData.data?.filter(obj => obj.MS === 1).sort((a, b) => b.Rating - a.Rating)

	if (!missedStarts || missedStarts?.length === 0) return <></>
	return (
		<div className="max-w-3xl bg-rose-100 text-rose-900 mx-auto my-4 py-2 px-4 rounded-xl shadow-md font-varela">
			<div className="text-center py-1 text-xl font-bold">{`${yesterday.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}${addSuffix(
				yesterday.getDate()
			)} Missed Starts`}</div>
			{teams.data?.map(team => {
				const teamMissedStarts = missedStarts?.filter(a => +a.gshlTeam === +team.id)
				if (teamMissedStarts?.length === 0) {
					return <></>
				}
				return (
					<div key={team.id} className="px-3 py-1 flex items-center justify-center text-lg border-t border-rose-800">
						<img className="w-10 xs:w-10 mx-2" src={team.LogoURL} alt={team.TeamName + ' Logo'} />
						<div className="px-3 py-1 flex flex-col items-center justify-center text-base">
							{teamMissedStarts?.map(b => {
								return (
									<span key={b.PlayerName} className={b.nhlPos === 'G' ? 'opacity-50' : ''}>
										{b.PlayerName}, {b.nhlPos.toString()}
									</span>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}

function addSuffix(rank: number) {
	let suffix: string
	if (rank % 100 === 11 || rank % 100 === 12 || rank % 100 === 13) {
		suffix = 'th'
	} else if (rank % 10 === 1) {
		suffix = 'st'
	} else if (rank % 10 === 2) {
		suffix = 'nd'
	} else if (rank % 10 === 3) {
		suffix = 'rd'
	} else {
		suffix = 'th'
	}
	return suffix
}

function PowerRankings() {
	const stdg = useStandingsData({ season: getSeason() }).data

	if (!stdg) return <></>
	return (
		<div className="mx-3 max-w-3xl my-8 py-4 px-1 rounded-2xl bg-gray-100 hover:text-gray-800 shadow-md">
			<div className="font-oswald text-4xl font-extrabold text-center mt-2 mb-2">GSHL Power Rankings</div>
			<ul className="mx-2 p-0 [&>*:last-child]:border-none">
				{stdg
					.sort((a, b) => a.Rk - b.Rk)
					.map(obj => (
						<RankingItem {...{ teamStdgInfo: obj }} />
					))}
			</ul>
		</div>
	)
}

function RankingItem({ teamStdgInfo }: { teamStdgInfo: StandingsInfoType }) {
	const [showInfo, setShowInfo] = useState(false)
	const teams = useGSHLTeams({ season: getSeason() }).data
	const weekNum = useCurrentWeek()?.WeekNum
	const lastweek = useScheduleData({ season: getSeason(), weekNum: weekNum && weekNum - 1, teamID: teamStdgInfo.gshlTeam }).data
	const weeklyData = useTeamWeeks({ WeekNum: weekNum && weekNum - 1, season: getSeason().Season }).data
	const seasonData = useTeamSeasons({ season: getSeason().Season }).data

	if (!teams || !lastweek || !weeklyData || !seasonData) return <></>
	let rankChange = []
	if (teamStdgInfo.RkCh > 0) {
		rankChange = [Math.abs(teamStdgInfo.RkCh), 'RkUp']
	} else if (teamStdgInfo.RkCh < 0) {
		rankChange = [Math.abs(teamStdgInfo.RkCh), 'RkDn']
	} else {
		rankChange = [Math.abs(teamStdgInfo.RkCh), 'Even']
	}
	const team = teams.filter(obj => obj.id === teamStdgInfo.gshlTeam)[0]
	return (
		<div className="border-b border-gray-600">
			<li key={teamStdgInfo.gshlTeam} className="py-2.5 flex items-center" onClick={() => setShowInfo(!showInfo)}>
				<div className="font-oswald text-base xs:text-lg font-bold w-4 mx-2 flex flex-row justify-around">
					{teamStdgInfo.Rk}
					<div
						className={`font-oswald pl-1 text-2xs sm:text-xs self-center ${
							rankChange[1] === 'RkUp' ? 'text-emerald-800' : rankChange[1] === 'RkDn' ? 'text-rose-800' : 'text-gray-800'
						}`}>
						{rankChange[1] === 'RkUp' ? '\u2191' : rankChange[1] === 'RkDn' ? '\u2193' : '\u2194'}
						{rankChange[1] === 'Even' ? null : rankChange[0]}
					</div>
				</div>
				<img className="w-10 xs:w-10 mx-2" src={team.LogoURL} alt={team.TeamName + ' Logo'} />
				<div className="flex flex-col gap-2 w-full items-center">
					<div className="font-bold text-base xs:text-lg px-2 my-auto text-center">{team.TeamName}</div>
					<div className="flex flex-row items-center flex-wrap">
						<div className="text-xs xs:text-sm pr-1 ml-auto">{teamStdgInfo.W + ' - ' + teamStdgInfo.L}</div>
						<div className="text-2xs xs:text-xs pl-1 pr-2 mr-auto">{'(' + teamStdgInfo.CCW + ' - ' + teamStdgInfo.CCL + ')'}</div>
						<div className="ml-4 text-2xs sm:text-xs pl-2 mx-auto">
							{teamStdgInfo.gshlTeam === lastweek[0].HomeTeam
								? lastweek[0].HomeWL +
								  ' ' +
								  lastweek[0].HomeScore +
								  '-' +
								  lastweek[0].AwayScore +
								  ' v ' +
								  teams.filter(obj => obj.id === lastweek[0].AwayTeam)[0].TeamName
								: lastweek[0].AwayWL +
								  ' ' +
								  lastweek[0].AwayScore +
								  '-' +
								  lastweek[0].HomeScore +
								  ' @ ' +
								  teams.filter(obj => obj.id === lastweek[0].HomeTeam)[0].TeamName}
						</div>
					</div>
				</div>
			</li>
			{showInfo ? (
				<div className="grid grid-cols-12 gap-0.5 font-varela text-2xs xs:text-xs pb-2 text-center mx-auto overflow-x-scroll">
					<div className="flex flex-col mx-auto gap-8 px-1 pt-8">
						<div className="mx-auto">Last Wk</div>
						<div className="mx-auto">Season</div>
					</div>
					{['G', 'A', 'P', 'PPP', 'SOG', 'HIT', 'BLK', 'W', 'GAA', 'SVP', 'MS'].map((categoryInput: string) => {
						const category = categoryInput as 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK' | 'W' | 'GAA' | 'SVP' | 'MS'
						return <RankingItemData {...{ category, team: teamStdgInfo.gshlTeam, weeklyData, seasonData }} />
					})}
				</div>
			) : (
				<></>
			)}
		</div>
	)
}
function RankingItemData({
	category,
	team,
	weeklyData,
	seasonData,
}: {
	category: 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK' | 'W' | 'GAA' | 'SVP' | 'MS'
	team: number
	weeklyData: TeamWeekType[]
	seasonData: TeamSeasonType[]
}) {
	const weeklyTeamData = weeklyData.filter(obj => obj.gshlTeam === team)[0]
	const seasonTeamData = seasonData.filter(obj => obj.gshlTeam === team)[0]
	const weeklyRk =
		category === 'GAA' || category === 'MS'
			? weeklyData.filter(obj => obj[category] < weeklyTeamData[category]).length + 1
			: weeklyData.filter(obj => obj[category] > weeklyTeamData[category]).length + 1
	const weeklyTie = weeklyData.filter(obj => obj[category] === weeklyTeamData[category]).length > 1 ? 'T' : ''
	const seasonRk =
		category === 'GAA' || category === 'MS'
			? seasonData.filter(obj => obj[category] < seasonTeamData[category]).length + 1
			: seasonData.filter(obj => obj[category] > seasonTeamData[category]).length + 1
	const seasonTie = weeklyData.filter(obj => obj[category] === weeklyTeamData[category]).length > 1 ? 'T' : ''
	return (
		<div className="flex flex-col mx-auto gap-2">
			<div className="mx-auto font-bold">{category}</div>
			<div
				className={`mx-auto px-1.5 xs:px-1 sm:px-2 py-0.5 xs:py-0.5 sm:py-1 rounded-lg ${
					weeklyRk < 4
						? 'bg-emerald-400'
						: weeklyRk < 7
						? 'bg-emerald-200'
						: weeklyRk < 9
						? 'bg-yellow-200'
						: weeklyRk < 12
						? 'bg-orange-200'
						: 'bg-rose-200'
				}`}>
				{weeklyTeamData[category]}
				<br />
				{weeklyTie + weeklyRk + addSuffix(weeklyRk)}
			</div>

			<div
				className={`mx-auto px-1.5 xs:px-1 sm:px-2 py-0 xs:py-0.5 sm:py-1  rounded-lg ${
					seasonRk < 4
						? 'bg-emerald-400'
						: seasonRk < 7
						? 'bg-emerald-200'
						: seasonRk < 9
						? 'bg-yellow-200'
						: seasonRk < 12
						? 'bg-orange-200'
						: 'bg-rose-200'
				}`}>
				{seasonTeamData[category]}
				<br />
				{seasonTie + seasonRk + addSuffix(seasonRk)}
			</div>
		</div>
	)
}

function Headlines() {
	const headlines = useHeadlineData().data

	if (!headlines) return <></>
	return (
		<div className="mx-auto max-w-3xl my-8 py-4 px-1 rounded-2xl bg-gray-100 hover:text-gray-800 shadow-md">
			<div className="font-oswald text-4xl font-extrabold text-center mt-2 mb-2">Headlines</div>
			<ul className="mx-2 p-0 [&>*:last-child]:border-none">
				{headlines
					.sort((a, b) => b.Priority - a.Priority)
					.map((headline, i) => (
						<HeadlineItem {...{ headline, i }} />
					))}
			</ul>
		</div>
	)
}

function HeadlineItem({ headline, i }: { headline: HeadlineType; i: number }) {
	const [showInfo, setShowInfo] = useState(false)
	const rawTeams = useGSHLTeams({}).data
	if (!rawTeams) return <></>
	const teams = headline.Teams?.map(obj => rawTeams.filter(a => a.id === obj)[0])
	return (
		<li key={i} className="border-b border-gray-600 py-2.5 flex flex-col items-center justify-center" onClick={() => setShowInfo(!showInfo)}>
			<div className="flex flex-row items-center">
				{teams?.map(team => (
					<img
						className={teams.length > 1 ? 'w-4 h-4 xs:w-5 xs:h-5 mx-0.5' : 'w-6 h-6 xs:w-6 xs:h-6 mx-1'}
						src={team.LogoURL}
						alt={team.TeamName + ' Logo'}
					/>
				))}
				<div className="font-varela text-base xs:text-lg font-bold px-2 my-auto text-center">{headline.Headline}</div>
			</div>
			{showInfo ? (
				<div className="">
					<NewsStory {...{ headline }} />
				</div>
			) : (
				<></>
			)}
		</li>
	)
}
function NewsStory({ headline }: { headline: HeadlineType }) {
	return <div className="font-varela text-xs xs:text-sm px-3 my-auto pt-1 text-center">{headline.Story}</div>
}
