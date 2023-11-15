import { SetURLSearchParams, useSearchParams } from 'react-router-dom'
import { seasons, upcomingSeasons } from '../utils/constants'
import { SecondaryPageToolbarPropsType, TeamsTogglePropsType } from '../utils/types'
import { SecondaryPageToolbar, TeamsToggle } from './ui/PageNavBar'
import { TeamInfoType, useGSHLTeams } from '../api/queries/teams'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { getSeason, moneyFormatter } from '../utils/utils'
import { PlayerContractType, useContractData } from '../api/queries/contracts'
import updateSearchParams from '../utils/updateSearchParams'
import { PlayerCurrentRosterType, PlayerSeasonType } from '../api/queries/players'
import TeamRoster from './ui/CurrentRoster'

type LockerRoomPagesType = 'Contracts' | 'Player Stats' | 'Team Stats' | 'History'

export default function LockerRoom() {
	const [searchParams, setSearchParams] = useSearchParams()
	const lockerRoomPage: LockerRoomPagesType = searchParams.get('lrpgType') as LockerRoomPagesType
	const season = seasons.filter(obj => obj.Season === Number(searchParams.get('season')))[0] || seasons.slice(-1)[0]
	const currentTeamData = useGSHLTeams({ season, teamID: Number(searchParams.get('teamID')) }).data
	if (!currentTeamData) return <LoadingSpinner />
	const currentTeam = searchParams.get('teamID') ? currentTeamData[0] : undefined

	const teamsToggleProps: TeamsTogglePropsType = {
		activeKey: currentTeam,
		paramState: [searchParams, setSearchParams],
		teamOptions: { season },
	}
	const pageToolbarProps: SecondaryPageToolbarPropsType = {
		activeKey: lockerRoomPage,
		seasonActiveKey: season,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'lrpgType', value: 'Contracts' },
			{ key: 'lrpgType', value: 'Player Stats' },
			{ key: 'lrpgType', value: 'Team Stats' },
		],
	}
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
					{lockerRoomPage === 'Contracts' && (
						<>
							<TeamPlayerContracts {...{ teamInfo: currentTeam }} />
							{/* <TeamDraftPicks {...playerStatProps} /> */}
							<TeamRoster {...{ teamInfo: currentTeam, season: getSeason() }} />
						</>
					)}
					{lockerRoomPage === 'Player Stats' && (
						<>
							{/* <SeasonToggleNavbar {...seasonToolbarProps} /> */}
							{/* <TeamPlayerStats {...playerStatProps} /> */}
							{/* <TeamPOPlayerStats {...playerStatProps} /> */}
							{/* <TeamLTPlayerStats {...playerStatProps} /> */}
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
				{upcomingSeasons[0].PlayoffEndDate > new Date() && (
					<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
						{moneyFormatter(22500000 - contractData.filter(obj => +obj.YearsRemaining > -1).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
						{contractData.filter(obj => +obj.YearsRemaining > -1 && obj.ExpiryType !== 'Buyout').length})
					</td>
				)}
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(25000000 - contractData.filter(obj => +obj.YearsRemaining > 0).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
					{contractData?.filter(obj => +obj.YearsRemaining > 0 && obj.ExpiryType !== 'Buyout').length})
				</td>
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(25000000 - contractData.filter(obj => +obj.YearsRemaining > 1).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
					{contractData?.filter(obj => +obj.YearsRemaining > 1 && obj.ExpiryType !== 'Buyout').length})
				</td>
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(25000000 - contractData.filter(obj => +obj.YearsRemaining > 2).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
					{contractData?.filter(obj => +obj.YearsRemaining > 2 && obj.ExpiryType !== 'Buyout').length})
				</td>
				<td className="px-2 py-1 text-xs font-normal text-center text-gray-800 whitespace-nowrap">
					{moneyFormatter(25000000 - contractData.filter(obj => +obj.YearsRemaining > 3).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
					{contractData?.filter(obj => +obj.YearsRemaining > 3 && obj.ExpiryType !== 'Buyout').length})
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
							{upcomingSeasons[0].PlayoffEndDate > new Date() && (
								<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[0].ListName}</th>
							)}
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[1].ListName}</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[2].ListName}</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[3].ListName}</th>
							<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[4].ListName}</th>
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

