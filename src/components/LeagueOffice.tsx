import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { seasons } from '../lib/constants'
import { TeamInfoType, useGSHLTeams } from '../api/queries/teams'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { PageToolbarPropsType, SecondaryPageToolbarPropsType, TeamsTogglePropsType } from '../lib/types'
import { PageToolbar, SecondaryPageToolbar, TeamsToggle } from './ui/PageNavBar'
import { usePlayerSalaries } from '../api/queries/players'
import { moneyFormatter } from '../lib/utils'
import Rulebook from './pages/Rulebook'
import { DraftBoardDataType, DraftOrderDataType, useDraftBoardData } from '../api/queries/draftboard'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

type LeagueOfficePagesType = 'Rulebook' | 'Free Agency' | 'Draft List' | 'Draft Board' | 'History' | 'Trade Block'
type NHLPositions = 'Any' | 'Fwd' | 'C' | 'Wing' | 'LW' | 'RW' | 'D' | 'GK' | 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK' | 'W' | 'GAA' | 'SVP'

export default function LeagueOffice() {
	const { data } = useDraftBoardData({})
	const season = seasons.slice(-1)[0]
	const [searchParams, setSearchParams] = useSearchParams()
	const leagueOfficePage: LeagueOfficePagesType = searchParams.get('pgType') as LeagueOfficePagesType
	const position: NHLPositions = searchParams.get('position') as NHLPositions
	const currentTeamData = useGSHLTeams({ season, teamID: Number(searchParams.get('teamID')) }).data
	if (!currentTeamData || !data) return <LoadingSpinner />
	const currentTeam = searchParams.get('teamID') ? currentTeamData[0] : undefined
	if (!data.draftboard || !data.draftorder) return <LoadingSpinner />

	const teamsToggleProps: TeamsTogglePropsType = {
		activeKey: currentTeam,
		paramState: [searchParams, setSearchParams],
		teamOptions: { season },
	}

	const pageToolbarProps: PageToolbarPropsType = {
		activeKey: leagueOfficePage,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'pgType', value: 'Rulebook' },
			{ key: 'pgType', value: 'Free Agency' },
			{ key: 'pgType', value: 'Draft Board' },
			{ key: 'pgType', value: 'Draft List' },
			// { key: 'pgType', value: 'History' },
			// { key: 'pgType', value: 'Trade Block' },
		],
	}

	const draftBoardToolbarProps: SecondaryPageToolbarPropsType = {
		activeKey: position,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'position', value: 'Any' },
			{ key: 'position', value: 'Fwd' },
			{ key: 'position', value: 'Wing' },
			{ key: 'position', value: 'C' },
			{ key: 'position', value: 'LW' },
			{ key: 'position', value: 'RW' },
			{ key: 'position', value: 'D' },
			{ key: 'position', value: 'GK' },
			{ key: 'position', value: 'G' },
			{ key: 'position', value: 'A' },
			{ key: 'position', value: 'P' },
			{ key: 'position', value: 'PPP' },
			{ key: 'position', value: 'SOG' },
			{ key: 'position', value: 'HIT' },
			{ key: 'position', value: 'BLK' },
			{ key: 'position', value: 'W' },
			{ key: 'position', value: 'GAA' },
			{ key: 'position', value: 'SVP' },
		],
	}

	return (
		<div className="my-4 text-center">
			{!leagueOfficePage && <PageToolbar {...pageToolbarProps} />}
			{leagueOfficePage === 'Rulebook' && (
				<>
					<PageToolbar {...pageToolbarProps} />
					<Rulebook />
				</>
			)}
			{leagueOfficePage === 'Free Agency' && (
				<>
					<PageToolbar {...pageToolbarProps} />
					<PlayerSalaries />
				</>
			)}
			{leagueOfficePage === 'Draft Board' && (
				<>
					<SecondaryPageToolbar {...pageToolbarProps} />
					<TeamsToggle {...teamsToggleProps} />
					<DraftBoard {...{ searchParams, draftboard: data.draftboard, draftorder: data.draftorder, teamData: currentTeam }} />
				</>
			)}
			{leagueOfficePage === 'Draft List' && (
				<>
					<SecondaryPageToolbar {...pageToolbarProps} />
					<PageToolbar {...draftBoardToolbarProps} />
					<DraftList {...{ position, draftboard: data.draftboard, draftorder: data.draftorder, teamData: currentTeam }} />
				</>
			)}
			{/* {leagueOfficePage === 'Trade Block' && <TradeBlock {...{ searchParams, setSearchParams }} />} */}
		</div>
	)
}

