import { useQueries, useQuery } from 'react-query'
import { getSeason, seasonToString } from '../../lib/utils'
import { Season, SeasonInfoDataType, WeekType } from '../types'
import { queryFunc } from '../fetch'
import { formatCurrentRoster, formatOwnerInfo, formatPlayerStats, formatTeamInfo, formatTeamStats } from '../formatters'
import { PlayerCurrentRosterType, PlayerSeasonType } from './players'
import { seasons } from '../../lib/constants'

export type TeamsQueryOptions = {
	season?: SeasonInfoDataType
	teamID?: number
	ownerID?: number
	conf?: string
}

export type TeamInfoType = {
	id: number
	TeamName: string
	Owner: OwnerInfoType
	LogoURL: string
	Conf: string
}

export type RawTeamInfoType = {
	id: number
	TeamName: string
	OwnerID: number
	LogoURL: string
	Conf: string
	'2015': number | undefined
	'2016': number | undefined
	'2017': number | undefined
	'2018': number | undefined
	'2019': number | undefined
	'2020': number | undefined
	'2021': number | undefined
	'2022': number | undefined
	'2023': number | undefined
	'2024': number | undefined
	'2025': number | undefined
	'2026': number | undefined
	'2027': number | undefined
}
export type OwnerInfoType = {
	id: number
	FirstName: string
	Nickname: string
	LastName: string
	Email: string
	Draft21: string
	Meetings21: string
	Draft22: string
	Meetings22: string
	Draft23: string
	Meetings23: string
}

export function useGSHLTeams(options: TeamsQueryOptions) {
	const queryKey = [seasonToString(options.season), 'MainInput', 'GSHLTeams']
	const queryKey2 = [seasonToString(options.season), 'MainInput', 'Users']
	// NEED TO GET CONTRACT DATA TO CALC CAP SPACE
	const teams = useQuery(queryKey, queryFunc)
	const owners = useQuery(queryKey2, queryFunc)
	if (teams.isLoading || owners.isLoading) return { loading: true }
	if (teams.isError || owners.isError) return { error: teams.error }
	if (!teams.isSuccess || !owners.isSuccess) return { error: teams }
	let teamsData: RawTeamInfoType[] = teams.data.map((obj: { [key: string]: string | number | Date | null }) => formatTeamInfo(obj))
	const ownersData: OwnerInfoType[] = owners.data.map((obj: { [key: string]: string | number | Date | null }) => formatOwnerInfo(obj))
	if (options.season) {
		teamsData = teamsData.filter(obj => options.season && obj[options.season.Season])
	}
	if (options.teamID) {
		teamsData = teamsData.filter(obj => options.teamID && +obj.id === +options.teamID)
	}
	if (options.ownerID) {
		teamsData = teamsData.filter(obj => options.ownerID && +obj.OwnerID === +options.ownerID)
	}
	if (options.conf) {
		teamsData = teamsData.filter(obj => obj.Conf === options.conf)
	}
	const output: TeamInfoType[] = teamsData.map(obj => {
		return { ...obj, Owner: ownersData.filter(a => a.id === obj.OwnerID)[0] }
	})
	return { data: output }
}

//
type TeamBaseType = {
	id: number
	Season: Season
	WeekType: WeekType
	gshlTeam: number[]
	owner: number[]
	GP: number
	GPg: number
	IR: number
	'IR+': number
	MG: number
	GS: number
	GSg: number
	G: number
	A: number
	P: number
	PPP: number
	SOG: number
	HIT: number
	BLK: number
	W: number
	GA: number
	GAA: number
	SV: number
	SA: number
	SVP: number
	TOI: number
	MS: number
	BS: number
	Rating: number
}
export type TeamDayType = TeamBaseType & {
	WeekNum: number
	Date: Date
}
export type TeamWeekType = TeamBaseType & {
	WeekNum: number
	YTDRtg: number
	PwrRtg: number
	PwrRk: number
}
export type TeamSeasonType = TeamBaseType & {
	Players: number
	Norris: number
	Vezina: number
	Calder: number
	JackAdams: number
	GMOY: number
}
//

