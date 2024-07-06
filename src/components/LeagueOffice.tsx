import { useState } from 'react'
import { SetURLSearchParams, useSearchParams } from 'react-router-dom'
import { seasons } from '../utils/constants'
import { TeamInfoType, useGSHLTeams } from '../api/queries/teams'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { PageToolbarPropsType } from '../utils/types'
import { PageToolbar, SecondaryPageToolbar } from './ui/PageNavBar'
import {
	PlayerNHLType,
	PlayerSeasonType,
	PlayerTradeBlockType,
	useAllPlayerNHLStats,
	useAllPlayerTotals,
	usePlayerSalaries,
	useTradeBlock,
} from '../api/queries/players'
import { moneyFormatter } from '../utils/utils'
import { PlayerContractType, useContractData } from '../api/queries/contracts'
import Rulebook from './pages/Rulebook'

type LeagueOfficePagesType = 'Rulebook' | 'Free Agency' | 'History' | 'Trade Block'

export default function LeagueOffice() {
	const [searchParams, setSearchParams] = useSearchParams()
	const leagueOfficePage: LeagueOfficePagesType = searchParams.get('pgType') as LeagueOfficePagesType

	const pageToolbarProps: PageToolbarPropsType = {
		activeKey: leagueOfficePage,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'pgType', value: 'Rulebook' },
			{ key: 'pgType', value: 'Free Agency' },
			// { key: 'pgType', value: 'History' },
			// { key: 'pgType', value: 'Trade Block' },
		],
	}
	return (
		<div className="my-4 text-center">
			<PageToolbar {...pageToolbarProps} />
			{leagueOfficePage === 'Rulebook' && <Rulebook />}
			{leagueOfficePage === 'Free Agency' && <PlayerSalaries />}
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
