import { useState } from 'react'
import { PageToolbar } from './ui/PageNavBar'
import { SeasonInfoDataType } from '../api/types'
import { PlayoffProbType, useGSHLTeams, usePlayoffProb } from '../api/queries/teams'
import { StandingsInfoType, StandingsQueryOptions, useStandingsData } from '../api/queries/standings'
import { LoadingSpinner } from './ui/LoadingSpinner'
import ErrorPage from '../error'
import { useSearchParams } from 'react-router-dom'
import { seasons } from '../lib/constants'
import { LosersBracket, PlayoffBracket } from './pages/Playoffs'

type StandingsOption = 'Overall' | 'Conference' | 'Wildcard' | 'Playoffs' | 'LosersTourney'

export default function Standings() {
	const [searchParams, setSearchParams] = useSearchParams()
	const standingsType: StandingsOption = (searchParams.get('stdgType') as StandingsOption) || 'Overall'
	const season = seasons.filter(obj => obj.Season === Number(searchParams.get('season')))[0] || seasons.slice(-1)[0]
	const pageToolbarProps = {
		activeKey: standingsType,
		seasonActiveKey: season,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'stdgType', value: 'Overall' },
			{ key: 'stdgType', value: 'Conference' },
			{ key: 'stdgType', value: 'Wildcard' },
			{ key: 'stdgType', value: 'Playoffs' },
		],
	}
	return (
		<div className="my-4 mx-2">
			<PageToolbar {...pageToolbarProps} />
			{standingsType !== 'Playoffs' ? (
				<>
					<StandingsToggle {...{ standingsType, season }} />
					<div className="my-4 mx-4 text-gray-500 text-xs">
						<div className="">x - Clinched Playoffs</div>
						<div className="">y - Clinched Conference</div>
						<div className="">z - Clinched President's Trophy</div>
						<div className="">e - Eliminated from Playoffs</div>
						<div className="">l - Clinched Loser's Bracket</div>
					</div>
				</>
			) : (
				<div className="flex flex-col mb-12">
					<div className="text-2xl text-center py-2 font-bold">GSHL Cup Playoffs</div>
					<PlayoffBracket {...{ seasonID: season.Season }} />
					<div className="text-2xl text-center pt-12 pb-2 font-bold">Loser's Tournament</div>
					<LosersBracket {...{ season }} />
				</div>
			)}
		</div>
	)
}

const StandingsToggle = ({ standingsType, season }: { standingsType: StandingsOption; season: SeasonInfoDataType }) => {
	const toggleOptions = {
		Overall: [{ title: '', classes: 'bg-gray-100', options: { season } }],
		Conference: [
			{
				title: 'Sunview Conference',
				classes: 'bg-sunview-50 bg-opacity-50',
				options: { season, conf: 'SV' },
			},
			{
				title: 'Hickory Hotel Conferene',
				classes: 'bg-hotel-50 bg-opacity-50',
				options: { season, conf: 'HH' },
			},
		],
		Wildcard: [
			{
				title: 'Sunview Top 3',
				classes: 'bg-sunview-50 bg-opacity-50',
				options: { season, conf: 'SV', CCRkMax: 3 },
			},
			{
				title: 'Hickory Hotel Top 3',
				classes: 'bg-hotel-50 bg-opacity-50',
				options: { season, conf: 'HH', CCRkMax: 3 },
			},
			{
				title: 'Wildcard',
				classes: 'bg-gray-100 [&>*:nth-child(2)]:border-solid [&>*:nth-child(2)]:border-b-2 [&>*:nth-child(2)]:border-gray-800',
				options: { season, WCRkMax: 14 },
			},
		],
		Playoffs: [{ title: '', classes: 'bg-gray-100', options: { season } }],
		LosersTourney: [{ title: '', classes: 'bg-brown-100', options: { season, LTRkMax: 4 } }],
	}
	return (
		<>
			{toggleOptions[standingsType]?.map(obj => {
				return (
					<div>
						<div className="font-bold mt-8 text-center text-sm font-varela">{obj.title}</div>
						<div className={'mb-4 p-2 rounded-xl shadow-md [&>*:last-child]:border-none ' + obj.classes}>
							<StandingsContainer {...{ standingsType, season, options: obj.options }} />
						</div>
					</div>
				)
			})}
		</>
	)
}

export const StandingsContainer = ({
	standingsType,
	season,
	options,
}: {
	standingsType: StandingsOption
	season: SeasonInfoDataType
	options: StandingsQueryOptions
}) => {
	const stdg = useStandingsData(options).data
	const playoffProb = usePlayoffProb({ season: season.Season }).data
	if (!stdg || !playoffProb) {
		return <LoadingSpinner />
	}
	return (
		<>
			{stdg &&
				stdg.map(team => {
					const teamProb = playoffProb.filter(a => a.teamID === team.gshlTeam)[0]
					return <StandingsItem key={team.gshlTeam} {...{ team, teamProb, season, standingsType }} />
				})}
		</>
	)
}

