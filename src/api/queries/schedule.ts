import { useQuery } from 'react-query'
import { queryFunc } from '../fetch'
import { formatScheduleMatchup } from '../formatters'
import { Season, SeasonInfoDataType, WeekType } from '../types'
import { getSeason, seasonToString } from '../../lib/utils'

type ScheduleQueryOptions = {
	id?: number
	season?: number | SeasonInfoDataType
	weekNum?: number
	gameType?: 'RS' | 'CC' | 'NC' | 'PO' | 'QF' | 'SF' | 'F' | 'LT'
	teamID?: number
	opponentID?: number
	homeTeamID?: number
	awayTeamID?: number
	ownerID?: number
	oppOwnerID?: number
	homeOwnerID?: number
	awayOwnerID?: number
}
export type MatchupDataType = {
	id: number
	Season: Season
	WeekNum: number
	StartDate: Date
	EndDate: Date
	GameDays: number
	GameType: WeekType
	MatchupNum: number
	HomeRank: number | null
	HomeTeam: number | null
	HomeOwner: number | null
	HomeScore: number | null
	HomeWL: 'W' | 'L' | 'T' | null
	AwayRank: number | null
	AwayTeam: number | null
	AwayOwner: number | null
	AwayScore: number | null
	AwayWL: 'W' | 'L' | 'T' | null
	FirstStar: number | null
	SecondStar: number | null
	ThirdStar: number | null
	MatchupRtg: number | null
}

export function useScheduleData(options: ScheduleQueryOptions) {
	const season: SeasonInfoDataType | undefined = typeof options.season === 'number' ? getSeason(options.season) : options.season
	const queryKey = [seasonToString(season), 'MainInput', 'Schedule']
	const sched = useQuery(queryKey, queryFunc)
	if (sched.isLoading) return { loading: true }
	if (sched.isError) return { error: sched.error }
	if (!sched.isSuccess) return { error: sched }
	let schedData: MatchupDataType[] = sched.data.map((obj: { [key: string]: string | number | Date | null }) => formatScheduleMatchup(obj))
	if (options.id) {
		schedData = schedData.filter(obj => obj.id === options.id)
	}
	if (options.season) {
		schedData = schedData.filter(obj => obj.Season === season?.Season)
	}
	if (options.weekNum) {
		schedData = schedData.filter(obj => +obj.WeekNum === options.weekNum)
	}
	if (options.gameType) {
		switch (options.gameType) {
			case 'RS':
				schedData = schedData.filter(obj => obj.GameType === 'RS' || obj.GameType === 'CC' || obj.GameType === 'NC')
				break
			case 'CC':
				schedData = schedData.filter(obj => obj.GameType === 'CC')
				break
			case 'NC':
				schedData = schedData.filter(obj => obj.GameType === 'NC')
				break
			case 'PO':
				schedData = schedData.filter(obj => obj.GameType === 'QF' || obj.GameType === 'SF' || obj.GameType === 'F')
				break
			case 'QF':
				schedData = schedData.filter(obj => obj.GameType === 'QF')
				break
			case 'SF':
				schedData = schedData.filter(obj => obj.GameType === 'SF')
				break
			case 'F':
				schedData = schedData.filter(obj => obj.GameType === 'F')
				break
			case 'LT':
				schedData = schedData.filter(obj => obj.GameType === 'LT')
				break
		}
	}
	if (options.teamID) {
		schedData = schedData.filter(obj => obj.HomeTeam === options.teamID || obj.AwayTeam === options.teamID)
	}
	if (options.opponentID) {
		schedData = schedData.filter(obj => obj.HomeTeam === options.opponentID || obj.AwayTeam === options.opponentID)
	}
	if (options.homeTeamID) {
		schedData = schedData.filter(obj => obj.HomeTeam === options.teamID)
	}
	if (options.awayTeamID) {
		schedData = schedData.filter(obj => obj.AwayTeam === options.teamID)
	}
	if (options.ownerID) {
		schedData = schedData.filter(obj => obj.HomeOwner === options.ownerID || obj.AwayOwner === options.ownerID)
	}
	if (options.oppOwnerID) {
		schedData = schedData.filter(obj => obj.HomeOwner === options.oppOwnerID || obj.AwayOwner === options.oppOwnerID)
	}
	if (options.homeOwnerID) {
		schedData = schedData.filter(obj => obj.HomeOwner === options.homeOwnerID)
	}
	if (options.awayOwnerID) {
		schedData = schedData.filter(obj => obj.AwayOwner === options.awayOwnerID)
	}
	return { data: schedData }
}
