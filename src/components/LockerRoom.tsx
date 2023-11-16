import { SetURLSearchParams, useSearchParams } from 'react-router-dom'
import { seasons, upcomingSeasons } from '../utils/constants'
import { SecondaryPageToolbarPropsType, TeamsTogglePropsType } from '../utils/types'
import { SeasonPageToggleNavbar, SeasonToggleNavbar, SecondaryPageToolbar, TeamsToggle } from './ui/PageNavBar'
import { TeamDraftPickType, TeamInfoType, useAllFutureDraftPicks, useCurrentRoster, useGSHLTeams } from '../api/queries/teams'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { getSeason, moneyFormatter } from '../utils/utils'
import { PlayerContractType, useContractData } from '../api/queries/contracts'
import updateSearchParams from '../utils/updateSearchParams'
import { usePlayerTotals } from '../api/queries/players'
import TeamRoster from './ui/CurrentRoster'
import { useState } from 'react'
import { Season } from '../api/types'

type LockerRoomPagesType = 'Roster' | 'Contracts' | 'Player Stats' | 'Team Stats' | 'History'

export default function LockerRoom() {
	const [searchParams, setSearchParams] = useSearchParams()
	const lockerRoomPage: LockerRoomPagesType = searchParams.get('pgType') as LockerRoomPagesType
	const season = seasons.filter(obj => obj.Season === Number(searchParams.get('season')))[0] || seasons.slice(-1)[0]
	const currentTeamData = useGSHLTeams({ season, teamID: Number(searchParams.get('teamID')) }).data
	const plyrStatsSeason: Season = (searchParams.get('statSzn') || getSeason().Season) as Season
	if (!currentTeamData) return <LoadingSpinner />
	const currentTeam = searchParams.get('teamID') ? currentTeamData[0] : undefined

	const teamsToggleProps: TeamsTogglePropsType = {
		activeKey: currentTeam,
		paramState: [searchParams, setSearchParams],
		teamOptions: { season },
	}
	const pageToolbarProps: SecondaryPageToolbarPropsType = {
		activeKey: lockerRoomPage || 'Roster',
		seasonActiveKey: season,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'pgType', value: 'Roster' },
			{ key: 'pgType', value: 'Contracts' },
			{ key: 'pgType', value: 'Player Stats' },
			{ key: 'pgType', value: 'Team Stats' },
		],
	}
	console.log(plyrStatsSeason)
	return (
		<div className="my-4 text-center">
			<TeamsToggle {...teamsToggleProps} />
			{currentTeam && (
				<>
					<SecondaryPageToolbar {...pageToolbarProps} />
					<div className="font-bold text-2xl flex flex-col items-center justify-center mb-4">
						<img className="max-w-xs w-2/6 h-2/6 mx-auto" src={currentTeam.LogoURL} alt="Team Logo" />
						{currentTeam.TeamName}
					</div>
					{(lockerRoomPage === null || lockerRoomPage === 'Roster') && (
						<>
							<TeamRoster {...{ teamInfo: currentTeam, season: getSeason() }} />
						</>
					)}
					{lockerRoomPage === 'Contracts' && (
						<>
							<TeamPlayerContracts {...{ teamInfo: currentTeam }} />
							<TeamDraftPicks {...{ teamInfo: currentTeam }} />
						</>
					)}
					{lockerRoomPage === 'Player Stats' && (
						<>
							<SeasonPageToggleNavbar
								{...{ paramKey: 'statSzn', activeKey: plyrStatsSeason, paramState: [searchParams, setSearchParams], position: ['', ''] }}
							/>
							<TeamPlayerStatsTable {...{ teamInfo: currentTeam, season: plyrStatsSeason }} />
							<TeamPOPlayerStats {...{ teamInfo: currentTeam, season: plyrStatsSeason }} />
							<TeamLTPlayerStats {...{ teamInfo: currentTeam, season: plyrStatsSeason }} />
						</>
					)}
					{lockerRoomPage === 'Team Stats' && <>{/* <TeamStatChart {...teamStatprops} /> */}</>}
					<div className="mb-14 text-white">.</div>
				</>
			)}
			{!currentTeam && (
				<>
					<CapOverview {...{ paramState: [searchParams, setSearchParams] }} />
					{/* <TeamPlayerContracts {...playerStatProps} /> */}
				</>
			)}
		</div>
	)
}