export const StandingsItem = ({
	team,
	teamProb,
	season,
	standingsType,
}: {
	team: StandingsInfoType
	teamProb: PlayoffProbType
	season: SeasonInfoDataType
	standingsType: StandingsOption
}) => {
	const [showInfo, setShowInfo] = useState(false)
	const teamInfo = useGSHLTeams({ season, teamID: team.gshlTeam }).data
	if (!teamInfo) return <LoadingSpinner />
	if (standingsType === 'LosersTourney' && +teamProb.LoserPer !== 1) {
		return (
			<div
				key={team.gshlTeam}
				className="grid grid-cols-12 mx-auto py-1 font-varela text-gray-400 text-center items-center border-b border-dotted border-gray-400"
				onClick={() => setShowInfo(!showInfo)}>
				<div className="col-span-12">TBD</div>
			</div>
		)
	} else if (standingsType === 'LosersTourney') {
		const LTDiff = team.LTCF - team.LTCA
		return (
			<div key={team.gshlTeam} className="border-b border-dotted border-gray-400" onClick={() => setShowInfo(!showInfo)}>
				<div className="flex justify-between mx-auto px-2 py-0.5 font-varela text-center items-center">
					<div className="p-1">
						<img className="w-12" src={String(teamInfo && teamInfo[0]?.LogoURL)} alt="Team Logo" />
					</div>
					<div className="font-bold text-base">{teamInfo && teamInfo[0]?.TeamName}</div>
					<div className="text-sm">
						{team.LTW} - {team.LTL}
					</div>
					<div className={`col-span-1 text-sm ${LTDiff > 0 ? 'text-emerald-800' : LTDiff < 0 ? 'text-rose-800' : 'text-gray-500'}`}>
						{LTDiff > 0 ? '+' + LTDiff : LTDiff < 0 ? LTDiff : '-'}
					</div>
				</div>
				{showInfo ? (
					<>
						<div className="col-span-12 mb-0.5 flex flex-row justify-center flex-wrap">
							<div className="text-2xs font-bold pr-2">Tiebreak Pts:</div>
							<div className="text-2xs">{team.LTPTS + ' pts'}</div>
						</div>
						<TeamInfo {...{ teamProb, standingsType }} />
					</>
				) : (
					<></>
				)}
			</div>
		)
	} else {
		return (
			<div key={team.gshlTeam} className="border-b border-dotted border-gray-400" onClick={() => setShowInfo(!showInfo)}>
				<div className="flex justify-between mx-auto px-2 py-0.5 font-varela text-center items-center">
					<div className="p-1">
						<img className="w-12" src={String(teamInfo && teamInfo[0]?.LogoURL)} alt="Team Logo" />
					</div>
					<div className="font-bold text-base">
						{teamProb.OneSeed === 1
							? 'z - '
							: teamProb.OneConf === 1
							? 'y - '
							: teamProb.PlayoffsPer === 1
							? 'x - '
							: teamProb.LoserPer === 1
							? 'l - '
							: !teamProb.PlayoffsPer
							? 'e - '
							: ''}
						{teamInfo && teamInfo[0]?.TeamName}
					</div>
					<div className="text-sm">
						{team.W} - {team.L}
					</div>
				</div>
				{/* <div className={`text-xs ${team.Stk?.includes('W') ? 'text-emerald-800' : 'text-rose-800'}`}>{team.Stk}</div> */}
				{showInfo ? (
					<>
						<div className="col-span-12 mb-0.5 flex flex-row justify-center flex-wrap">
							<div className="text-2xs font-bold pr-2">Tiebreak Pts:</div>
							<div className="text-2xs">{team.PTS + ' pts'}</div>
						</div>
						<TeamInfo {...{ teamProb, standingsType }} />
					</>
				) : (
					<></>
				)}
			</div>
		)
	}
}
const TeamInfo = ({ teamProb, standingsType }: { teamProb: PlayoffProbType; standingsType: StandingsOption }) => {
	switch (standingsType) {
		case 'Overall':
			return (
				<div className="col-span-12 mt-1 mb-3 flex flex-row justify-center flex-wrap">
					{[
						'OneSeed',
						'TwoSeed',
						'ThreeSeed',
						'FourSeed',
						'FiveSeed',
						'SixSeed',
						'SevenSeed',
						'EightSeed',
						'NineSeed',
						'TenSeed',
						'ElevenSeed',
						'TwelveSeed',
						'ThirteenSeed',
						'FourteenSeed',
						'FifteenSeed',
						'SixteenSeed',
					].map((obj, i) => {
						return (
							<>
								{teamProb[
									obj as
										| 'OneSeed'
										| 'TwoSeed'
										| 'ThreeSeed'
										| 'FourSeed'
										| 'FiveSeed'
										| 'SixSeed'
										| 'SevenSeed'
										| 'EightSeed'
										| 'NineSeed'
										| 'TenSeed'
										| 'ElevenSeed'
										| 'TwelveSeed'
										| 'ThirteenSeed'
										| 'FourteenSeed'
										| 'FifteenSeed'
										| 'SixteenSeed'
								] !== 0 && (
									<div className="flex flex-col gap-1 px-2 border-r border-gray-500 last:border-none">
										<div className="text-xs font-bold">{i + 1 + (i + 1 === 1 ? 'st' : i + 1 === 2 ? 'nd' : i + 1 === 3 ? 'rd' : 'th') + ' Ovr'}</div>
										<div className="text-xs">
											{Math.round(
												teamProb[
													obj as
														| 'OneSeed'
														| 'TwoSeed'
														| 'ThreeSeed'
														| 'FourSeed'
														| 'FiveSeed'
														| 'SixSeed'
														| 'SevenSeed'
														| 'EightSeed'
														| 'NineSeed'
														| 'TenSeed'
														| 'ElevenSeed'
														| 'TwelveSeed'
														| 'ThirteenSeed'
														| 'FourteenSeed'
														| 'FifteenSeed'
														| 'SixteenSeed'
												] * 1000
											) /
												10 +
												'%'}
										</div>
									</div>
								)}
							</>
						)
					})}
				</div>
			)

		case 'Conference':
			return (
				<div className="col-span-12 mt-1 mb-3 flex flex-row justify-center flex-wrap">
					{['OneConf', 'TwoConf', 'ThreeConf', 'FourConf', 'FiveConf', 'SixConf', 'SevenConf', 'EightConf'].map((obj, i) => {
						return (
							<>
								{teamProb[obj as 'OneConf' | 'TwoConf' | 'ThreeConf' | 'FourConf' | 'FiveConf' | 'SixConf' | 'SevenConf' | 'EightConf'] !== 0 && (
									<div className="flex flex-col gap-1 px-2 border-r border-gray-500 last:border-none">
										<div className="text-xs font-bold">{i + 1 + (i + 1 === 1 ? 'st' : i + 1 === 2 ? 'nd' : i + 1 === 3 ? 'rd' : 'th') + ' Conf'}</div>
										<div className="text-xs">
											{Math.round(
												teamProb[obj as 'OneConf' | 'TwoConf' | 'ThreeConf' | 'FourConf' | 'FiveConf' | 'SixConf' | 'SevenConf' | 'EightConf'] * 1000
											) /
												10 +
												'%'}
										</div>
									</div>
								)}
							</>
						)
					})}
				</div>
			)

		case 'Wildcard':
			return (
				<div className="col-span-12 mt-1 mb-3 flex flex-row justify-center flex-wrap">
					{['PlayoffsPer', 'LoserPer', 'SFPer', 'FinalPer', 'CupPer'].map(obj => {
						return (
							<>
								{teamProb[obj as 'PlayoffsPer' | 'LoserPer' | 'SFPer' | 'FinalPer' | 'CupPer'] !== 0 && (
									<div className="flex flex-col gap-1 px-2 border-r border-gray-500 last:border-none">
										<div className="text-xs font-bold">{obj.replace('Per', '')}</div>
										<div className="text-xs">
											{Math.round(teamProb[obj as 'PlayoffsPer' | 'LoserPer' | 'SFPer' | 'FinalPer' | 'CupPer'] * 1000) / 10 + '%'}
										</div>
									</div>
								)}
							</>
						)
					})}
				</div>
			)

		case 'LosersTourney':
			return (
				<div className="col-span-12 mt-1 mb-3 flex flex-row justify-center flex-wrap">
					{['1stPickPer', '3rdPickPer', '4thPickPer', '8thPickPer'].map(obj => {
						return (
							<>
								{teamProb[obj as '1stPickPer' | '3rdPickPer' | '4thPickPer' | '8thPickPer'] && (
									<div className="flex flex-col gap-1 px-2 border-r border-gray-500 last:border-none">
										<div className="text-xs font-bold">{obj.replace('Per', '')}</div>
										<div className="text-xs">
											{Math.round(teamProb[obj as '1stPickPer' | '3rdPickPer' | '4thPickPer' | '8thPickPer'] * 1000) / 10 + '%'}
										</div>
									</div>
								)}
							</>
						)
					})}
				</div>
			)

		default:
			return <div></div>
	}
}
