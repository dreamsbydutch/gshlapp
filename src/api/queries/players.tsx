import { useQuery } from 'react-query'
import { queryFunc } from '../fetch'
import { Season, SeasonInfoDataType, WeekType } from '../types'
import { formatPlayerStats, formatPlayerWeeks, formatStandings } from '../formatters'
import { formatDate, getSeason } from '../../utils/utils'

// PLAYER DATA TYPES
type PlayerInfoType = {
	id: number
	Season: Season
	WeekType: WeekType
	PlayerName: string
	nhlPos: 'C' | 'C,LW' | 'C,RW' | 'C,LW,RW' | 'LW' | 'LW,RW' | 'RW' | 'D' | 'G'
	PosGroup: 'F' | 'D' | 'G'
	nhlTeam: string[] | null
	gshlTeam: number[]
	Age?: number
	GP: number | null
	PPD: number | null
	MG: number | null
	GS: number | null
	Rating: number
	MS: number | null
	BS: number | null
}
type SkaterStatsType = {
	G: number | null
	A: number | null
	P?: number | null
	PM?: number | null
	PIM?: number | null
	PPP: number | null
	SOG: number | null
	HIT: number | null
	BLK: number | null
}
type GoalieStatsType = {
	W: number | null
	L?: number | null
	OTL?: number | null
	GA: number | null
	GAA: number | null
	SV: number | null
	SA?: number | null
	SVP: number | null
	SO?: number | null
	TOI?: number | null
}
export type PlayerDayType = PlayerInfoType &
	SkaterStatsType &
	GoalieStatsType & {
		WeekNum: number
		Date: Date
		Injury: 'DTD' | 'O' | 'IR' | 'IR-LT' | 'IR-NR' | 'COVID-19' | 'SUSP' | 'NA' | null
		DailyPos: 'C' | 'LW' | 'RW' | 'D' | 'G' | 'Util' | 'BN' | 'IR+' | 'IR'
		Opp: string | null
		Score: string | null
		YahooRk: number | null
		FullPos: 'C' | 'LW' | 'RW' | 'D' | 'G' | 'Util' | 'BN' | 'IR+' | 'IR'
		BestPos: 'C' | 'LW' | 'RW' | 'D' | 'G' | 'Util' | 'BN' | 'IR+' | 'IR'
	}
export type PlayerWeekType = PlayerInfoType & (SkaterStatsType | GoalieStatsType) & { WeekNum: number; RosterDays: number }
export type PlayerSeasonType =
	| (PlayerInfoType & SkaterStatsType & { RosterDays: number })
	| (PlayerInfoType & GoalieStatsType & { RosterDays: number })
export type PlayerNHLType = Omit<PlayerInfoType, 'WeekType' | 'nhlPos' | 'gshlTeam' | 'PPD' | 'MG' | 'GP' | 'MS' | 'BS'> &
	(SkaterStatsType | GoalieStatsType)
export type PlayerSalaryType = Omit<PlayerInfoType, 'WeekType' | 'nhlTeam' | 'PPD' | 'MG' | 'GP' | 'GS' | 'MS' | 'BS'> & {
	ProjectedSalary: number
	CurrentSalary: number | null
	EarlySalary: number | null
	LateSalary: number | null
	Status: 'Contract' | 'Draft'
	Savings: number | null
	'2015': number | null
	'2016': number | null
	'2017': number | null
	'2018': number | null
	'2019': number | null
	'2020': number | null
	'2021': number | null
	'2022': number | null
	'2023': number | null
	'2024': number | null
	'2025': number | null
	'2026': number | null
}
export type PlayerCurrentRosterType = Omit<PlayerInfoType, 'WeekType' | 'Age' | 'PPD' | 'MG' | 'GP' | 'GS' | 'MS' | 'BS'> & {
	Rank: number
	ContractEligible: boolean
	LineupPos: 'C' | 'LW' | 'RW' | 'D' | 'G' | 'Util' | 'BN' | 'IR+' | 'IR'
}
export type PlayerDraftPickType = {
	Season: Season
	Rd: number
	Pick: number
	PlayerName: string
	gshlTeam: number
	SplitRtg: number
	TotalRtg: number
	SplitRatio: number
	CalderRtg: number
	PickRtg: number
}
export type PlayerAllStarsType = PlayerSeasonType & { LineupPos: string }
//

