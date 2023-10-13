import { seasons } from "../utils/constants"
import { SeasonInfoDataType } from "./types"

function formatNumbersInsideInputs(inputObj: { [key: string]: (number|string|Date|null) }) {
	for (const key in inputObj) {
		if (!isNaN(Number(inputObj[key]))) {
			inputObj[key] = Number(inputObj[key])
		} else if (inputObj[key] === '') {
			inputObj[key] = null
		}
	}
	return inputObj
}
export function formatScheduleMatchup(matchup: { [key: string]: (number|string|Date|null) }) {
	matchup = formatNumbersInsideInputs(matchup)
	matchup.StartDate = matchup.StartDate && new Date(matchup.StartDate)
	matchup.EndDate = matchup.EndDate && new Date(matchup.EndDate)
	return matchup
}
export function formatStandings(stdg: { [key: string]: (number|string|Date|SeasonInfoDataType|null) }) {
	stdg.Season = stdg.Season&&isNaN(+stdg.Season) ? stdg.Season : seasons.filter(obj => stdg.Season&& obj.Season === +stdg.Season)[0]
	stdg = formatNumbersInsideInputs(stdg as { [key: string]: (number|string|Date|null) })
	return stdg
}
export function formatTeamInfo(team: { [key: string]: (number|string|Date|null) }) {
	return formatNumbersInsideInputs(team)
}
export function formatWeeks(week: { [key: string]: (number|string|Date|SeasonInfoDataType|null) }) {
	week.Season = week.Season&&isNaN(+week.Season) ? week.Season : seasons.filter(obj => week.Season && obj.Season === +week.Season)[0]
	week = formatNumbersInsideInputs(week as { [key: string]: (number|string|Date|null) })
	week.StartDate = week.StartDate && new Date(week.StartDate as (number|string|Date))
	week.EndDate = week.EndDate && new Date(week.EndDate as (number|string|Date))
	return week
}
export function formatContracts(contract: { [key: string]: (number|string|Date|null) }) {
	contract = formatNumbersInsideInputs(contract)
	contract.SigningDate = contract.SigningDate && new Date(contract.SigningDate)
	contract.StartDate = contract.StartDate && new Date(contract.StartDate)
	contract.EndDate = contract.EndDate && new Date(contract.EndDate)
	contract.CapHitExpiry = contract.CapHitExpiry && new Date(contract.CapHitExpiry)
	return contract
}