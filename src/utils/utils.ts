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
export function isSigningPeriod() {
	const date = new Date()
	const season = seasons.slice(-1)[0]
	switch(true) {
		case season.EarlySigningStartDate > date:
			return false
		case season.EarlySigningStartDate <= date && season.EarlySigningEndDate <= date:
			return true
		case season.LateSigningStartDate > date:
			return false
		case season.LateSigningStartDate <= date && season.LateSigningEndDate <= date:
			return true
		case season.LateSigningEndDate < date:
			return false
		default:
			return false
	}
}


export function getSeason(season?:number) {
	const date = new Date()
	date.setHours(date.getHours()-8)
	return season ? seasons.filter(obj => String(obj.Season) === String(season))[0] : seasons.filter(season => season.SeasonStartDate < date).slice(-1)[0]
}
export function seasonToNumber(season?:SeasonInfoDataType) {
	const date = new Date()
	date.setHours(date.getHours()-8)
	return season ? +season.Season as Season : +seasons.filter(season => season.SeasonStartDate < date).slice(-1)[0].Season as Season
}
export function seasonToString(season?:SeasonInfoDataType) {
	const date = new Date()
	date.setHours(date.getHours()-8)
	return season ? String(season.Season) : String(seasons.filter(season => season.SeasonStartDate < date).slice(-1)[0].Season)
}
export function dateToString(date?:Date|string) {
	if (typeof date === 'string') return date
	if (date && typeof date !== 'string') {
		return formatDate(date)
	}
	const date2 = new Date()
	date2.setHours(date2.getHours()-8)
	return formatDate(date2)
}
export function useCurrentWeek() {
	const date = new Date()
	date.setHours(date.getHours()-8)
	const weeks = useWeeksData({season: getSeason()})
	const currentWeek = weeks.data?.filter(obj => formatDate(obj.StartDate) <= formatDate(date) && formatDate(obj.EndDate) >= formatDate(date))[0]
	return currentWeek
}
export function formatYears(years:number[]) {
	if (!years.length) return "";
  
	years.sort((a, b) => a - b); // Ensure the years are sorted
  
	let result = "";
	let start = years[0];
	let end = years[0];
  
	for (let i = 1; i < years.length; i++) {
		if (years[i] === end + 1) {
			end = years[i];
		} else {
			if (start === end) {
				result += `${start}, `;
			} else {
				result += `${start}-${end}, `;
			}
			start = years[i];
			end = years[i];
		}
	}
  
	if (start === end) {
		result += `${start}`;
	} else {
		result += `${start}-${end}`;
	}
  
	return result;
  }