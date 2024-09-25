import { useQuery } from 'react-query'
import { getSeason } from '../../lib/utils'
import { queryFunc } from '../fetch'
import { SeasonInfoDataType } from '../types'
import { formatWeeks } from '../formatters'

export type ScheduleWeekType = {
	id: number
	Season: SeasonInfoDataType
	WeekNum: number
	StartDate: Date
	EndDate: Date
	GameDays: number
	WeekType: 'RS' | 'PO'
}

export type WeeksQueryOptions = {
	season: SeasonInfoDataType | number
	WeekNum?: number
	Date?: Date
	DaysMax?: number
	DaysMin?: number
	WeekType?: 'RS' | 'PO'
}

export function useWeeksData(options: WeeksQueryOptions) {
	const season: SeasonInfoDataType =
		typeof options.season === 'number' || typeof options.season === 'undefined' ? getSeason(options.season) : options.season
	const queryKey = [String(season.Season), 'MainInput', 'Weeks']
	const weeks = useQuery(queryKey, queryFunc)
	if (weeks.isLoading) return { loading: true }
	if (weeks.isError) return { error: weeks.error }
	if (!weeks.isSuccess) return { error: weeks }
	let weeksData: ScheduleWeekType[] = weeks.data
		.map((obj: { [key: string]: string | number | Date | null }) => formatWeeks(obj))
		.sort((a: ScheduleWeekType, b: ScheduleWeekType) => a.id - b.id)
	if (options.season) {
		weeksData = weeksData.filter(obj => obj.Season === season)
	}
	if (options.WeekNum) {
		weeksData = weeksData.filter(obj => +obj.WeekNum === options.WeekNum)
	}
	if (options.Date) {
		if (options.Date >= season.PlayoffEndDate) {
			weeksData = [weeksData[0]]
		} else {
			weeksData = weeksData.filter(obj => options.Date && obj.StartDate <= options.Date && obj.EndDate >= options.Date)
		}
	}
	if (options.DaysMax) {
		weeksData = weeksData.filter(obj => options.DaysMax && +obj.GameDays <= options.DaysMax)
	}
	if (options.DaysMin) {
		weeksData = weeksData.filter(obj => options.DaysMin && +obj.GameDays >= options.DaysMin)
	}
	if (options.WeekType) {
		weeksData = weeksData.filter(obj => obj.WeekType === options.WeekType)
	}
	return { data: weeksData }
}