function TeamPlayerContracts(props: LockerRoomPlayerStatPropsType) {
	const currentTeamContracts = useContractData({ teamID: props.teamInfo?.id, date: new Date() }).data
	if (!currentTeamContracts) {
		return <LoadingSpinner />
	}
	return (
		<>
			<div className="mt-4 text-center mx-auto text-xl font-bold">Current Contracts & Buyouts</div>
			<div className="mb-8 table-auto overflow-scroll no-scrollbar">
				<PlayerContractTable {...{ contracts: currentTeamContracts, team: props.teamInfo }} />
			</div>
		</>
	)
}
function PlayerContractTable(props: { contracts: PlayerContractType[]; team: TeamInfoType | undefined }) {
	const gshlTeams = useGSHLTeams({ season: getSeason() }).data
	const PlayerContractRow = (props: { player: PlayerContractType; team: TeamInfoType | undefined }) => (
		<tr key={props.player.id} className={`${props.player.ExpiryType === 'Buyout' ? 'text-gray-400' : 'text-gray-800'}`}>
			<td className="sticky left-0 py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap bg-gray-50">
				{props.player.PlayerName}
			</td>
			<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{props.player.Pos}</td>
			{props.team == undefined && (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
					<img
						src={gshlTeams?.filter(team => props.player.CurrentTeam === team.id)[0]?.LogoURL || ''}
						alt={gshlTeams?.filter(team => props.player.CurrentTeam === team.id)[0]?.TeamName || ''}
						className="h-4 w-4 mx-auto"
					/>
				</td>
			)}
			{upcomingSeasons[0].PlayoffEndDate > new Date() && +props.player.YearsRemaining > 0 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(props.player.CapHit)}</td>
			) : +props.player.YearsRemaining === 0 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						props.player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : props.player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{props.player.ExpiryType === 'Buyout' ? '' : props.player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+props.player.YearsRemaining > 1 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(props.player.CapHit)}</td>
			) : +props.player.YearsRemaining === 1 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						props.player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : props.player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{props.player.ExpiryType === 'Buyout' ? '' : props.player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+props.player.YearsRemaining > 2 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(props.player.CapHit)}</td>
			) : +props.player.YearsRemaining === 2 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						props.player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : props.player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{props.player.ExpiryType === 'Buyout' ? '' : props.player.ExpiryType}
				</td>
			) : (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300"></td>
			)}
			{+props.player.YearsRemaining > 3 ? (
				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{moneyFormatter(props.player.CapHit)}</td>
			) : +props.player.YearsRemaining === 3 ? (
				<td
					className={`my-1 mx-2 text-center text-2xs font-bold rounded-xl border-t border-b border-gray-300 ${
						props.player.ExpiryType === 'RFA' ? 'text-orange-700 bg-orange-100' : props.player.ExpiryType === 'UFA' ? 'text-rose-800 bg-rose-100' : ''
					}`}>
					{props.player.ExpiryType === 'Buyout' ? '' : props.player.ExpiryType}
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
					{!props.team && <th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>}
					{upcomingSeasons[0].PlayoffEndDate > new Date() && (
						<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[0].ListName}</th>
					)}
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[1].ListName}</th>
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[2].ListName}</th>
					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{upcomingSeasons[3].ListName}</th>
				</tr>
			</thead>
			<tbody>
				{props.contracts
					?.sort((a, b) => +b.CapHit - +a.CapHit)
					.map(obj => (obj ? <PlayerContractRow {...{ player: obj, team: props.team }} /> : <tr></tr>))}
				{props.team && (
					<tr key={`${props.team.TeamName}CapSpace`}>
						<td className="sticky left-0 font-bold py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">Cap Space</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200"></td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(22500000 - props.contracts?.filter(obj => obj.YearsRemaining > 0).reduce((acc, obj) => acc + +obj.CapHit, 0))}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(25000000 - props.contracts?.filter(obj => obj.YearsRemaining > 1).reduce((acc, obj) => acc + +obj.CapHit, 0))}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(25000000 - props.contracts?.filter(obj => obj.YearsRemaining > 2).reduce((acc, obj) => acc + +obj.CapHit, 0))}
						</td>
						<td className="py-1 px-2 text-center text-xs border-t border-gray-800 bg-gray-200">
							{moneyFormatter(25000000 - props.contracts?.filter(obj => obj.YearsRemaining > 3).reduce((acc, obj) => acc + +obj.CapHit, 0))}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}

export type LockerRoomPlayerStatPropsType = {
	teamInfo: TeamInfoType | undefined
	playerSeasonData?: PlayerSeasonType[]
	currentRosterData?: PlayerCurrentRosterType[]
	teamContracts?: PlayerContractType[]
}
// export type LockerRoomTeamStatPropsType = {
// 	teamInfo: TeamInfoType | undefined
// 	season: SeasonInfoDataType
// 	teamWeeksData: TeamWeeksType[]
// 	teamSeasonsData: TeamTotalsType[]
// 	teamContracts: PlayerContractType[]
// }
