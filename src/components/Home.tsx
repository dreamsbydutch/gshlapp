import { useSearchParams } from 'react-router-dom'
import { CapOverview } from './LockerRoom'
import { seasonToNumber, useCurrentWeek } from '../utils/utils'
import { useGSHLTeams } from '../api/queries/teams'
import { seasons } from '../utils/constants'
import { usePlayerDays } from '../api/queries/players'
import MatchupScroller from './ui/MatchupScroller'

function Home() {
	const currentWeek = useCurrentWeek()
	const [searchParams, setSearchParams] = useSearchParams()
	if (!currentWeek) {
		return <></>
	}
	return (
		<div>
			<MatchupScroller {...{ season: currentWeek?.Season.Season, weekNum: currentWeek?.WeekNum, searchParams, prev: 'home' }} />
			<MissedStarts />
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
	console.log(playerDaysData, missedStarts)

	if (!missedStarts || missedStarts?.length === 0) return <></>
	return (
		<div className="bg-rose-100 text-rose-900 mx-3 my-4 py-2 rounded-xl shadow-md font-varela">
			<div className="text-center py-1 text-2xl font-bold">{`${yesterday.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}${addSuffix(
				yesterday.getDate()
			)} Missed Starts`}</div>
			{teams.data?.map(team => {
				const teamMissedStarts = missedStarts?.filter(a => +a.gshlTeam === +team.id)
				if (teamMissedStarts?.length === 0) {
					return <></>
				}
				return (
					<div key={team.id} className="px-3 py-1 flex items-center justify-center text-lg border-t border-rose-800">
						<img className="w-12 xs:w-12 mx-2" src={team.LogoURL} alt={team.TeamName + ' Logo'} />
						<div className="px-3 py-1 flex flex-col items-center justify-center text-lg">
							{teamMissedStarts?.map(b => {
								return (
									<span key={b.PlayerName} className={b.nhlPos === 'G' ? 'opacity-50' : ''}>
										{b.PlayerName}, {b.nhlPos}
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
