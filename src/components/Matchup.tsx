/* eslint-disable no-mixed-spaces-and-tabs */
import { Link, SetURLSearchParams, useParams, useSearchParams } from 'react-router-dom'
import { MatchupDataType, useScheduleData } from '../api/queries/schedule'
import { PlayerWeekType, usePlayerDays, usePlayerTotals, usePlayerWeeks } from '../api/queries/players'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { TeamInfoType, TeamWeekType, useGSHLTeams, useTeamWeeks } from '../api/queries/teams'
import { dateToString, formatDate, getSeason, useCurrentWeek } from '../lib/utils'
import { BackButton } from './ui/BackButton'
import { useState } from 'react'
import { useWeeksData } from '../api/queries/weeks'

export default function MatchupContainer() {
	const { id } = useParams()
	const [searchParams, setSearchParams] = useSearchParams()
	const schedData = useScheduleData({ id: Number(id?.replace(',', '')) })
	if (!schedData.data) return <LoadingSpinner />
	return <Matchup paramState={[searchParams, setSearchParams]} matchup={schedData.data[0]} />
}

function Matchup({ matchup, paramState }: { matchup: MatchupDataType; paramState: (URLSearchParams | SetURLSearchParams)[] }) {
	const teamsData = useGSHLTeams({ season: getSeason(matchup.Season) })
	const homePlayerWeeks = usePlayerWeeks({ season: matchup.Season, WeekNum: matchup.WeekNum, gshlTeam: matchup.HomeTeam || 0 })
	const awayPlayerWeeks = usePlayerWeeks({ season: matchup.Season, WeekNum: matchup.WeekNum, gshlTeam: matchup.AwayTeam || 0 })
	const homeTeamWeeks = useTeamWeeks({ season: matchup.Season, WeekNum: matchup.WeekNum, gshlTeam: matchup.HomeTeam || 0 })
	const awayTeamWeeks = useTeamWeeks({ season: matchup.Season, WeekNum: matchup.WeekNum, gshlTeam: matchup.AwayTeam || 0 })
	const currentWeek = useCurrentWeek()
	if (!homePlayerWeeks.data || !awayPlayerWeeks.data || !homeTeamWeeks.data || !awayTeamWeeks.data || !teamsData.data || !currentWeek)
		return <LoadingSpinner />
	const teams = teamsData.data
	const matchupTeams = {
		homeTeam: teams.filter(obj => obj.id === matchup.HomeTeam)[0],
		awayTeam: teams.filter(obj => obj.id === matchup.AwayTeam)[0],
	}
	const matchupStats = {
		homePlayers: homePlayerWeeks.data,
		homeTeam: homeTeamWeeks.data[0],
		awayPlayers: awayPlayerWeeks.data,
		awayTeam: awayTeamWeeks.data[0],
	}
	const searchParams = paramState[0] as URLSearchParams
	return (
		<>
			<BackButton {...{ searchParams }} />
			<MatchupPageScroller {...{ season: matchup.Season, weekNum: matchup.WeekNum, currentID: matchup.id, searchParams }} />
			<MatchupHeader {...{ matchup, matchupTeams, matchupStats }} />
			{matchupStats.homeTeam && matchupStats.awayTeam && <MatchupStats {...{ matchupStats }} />}
			{matchup.HomeWL && matchup.AwayWL && matchupStats.homeTeam && matchupStats.awayTeam && (
				<>
					<ThreeStars {...{ matchup, matchupStats, matchupTeams }} />
				</>
			)}
			{!matchup.HomeWL && !matchup.AwayWL && matchup.WeekNum === currentWeek.WeekNum && <PlayingToday {...{ matchup, matchupTeams }} />}
			{!matchup.HomeWL && !matchup.AwayWL && !matchupStats.homeTeam && !matchupStats.awayTeam && (
				<>
					<WatchList {...{ matchup, matchupStats, matchupTeams }} />
				</>
			)}
			{matchupStats.homeTeam && matchupStats.awayTeam && <MatchupBoxscore {...{ matchup, matchupStats, matchupTeams }} />}
		</>
	)
}

