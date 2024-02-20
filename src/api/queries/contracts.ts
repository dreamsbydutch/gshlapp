import { useQuery } from "react-query"
import { seasonToString } from "../../utils/utils"
import { queryFunc } from "../fetch"
import { formatContracts, formatSalaries } from "../formatters"

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
    // salaryMax?: number
    // salaryMin?: number
    // signType?: number
    // expiryType?: number
    // position?: number
    // signingTeam?: number
}

export function useContractData (options: ContractQueryOptions) {
    const queryKey = [seasonToString(), 'MainInput', 'Contracts']
	const contracts = useQuery(queryKey,queryFunc)
    if (contracts.isLoading) return {'loading':true}
    if (contracts.isError) return {'error':contracts.error}
    if (!contracts.isSuccess) return {'error':contracts}
    let contractData: PlayerContractType[] = contracts.data.map((obj: {[key: string]: string | number | Date | null}) => formatContracts(obj))
    if (options.date) {
        contractData = contractData.filter(obj => options.date && obj.CapHitExpiry >= options.date)
    }
    if (options.teamID) {
        contractData = contractData.filter(obj => +obj.CurrentTeam === options.teamID)
    }
    return {data: contractData}
}


export type SalaryDataType = {
	Season: number
	Rank: number
	PlayerName: string
    gshlTeam: number
	Pos: NHLPosition
	Age: number
	Rating: number
	ProjectedSalary: number
	CurrentSalary: number
	EarlySalary: number
	LateSalary: number
    Status: string
    Savings: number

}
export type SalaryQueryOptions = {
    // date?: Date
    teamID?: number
    PlayerName?: string
    // salaryMax?: number
    // salaryMin?: number
    // signType?: number
    // expiryType?: number
    // position?: number
    // signingTeam?: number
}

export function useSalaryData(options: SalaryQueryOptions) {
    const queryKey = [seasonToString(), 'PlayerData', 'Salaries']
	const salaries = useQuery(queryKey,queryFunc)
    if (salaries.isLoading) return {'loading':true}
    if (salaries.isError) return {'error':salaries.error}
    if (!salaries.isSuccess) return {'error':salaries}
    let salaryData: SalaryDataType[] = salaries.data.map((obj: {[key: string]: string | number | Date | null}) => formatSalaries(obj))
    if (options.teamID) {
        salaryData = salaryData.filter(obj => obj.gshlTeam === options.teamID)
    }
    if (options.PlayerName) {
        salaryData = salaryData.filter(obj => obj.PlayerName === options.PlayerName)
    }
    return {data: salaryData}
}