export type TeamDayOptions = {
	season: Season
	WeekNum?: number
	gshlTeam?: number
}
export function useTeamDays(options: TeamDayOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'TeamData', 'Days']
	const days = useQuery(queryKey, queryFunc)
	if (days.isLoading) return { loading: true }
	if (days.isError) return { error: days.error }
	if (!days.isSuccess) return { error: days }
	let daysData: TeamDayType[] = days.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatTeamStats(obj))
		.sort((a: TeamDayType, b: TeamDayType) => a.Rating - b.Rating)
	if (options.season) {
		daysData = daysData.filter(obj => obj.Season === season.Season)
	}
	if (options.WeekNum) {
		daysData = daysData.filter(obj => obj.WeekNum === options.WeekNum)
	}
	if (options.gshlTeam) {
		daysData = daysData.filter(obj => obj.gshlTeam.includes(options.gshlTeam ?? 0))
	}
	return { data: daysData }
}
export type TeamWeekOptions = {
	season: Season
	WeekNum?: number
	gshlTeam?: number
}
export function useTeamWeeks(options: TeamWeekOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'TeamData', 'Weeks']
	const weeks = useQuery(queryKey, queryFunc)
	if (weeks.isLoading) return { loading: true }
	if (weeks.isError) return { error: weeks.error }
	if (!weeks.isSuccess) return { error: weeks }
	let weeksData: TeamWeekType[] = weeks.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatTeamStats(obj))
		.sort((a: TeamWeekType, b: TeamWeekType) => a.Rating - b.Rating)
	if (options.season) {
		weeksData = weeksData.filter(obj => obj.Season === season.Season)
	}
	if (options.WeekNum) {
		weeksData = weeksData.filter(obj => obj.WeekNum === options.WeekNum)
	}
	if (options.gshlTeam) {
		weeksData = weeksData.filter(obj => obj.gshlTeam.includes(options.gshlTeam ?? 0))
	}
	return { data: weeksData }
}
export type TeamSeasonOptions = {
	season: Season
	gshlTeam?: number
}
export function useTeamSeasons(options: TeamSeasonOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'TeamData', 'Seasons']
	const seasons = useQuery(queryKey, queryFunc)
	if (seasons.isLoading) return { loading: true }
	if (seasons.isError) return { error: seasons.error }
	if (!seasons.isSuccess) return { error: seasons }
	let seasonsData: TeamSeasonType[] = seasons.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatTeamStats(obj))
		.sort((a: TeamSeasonType, b: TeamSeasonType) => a.Rating - b.Rating)
	if (options.season) {
		seasonsData = seasonsData.filter(obj => obj.Season === season.Season)
	}
	if (options.gshlTeam) {
		seasonsData = seasonsData.filter(obj => obj.gshlTeam.includes(options.gshlTeam ?? 0))
	}
	return { data: seasonsData }
}

export type CurrentRosterOptions = {
	season: Season
	gshlTeam?: number
	nhlTeam?: string
	contractEligible?: boolean
	lineupPos?: string
}
export function useCurrentRoster(options: CurrentRosterOptions) {
	const season: SeasonInfoDataType = getSeason(options.season)
	const queryKey = [String(season.Season), 'PlayerData', 'CurrentRosters']
	const roster = useQuery(queryKey, queryFunc)
	if (roster.isLoading) return { loading: true }
	if (roster.isError) return { error: roster.error }
	if (!roster.isSuccess) return { error: roster }
	let rosterData: PlayerCurrentRosterType[] = roster.data.map((obj: { [key: string]: string | number | Date | null }) => formatCurrentRoster(obj))
	if (options.gshlTeam) {
		rosterData = rosterData.filter(obj => options.gshlTeam && obj.gshlTeam.includes(options.gshlTeam))
	}
	if (options.nhlTeam) {
		rosterData = rosterData.filter(obj => obj.nhlTeam && options.nhlTeam && obj.nhlTeam.includes(options.nhlTeam))
	}
	if (options.contractEligible) {
		rosterData = rosterData.filter(obj => obj.ContractEligible)
	}
	if (options.lineupPos) {
		rosterData = rosterData.filter(obj => obj.LineupPos === options.lineupPos)
	}
	return { data: rosterData }
}

export type TeamDraftPickType = {
	Season: Season
	Rd: number
	Pick: number
	gshlTeam: number
	originalTeam: number
}
export function useAllFutureDraftPicks(team?: TeamInfoType): TeamDraftPickType[] {
	const statQueries: TeamDraftPickType[] = useQueries(
		seasons
			.filter(season => season === getSeason())
			.map(season => {
				if (!season.TeamData) return { data: null }
				const queryKey: string[] = [String(season.Season), 'TeamData', 'DraftPicks']
				return {
					queryKey,
					queryFn: queryFunc,
				}
			})
	)
		.map(queryResult => {
			const seasonTeamData: TeamDraftPickType[] = queryResult.data
			if (team) return seasonTeamData
			return seasonTeamData
		})
		.flat()
	return statQueries.filter(Boolean)
}

