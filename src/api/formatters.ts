import { seasons } from "../utils/constants"

function formatNumbersInsideInputs(inputObj: any) {
	for (const key in inputObj) {
		if (!isNaN(Number(inputObj[key]))) {
			inputObj[key] = +inputObj[key]
		} else if (inputObj[key] === '') {
			inputObj[key] = null
		}
	}
	return inputObj
}
export function formatScheduleMatchup(matchup: any) {
	matchup = formatNumbersInsideInputs(matchup)
	matchup.StartDate = new Date(matchup.StartDate)
	matchup.EndDate = new Date(matchup.EndDate)
	return matchup
}
export function formatStandings(stdg: any) {
	stdg.Season = isNaN(stdg.Season) ? stdg.Season : seasons.filter(obj => obj.Season === +stdg.Season)[0]
	stdg = formatNumbersInsideInputs(stdg)
	return stdg
}
export function formatTeamInfo(team: any) {
	return formatNumbersInsideInputs(team)
}
export function formatWeeks(week: any) {
	week.Season = isNaN(week.Season) ? week.Season : seasons.filter(obj => obj.Season === +week.Season)[0]
	week = formatNumbersInsideInputs(week)
	week.StartDate = new Date(week.StartDate)
	week.EndDate = new Date(week.EndDate)
	return week
}
export function formatContracts(contract: any) {
	contract = formatNumbersInsideInputs(contract)
	contract.SigningDate = new Date(contract.SigningDate)
	contract.StartDate = new Date(contract.StartDate)
	contract.EndDate = new Date(contract.EndDate)
	contract.CapHitExpiry = new Date(contract.CapHitExpiry)
	return contract
}