import { seasons } from "../utils/constants"
import { SeasonInfoDataType } from "./types"

function formatNumbersInsideInputs(inputObj: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	for (const key in inputObj) {
		if (inputObj[key] === '') {
			inputObj[key] = null
		} else if (typeof inputObj[key] !== 'object' && !isNaN(Number(inputObj[key]))) {
			inputObj[key] = Number(inputObj[key])
		}
	}
	return inputObj
}
export function formatScheduleMatchup(matchup: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	matchup = formatNumbersInsideInputs(matchup)
	matchup.StartDate = matchup.StartDate && new Date(matchup.StartDate as string)
	matchup.EndDate = matchup.EndDate && new Date(matchup.EndDate as string)
	matchup.HomeWL = matchup.HomeWL === 0 ? null : matchup.HomeWL
	matchup.AwayWL = matchup.AwayWL === 0 ? null : matchup.AwayWL
	return matchup
}
export function formatStandings(stdg: { [key: string]: (number|string|string[]|number[]|Date|SeasonInfoDataType|null) }) {
	stdg.Season = stdg.Season&&isNaN(+stdg.Season) ? stdg.Season : seasons.filter(obj => stdg.Season&& obj.Season === +stdg.Season)[0]
	stdg = formatNumbersInsideInputs(stdg as { [key: string]: (number|string|Date|null) })
	return stdg
}
export function formatTeamInfo(team: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	return formatNumbersInsideInputs(team)
}
export function formatOwnerInfo(team: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	return formatNumbersInsideInputs(team)
}
export function formatWeeks(week: { [key: string]: (number|string|string[]|number[]|Date|SeasonInfoDataType|null) }) {
	week.Season = week.Season&&isNaN(+week.Season) ? week.Season : seasons.filter(obj => week.Season && obj.Season === +week.Season)[0]
	week = formatNumbersInsideInputs(week as { [key: string]: (number|string|Date|null) })
	week.StartDate = week.StartDate && new Date(week.StartDate as (number|string|Date))
	week.EndDate = week.EndDate && new Date(week.EndDate as (number|string|Date))
	return week
}
export function formatContracts(contract: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	contract = formatNumbersInsideInputs(contract)
	contract.SigningDate = contract.SigningDate && new Date(contract.SigningDate as string)
	contract.StartDate = contract.StartDate && new Date(contract.StartDate as string)
	contract.EndDate = contract.EndDate && new Date(contract.EndDate as string)
	contract.CapHitExpiry = contract.CapHitExpiry && new Date(contract.CapHitExpiry as string)
	return contract
}
export function formatPlayerStats(statLine: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	if (statLine.Date) {
		statLine.Date = typeof statLine.Date === 'string' ? new Date(statLine.Date + "T00:00:00") : statLine.Date
	}
	statLine = formatNumbersInsideInputs(statLine)
	statLine.gshlTeam = String(statLine.gshlTeam).split(",").map(obj => +obj)
	statLine.nhlTeam = String(statLine.nhlTeam).split(",")
	statLine.nhlPos = String(statLine.nhlPos).split(",")
	return statLine
}
export function formatTeamStats(statLine: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	statLine.Date = typeof statLine.Date === 'string' ? new Date(statLine.Date + "T00:00:00") : statLine.Date
	statLine = formatNumbersInsideInputs(statLine)
	return statLine
}
export function formatCurrentRoster(player: { [key: string]: (number|string|string[]|number[]|Date|null) }) {
	player = formatNumbersInsideInputs(player)
	player.nhlPos = String(player.nhlPos).split(",")
	player.nhlTeam = String(player.nhlTeam).split(",")
	player.gshlTeam = String(player.gshlTeam).split(",").map(obj => +obj)
	return player
}