type TeamAwardOptions = {
	season?: Season
	teamID?: number
	ownerID?: number
	award?: string
}
export type TeamAwardType = TeamSeasonType & {
	Award: string
}
export type TeamAllStarsType = PlayerSeasonType & {
	BestPos: string
}
export function useAwardHistory(options: TeamAwardOptions) {
	const season: SeasonInfoDataType = getSeason(options.season)
	const queryKey = [String(season.Season), 'MainInput', 'Awards']
	const queryKeyTwo = [String(season.Season), 'MainInput', 'AllStars']
	const awards = useQuery(queryKey, queryFunc)
	const allStars = useQuery(queryKeyTwo, queryFunc)
	if (awards.isLoading || allStars.isLoading) return { loading: true }
	if (awards.isError || allStars.isError) return { error: { awards: awards.error, allStars: allStars.error } }
	if (!awards.isSuccess || !allStars.isSuccess) return { error: { awards, allStars } }
	let awardsData: TeamAwardType[] = awards.data.map((obj: { [key: string]: string | number | Date | null }) => formatTeamStats(obj))
	let allStarsData: TeamAllStarsType[] = allStars.data.map((obj: { [key: string]: string | number | Date | null }) => formatPlayerStats(obj))
	if (options.season) {
		awardsData = awardsData.filter(obj => obj.Season === options.season)
		allStarsData = allStarsData.filter(obj => obj.Season === options.season)
	}
	if (options.teamID) {
		awardsData = awardsData.filter(obj => obj.gshlTeam.includes(options.teamID ?? 0))
		allStarsData = allStarsData.filter(obj => obj.gshlTeam.includes(options.teamID ?? 0))
	}
	if (options.ownerID) {
		awardsData = awardsData.filter(obj => obj.owner && obj.owner.includes(options.ownerID ?? 0))
		allStarsData = allStarsData.filter(obj =>
			obj.owner
				.toString()
				.split(',')
				.includes(options.ownerID?.toString() ?? '0')
		)
	}
	if (options.award) {
		awardsData = awardsData.filter(obj => obj.Award === options.award)
	}
	return { data: { awards: awardsData.filter(obj => obj.gshlTeam), allStars: allStarsData.filter(obj => obj.gshlTeam) } }
}

export type GMRankingsOptions = {
	ownerID?: number
}
export type GMRankingsType = {
	id: number
	FirstName: string
	Nickname: string
	LastName: string
	Owing: number
	Email: string
	Draft22: string
	Meetings22: string
	Draft23: string
	Meetings23: string
	Draft24: string
	Meetings24: string
	W: number
	HW: number
	HL: number
	L: number
	PTS: number
	CF: number
	CA: number
	Diff: number
	CCW: number
	CCHW: number
	CCHL: number
	CCL: number
	CCPTS: number
	CCCF: number
	CCCA: number
	CCDiff: number
	POW: number
	POHW: number
	POHL: number
	POL: number
	POPTS: number
	POCF: number
	POCA: number
	PODiff: number
	LTW: number
	LTHW: number
	LTHL: number
	LTL: number
	LTPTS: number
	LTCF: number
	LTCA: number
	LTDiff: number
	DraftPtsAdj: number
	Players: number
	Norris: number
	Vezina: number
	Calder: number
	JackAdams: number
	GMOY: number
	Add: number
	GP: number
	GPg: number
	IR: number
	IRP: number
	MG: number
	GS: number
	GSg: number
	G: number
	A: number
	P: number
	PPP: number
	SOG: number
	HIT: number
	BLK: number
	GW: number
	GA: number
	SV: number
	SA: number
	TOI: number
	MS: number
	BS: number
	Rating: number
	GAA: number
	SVP: number
	OwnerScore: string
	seasons: string
}
export function useGMRankings(options: GMRankingsOptions) {
	const queryKey = [String(getSeason().Season), 'MainInput', 'GMRankings']
	const rankings = useQuery(queryKey, queryFunc)
	if (rankings.isLoading) return { loading: true }
	if (rankings.isError) return { error: rankings.error }
	if (!rankings.isSuccess) return { error: rankings }
	let rankingsData: GMRankingsType[] = rankings.data.map((obj: { [key: string]: string | number | Date | null }) => formatTeamStats(obj))

	if (options.ownerID) {
		rankingsData = rankingsData.filter(obj => obj.id === options.ownerID)
	}
	return { data: rankingsData, loading: false, error: undefined }
}

export type PlayoffProbOptions = {
	season: Season
	teamID?: number
}
export type PlayoffProbType = {
	teamID: number
	PlayoffsPer: number
	LoserPer: number
	AvgWins: number
	MinWins: number
	MaxWins: number
	OneSeed: number
	TwoSeed: number
	ThreeSeed: number
	FourSeed: number
	FiveSeed: number
	SixSeed: number
	SevenSeed: number
	EightSeed: number
	NineSeed: number
	TenSeed: number
	ElevenSeed: number
	TwelveSeed: number
	ThirteenSeed: number
	FourteenSeed: number
	FifteenSeed: number
	SixteenSeed: number
	OneConf: number
	TwoConf: number
	ThreeConf: number
	FourConf: number
	FiveConf: number
	SixConf: number
	SevenConf: number
	EightConf: number
	QFPer: number
	SFPer: number
	FinalPer: number
	CupPer: number
	'1stPickPer': number
	'3rdPickPer': number
	'4thPickPer': number
	'8thPickPer': number
}
export function usePlayoffProb(options: PlayoffProbOptions) {
	const season: SeasonInfoDataType = getSeason(options.season)
	const queryKey = [String(season.Season), 'TeamData', 'Probabilities']
	const prob = useQuery(queryKey, queryFunc)
	if (prob.isLoading) return { loading: true }
	if (prob.isError) return { error: prob.error }
	if (!prob.isSuccess) return { error: prob }
	let probData: PlayoffProbType[] = prob.data.map((obj: { [key: string]: string }) => formatTeamInfo(obj))
	console.log(probData)
	if (options.teamID) {
		probData = probData.filter(obj => obj.teamID === options.teamID)
	}
	return { data: probData }
}