export function CapOverview({ paramState }: { paramState: (URLSearchParams | SetURLSearchParams)[] }) {
	const gshlTeams = useGSHLTeams({ season: getSeason() }).data
	const contractData = useContractData({ date: new Date() }).data
	if (!gshlTeams || !contractData) {
		return <LoadingSpinner />
	}
	gshlTeams.sort(
		(a, b) =>
			contractData.filter(obj => obj.CurrentTeam === a.id).reduce((p, c) => (p += c.CapHit), 0) -
			contractData.filter(obj => obj.CurrentTeam === b.id).reduce((p, c) => (p += c.CapHit), 0)
	)
	function TeamCapSpaceRow({ team, contractData }: { team: TeamInfoType; contractData: PlayerContractType[] }) {
		return (
			<tr key={team.id}>
				<td className="sticky left-0 flex justify-start px-2 py-1 text-sm font-normal text-gray-800 bg-gray-50 whitespace-nowrap">
					<div
						className="place-self-center overflow-hidden"
						onClick={() =>
							updateSearchParams([{ key: 'teamID', value: String(team.id) }], paramState[0] as URLSearchParams, paramState[1] as SetURLSearchParams)
						}>
						<img src={team.LogoURL} alt={`${team.TeamName} Team Logo`} className="h-6 w-6 mx-2 inline-block" />
						{team.TeamName}
					</div>
				</td>
				{seasons.slice(-1)[0].PlayoffEndDate > new Date() && (
					<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
						{moneyFormatter(
							seasons.slice(-1)[0].SalaryCap -
								contractData
									.filter(obj => obj.StartDate < seasons.slice(-1)[0].PlayoffEndDate && +obj.YearsRemaining >= 0)
									.reduce((prev, curr) => (prev += curr.CapHit), 0)
						)}{' '}
						({contractData.filter(obj => +obj.YearsRemaining > -1 && obj.ExpiryType !== 'Buyout').length})
					</td>
				)}
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(
						upcomingSeasons[0].SalaryCap - contractData.filter(obj => +obj.YearsRemaining > 0).reduce((prev, curr) => (prev += curr.CapHit), 0)
					)}{' '}
					({contractData?.filter(obj => +obj.YearsRemaining > 0 && obj.ExpiryType !== 'Buyout').length})
				</td>
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(
						upcomingSeasons[1].SalaryCap - contractData.filter(obj => +obj.YearsRemaining > 1).reduce((prev, curr) => (prev += curr.CapHit), 0)
					)}{' '}
					({contractData?.filter(obj => +obj.YearsRemaining > 1 && obj.ExpiryType !== 'Buyout').length})
				</td>
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(
						upcomingSeasons[2].SalaryCap - contractData.filter(obj => +obj.YearsRemaining > 2).reduce((prev, curr) => (prev += curr.CapHit), 0)
					)}{' '}
					({contractData?.filter(obj => +obj.YearsRemaining > 2 && obj.ExpiryType !== 'Buyout').length})
				</td>
			</tr>
		)
	}
	return (
		<>
			<div className="mt-8 text-center mx-auto text-xl font-bold">GSHL Salary Caps</div>
			<div className="mb-2 table-auto overflow-scroll no-scrollbar">
				<table className="mx-auto overflow-x-auto border border-black">
					<thead>
						<tr key="header">
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							{seasons.slice(-1)[0].PlayoffEndDate > new Date() && (
								<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{seasons.slice(-1)[0].ListName}</th>
							)}
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[0].ListName}</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[1].ListName}</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[2].ListName}</th>
						</tr>
					</thead>
					<tbody>
						{gshlTeams.map(team => (
							<TeamCapSpaceRow {...{ team, contractData: contractData.filter(obj => obj.CurrentTeam === team.id) }} />
						))}
					</tbody>
				</table>
			</div>
		</>
	)
}

