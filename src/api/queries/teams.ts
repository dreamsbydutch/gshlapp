import { useQuery } from "react-query"
import { getSeason, seasonToString } from "../../utils/utils"
import { Season, SeasonInfoDataType, WeekType } from "../types"
import { queryFunc } from "../fetch"
import { formatTeamInfo, formatTeamStats } from "../formatters"


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


//
	type TeamBaseType = {
		id:number,
		Season: Season,
		WeekType: WeekType,
		gshlTeam:number,
		owner:number,
		GP:number,
		GPg:number,
		IR:number,
		'IR+':number,
		MG:number,
		GS:number,
		GSg:number,
		G:number,
		A:number,
		P:number,
		PPP:number,
		SOG:number,
		HIT:number,
		BLK:number,
		W:number,
		GA:number,
		GAA:number,
		SV:number,
		SA:number,
		SVP:number,
		TOI:number,
		MS:number,
		BS:number,
		Rating:number,
	}
	type TeamDayType = TeamBaseType & {
		WeekNum:number,
		Date: Date,
	}
	export type TeamWeekType = TeamBaseType & {
		WeekNum:number,
		YTDRtg:number,
		PwrRtg:number,
		PwrRk:number,
	}
	type TeamSeasonType = TeamBaseType & {
		Players:number,
		Norris:number,
		Vezina:number,
		Calder:number,
		JackAdams:number,
		GMOY:number,
	}
//



export type TeamWeekOptions = {
	season: Season,
	WeekNum?: number,
	gshlTeam?: number,

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
	if (options.season) {weeksData = weeksData.filter(obj => obj.Season === season.Season)}
	if (options.WeekNum) {weeksData = weeksData.filter(obj => obj.WeekNum === options.WeekNum)}
	if (options.gshlTeam) {weeksData = weeksData.filter(obj => obj.gshlTeam === options.gshlTeam)}
	return { data: weeksData }
}