import { useContractData, useSalaryData } from '../../api/queries/contracts'
import { TeamInfoType, useCurrentRoster } from '../../api/queries/teams'
import { SeasonInfoDataType } from '../../api/types'
import { seasons, upcomingSeasons } from '../../utils/constants'
import { moneyFormatter } from '../../utils/utils'
import { LoadingSpinner } from './LoadingSpinner'

export default function TeamRoster({ teamInfo, season }: { teamInfo: TeamInfoType; season: SeasonInfoDataType }) {
	const showSalaries = false
	const salaryData = useSalaryData({}).data
	const rosterData = useCurrentRoster({ season: season.Season, gshlTeam: teamInfo.id })
	const contractData = useContractData({ teamID: teamInfo.id })
	const expiringContracts = contractData.data?.filter(obj => +obj.YearsRemaining === 0)
	const currentRoster = rosterData.data?.sort((a, b) => a.Rank - b.Rank)
	const teamLineup = !currentRoster?.filter(obj => obj.LineupPos === 'Util')[0]?.nhlPos.includes('D')
		? [
				[
					[
						currentRoster?.filter(obj => obj.LineupPos === 'LW')[0],
						currentRoster?.filter(obj => obj.LineupPos === 'C')[0],
						currentRoster?.filter(obj => obj.LineupPos === 'RW')[0],
					],
					[
						currentRoster?.filter(obj => obj.LineupPos === 'LW')[1],
						currentRoster?.filter(obj => obj.LineupPos === 'C')[1],
						currentRoster?.filter(obj => obj.LineupPos === 'RW')[1],
					],
					[null, null, currentRoster?.filter(obj => obj.LineupPos === 'Util')[0], null, null],
				],
				[
					[null, currentRoster?.filter(obj => obj.LineupPos === 'D')[0], currentRoster?.filter(obj => obj.LineupPos === 'D')[1], null],
					[null, null, currentRoster?.filter(obj => obj.LineupPos === 'D')[2], null, null],
				],
				[[null, null, currentRoster?.filter(obj => obj.LineupPos === 'G')[0], null, null]],
		  ]
		: [
				[
					[
						currentRoster?.filter(obj => obj.LineupPos === 'LW')[0],
						currentRoster?.filter(obj => obj.LineupPos === 'C')[0],
						currentRoster?.filter(obj => obj.LineupPos === 'RW')[0],
					],
					[
						currentRoster?.filter(obj => obj.LineupPos === 'LW')[1],
						currentRoster?.filter(obj => obj.LineupPos === 'C')[1],
						currentRoster?.filter(obj => obj.LineupPos === 'RW')[1],
					],
				],
				[
					[null, currentRoster?.filter(obj => obj.LineupPos === 'D')[0], currentRoster?.filter(obj => obj.LineupPos === 'D')[1], null],
					[null, currentRoster?.filter(obj => obj.LineupPos === 'D')[2], currentRoster?.filter(obj => obj.LineupPos === 'Util')[0], null],
				],
				[[null, null, currentRoster?.filter(obj => obj.LineupPos === 'G')[0], null, null]],
		  ]

	if (!salaryData || !currentRoster || !teamInfo) {
		return <LoadingSpinner />
	}
	return (
		<>
			<div className="mt-12 text-center mx-auto text-xl font-bold">Current Roster</div>
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
											const contract = expiringContracts?.filter(b => b.PlayerName === a.PlayerName)[0]
											const salary = salaryData?.filter(c => c.PlayerName === a.PlayerName)[0]?.CurrentSalary
											return (
												<div key={j} className="grid grid-cols-2 col-span-2 text-center px-2">
													<div className="col-span-3 text-sm">{a.PlayerName}</div>
													<div className="text-2xs">{a.nhlPos.toString()}</div>
													<div>
														<img
															src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${a?.nhlTeam?.slice(
																-1
															)}.png`}
															alt="NHL Team Logo"
															className="h-4 w-4 mx-auto"
														/>
													</div>
													<div
														className={`text-2xs rounded-lg px-2 max-w-fit place-self-center ${
															a?.Rank < 17
																? 'bg-emerald-400'
																: a?.Rank < 65
																? 'bg-emerald-200'
																: a?.Rank < 161
																? 'bg-yellow-200'
																: a?.Rank < 241
																? 'bg-orange-200'
																: 'bg-rose-200'
														}`}>
														{Math.round(+a?.Rating * 100) / 100}
													</div>
													<div className={`text-2xs my-1 col-span-3 rounded-xl ${contract?.ExpiryType === 'RFA' ? 'text-orange-700' : ''} ${showSalaries && 'hidden'}`}>
														{a.ContractEligible && salary > 999999 && moneyFormatter(salary)}
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
			{currentRoster?.filter(obj => obj.LineupPos === 'BN').length > 0 ? (
				<div className="flex flex-col max-w-md mx-auto border rounded-xl bg-brown-50 mt-2">
					<div className="grid grid-cols-2 items-center my-2 mx-2">
						{currentRoster
							?.filter(obj => obj.LineupPos === 'BN')
							.map((obj, i) => {
								const contract = expiringContracts?.filter(b => b.PlayerName === obj.PlayerName)[0]
								const salary = salaryData?.filter(a => a.PlayerName === obj?.PlayerName)[0]?.CurrentSalary
								return (
									<div key={i} className="grid grid-cols-2 text-center px-2 my-2">
										<div className="col-span-3 text-sm">{obj?.PlayerName}</div>
										<div className="text-2xs">{obj?.nhlPos.toString()}</div>
										<div>
											<img
												src={`https://raw.githubusercontent.com/dreamsbydutch/gshl/main/public/assets/Logos/nhlTeams/${obj?.nhlTeam?.slice(-1)}.png`}
												alt="NHL Team Logo"
												className="h-4 w-4 mx-auto"
											/>
										</div>
										<div
											className={`text-2xs rounded-lg px-2 max-w-fit place-self-center ${
												obj?.Rank < 17
													? 'bg-emerald-400'
													: obj?.Rank < 65
													? 'bg-emerald-200'
													: obj?.Rank < 161
													? 'bg-yellow-200'
													: obj?.Rank < 241
													? 'bg-orange-200'
													: 'bg-rose-200'
											}`}>
											{Math.round(+obj?.Rating * 100) / 100}
										</div>
										<div className={`text-2xs my-1 col-span-3 rounded-xl ${contract?.ExpiryType === 'RFA' ? 'text-orange-700' : ''}`}>
											{showSalaries && obj.ContractEligible && salary > 999999 && moneyFormatter(salary)}
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
			{showSalaries && (
				<div className="text-center mx-auto text-lg font-medum pb-4">
					Cap Space -{' '}
					{contractData.data &&
						moneyFormatter(
							upcomingSeasons[0].SalaryCap -
								contractData.data
									?.filter(obj => obj.StartDate < upcomingSeasons[0].PlayoffEndDate && +obj.YearsRemaining >= 1)
									.reduce((prev, curr) => (prev += curr.CapHit), 0)
						)}
				</div>
			)}
		</>
	)
}