function TeamPlayerContracts({ teamInfo }: { teamInfo: TeamInfoType }) {
	const currentTeamContracts = useContractData({ teamID: teamInfo?.id, date: new Date() }).data
	if (!currentTeamContracts) {
		return <LoadingSpinner />
	}
	return (
		<>
			<div className="mt-4 text-center mx-auto text-xl font-bold">Current Contracts & Buyouts</div>
			<div className="mb-8 table-auto overflow-scroll no-scrollbar">
				<PlayerContractTable {...{ contracts: currentTeamContracts, team: teamInfo }} />
			</div>
		</>
	)
}
function PlayerContractTable({ contracts, team }: { contracts: PlayerContractType[]; team: TeamInfoType | undefined }) {
	const gshlTeams = useGSHLTeams({ season: getSeason() }).data
	console.log(contracts?.filter(obj => obj.YearsRemaining === 0))
	const PlayerContractRow = ({ player, team }: { player: PlayerContractType; team: TeamInfoType | undefined }) => (
		<tr key={player.id} className={`${player.ExpiryType === 'Buyout' ? 'text-gray-400' : 'text-gray-800'}`}>
			<td className="sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50">
				{player.PlayerName}
			</td>
			<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{player.Pos}</td>
			{team == undefined && (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
					<img
						src={gshlTeams?.filter(team => player.CurrentTeam === team.id)[0]?.LogoURL || ''}
						alt={gshlTeams?.filter(team => player.CurrentTeam === team.id)[0]?.TeamName || ''}
						className="h-4 w-4 mx-auto"
					/>
				</td>
			)}
			{seasons.slice(-1)[0].PlayoffEndDate > new Date() && player.StartDate < seasons.slice(-1)[0].PlayoffEndDate && +player.YearsRemaining > -1 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(player.CapHit)}</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+player.YearsRemaining > 0 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(player.CapHit)}</td>
			) : +player.YearsRemaining === 0 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{player.ExpiryType === 'Buyout' ? '' : player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+player.YearsRemaining > 1 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(player.CapHit)}</td>
			) : +player.YearsRemaining === 1 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{player.ExpiryType === 'Buyout' ? '' : player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+player.YearsRemaining > 2 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(player.CapHit)}</td>
			) : +player.YearsRemaining === 2 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{player.ExpiryType === 'Buyout' ? '' : player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
		</tr>
	)
	return (
		<table className="mx-auto my-1 overflow-x-auto">
			<thead>
				<tr key="contractTableHead">
					<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
					{!team && <th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>}
					{seasons.slice(-1)[0].PlayoffEndDate > new Date() && (
						<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{seasons.slice(-1)[0].ListName}</th>
					)}
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[0].ListName}</th>
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[1].ListName}</th>
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[2].ListName}</th>
				</tr>
			</thead>
			<tbody>
				{contracts?.sort((a, b) => +b.CapHit - +a.CapHit).map(obj => (obj ? <PlayerContractRow {...{ player: obj, team: team }} /> : <tr></tr>))}
				{team && (
					<tr key={`${team.TeamName}CapSpace`}>
						<td className="sticky left-0 font-bold py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">Cap Space</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200"></td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(
								seasons.slice(-1)[0].SalaryCap -
									contracts
										?.filter(obj => obj.StartDate < seasons.slice(-1)[0].PlayoffEndDate && obj.YearsRemaining >= 0)
										.reduce((acc, obj) => acc + +obj.CapHit, 0)
							)}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(
								upcomingSeasons[0].SalaryCap - contracts?.filter(obj => obj.YearsRemaining > 0).reduce((acc, obj) => acc + +obj.CapHit, 0)
							)}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(
								upcomingSeasons[1].SalaryCap - contracts?.filter(obj => obj.YearsRemaining > 1).reduce((acc, obj) => acc + +obj.CapHit, 0)
							)}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(
								upcomingSeasons[2].SalaryCap - contracts?.filter(obj => obj.YearsRemaining > 2).reduce((acc, obj) => acc + +obj.CapHit, 0)
							)}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}
function TeamDraftPicks({ teamInfo }: { teamInfo: TeamInfoType }) {
	const gshlTeams = useGSHLTeams({}).data
	const draftPickData: TeamDraftPickType[] = useAllFutureDraftPicks(teamInfo || undefined)
	const currentTeamContracts = useContractData({ date: new Date(), teamID: teamInfo?.id })
		.data?.filter(obj => +obj.YearsRemaining > 0 && obj.ExpiryType !== 'Buyout')
		.sort((a, b) => b.CapHit - a.CapHit)
	const numberSuffix = (num: number) => {
		num = num < 20 ? num : num % 10
		switch (num) {
			case 1:
				return 'st'
			case 2:
				return 'nd'
			case 3:
				return 'rd'
			default:
				return 'th'
		}
	}
	const teamDraftPicks = draftPickData?.filter(obj => teamInfo && +obj.gshlTeam === +teamInfo.id)
	if (!teamDraftPicks || !gshlTeams || !currentTeamContracts) return <LoadingSpinner />

	return (
		<>
			<div className="mt-4 mx-auto text-xl font-bold">Draft Picks</div>
			{teamDraftPicks
				.sort((a, b) => a.Pick - b.Pick)
				.map((obj, i) => {
					if (obj === null) {
						return <tr></tr>
					}
					let originalTeam: TeamInfoType | undefined = undefined
					if (obj.OriginalTeam !== obj.gshlTeam && gshlTeams) {
						originalTeam = gshlTeams.filter(x => x.id === +obj.OriginalTeam)[0]
					}
					console.log(obj)
					if (teamDraftPicks.length - i > currentTeamContracts.length) {
						return (
							<div key={i + 1} className="text-gray-800">
								<div className="mx-auto w-5/6 py-1 px-2 text-center text-xs border-t border-gray-300">
									{obj.Rd + numberSuffix(+obj.Rd)} Round, {obj.Pick + numberSuffix(+obj.Pick)} Overall
									{originalTeam ? ` (via ${originalTeam.TeamName})` : ''}
								</div>
							</div>
						)
					}
					return (
						<div key={i + 1} className="text-gray-400">
							<div className="mx-auto w-5/6 py-1 px-2 text-center text-xs border-t border-gray-300">
								{currentTeamContracts[teamDraftPicks.length - i - 1].PlayerName}, {currentTeamContracts[teamDraftPicks.length - i - 1].Pos} (
								{obj.Rd + numberSuffix(+obj.Rd)} Round)
							</div>
						</div>
					)
				})}
		</>
	)
}

