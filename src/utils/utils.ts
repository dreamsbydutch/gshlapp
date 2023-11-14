import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { seasons } from './constants'
import { Season, SeasonInfoDataType } from '../api/types'
import { useWeeksData } from '../api/queries/weeks'


export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))
export function formatDate(date: Date) {
	return date.toISOString().slice(0, 10)
}
export function rankFormatter(number: number) {
	// Check if the number ends in 11, 12, or 13 (special cases)
	if (number % 100 >= 11 && number % 100 <= 13) {
		return number + 'th'
	}

	// Determine the postfix based on the last digit
	switch (number % 10) {
		case 1:
			return number + 'st'
		case 2:
			return number + 'nd'
		case 3:
			return number + 'rd'
		default:
			return number + 'th'
	}
}
export function moneyFormatter(number: number) {
	const formatter = new Intl.NumberFormat(navigator.language, {
		style: 'currency',
		currency: 'USD',
		minimumSignificantDigits: 1,
	})
	return formatter.format(number).replace('US', '')
}


export function getSeason(season?:number) {
	return season ? seasons.filter(obj => obj.Season === season)[0] : seasons.filter(season => season.SeasonStartDate < new Date()).slice(-1)[0]
}
export function seasonToNumber(season?:SeasonInfoDataType) {
	return season ? +season.Season as Season : +seasons.filter(season => season.SeasonStartDate < new Date()).slice(-1)[0].Season as Season
}
export function seasonToString(season?:SeasonInfoDataType) {
	return season ? String(season.Season) : String(seasons.filter(season => season.SeasonStartDate < new Date()).slice(-1)[0].Season)
}
export function dateToString(date?:Date|string) {
	if (typeof date === 'string') return date
	if (date && typeof date !== 'string') {
		return formatDate(date)
	}
	return formatDate(new Date())
}
export function useCurrentWeek() {
	const weeks = useWeeksData({season: getSeason()})
	const currentWeek = weeks.data?.filter(obj => obj.StartDate <= new Date() && obj.EndDate >= new Date())[0]
	return currentWeek
}