function MatchupHeader({
	matchup,
	matchupStats,
	matchupTeams,
}: {
	matchup: MatchupDataType
	matchupStats: {
		homePlayers: PlayerWeekType[]
		homeTeam: TeamWeekType
		awayPlayers: PlayerWeekType[]
		awayTeam: TeamWeekType
	}
	matchupTeams: { homeTeam: TeamInfoType; awayTeam: TeamInfoType }
}) {
	return (
		<div className="grid grid-cols-11 w-5/6 mx-auto justify-center items-center mt-8">
			<div className="col-span-5 flex flex-row justify-center">
				{matchup.AwayRank && matchup.AwayRank <= 8 ? <div className="text-sm mt-2 mr-0.5 font-bold">#{matchup.AwayRank}</div> : <></>}
				<img className="h-20" src={matchupTeams.awayTeam.LogoURL} alt={matchupTeams.awayTeam.TeamName + 'Logo'} />
				<div
					className={`place-self-center ml-4 text-4xl ${
						matchup.AwayWL === 'W' ? 'font-bold text-emerald-800' : matchup.AwayWL === 'L' ? 'text-rose-800' : ''
					}`}>
					{matchupStats.awayTeam && matchup.AwayScore}
				</div>
			</div>
			<div className="text-center font-bold text-lg">@</div>
			<div className="col-span-5 flex flex-row justify-center">
				<div
					className={`place-self-center mr-4 text-4xl ${
						matchup.HomeWL === 'W' ? 'font-bold text-emerald-800' : matchup.HomeWL === 'L' ? 'text-rose-800' : ''
					}`}>
					{matchupStats.homeTeam && matchup.HomeScore}
				</div>
				{matchup.HomeRank && matchup.HomeRank <= 8 ? <div className="text-sm mt-2 mr-0.5 font-bold">#{matchup.HomeRank}</div> : <></>}
				<img className="h-20" src={matchupTeams.homeTeam.LogoURL} alt={matchupTeams.homeTeam.TeamName + 'Logo'} />
			</div>
		</div>
	)
}

function MatchupStats({
	matchupStats,
}: {
	matchupStats: {
		homePlayers: PlayerWeekType[]
		homeTeam: TeamWeekType
		awayPlayers: PlayerWeekType[]
		awayTeam: TeamWeekType
	}
}) {
	return (
		<div className="my-6 font-varela">
			{['G', 'A', 'P', 'PPP', 'SOG', 'HIT', 'BLK', 'W', 'GAA', 'SVP'].map((obj, i) => {
				const home = matchupStats.homeTeam[obj as 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK' | 'W' | 'GAA' | 'SVP']
				const away = matchupStats.awayTeam[obj as 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK' | 'W' | 'GAA' | 'SVP']
				return (
					<>
						{obj === 'GAA' ? (
							<div className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted" key={i}>
								<div
									className={`col-span-2 ${
										away ? (!home || +away < +home ? 'text-emerald-800 font-bold' : +away > +home ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{away}
								</div>
								<div className="text-xs font-bold">{obj}</div>
								<div
									className={`col-span-2 ${
										home ? (!away || +home < +away ? 'text-emerald-800 font-bold' : +home > +away ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{home}
								</div>
							</div>
						) : (
							<div className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted" key={i}>
								<div
									className={`col-span-2 ${
										away ? (!home || +away > +home ? 'text-emerald-800 font-bold' : +away < +home ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{away}
								</div>
								<div className="text-xs font-bold">{obj === 'SVP' ? 'SV%' : obj}</div>
								<div
									className={`col-span-2 ${
										home ? (!away || +home > +away ? 'text-emerald-800 font-bold' : +home < +away ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{home}
								</div>
							</div>
						)}
					</>
				)
			})}
			<div className="my-4"></div>
			{['Rating', 'GS', 'MS', 'BS'].map((obj, i) => {
				const home = obj === 'Rating' ? Math.round(matchupStats.homeTeam.Rating * 10) / 10 : matchupStats.homeTeam[obj as 'GS' | 'MS' | 'BS']
				const away = obj === 'Rating' ? Math.round(matchupStats.awayTeam.Rating * 10) / 10 : matchupStats.awayTeam[obj as 'GS' | 'MS' | 'BS']
				const homeLineupDec =
					matchupStats.homeTeam.GP + matchupStats.homeTeam.GPg - (matchupStats.homeTeam.GS + matchupStats.homeTeam.GSg) - matchupStats.homeTeam.MS
				const awayLineupDec =
					matchupStats.awayTeam.GP + matchupStats.awayTeam.GPg - (matchupStats.awayTeam.GS + matchupStats.awayTeam.GSg) - matchupStats.awayTeam.MS
				return (
					<>
						{obj === 'Rating' ? (
							<div className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted" key={i}>
								<div
									className={`col-span-2 ${
										away ? (!home || +away > +home ? 'text-emerald-800 font-bold' : +away < +home ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{away}
								</div>
								<div className="text-xs font-bold">{obj}</div>
								<div
									className={`col-span-2 ${
										home ? (!away || +home > +away ? 'text-emerald-800 font-bold' : +home < +away ? 'text-rose-800 text-sm' : '') : ''
									}`}>
									{home}
								</div>
							</div>
						) : obj === 'GS' ? (
							<div
								className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted text-2xs"
								key={i}>
								<div
									className={`col-span-2 ${
										away ? (!home || +away > +home ? 'text-emerald-800 font-bold text-xs' : +away < +home ? 'text-rose-800' : '') : ''
									}`}>
									{away}
								</div>
								<div className="font-bold">Starts</div>
								<div
									className={`col-span-2 ${
										home ? (!away || +home > +away ? 'text-emerald-800 font-bold text-xs' : +home < +away ? 'text-rose-800' : '') : ''
									}`}>
									{home}
								</div>
							</div>
						) : obj === 'BS' ? (
							<div
								className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted text-2xs"
								key={i}>
								<div className={`col-span-2`}>
									{awayLineupDec - away} / {awayLineupDec} - {Math.round((1 - away / awayLineupDec) * 1000) / 10}%
								</div>
								<div className="font-bold">Lineup Decisions</div>
								<div className={`col-span-2`}>
									{homeLineupDec - home} / {homeLineupDec} - {Math.round((1 - home / homeLineupDec) * 1000) / 10}%
								</div>
							</div>
						) : (
							<div
								className="w-4/6 mx-auto grid gap-2 grid-cols-5 p-0.5 text-center items-center border-b border-gray-400 border-dotted text-2xs"
								key={i}>
								<div
									className={`col-span-2 ${
										away ? (!home || +away < +home ? 'text-emerald-800 font-bold text-xs' : +away > +home ? 'text-rose-800' : '') : ''
									}`}>
									{away}
								</div>
								<div className="font-bold">{obj === 'MS' ? 'Missed Starts' : obj}</div>
								<div
									className={`col-span-2 ${
										home ? (!away || +home < +away ? 'text-emerald-800 font-bold text-xs' : +home > +away ? 'text-rose-800' : '') : ''
									}`}>
									{home}
								</div>
							</div>
						)}
					</>
				)
			})}
		</div>
	)
}

function ThreeStars({
	matchup,
	matchupStats,
	matchupTeams,
}: {
	matchup: MatchupDataType
	matchupStats: {
		homePlayers: PlayerWeekType[]
		homeTeam: TeamWeekType
		awayPlayers: PlayerWeekType[]
		awayTeam: TeamWeekType
	}
	matchupTeams: { homeTeam: TeamInfoType; awayTeam: TeamInfoType }
}) {
	if (!matchupStats.homePlayers && !matchupStats.awayPlayers) {
		return <LoadingSpinner />
	}
	const firstStar = [...matchupStats.homePlayers, ...matchupStats.awayPlayers].filter(obj => obj.id === matchup.FirstStar)[0]
	const secondStar = [...matchupStats.homePlayers, ...matchupStats.awayPlayers].filter(obj => obj.id === matchup.SecondStar)[0]
	const thirdStar = [...matchupStats.homePlayers, ...matchupStats.awayPlayers].filter(obj => obj.id === matchup.ThirdStar)[0]
	if (!firstStar || !secondStar || !thirdStar) {
		return <LoadingSpinner />
	}
	return (
		<div>
			<div className="mt-8 text-lg text-center font-bold">Three Stars</div>
			{matchup.FirstStar && (
				<div className="w-11/12 mt-2 mx-auto flex flex-col p-1 gap-4 items-center font-varela">
					<div className="grid grid-cols-7 m-auto w-11/12 text-center">
						<div className="text-3xl text-yellow-300 m-auto">{'\u2605'}</div>
						<img
							className="my-auto"
							src={matchup.AwayTeam && firstStar.gshlTeam.includes(matchup.AwayTeam) ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="First Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto items-center inline-block">
							{firstStar.PlayerName}, {firstStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									firstStar.nhlTeam && firstStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 mx-1.5"
							/>
							{firstStar.nhlPos[0] === 'G' ? (
								<div className="text-2xs mx-1">{`${firstStar.W} W / ${firstStar.GAA} GAA / ${firstStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${firstStar.G} G / ${firstStar.A} A / ${firstStar.P} P / ${firstStar.PPP} PPP / ${firstStar.SOG} SOG / ${firstStar.HIT} HIT / ${firstStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
					<div className="grid grid-cols-7 m-auto w-11/12 text-center">
						<div className="text-2xl text-slate-300 m-auto">
							{'\u2605'}
							{'\u2605'}
						</div>
						<img
							className="my-auto"
							src={matchup.AwayTeam && secondStar.gshlTeam.includes(matchup.AwayTeam) ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="Second Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto items-center inline-block">
							{secondStar.PlayerName}, {secondStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									secondStar.nhlTeam && secondStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 mx-1.5"
							/>
							{secondStar.nhlPos[0] === 'G' ? (
								<div className="text-2xs mx-1">{`${secondStar.W} W / ${secondStar.GAA} GAA / ${secondStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${secondStar.G} G / ${secondStar.A} A / ${secondStar.P} P / ${secondStar.PPP} PPP / ${secondStar.SOG} SOG / ${secondStar.HIT} HIT / ${secondStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
					<div className="grid grid-cols-7 m-auto w-11/12 text-center">
						<div className="text-xl text-orange-700 my-auto text-center">
							{'\u2605'}
							<br></br>
							{'\u2605'}
							{'\u2605'}
						</div>
						<img
							className="my-auto"
							src={matchup.AwayTeam && thirdStar.gshlTeam.includes(matchup.AwayTeam) ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="Third Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto items-center inline-block">
							{thirdStar.PlayerName}, {thirdStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									thirdStar.nhlTeam && thirdStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 mx-1.5"
							/>
							{thirdStar.nhlPos[0] === 'G' ? (
								<div className="text-2xs mx-1">{`${thirdStar.W} W / ${thirdStar.GAA} GAA / ${thirdStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${thirdStar.G} G / ${thirdStar.A} A / ${thirdStar.P} P / ${thirdStar.PPP} PPP / ${thirdStar.SOG} SOG / ${thirdStar.HIT} HIT / ${thirdStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function MatchupBoxscore({
	matchup,
	matchupStats,
	matchupTeams,
}: {
	matchup: MatchupDataType
	matchupStats: {
		homePlayers: PlayerWeekType[]
		homeTeam: TeamWeekType
		awayPlayers: PlayerWeekType[]
		awayTeam: TeamWeekType
	}
	matchupTeams: { homeTeam: TeamInfoType; awayTeam: TeamInfoType }
}) {
	const week = useWeeksData({ season: matchup.Season, WeekNum: matchup.WeekNum }).data
	const currentRoster = usePlayerDays({
		season: matchup.Season,
		Date: week && (dateToString(week[0].EndDate) > dateToString() ? new Date(dateToString()) : week[0].EndDate),
	})
	const [boxscoreTeam, setBoxscoreTeam] = useState('home')
	const teamStats = matchupStats && (boxscoreTeam === 'home' ? matchupStats.homePlayers : matchupStats.awayPlayers)
	if (!teamStats || !currentRoster.data) {
		return <LoadingSpinner />
	}
	return (
		<div className="mb-16 font-varela">
			<div className="mt-12 mb-4 mx-1">
				<div className="flex flex-wrap gap-3 items-center justify-center list-none">
					<div
						key="Week"
						className={`min-w-min text-center font-bold py-1 px-3 rounded-md shadow-emboss text-xs sm:text-sm ${
							boxscoreTeam === 'away' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700'
						}`}
						onClick={() => setBoxscoreTeam('away')}>
						{matchupTeams.awayTeam.TeamName}
					</div>
					<div
						key="Team"
						className={`min-w-min text-center font-bold py-1 px-3 rounded-md shadow-emboss text-xs sm:text-sm ${
							boxscoreTeam === 'home' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700'
						}`}
						onClick={() => setBoxscoreTeam('home')}>
						{matchupTeams.homeTeam.TeamName}
					</div>
				</div>
			</div>
			<div className="table-auto overflow-scroll">
				<table className="mx-auto overflow-x-auto">
					<thead>
						<tr key="Header">
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Player">
								Player
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Pos">
								Pos
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Team">
								Team
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="GS">
								GS
							</th>
							{['G', 'A', 'P', 'PPP', 'SOG', 'HIT', 'BLK'].map(obj => (
								<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key={obj}>
									{obj}
								</th>
							))}
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Rating">
								Rating
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Days">
								Days
							</th>
						</tr>
					</thead>
					<tbody>
						{teamStats
							?.filter(obj => obj.nhlPos[0] !== 'G')
							.sort((a, b) => b.Rating - a.Rating)
							.map(player => {
								const active =
									currentRoster.data?.filter(
										obj =>
											player.gshlTeam.includes(obj.gshlTeam[0]) &&
											player.nhlPos.toString() === obj.nhlPos.toString() &&
											player.PlayerName === obj.PlayerName
									).length > 0
								return (
									<tr key={player.id} className={`${!active && 'text-gray-400 text-opacity-80'}`}>
										<td
											className="sticky left-0 whitespace-nowrap py-1 px-2 text-center text-xs border-t border-b border-gray-300 bg-gray-50"
											key="Player">
											{player.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Pos">
											{player.nhlPos.toString()}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Team">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
													player.nhlTeam && player.nhlTeam.slice(-1)[0]
												}.png`}
												alt=""
												className="h-4 w-4"
											/>
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="GS">
											{player.GS}
										</td>
										{['G', 'A', 'P', 'PPP', 'SOG', 'HIT', 'BLK'].map(obj => (
											<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key={obj}>
												{player[obj]}
											</td>
										))}
										<td className="py-1 px-2 text-center text-xs font-bold bg-gray-50 border-t border-b border-gray-300" key="Rating">
											{Math.round(player.Rating * 100) / 100}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Days">
											{player.RosterDays}
										</td>
									</tr>
								)
							})}
					</tbody>
					<thead>
						<tr key="Header">
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Player">
								Player
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Pos">
								Pos
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Team">
								Team
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="GS">
								GS
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Space"></th>
							{['W', 'GAA', 'SVP'].map(obj => (
								<>
									<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key={obj}>
										{obj}
									</th>
									<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Space"></td>
								</>
							))}
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Rating">
								Rating
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200" key="Days">
								Days
							</th>
						</tr>
					</thead>
					<tbody>
						{teamStats
							?.filter(obj => obj.nhlPos[0] === 'G')
							.sort((a, b) => b.Rating - a.Rating)
							.map(player => {
								const active =
									currentRoster.data?.filter(
										obj => obj.gshlTeam[0] === player.gshlTeam[0] && player.nhlPos[0] === obj.nhlPos[0] && player.PlayerName === obj.PlayerName
									).length > 0
								return (
									<tr key={player.id} className={`${!active && 'text-gray-400 text-opacity-80'}`}>
										<td className="sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 bg-gray-50" key="Player">
											{player.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Pos">
											{player.nhlPos}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Team">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
													player.nhlTeam && player.nhlTeam.slice(-1)[0]
												}.png`}
												alt=""
												className="h-4 w-4"
											/>
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="GS">
											{player.GS}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Space"></td>
										{['W', 'GAA', 'SVP'].map(obj => (
											<>
												<td className="py-1 px-2 col-span-2 text-center text-xs border-t border-b border-gray-300" key={obj}>
													{player[obj]}
												</td>
												<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Space"></td>
											</>
										))}
										<td className="py-1 px-2 text-center text-xs font-bold bg-gray-50 border-t border-b border-gray-300" key="Rating">
											{Math.round(player.Rating * 100) / 100}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300" key="Days">
											{player.RosterDays}
										</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function WatchList({
	matchup,
	matchupStats,
	matchupTeams,
}: {
	matchup: MatchupDataType
	matchupStats: {
		homePlayers: PlayerWeekType[]
		homeTeam: TeamWeekType
		awayPlayers: PlayerWeekType[]
		awayTeam: TeamWeekType
	}
	matchupTeams: { homeTeam: TeamInfoType; awayTeam: TeamInfoType }
}) {
	const playerSeasonStats = usePlayerTotals({ season: matchup.Season })
	if (!matchup || !matchupStats.homePlayers || !matchupStats.awayPlayers || !matchupTeams) {
		return <LoadingSpinner />
	}
	const firstStar = playerSeasonStats.data?.filter(obj => obj.id === matchup.FirstStar)[0]
	const secondStar = playerSeasonStats.data?.filter(obj => obj.id === matchup.SecondStar)[0]
	const thirdStar = playerSeasonStats.data?.filter(obj => obj.id === matchup.ThirdStar)[0]
	if (!firstStar || !secondStar || !thirdStar) {
		return <LoadingSpinner />
	}
	return (
		<div>
			<div className="mt-8 text-lg text-center font-bold">Players to Watch</div>
			{matchup.FirstStar && (
				<div className="w-11/12 mt-2 mx-auto flex flex-col p-1 gap-4 items-center text-center font-varela">
					<div className="grid grid-cols-6 m-auto w-11/12 text-center">
						<img
							className="my-auto"
							src={matchup.AwayTeam === firstStar.gshlTeam.slice(-1)[0] ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="First Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto items-center inline-block">
							{firstStar.PlayerName}, {firstStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									firstStar.nhlTeam && firstStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 mx-1.5"
							/>
							{firstStar.nhlPos === 'G' ? (
								<div className="text-2xs mx-1">{`${firstStar.W} W / ${firstStar.GAA} GAA / ${firstStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${firstStar.G} G / ${firstStar.A} A / ${firstStar.P} P / ${firstStar.PPP} PPP / ${firstStar.SOG} SOG / ${firstStar.HIT} HIT / ${firstStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
					<div className="grid grid-cols-6 m-auto w-11/12 text-center">
						<img
							className="my-auto"
							src={matchup.AwayTeam === secondStar.gshlTeam.slice(-1)[0] ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="Second Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto inline-block items-center">
							{secondStar.PlayerName}, {secondStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									secondStar.nhlTeam && secondStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 ml-1.5"
							/>
							{secondStar.nhlPos === 'G' ? (
								<div className="text-2xs mx-1">{`${secondStar.W} W / ${secondStar.GAA} GAA / ${secondStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${secondStar.G} G / ${secondStar.A} A / ${secondStar.P} P / ${secondStar.PPP} PPP / ${secondStar.SOG} SOG / ${secondStar.HIT} HIT / ${secondStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
					<div className="grid grid-cols-6 m-auto w-11/12 text-center">
						<img
							className="my-auto"
							src={matchup.AwayTeam === thirdStar.gshlTeam.slice(-1)[0] ? matchupTeams.awayTeam.LogoURL : matchupTeams.homeTeam.LogoURL}
							alt="Third Star Team Logo"
						/>
						<div className="text-lg font-normal col-span-5 m-auto inline-block items-center">
							{thirdStar.PlayerName}, {thirdStar.nhlPos.toString()}
							<img
								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
									thirdStar.nhlTeam && thirdStar.nhlTeam.slice(-1)[0]
								}.png`}
								alt=""
								className="inline-block h-5 w-5 ml-1.5"
							/>
							{thirdStar.nhlPos === 'G' ? (
								<div className="text-2xs mx-1">{`${thirdStar.W} W / ${thirdStar.GAA} GAA / ${thirdStar.SVP} SV%`}</div>
							) : (
								<div className="text-2xs mx-1">{`${thirdStar.G} G / ${thirdStar.A} A / ${thirdStar.P} P / ${thirdStar.PPP} PPP / ${thirdStar.SOG} SOG / ${thirdStar.HIT} HIT / ${thirdStar.BLK} BLK`}</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
function PlayingToday({ matchup, matchupTeams }: { matchup: MatchupDataType; matchupTeams: { homeTeam: TeamInfoType; awayTeam: TeamInfoType } }) {
	const playerDayStats = usePlayerDays({ season: matchup.Season })
	if (!playerDayStats.data) {
		return <LoadingSpinner />
	}
	const currentDate = new Date()
	currentDate.setHours(currentDate.getHours() - 5)
	return (
		<div className="mb-8">
			<div className="mt-2 text-base text-center font-bold">Playing Today</div>
			<div className="grid grid-cols-2 gap-2 w-11/12 mx-auto text-2xs font-medium text-center items-start">
				<div className="grid grid-cols-1 gap-2 w-11/12 mx-auto text-2xs font-medium text-center items-start">
					{playerDayStats.data
						?.filter(
							player =>
								formatDate(player.Date) === formatDate(currentDate) &&
								player.gshlTeam.includes(matchupTeams.awayTeam.id) &&
								player.DailyPos !== 'BN' &&
								player.DailyPos !== 'IR+' &&
								player.DailyPos !== 'IR' &&
								player.Opp !== null
						)
						.map(player => {
							return (
								<div key={player.id} className="flex flex-col border-b border-gray-300">
									<div className="inline-block text-xs">{player.PlayerName}</div>
									<div className="inline-block">
										<img
											src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
												player.nhlTeam?.slice(-1)[0]
											}.png`}
											alt=""
											className="inline-block h-4 w-4 mx-1"
										/>
										{player.Opp && player.Opp[0] === '@' ? '@' : 'v'}
										<img
											src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
												player.Opp && player.Opp[0] === '@' ? player.Opp.slice(1) : player.Opp
											}.png`}
											alt=""
											className="inline-block h-4 w-4 mx-1"
										/>
										{player.Score}
									</div>
								</div>
							)
						})}
				</div>
				<div className="grid grid-cols-1 gap-2 w-11/12 mx-auto text-2xs font-medium text-center items-start">
					{playerDayStats.data
						?.filter(
							player =>
								formatDate(player.Date) === formatDate(currentDate) &&
								player.gshlTeam.includes(matchupTeams.homeTeam.id) &&
								player.DailyPos !== 'BN' &&
								player.DailyPos !== 'IR+' &&
								player.DailyPos !== 'IR' &&
								player.Opp !== null
						)
						.map(player => {
							return (
								<div key={player.id} className="flex flex-col border-b border-gray-300">
									<div className="inline-block text-xs">{player.PlayerName}</div>
									<div className="inline-block">
										<img
											src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
												player.nhlTeam?.slice(-1)[0]
											}.png`}
											alt=""
											className="inline-block h-4 w-4 mx-1"
										/>
										{player.Opp && player.Opp[0] === '@' ? '@' : 'v'}
										<img
											src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${
												player.Opp && player.Opp[0] === '@' ? player.Opp.slice(1) : player.Opp
											}.png`}
											alt=""
											className="inline-block h-4 w-4 mx-1"
										/>
										{player.Score}
									</div>
								</div>
							)
						})}
				</div>
			</div>
		</div>
	)
}

function MatchupPageScroller({
	season,
	weekNum,
	currentID,
	searchParams,
}: {
	season: number
	weekNum: number
	currentID?: number
	searchParams: URLSearchParams
}) {
	const weeklyMatchups = useScheduleData({ season, weekNum })
	const teams = useGSHLTeams({})
	if (!weeklyMatchups.data || !teams.data) {
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
							<ScrollerItem {...{ matchup, teams: teams.data, currentID: currentID || 0, searchParams }} />
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
}: {
	matchup: MatchupDataType
	teams: TeamInfoType[]
	currentID: number
	searchParams: URLSearchParams
}) {
	const homeTeam = teams.filter(obj => obj.id === matchup.HomeTeam)[0]
	const awayTeam = teams.filter(obj => obj.id === matchup.AwayTeam)[0]
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
