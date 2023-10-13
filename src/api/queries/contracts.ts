import { useQuery } from "react-query"
import { seasonToString } from "../../utils/utils"
import { queryFunc } from "../fetch"
import { formatContracts } from "../formatters"

type NHLPosition = 'C' | 'C,LW' | 'C,RW' | 'C,LW,RW' | 'LW' | 'LW,RW' | 'RW' | 'D' | 'G'

export type PlayerContractType = {
	id: number
	PlayerName: string
	Pos: NHLPosition
	Years: 1 | 2 | 3
	AAV: number
	SigningTeam: number
	CurrentTeam: number
	SigningDate: Date
	StartDate: Date
	SignType: 'Draft' | 'RFA' | 'UFA'
	ExpiryType: 'RFA' | 'UFA' | 'Buyout'
	EndDate: Date
	CapHit: number
	CapHitExpiry: Date
	YearsRemaining: number
}
export type ContractQueryOptions = {
    date?: Date
    teamID?: number
    salaryMax?: number
    salaryMin?: number
    signType?: number
    expiryType?: number
    position?: number
    signingTeam?: number
}

export function useContractData (options: ContractQueryOptions) {
    const queryKey = [seasonToString(), 'MainInput', 'Contracts']
	const contracts = useQuery(queryKey,queryFunc)
    if (contracts.isLoading) return {'loading':true}
    if (contracts.isError) return {'error':contracts.error}
    if (!contracts.isSuccess) return {'error':contracts}
    let contractData: PlayerContractType[] = contracts.data.map((obj: (number|string)[]) => formatContracts(obj))
    if (options.date) {
        contractData = contractData.filter(obj => options.date && obj.CapHitExpiry >= options.date)
    }
    if (options.teamID) {
        contractData = contractData.filter(obj => +obj.CurrentTeam === options.teamID)
    }
    return {data: contractData}
}