// function TradeBlock({ searchParams, setSearchParams }: { searchParams: URLSearchParams; setSearchParams: SetURLSearchParams }) {
// 	const positionGroupFilter = (searchParams.get('posGroup') as 'F' | 'C' | 'LW' | 'RW' | 'D' | 'G' | 'All') ?? 'All'
// 	const date = new Date()
// 	const tradeBlockPlayers = useTradeBlock({ season: seasons.slice(-1)[0].Season }).data
// 	const gshlTeam = useGSHLTeams({ season: seasons.slice(-1)[0] }).data
// 	const contract = useContractData({ date: date }).data
// 	if (!tradeBlockPlayers || !contract || !gshlTeam) {
// 		return <LoadingSpinner />
// 	}
// 	return (
// 		<>
// 			<SecondaryPageToolbar
// 				{...{
// 					activeKey: positionGroupFilter,
// 					paramState: [searchParams, setSearchParams],
// 					toolbarKeys: [
// 						{ key: 'posGroup', value: 'All' },
// 						{ key: 'posGroup', value: 'C' },
// 						{ key: 'posGroup', value: 'LW' },
// 						{ key: 'posGroup', value: 'RW' },
// 						{ key: 'posGroup', value: 'F' },
// 						{ key: 'posGroup', value: 'D' },
// 						{ key: 'posGroup', value: 'G' },
// 					],
// 				}}
// 			/>
// 			{tradeBlockPlayers.map(obj => {
// 				if (positionGroupFilter === 'All' || positionGroupFilter === obj.PosGroup || obj.nhlPos.includes(positionGroupFilter)) {
// 					return (
// 						<div className="mx-4">
// 							<PlayerListing
// 								{...{
// 									player: obj,
// 									team: gshlTeam.filter(a => obj.gshlTeam.includes(a.id))[0],
// 									contract: contract.filter(a => a.PlayerName === obj.PlayerName)[0],
// 								}}
// 							/>
// 						</div>
// 					)
// 				}
// 			})}
// 		</>
// 	)
// }
// function PlayerListing({ player, team, contract }: { player: PlayerTradeBlockType; team: TeamInfoType; contract: PlayerContractType }) {
// 	const [showInfo, setShowInfo] = useState(false)
// 	return (
// 		<>
// 			<div
// 				onClick={() => setShowInfo(!showInfo)}
// 				className="flex flex-col bg-slate-100 rounded-xl shadow-xl border-2 border-slate-300 py-1.5 px-4 my-3 gap-4">
// 				<div className="flex">
// 					<div className="w-10 my-auto">
// 						<img src={team && team.LogoURL} alt="NHL Team Logo" className="w-full" />
// 					</div>
// 					<div className="flex flex-col mx-auto my-auto">
// 						<div className="flex content-between mx-1 gap-2">
// 							<div className="font-varela">{player.PlayerName}</div>
// 							<div className="font-varela my-auto">{player.nhlPos.toString()}</div>
// 							<div className="w-6 my-auto">
// 								<img
// 									src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${player.nhlTeam}.png`}
// 									alt="NHL Team Logo"
// 								/>
// 							</div>
// 							<div
// 								className={`rounded-lg px-1.5 max-w-fit my-auto ${
// 									player.Rk < 17
// 										? 'bg-emerald-400'
// 										: player.Rk < 65
// 										? 'bg-emerald-200'
// 										: player.Rk < 161
// 										? 'bg-yellow-200'
// 										: player.Rk < 241
// 										? 'bg-orange-200'
// 										: 'bg-rose-200'
// 								}`}>
// 								{Math.round(+player.Rating * 100) / 100}
// 							</div>
// 						</div>
// 						{contract && (
// 							<div className="flex mx-auto text-yellow-800 bg-yellow-100 px-1 py-0.5">
// 								<div className="text-xs font-varela">{`Contract: ${moneyFormatter(contract.AAV)} thru ${contract.CapHitExpiry.getFullYear()}`}</div>
// 							</div>
// 						)}
// 					</div>
// 				</div>
// 				{showInfo && (
// 					<>
// 						<div className="flex flex-row gap-1 mx-auto pt-4">
// 							{!player.nhlPos.includes('G') &&
// 								['G', 'A', 'P', 'PPP', 'SOG', 'HIT', 'BLK'].map(cat => (
// 									<div
// 										className={`text-2xs rounded-lg px-1.5 max-w-fit my-auto ${
// 											player[(cat + 'Rk') as 'GRk' | 'ARk' | 'PRk' | 'PPPRk' | 'SOGRk' | 'HITRk' | 'BLKRk'] < 17
// 												? 'bg-emerald-400'
// 												: player[(cat + 'Rk') as 'GRk' | 'ARk' | 'PRk' | 'PPPRk' | 'SOGRk' | 'HITRk' | 'BLKRk'] < 65
// 												? 'bg-emerald-200'
// 												: player[(cat + 'Rk') as 'GRk' | 'ARk' | 'PRk' | 'PPPRk' | 'SOGRk' | 'HITRk' | 'BLKRk'] < 161
// 												? 'bg-yellow-200'
// 												: player[(cat + 'Rk') as 'GRk' | 'ARk' | 'PRk' | 'PPPRk' | 'SOGRk' | 'HITRk' | 'BLKRk'] < 241
// 												? 'bg-orange-200'
// 												: 'bg-rose-200'
// 										}`}>
// 										{player[cat as 'G' | 'A' | 'P' | 'PPP' | 'SOG' | 'HIT' | 'BLK'] + ' ' + cat}
// 									</div>
// 								))}
// 							{player.nhlPos.includes('G') &&
// 								['W', 'GAA', 'SVP'].map(cat => (
// 									<div
// 										className={`text-2xs rounded-lg px-1.5 max-w-fit my-auto ${
// 											player[(cat + 'Rk') as 'WRk' | 'GAARk' | 'SVPRk'] < 3
// 												? 'bg-emerald-400'
// 												: player[(cat + 'Rk') as 'WRk' | 'GAARk' | 'SVPRk'] < 8
// 												? 'bg-emerald-200'
// 												: player[(cat + 'Rk') as 'WRk' | 'GAARk' | 'SVPRk'] < 16
// 												? 'bg-yellow-200'
// 												: player[(cat + 'Rk') as 'WRk' | 'GAARk' | 'SVPRk'] < 28
// 												? 'bg-orange-200'
// 												: 'bg-rose-200'
// 										}`}>
// 										{(cat === 'W'
// 											? player[cat as 'W' | 'GAA' | 'SVP']
// 											: cat === 'GAA'
// 											? Math.round(+(player[cat as 'W' | 'GAA' | 'SVP'] || 0) * 100) / 100
// 											: Math.round(+(player[cat as 'W' | 'GAA' | 'SVP'] || 0) * 1000) / 1000) +
// 											' ' +
// 											cat}
// 									</div>
// 								))}
// 						</div>
// 						<PlayerCardStats {...{ PlayerName: player.PlayerName, PosGroup: player.PosGroup }} />
// 					</>
// 				)}
// 			</div>
// 		</>
// 	)
// }
// function PlayerCardStats({ PlayerName, PosGroup }: { PlayerName: string; PosGroup: 'F' | 'D' | 'G' }) {
// 	const teamData = useGSHLTeams({}).data
// 	const statsObj = {
// 		GSHL: useAllPlayerTotals({ PlayerName, PosGroup }).data,
// 		NHL: useAllPlayerNHLStats({ PlayerName, PosGroup }).data,
// 	}