type PlayerTotalsOptions = {
	season: Season
	id?: number
	WeekType?: WeekType
	PlayerName?: string
	nhlPos?: 'C' | 'C,LW' | 'C,RW' | 'C,LW,RW' | 'LW' | 'LW,RW' | 'RW' | 'D' | 'G'
	PosGroup?: 'F' | 'D' | 'G'
	nhlTeam?: string
	gshlTeam?: number
	RosterDaysMax?: number
	RosterDaysMin?: number
}
export function usePlayerTotals(options: PlayerTotalsOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'PlayerData', 'Totals']
	const totals = useQuery(queryKey, queryFunc)
	if (totals.isLoading) return { loading: true }
	if (totals.isError) return { error: totals.error }
	if (!totals.isSuccess) return { error: totals }
	let totalsData: PlayerSeasonType[] = totals.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatPlayerStats(obj))
		.sort((a: PlayerSeasonType, b: PlayerSeasonType) => a.Rating - b.Rating)
	if (options.season) {
		totalsData = totalsData.filter(obj => obj.Season === season.Season)
	}
	if (options.id) {
		totalsData = totalsData.filter(obj => obj.id === options.id)
	}
	if (options.WeekType) {
		totalsData = totalsData.filter(obj => obj.WeekType === options.WeekType)
	}
	if (options.PlayerName) {
		totalsData = totalsData.filter(obj => obj.PlayerName === options.PlayerName)
	}
	if (options.nhlPos) {
		totalsData = totalsData.filter(obj => options.nhlPos && obj.nhlPos === options.nhlPos)
	}
	if (options.PosGroup) {
		totalsData = totalsData.filter(obj => obj.PosGroup === options.PosGroup)
	}
	if (options.nhlTeam) {
		totalsData = totalsData.filter(obj => options.nhlTeam && obj.nhlTeam && obj.nhlTeam.includes(options.nhlTeam))
	}
	if (options.gshlTeam) {
		totalsData = totalsData.filter(obj => options.gshlTeam && obj.gshlTeam.includes(options.gshlTeam))
	}
	if (options.RosterDaysMax) {
		totalsData = totalsData.filter(obj => options.RosterDaysMax && obj.RosterDays <= options.RosterDaysMax)
	}
	if (options.RosterDaysMin) {
		totalsData = totalsData.filter(obj => options.RosterDaysMin && obj.RosterDays >= options.RosterDaysMin)
	}
	return { data: totalsData }
}

type PlayerWeekOptions = {
	season: Season
	id?: number
	WeekNum?: number
	WeekType?: WeekType
	PlayerName?: string
	nhlPos?: 'C' | 'C,LW' | 'C,RW' | 'C,LW,RW' | 'LW' | 'LW,RW' | 'RW' | 'D' | 'G'
	PosGroup?: 'F' | 'D' | 'G'
	nhlTeam?: string
	gshlTeam?: number
	RosterDaysMax?: number
	RosterDaysMin?: number
}
export function usePlayerWeeks(options: PlayerWeekOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'PlayerData', 'Weeks']
	const weeks = useQuery(queryKey, queryFunc)
	if (weeks.isLoading) return { loading: true }
	if (weeks.isError) return { error: weeks.error }
	if (!weeks.isSuccess) return { error: weeks }
	let weeksData: PlayerWeekType[] = weeks.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatPlayerStats(obj))
		.sort((a: PlayerWeekType, b: PlayerWeekType) => a.Rating - b.Rating)
	if (options.season) {
		weeksData = weeksData.filter(obj => obj.Season === season.Season)
	}
	if (options.id) {
		weeksData = weeksData.filter(obj => obj.id === options.id)
	}
	if (options.WeekNum) {
		weeksData = weeksData.filter(obj => obj.WeekNum === options.WeekNum)
	}
	if (options.WeekType) {
		weeksData = weeksData.filter(obj => obj.WeekType === options.WeekType)
	}
	if (options.PlayerName) {
		weeksData = weeksData.filter(obj => obj.PlayerName === options.PlayerName)
	}
	if (options.nhlPos) {
		weeksData = weeksData.filter(obj => options.nhlPos && obj.nhlPos === options.nhlPos)
	}
	if (options.PosGroup) {
		weeksData = weeksData.filter(obj => obj.PosGroup === options.PosGroup)
	}
	if (options.nhlTeam) {
		weeksData = weeksData.filter(obj => options.nhlTeam && obj.nhlTeam && obj.nhlTeam.includes(options.nhlTeam))
	}
	if (options.gshlTeam) {
		weeksData = weeksData.filter(obj => options.gshlTeam && obj.gshlTeam.includes(options.gshlTeam))
	}
	if (options.RosterDaysMax) {
		weeksData = weeksData.filter(obj => options.RosterDaysMax && obj.RosterDays <= options.RosterDaysMax)
	}
	if (options.RosterDaysMin) {
		weeksData = weeksData.filter(obj => options.RosterDaysMin && obj.RosterDays >= options.RosterDaysMin)
	}
	return { data: weeksData }
}

type PlayerDayOptions = {
	season: Season
	// id?: number
	Date?: Date
	// WeekNum?: number
	// WeekType?: WeekType
	// PlayerName?: string
	// nhlPos?: 'C' | 'C,LW' | 'C,RW' | 'C,LW,RW' | 'LW' | 'LW,RW' | 'RW' | 'D' | 'G'
	// PosGroup?: 'F' | 'D' | 'G'
	// nhlTeam?: string
	// gshlTeam?: number
	// injury?: 'DTD' | 'O' | 'IR' | 'IR-LT' | 'IR-NR' | 'COVID-19' | 'SUSP' | 'NA' | null
}
export function usePlayerDays(options: PlayerDayOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'PlayerData', 'Days']
	const days = useQuery(queryKey, queryFunc)
	if (days.isLoading) return { loading: true }
	if (days.isError) return { error: days.error }
	if (!days.isSuccess) return { error: days }
	let daysData: PlayerDayType[] = days.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatPlayerStats(obj))
		.sort((a: PlayerDayType, b: PlayerDayType) => a.Rating - b.Rating)
	if (options.season) {
		daysData = daysData.filter(obj => obj.Season === season.Season)
	}
	if (options.Date) {
		daysData = daysData.filter(obj => options.Date && formatDate(obj.Date) === formatDate(options.Date))
	}
	return { data: daysData }
}
