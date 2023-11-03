import { useQuery } from "react-query";
import { queryFunc } from "../fetch";
import { SeasonInfoDataType } from "../types";
import { formatStandings } from "../formatters";
import { getSeason } from "../../utils/utils";

export type StandingsQueryOptions = {
    season: SeasonInfoDataType | number
    conf?: string
    teamID?: number
    ownerID?: number
    OvrRkMax?: number
    OvrRkMin?: number
    CCRkMax?: number
    CCRkMin?: number
    WCRkMax?: number
    WCRkMin?: number
    LTRkMax?: number
    LTRkMin?: number
    POFinish?: string
}
export type StandingsInfoType = {
	Season: SeasonInfoDataType
	gshlTeam: number
	Owner: number
	LogoURL: string
	conf: string
	W: number
	HW: number
	HL: number
	L: number
	PTS: number
	CF: number
	CA: number
	CCW: number
	CCHW: number
	CCHL: number
	CCL: number
	CCPTS: number
	CCCF: number
	CCCA: number
	POW: number
	POHW: number
	POHL: number
	POL: number
	POPTS: number
	POCF: number
	POCA: number
	LTW: number
	LTHW: number
	LTHL: number
	LTL: number
	LTPTS: number
	LTCF: number
	LTCA: number
	Stk: string
	Rtg: number
	Rk: number
	PrevRtg: number
	PrevRk: number
	RtgCh: number
	RkCh: number
	POFinish: string
	POPer: number | null
	OvrRk: number
	WCRk: number | null
	LTRk: number | null
	CCRk: number
	DraftPtsAdj: number | null
}

export function useStandingsData (options: StandingsQueryOptions) {
	const season: SeasonInfoDataType = typeof options.season === 'number' ? getSeason(options.season) : options.season
    const queryKey = [String(season.Season), 'TeamData', 'Standings']
	const stdg = useQuery(queryKey,queryFunc)
    if (stdg.isLoading) return {'loading':true}
    if (stdg.isError) return {'error':stdg.error}
    if (!stdg.isSuccess) return {'error':stdg}
    let stdgData: StandingsInfoType[] = stdg.data.map((obj:{[key: string]: string | number | Date | null}) => formatStandings(obj)).sort((a:StandingsInfoType,b:StandingsInfoType) => a.OvrRk - b.OvrRk)
    if (options.season) {
        stdgData = stdgData.filter(obj => obj.Season === season)
    }
	if (options.conf) {
        stdgData = stdgData.filter(obj => obj.conf === options.conf)
    }
	if (options.teamID) {
        stdgData = stdgData.filter(obj => +obj.gshlTeam === options.teamID)
    }
	if (options.ownerID) {
        stdgData = stdgData.filter(obj => +obj.Owner === options.ownerID)
    }
	if (options.OvrRkMax) {
        stdgData = stdgData.filter(obj => options.OvrRkMax && +obj.OvrRk <= options.OvrRkMax)
    }
	if (options.OvrRkMin) {
        stdgData = stdgData.filter(obj => options.OvrRkMin && +obj.OvrRk >= options.OvrRkMin)
    }
	if (options.CCRkMax) {
        stdgData = stdgData.filter(obj => options.CCRkMax && +obj.CCRk <= options.CCRkMax)
    }
	if (options.CCRkMin) {
        stdgData = stdgData.filter(obj => options.CCRkMin && +obj.CCRk >= options.CCRkMin)
    }
	if (options.WCRkMax) {
        stdgData = stdgData.filter(obj => options.WCRkMax &&obj.WCRk&& +obj.WCRk <= options.WCRkMax)
    }
	if (options.WCRkMin) {
        stdgData = stdgData.filter(obj => options.WCRkMin &&obj.WCRk&& +obj.WCRk >= options.WCRkMin)
    }
	if (options.LTRkMax) {
        stdgData = stdgData.filter(obj => options.LTRkMax &&obj.LTRk&& +obj.LTRk <= options.LTRkMax)
    }
	if (options.LTRkMin) {
        stdgData = stdgData.filter(obj => options.LTRkMin &&obj.LTRk&& +obj.LTRk >= options.LTRkMin)
    }
	if (options.POFinish) {
        stdgData = stdgData.filter(obj => obj.POFinish === options.POFinish)
    }
    return {data: stdgData}
}