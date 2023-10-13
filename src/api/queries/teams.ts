import { useQuery } from "react-query"
import { seasonToString } from "../../utils/utils"
import { SeasonInfoDataType } from "../types"
import { queryFunc } from "../fetch"
import { formatTeamInfo } from "../formatters"


export type TeamsQueryOptions = {
	season?: SeasonInfoDataType
	teamID?: number
	ownerID?: number
	conf?: string
}

export type TeamInfoType = {
	id: number
	TeamName: string
	OwnerID: number
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

export function useGSHLTeams (options: TeamsQueryOptions) {
    const queryKey = [seasonToString(options.season), 'MainInput', 'GSHLTeams']
	// NEED TO GET CONTRACT DATA TO CALC CAP SPACE
	const teams = useQuery(queryKey,queryFunc)
    if (teams.isLoading) return {'loading':true}
    if (teams.isError) return {'error':teams.error}
    if (!teams.isSuccess) return {'error':teams}
    let teamsData: RawTeamInfoType[] = teams.data.map((obj:{[key: string]: string | number | Date | null}) => formatTeamInfo(obj))
	if (options.season) {
		teamsData = teamsData.filter(obj => options.season && obj[options.season.Season])
	}
	if (options.teamID) {
		teamsData = teamsData.filter(obj => +obj.id === options.teamID)
    }
	if (options.ownerID) {
		teamsData = teamsData.filter(obj => +obj.OwnerID === options.ownerID)
    }
	if (options.conf) {
		teamsData = teamsData.filter(obj => obj.Conf === options.conf)
    }
    return {data: teamsData as TeamInfoType[]}
}