// 	const SkaterHeader = ({ type }: { type: 'NHL' | 'GSHL' }) => {
// 		return (
// 			<thead>
// 				<tr>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Season</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">G</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">A</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">P</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">PPP</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">SOG</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">HIT</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">BLK</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Rtg</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GP</th>
// 					<th className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{type === 'NHL' ? 'Age' : 'Days'}</th>
// 				</tr>
// 			</thead>
// 		)
// 	}
// 	const SkaterNHLStats = ({ statItem }: { statItem: PlayerNHLType }) => {
// 		const gshlTotalsTeams = statsObj.GSHL.filter(a => a && a.Season === statItem.Season)[0]
// 		const teams = statItem.nhlTeam?.includes('TOT') && gshlTotalsTeams ? gshlTotalsTeams.nhlTeam || statItem.nhlTeam : statItem.nhlTeam
// 		return (
// 			<tr key={statItem.id}>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{statItem.Season}</td>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap">
// 					<div className="flex min-w-max gap-0.5">
// 						{teams?.map(x => (
// 							<img
// 								key={x}
// 								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${x}.png`}
// 								alt="NHL Team Logo"
// 								className={`${teams.length === 1 ? 'w-4' : teams.length === 2 ? 'w-3.5' : 'w-3'} mx-auto inline-block`}
// 							/>
// 						))}
// 					</div>
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.G && Math.round(statItem.G)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.A && Math.round(statItem.A)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.P && Math.round(statItem.P)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.PPP && Math.round(statItem.PPP)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.SOG && Math.round(statItem.SOG)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.HIT && Math.round(statItem.HIT)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.BLK && Math.round(statItem.BLK)}</td>
// 				<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
// 					{Math.round(+statItem.RTG * 100) / 100}
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GS && Math.round(statItem.GS)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.Age}</td>
// 			</tr>
// 		)
// 	}
// 	const SkaterGSHLStats = ({ statItem }: { statItem: PlayerSeasonType }) => {
// 		return (
// 			<tr key={statItem.id}>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{statItem.Season}</td>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">
// 					<div className="flex min-w-max gap-0.5">
// 						{statItem.gshlTeam.map(x => (
// 							<img
// 								src={teamData?.filter(a => a.id === x)[0] && teamData?.filter(a => a.id === x)[0].LogoURL}
// 								alt="GSHL Team Logo"
// 								className={`${statItem.gshlTeam.length === 1 ? 'w-4' : statItem.gshlTeam.length === 2 ? 'w-3.5' : 'w-3'} mx-auto inline-block`}
// 							/>
// 						))}
// 					</div>
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.G && Math.round(statItem.G)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.A && Math.round(statItem.A)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.P && Math.round(statItem.P)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.PPP && Math.round(statItem.PPP)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.SOG && Math.round(statItem.SOG)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.HIT && Math.round(statItem.HIT)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.BLK && Math.round(statItem.BLK)}</td>
// 				<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
// 					{Math.round(statItem.Rating * 100) / 100}
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GS && Math.round(statItem.GS)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.RosterDays}</td>
// 			</tr>
// 		)
// 	}
// 	const GoalieHeader = ({ type }: { type: 'NHL' | 'GSHL' }) => {
// 		return (
// 			<thead>
// 				<tr>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Season</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">Team</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">W</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GAA</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">SV%</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">RTG</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">GS</td>
// 					<td className="p-1 text-2xs font-normal text-center bg-gray-800 text-gray-200">{type === 'NHL' ? 'Age' : 'Days'}</td>
// 				</tr>
// 			</thead>
// 		)
// 	}
// 	const GoalieNHLStats = ({ statItem }: { statItem: PlayerNHLType }) => {
// 		const gshlTotalsTeams = statsObj.GSHL.filter(a => a && a.Season === statItem.Season)[0]
// 		const teams = statItem.nhlTeam?.includes('TOT') && gshlTotalsTeams ? gshlTotalsTeams.nhlTeam || [statItem.nhlTeam] : [statItem.nhlTeam]
// 		return (
// 			<tr key={statItem.id}>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{statItem.Season}</td>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap">
// 					<div className="flex min-w-max gap-0.5">
// 						{teams.map(x => (
// 							<img
// 								src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${x}.png`}
// 								alt="NHL Team Logo"
// 								className={`${teams.length === 1 ? 'w-4' : teams.length === 2 ? 'w-3.5' : 'w-3'} mx-auto inline-block`}
// 							/>
// 						))}
// 					</div>
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.W && Math.round(statItem.W)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GAA && Math.round(statItem.GAA * 100) / 100}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">
// 					{statItem.SVP && Math.round(statItem.SVP * 1000) / 1000}
// 				</td>
// 				<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
// 					{Math.round(+statItem.RTG * 100) / 100}
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GS && Math.round(statItem.GS)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.Age}</td>
// 			</tr>
// 		)
// 	}
// 	const GoalieGSHLStats = ({ statItem }: { statItem: PlayerSeasonType }) => {
// 		return (
// 			<tr key={statItem.id}>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300">{statItem.Season}</td>
// 				<td className="py-1 px-2 text-center text-xs border-t border-b border-gray-300 whitespace-nowrap">
// 					<div className="flex min-w-max gap-0.5">
// 						{statItem.gshlTeam.map(x => (
// 							<img
// 								src={teamData?.filter(a => a.id === x)[0] && teamData?.filter(a => a.id === x)[0].LogoURL}
// 								alt="GSHL Team Logo"
// 								className={`${statItem.gshlTeam.length === 1 ? 'w-4' : statItem.gshlTeam.length === 2 ? 'w-3.5' : 'w-3'} mx-auto inline-block`}
// 							/>
// 						))}
// 					</div>
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.W && Math.round(statItem.W)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GAA && Math.round(statItem.GAA * 100) / 100}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">
// 					{statItem.SVP && Math.round(statItem.SVP * 1000) / 1000}
// 				</td>
// 				<td className="py-1 px-2 text-center text-xs font-bold border-t border-b border-gray-300 bg-gray-50">
// 					{Math.round(+statItem.Rating * 100) / 100}
// 				</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.GS && Math.round(statItem.GS)}</td>
// 				<td className="py-1 px-1.5 text-center text-2xs border-t border-b border-gray-300">{statItem.RosterDays}</td>
// 			</tr>
// 		)
// 	}
// 	return (
// 		<div className="w-full mx-auto mb-6">
// 			<div className="mt-4 font-varela text-center mx-auto font-bold">NHL Stats</div>
// 			<div className=" table-auto overflow-scroll">
// 				<table className="mx-auto overflow-x-auto">
// 					{PosGroup === 'G' ? <GoalieHeader type={'NHL'} /> : <SkaterHeader type={'NHL'} />}
// 					{statsObj.NHL.sort((a, b) => b.Season - a.Season).map(obj =>
// 						obj ? PosGroup === 'G' ? <GoalieNHLStats statItem={obj} /> : <SkaterNHLStats statItem={obj} /> : <LoadingSpinner />
// 					)}
// 				</table>
// 			</div>
// 			<div className="mt-4 font-varela text-center mx-auto font-bold">GSHL Stats</div>
// 			<div className="table-auto overflow-scroll">
// 				<table className="mx-auto overflow-x-auto">
// 					{PosGroup === 'G' ? <GoalieHeader type={'GSHL'} /> : <SkaterHeader type={'GSHL'} />}
// 					{statsObj.GSHL.filter(obj => obj.WeekType === 'RS')
// 						.sort((a, b) => b.Season - a.Season)
// 						.map(obj => (obj ? PosGroup === 'G' ? <GoalieGSHLStats statItem={obj} /> : <SkaterGSHLStats statItem={obj} /> : <></>))}
// 				</table>
// 			</div>
// 			{statsObj.GSHL.filter(obj => obj.WeekType === 'PO').length > 0 && (
// 				<>
// 					<div className="mt-4 font-varela text-center mx-auto font-bold">GSHL Playoff Stats</div>
// 					<div className="table-auto overflow-scroll">
// 						<table className="mx-auto overflow-x-auto">
// 							{PosGroup === 'G' ? <GoalieHeader type={'GSHL'} /> : <SkaterHeader type={'GSHL'} />}
// 							{statsObj.GSHL.filter(obj => obj.WeekType === 'PO')
// 								.sort((a, b) => b.Season - a.Season)
// 								.map(obj => (obj ? PosGroup === 'G' ? <GoalieGSHLStats statItem={obj} /> : <SkaterGSHLStats statItem={obj} /> : <></>))}
// 						</table>
// 					</div>
// 				</>
// 			)}
// 		</div>
// 	)
// }

