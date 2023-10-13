import { Link, SetURLSearchParams, useSearchParams } from 'react-router-dom'
import { seasons, upcomingSeasons } from '../utils/constants'
import { SecondaryPageToolbarPropsType, TeamsTogglePropsType } from '../utils/types'
import { SeasonToggleNavbar, SecondaryPageToolbar, TeamsToggle } from './ui/PageNavBar'
import { TeamInfoType, useGSHLTeams } from '../api/queries/teams'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { dateToString, getSeason, moneyFormatter, seasonToString } from '../utils/utils'
import { PlayerContractType, useContractData } from '../api/queries/contracts'
import updateSearchParams from '../utils/updateSearchParams'

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
							{/* <TeamPlayerContracts {...playerStatProps} /> */}
							{/* <TeamDraftPicks {...playerStatProps} /> */}
							{/* <TeamRoster {...playerStatProps} /> */}
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
	function TeamCapSpaceRow({ team }: { team: TeamInfoType }) {
		const contractData = useContractData({ teamID: team.id, date: new Date() }).data
		if (!contractData) {
			return <LoadingSpinner />
		}
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
						{moneyFormatter(22500000 - contractData.filter(obj => +obj.YearsRemaining > 0).reduce((prev, curr) => (prev += curr.CapHit), 0))} (
						{contractData.filter(obj => +obj.YearsRemaining > 0 && obj.ExpiryType !== 'Buyout').length})
					</td>
				)}
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
						</tr>
					</thead>
					<tbody>
						{gshlTeams.map(team => (
							<TeamCapSpaceRow {...{ team }} />
						))}
					</tbody>
				</table>
			</div>
		</>
	)
}
