import { Link } from 'react-router-dom'
import { MatchupDataType, useScheduleData } from '../../api/queries/schedule'
import { useGSHLTeams } from '../../api/queries/teams'
import { Season, SeasonInfoDataType } from '../../api/types'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { StandingsContainer } from '../Standings'
import { useStandingsData } from '../../api/queries/standings'

export const PlayoffBracket = ({ seasonID }: { seasonID: Season }) => {
	const scheduleData = useScheduleData({ season: seasonID, gameType: 'PO' }).data
	if (!scheduleData) {
		return <LoadingSpinner />
	}
	if (!scheduleData[0].HomeTeam) return <></>
	return (
		<div className="flex flex-nowrap overflow-scroll whitespace-nowrap py-3 rounded-xl shadow-md gap-2 bg-gradient-to-b from-sunview-50 to-hotel-50 bg-opacity-10">
			<div className="flex flex-col gap-2 [&>*]:bg-orange-200 [&>*]:bg-opacity-50">
				<span className="font-oswald font-bold text-sm text-center">Conference Semifinals</span>
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 1 && obj.GameType === 'QF')[0]} />
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 2 && obj.GameType === 'QF')[0]} />
				<div className="my-8"></div>
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 3 && obj.GameType === 'QF')[0]} />
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 4 && obj.GameType === 'QF')[0]} />
			</div>
			<div className="flex flex-col [&>*]:bg-slate-200 [&>*]:bg-opacity-80">
				<span className="font-oswald font-bold text-sm text-center">Conference Finals</span>
				<div className="my-8"></div>
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 1 && obj.GameType === 'SF')[0]} />
				<div className="my-24"></div>
				<div className="my-2"></div>
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 2 && obj.GameType === 'SF')[0]} />
			</div>
			<div className="flex flex-col [&>*]:bg-yellow-200 [&>*]:bg-opacity-50">
				<span className="font-oswald font-bold text-sm text-center">GSHL Cup Final</span>
				<div className="my-24"></div>
				<div className="my-4"></div>
				<BracketLine matchup={scheduleData.filter(obj => obj.Season === seasonID && obj.MatchupNum === 1 && obj.GameType === 'F')[0]} />
			</div>
		</div>
	)
}
const BracketLine = ({ matchup }: { matchup: MatchupDataType }) => {
	const gshlTeams = useGSHLTeams({}).data
	if (!matchup) return <></>
	const homeTeam = gshlTeams?.filter(obj => obj.id === matchup.HomeTeam)[0]
	const awayTeam = gshlTeams?.filter(obj => obj.id === matchup.AwayTeam)[0]
	console.log(matchup)
	if (!homeTeam && !awayTeam) {
		return (
			<div className="flex flex-col m-2 px-2 py-4 text-gray-600 font-bold items-center bg-gray-100 shadow-emboss rounded-2xl shrink-0 min-w-max">
				{matchup.GameType === 'LT'
					? ' Losers TBD'
					: matchup.GameType === 'QF'
					? 'First Round'
					: matchup.GameType === 'SF'
					? 'Conf. Finals'
					: 'Cup Finals'}
			</div>
		)
	}
	return (
		<>
			<div className="flex flex-col m-2 px-1 items-center bg-gray-100 shadow-emboss rounded-2xl shrink-0 min-w-max">
				<Link to={'/matchup/' + matchup.id}>
					{!homeTeam ? (
						<div className={`flex p-1`}>
							<div className="mx-auto px-1 text-sm xs:text-base my-auto text-gray-400">TBD</div>
						</div>
					) : (
						<div className={`flex p-1 ${matchup.HomeWL === 'W' ? 'font-bold text-emerald-800' : matchup.HomeWL === 'L' ? 'text-rose-800' : ''}`}>
							<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">{matchup.HomeRank && '#' + matchup.HomeRank}</div>
							<img className="w-8 my-1 mx-1" src={homeTeam.LogoURL} alt="Home Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{homeTeam.TeamName}</div>
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.HomeScore}</div>
						</div>
					)}
					{!awayTeam ? (
						<div className={`flex p-1`}>
							<div className="mx-auto px-1 text-sm xs:text-base my-auto text-gray-400">TBD</div>
						</div>
					) : (
						<div className={`flex p-1 ${matchup.AwayWL === 'W' ? 'font-bold text-emerald-800' : matchup.AwayWL === 'L' ? 'text-rose-800' : ''}`}>
							<div className="mx-auto px-1 text-xs xs:text-sm items-start font-bold">{matchup.AwayRank && '#' + matchup.AwayRank}</div>
							<img className="w-8 my-1 mx-1" src={awayTeam.LogoURL} alt="Away Team Logo" />
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{awayTeam.TeamName}</div>
							<div className="mx-auto px-1 text-sm xs:text-base my-auto">{matchup.AwayScore}</div>
						</div>
					)}
				</Link>
			</div>
		</>
	)
}
export const LosersBracket = ({ season }: { season: SeasonInfoDataType }) => {
	const scheduleData = useScheduleData({ season, gameType: 'PO' })
	if (!scheduleData.data) {
		return <LoadingSpinner />
	}
	return (
		<div className=" rounded-xl shadow-md gap-2 bg-brown-200">
			<div className="flex flex-nowrap overflow-scroll whitespace-nowrap py-3">
				<div className="flex flex-col gap-2 place-content-around">
					<LosersGames {...{ season }} />
				</div>
			</div>
			<StandingsContainer {...{ standingsType: 'LosersTourney', season, options: { season, OvrRkMin: 13 } }} />
		</div>
	)
}
const LosersGames = ({ season }: { season: SeasonInfoDataType }) => {
	const scheduleData = useScheduleData({ season, gameType: 'LT' })

	if (!scheduleData.data) {
		return <LoadingSpinner />
	}
	return (
		<div className="flex flex-row overflow-auto whitespace-nowrap mt-2 flex-nowrap">
			<div className="mr-12 shrink-0">
				<div className="font-oswald text-left px-4 font-bold text-base">Week 23</div>
				<div className="flex flex-row">
					{scheduleData.data &&
						scheduleData.data
							.filter(obj => obj.Season === season.Season && obj.GameType === 'LT' && +obj.WeekNum === 24)
							.sort((a, b) => a.MatchupNum - b.MatchupNum)
							.map(obj => <BracketLine {...{ matchup: obj }} />)}
				</div>
			</div>
			<div className="mr-12 shrink-0">
				<div className="font-oswald text-left px-4 font-bold text-base">Week 24</div>
				<div className="flex flex-row">
					{scheduleData.data &&
						scheduleData.data
							.filter(obj => obj.Season === season.Season && obj.GameType === 'LT' && +obj.WeekNum === 25)
							.sort((a, b) => a.MatchupNum - b.MatchupNum)
							.map(obj => <BracketLine {...{ matchup: obj }} />)}
				</div>
			</div>
			<div className="">
				<div className="font-oswald text-left px-4 font-bold text-base">Week 25</div>
				<div className="flex flex-row">
					{scheduleData.data &&
						scheduleData.data
							.filter(obj => obj.Season === season.Season && obj.GameType === 'LT' && +obj.WeekNum === 26)
							.sort((a, b) => a.MatchupNum - b.MatchupNum)
							.map(obj => <BracketLine {...{ matchup: obj }} />)}
				</div>
			</div>
		</div>
	)
}