function PlayerSalaries() {
	const playerSalaries = usePlayerSalaries()
	const freeAgents = playerSalaries.data?.filter(obj => obj.CurrentSalary)
	if (!freeAgents) {
		return <LoadingSpinner />
	}
	return (
		<div>
			{freeAgents.map(obj => {
				return (
					<div>
						{obj.PlayerName} - {obj.CurrentSalary}
					</div>
				)
			})}
		</div>
	)
}

function DraftList({
	position,
	draftboard,
	draftorder,
	teamData,
}: {
	position: NHLPositions
	draftboard: DraftBoardDataType[]
	draftorder: DraftOrderDataType[]
	teamData: TeamInfoType | undefined
}) {
	const [filteredDraftBoard, setFilteredDraftBoard] = useState<DraftBoardDataType[]>(draftboard.filter(obj => !obj.Pick))

	const [searchItem, setSearchItem] = useState<string>('')
	const remainingPicks = draftorder.filter(obj => obj.teamID === teamData?.id && !obj.Player)
	const currentPick = Math.min(...draftorder.map(obj => (obj.signing === 'Yes' || obj.Player ? 300 : obj.Pick)))
	let inputHandler = (e: any) => {
		e.preventDefault()
		const searchTerm = e.target.value
		setSearchItem(searchTerm)
		const filteredItems = draftboard.filter(obj => obj.Player.toLowerCase().includes(searchTerm.toLowerCase()))
		setFilteredDraftBoard(filteredItems)
	}

	let x: DraftBoardDataType[]
	useEffect(() => {
		switch (position) {
			case 'Fwd':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'D' && obj.Pos1 !== 'G')
				setFilteredDraftBoard(x)
				break
			case 'Wing':
				x = draftboard.filter(
					obj =>
						!obj.Pick && (obj.Pos1 === 'LW' || obj.Pos1 === 'RW' || obj.Pos2 === 'LW' || obj.Pos2 === 'RW' || obj.Pos3 === 'LW' || obj.Pos3 === 'RW')
				)
				setFilteredDraftBoard(x)
				break
			case 'C':
				x = draftboard.filter(obj => !obj.Pick && (obj.Pos1 === 'C' || obj.Pos2 === 'C' || obj.Pos3 === 'C'))
				setFilteredDraftBoard(x)
				break
			case 'LW':
				x = draftboard.filter(obj => !obj.Pick && (obj.Pos1 === 'LW' || obj.Pos2 === 'LW' || obj.Pos3 === 'LW'))
				setFilteredDraftBoard(x)
				break
			case 'RW':
				x = draftboard.filter(obj => !obj.Pick && (obj.Pos1 === 'RW' || obj.Pos2 === 'RW' || obj.Pos3 === 'RW'))
				setFilteredDraftBoard(x)
				break
			case 'D':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 === 'D')
				setFilteredDraftBoard(x)
				break
			case 'GK':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 === 'G')
				setFilteredDraftBoard(x)
				break
			case 'G':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjG - a.ProjG)
				setFilteredDraftBoard(x)
				break
			case 'A':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjA - a.ProjA)
				setFilteredDraftBoard(x)
				break
			case 'P':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjP - a.ProjP)
				setFilteredDraftBoard(x)
				break
			case 'PPP':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjPPP - a.ProjPPP)
				setFilteredDraftBoard(x)
				break
			case 'SOG':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjSOG - a.ProjSOG)
				setFilteredDraftBoard(x)
				break
			case 'HIT':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjHIT - a.ProjHIT)
				setFilteredDraftBoard(x)
				break
			case 'BLK':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 !== 'G').sort((a, b) => b.ProjBLK - a.ProjBLK)
				setFilteredDraftBoard(x)
				break
			case 'W':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 === 'G').sort((a, b) => b.ProjW - a.ProjW)
				setFilteredDraftBoard(x)
				break
			case 'GAA':
				x = draftboard
					.filter(obj => !obj.Pick && obj.Pos1 === 'G')
					.sort((a, b) => (a.ProjGAA === null ? 100 : a.ProjGAA) - (b.ProjGAA === null ? 100 : b.ProjGAA))
				setFilteredDraftBoard(x)
				break
			case 'SVP':
				x = draftboard.filter(obj => !obj.Pick && obj.Pos1 === 'G').sort((a, b) => b.ProjSVP - a.ProjSVP)
				setFilteredDraftBoard(x)
				break
			case 'Any':
			default:
				setFilteredDraftBoard(draftboard.filter(obj => !obj.Pick))
				break
		}
	}, [position])

	return (
		<>
			<div className="font-bold text-2xl">Eligible Players</div>
			{teamData && (
				<div className={cn('text-yellow-800 mb-6', remainingPicks[0].Pick - currentPick === 0 ? 'font-bold text-lg' : '')}>
					{teamData &&
						currentPick &&
						`${teamData.TeamName} are on the clock${
							remainingPicks[0].Pick - currentPick === 0 ? '!!!' : ` in ${remainingPicks[0].Pick - currentPick} picks`
						}`}
				</div>
			)}
			<div className="flex w-full max-w-sm items-center space-x-2 my-2 mx-auto">
				<Input onChange={inputHandler} value={searchItem} type="search" placeholder="Search..." />
			</div>
			<FilterDraftList {...{ draftboard: filteredDraftBoard }} />
		</>
	)

	function FilterDraftList({ draftboard }: { draftboard: DraftBoardDataType[] }) {
		return (
			<>
				<div className="grid grid-cols-7 mx-2 font-bold text-sm">
					<div className="">Rank</div>
					<div className="col-span-3">Player</div>
					<div className="">Pos</div>
					<div className="">Yahoo</div>
					<div className="">ESPN</div>
				</div>
				{draftboard.map(obj => (
					<EligibleDraftPlayer player={obj} key={obj.Player} />
				))}
			</>
		)
	}
	function EligibleDraftPlayer({ player }: { player: DraftBoardDataType }) {
		const [showStats, setShowStats] = useState<Boolean>(false)
		return (
			<div onClick={() => setShowStats(!showStats)} className="border-b border-dotted border-slate-400">
				<div className="grid grid-cols-7 mx-2 justify-center items-center my-0.5">
					<div className="">{player.Rank}</div>
					<div className="col-span-3">{player.Player}</div>
					<div className="">{player.Pos1 + (player.Pos2 ? ',' + player.Pos2 : '') + (player.Pos3 ? ',' + player.Pos3 : '')}</div>
					<div className="">{player.Yahoo}</div>
					<div className="">{player.ESPN}</div>
				</div>
				{showStats && (
					<div className="mx-2 mb-6 mt-1">
						<div className="flex justify-around w-8/12 mx-auto mb-2 text-sm">
							<div className="">
								<img
									src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${player.Team}.png`}
									alt="NHL Team Logo"
									className="h-6 w-6 mx-auto"
								/>
							</div>
							<div className="">{player.Age} y/o</div>
							<div className="">{moneyFormatter(player.Salary)}</div>
						</div>
						<div className="grid grid-cols-10 mx-4 font-bold text-xs">
							<div className="col-span-3"></div>
							<div>G</div>
							<div>A</div>
							<div>P</div>
							<div>PPP</div>
							<div>SOG</div>
							<div>HIT</div>
							<div>BLK</div>
						</div>
						<div className="grid grid-cols-10 mx-4 text-sm my-0.5">
							<div className="col-span-3">23/24 Stats</div>
							<div>{player.PrevG}</div>
							<div>{player.PrevA}</div>
							<div>{player.PrevP}</div>
							<div>{player.PrevPPP}</div>
							<div>{player.PrevSOG}</div>
							<div>{player.PrevHIT}</div>
							<div>{player.PrevBLK}</div>
						</div>
						<div className="grid grid-cols-10 mx-4 text-sm my-0.5">
							<div className="col-span-3">24/25 Proj</div>
							<div>{player.ProjG}</div>
							<div>{player.ProjA}</div>
							<div>{player.ProjP}</div>
							<div>{player.ProjPPP}</div>
							<div>{player.ProjSOG}</div>
							<div>{player.ProjHIT}</div>
							<div>{player.ProjBLK}</div>
						</div>
					</div>
				)}
			</div>
		)
	}
}

function DraftBoard({
	draftboard,
	draftorder,
	teamData,
}: {
	draftboard: DraftBoardDataType[]
	draftorder: DraftOrderDataType[]
	teamData: TeamInfoType | undefined
}) {
	const draftOrder = draftorder.filter(obj => obj.teamID === teamData?.id && !!obj.Player)
	const remainingPicks = draftorder.filter(obj => obj.teamID === teamData?.id && !obj.Player)
	const currentPick = Math.min(...draftorder.map(obj => (obj.signing === 'Yes' || obj.Player ? 300 : obj.Pick)))

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
	if (!draftOrder) return <LoadingSpinner />
	return (
		<>
			<div>Draft Board</div>
			{teamData && (
				<div className={cn('text-yellow-800 mb-6', remainingPicks[0].Pick - currentPick === 0 ? 'font-bold text-lg' : '')}>
					{teamData &&
						currentPick &&
						`${teamData.TeamName} are on the clock${
							remainingPicks[0].Pick - currentPick === 0 ? '!!!' : ` in ${remainingPicks[0].Pick - currentPick} picks`
						}`}
				</div>
			)}
			<DraftRoster roster={draftOrder} draftboard={draftboard} />
			<div className="mt-6 mb-2 text-center mx-auto text-xl font-bold">Remaining Picks</div>

			{remainingPicks?.map((pick, i) => (
				<div>
					{`${pick.Round + numberSuffix(+pick.Round)} Round${
						Number.isInteger(+pick.Pick) ? ', ' + pick.Pick + numberSuffix(+pick.Pick) + ' Overall' : ''
					}`}
				</div>
			))}
		</>
	)

	function DraftRoster({ roster, draftboard }: { roster: DraftOrderDataType[]; draftboard: DraftBoardDataType[] }) {
		const teamLineup = [
			[
				[
					roster?.filter(obj => obj.TeamPos === 'LW01')[0],
					roster?.filter(obj => obj.TeamPos === 'C01')[0],
					roster?.filter(obj => obj.TeamPos === 'RW01')[0],
				],
				[
					roster?.filter(obj => obj.TeamPos === 'LW02')[0],
					roster?.filter(obj => obj.TeamPos === 'C02')[0],
					roster?.filter(obj => obj.TeamPos === 'RW02')[0],
				],
				[null, null, roster?.filter(obj => obj.TeamPos === 'Util01')[0], null, null],
			],
			[
				[null, roster?.filter(obj => obj.TeamPos === 'D01')[0], roster?.filter(obj => obj.TeamPos === 'D02')[0], null],
				[null, null, roster?.filter(obj => obj.TeamPos === 'D03')[0], null, null],
			],
			[[null, null, roster?.filter(obj => obj.TeamPos === 'G01')[0], null, null]],
		]
		const currentRoster = [
			roster?.filter(obj => obj.TeamPos === 'BN01')[0],
			roster?.filter(obj => obj.TeamPos === 'BN02')[0],
			roster?.filter(obj => obj.TeamPos === 'BN03')[0],
			roster?.filter(obj => obj.TeamPos === 'BN04')[0],
			roster?.filter(obj => obj.TeamPos === 'BN05')[0],
		].filter(Boolean)
		console.log(currentRoster)
		return (
			<>
				<div className="mt-12 text-center mx-auto text-xl font-bold">Draft Roster</div>
				<div className="flex flex-col max-w-md mx-auto border rounded-xl bg-gray-50">
					{teamLineup.map(x => {
						return (
							<>
								{x.map((obj, i) => {
									return (
										<div key={i} className="grid grid-cols-6 items-center py-2">
											{obj.map((a, j) => {
												if (!a) {
													return <div></div>
												}
												const playerData = draftboard.filter(obj => obj.Player === a.Player)[0]
												return (
													<div key={j} className="grid grid-cols-2 col-span-2 text-center px-2">
														<div className="col-span-3 text-sm">{a.Player}</div>
														<div className="text-2xs">{playerData?.Position}</div>
														<div>
															<img
																src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${playerData?.Team}.png`}
																alt="NHL Team Logo"
																className="h-4 w-4 mx-auto"
															/>
														</div>
														<div
															className={`text-2xs rounded-lg px-2 max-w-fit place-self-center ${
																playerData.DuRk < 17
																	? 'bg-emerald-400'
																	: playerData.DuRk < 65
																	? 'bg-emerald-200'
																	: playerData.DuRk < 161
																	? 'bg-yellow-200'
																	: playerData.DuRk < 241
																	? 'bg-orange-200'
																	: 'bg-rose-200'
															}`}>
															{Math.round(+playerData.DuRtg * 100) / 100}
														</div>
													</div>
												)
											})}
										</div>
									)
								})}
								<span className="border-b"></span>
							</>
						)
					})}
				</div>
				{currentRoster.length > 0 ? (
					<div className="flex flex-col max-w-md mx-auto border rounded-xl bg-brown-50 mt-2">
						<div className="grid grid-cols-2 items-center my-2 mx-2">
							{currentRoster.map((obj, i) => {
								const playerData = draftboard.filter(a => obj.Player === a.Player)[0]
								return (
									<div key={i} className="grid grid-cols-2 text-center px-2 my-2">
										<div className="col-span-3 text-sm">{obj?.Player}</div>
										<div className="text-2xs">{playerData?.Position}</div>
										<div>
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${playerData?.Team}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</div>
										<div
											className={`text-2xs rounded-lg px-2 max-w-fit place-self-center ${
												playerData.DuRk < 17
													? 'bg-emerald-400'
													: playerData.DuRk < 65
													? 'bg-emerald-200'
													: playerData.DuRk < 161
													? 'bg-yellow-200'
													: playerData.DuRk < 241
													? 'bg-orange-200'
													: 'bg-rose-200'
											}`}>
											{Math.round(+playerData.DuRtg * 100) / 100}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				) : null}
				<div className="my-2 flex gap-2 justify-center">
					<div className="text-3xs rounded-lg px-2 max-w-fit place-self-center bg-emerald-400">1 - 16</div>
					<div className="text-3xs rounded-lg px-2 max-w-fit place-self-center bg-emerald-200">17 - 64</div>
					<div className="text-3xs rounded-lg px-2 max-w-fit place-self-center bg-yellow-200">65 - 160</div>
					<div className="text-3xs rounded-lg px-2 max-w-fit place-self-center bg-orange-200">161 - 240</div>
					<div className="text-3xs rounded-lg px-2 max-w-fit place-self-center bg-rose-200">241 +</div>
				</div>
			</>
		)
	}
}