function TeamPlayerStatsTable({ teamInfo, season }: { teamInfo: TeamInfoType; season: Season }) {
	const teamPlayers = usePlayerTotals({ season, gshlTeam: teamInfo.id, WeekType: 'RS' }).data
	const currentRoster = useCurrentRoster({ season, gshlTeam: teamInfo.id }).data

	if (!currentRoster || !teamPlayers || teamPlayers.length === 0) {
		return <div></div>
	}
	return (
		<>
			<div className="mt-8 text-center mx-auto text-xl font-bold">Regular Season Stats</div>
			<div className="table-auto overflow-scroll">
				<table className="mx-auto overflow-x-auto">
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">G</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">A</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">P</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">PPP</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">SOG</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">HIT</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">BLK</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => !obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : 'text-gray-500'
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.G}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.A}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.P}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.PPP}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.SOG}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.HIT}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.BLK}</td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								W
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								GAA
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								SV%
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200"></th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : ''
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.W}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.GAA}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.SVP}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300"></td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</>
	)
}
function TeamPOPlayerStats({ teamInfo, season }: { teamInfo: TeamInfoType; season: Season }) {
	const teamPlayers = usePlayerTotals({ season, gshlTeam: teamInfo.id, WeekType: 'PO' }).data
	const currentRoster = useCurrentRoster({ season, gshlTeam: teamInfo.id }).data

	if (!currentRoster || !teamPlayers || teamPlayers.length === 0) {
		return <div></div>
	}
	return (
		<>
			<div className="mt-8 text-center mx-auto text-xl font-bold">Playoff Stats</div>
			<div className="table-auto overflow-scroll">
				<table className="mx-auto overflow-x-auto">
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">G</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">A</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">P</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">PPP</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">SOG</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">HIT</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">BLK</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => !obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : 'text-gray-500'
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.G}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.A}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.P}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.PPP}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.SOG}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.HIT}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.BLK}</td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								W
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								GAA
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								SV%
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200"></th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : ''
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.W}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.GAA}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.SVP}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300"></td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</>
	)
}
function TeamLTPlayerStats({ teamInfo, season }: { teamInfo: TeamInfoType; season: Season }) {
	const teamPlayers = usePlayerTotals({ season, gshlTeam: teamInfo.id, WeekType: 'LT' }).data
	const currentRoster = useCurrentRoster({ season, gshlTeam: teamInfo.id }).data

	if (!currentRoster || !teamPlayers || teamPlayers.length === 0) {
		return <div></div>
	}
	return (
		<>
			<div className="mt-8 text-center mx-auto text-xl font-bold">Loser's Tournament Stats</div>
			<div className="table-auto overflow-scroll">
				<table className="mx-auto overflow-x-auto">
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">G</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">A</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">P</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">PPP</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">SOG</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">HIT</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">BLK</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => !obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : 'text-gray-500'
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.G}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.A}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.P}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.PPP}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.SOG}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.HIT}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.BLK}</td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
					<thead>
						<tr>
							<th className="sticky left-0 p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Name</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Pos</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								W
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								GAA
							</th>
							<th colSpan={2} className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">
								SV%
							</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200"></th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Days</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
						</tr>
					</thead>
					<tbody>
						{teamPlayers
							.sort((a, b) => +b.Rating - +a.Rating)
							.filter(obj => obj.nhlPos.includes('G'))
							.map(obj => {
								return (
									<tr key={obj.id}>
										<td
											className={`${
												currentRoster?.filter(a => a.PlayerName === obj.PlayerName).length > 0 ? 'font-bold' : ''
											} sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50`}>
											{obj.PlayerName}
										</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{obj.nhlPos}</td>
										<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.W}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.GAA}
										</td>
										<td colSpan={2} className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">
											{obj.SVP}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300"></td>
										<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
											{Math.round(obj.Rating * 10) / 10}
										</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.RosterDays}</td>
										<td className="py-1 px-1.5 text-center text-xs border-t border-b border-gray-300">{obj.GS}</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</>
	)
}

// export type LockerRoomTeamStatPropsType = {
// 	teamInfo: TeamInfoType | undefined
// 	season: SeasonInfoDataType
// 	teamWeeksData: TeamWeeksType[]
// 	teamSeasonsData: TeamTotalsType[]
// 	teamContracts: PlayerContractType[]
// }
