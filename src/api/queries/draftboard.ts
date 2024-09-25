import { useQuery } from 'react-query'
import { seasonToString } from '../../lib/utils'
import { queryFunc } from '../fetch'
import { formatDraftBoard, formatDraftOrder } from '../formatters'

export type DraftBoardDataType = {
	Rank: number
	Owner: string
	Pick: number
	Player: string
	Position: string
	Pos1: string
	Pos2: string
	Pos3: string
	Team: string
	Salary: number
	DuRtg: number
	DuRk: number
	Age: number
	Yahoo: number
	ESPN: number
	DFOVAR: number
	ProjG: number
	ProjA: number
	ProjP: number
	ProjPPP: number
	ProjSOG: number
	ProjHIT: number
	ProjBLK: number
	ProjW: number
	ProjGA: number
	ProjGAA: number
	ProjSV: number
	ProjSA: number
	ProjSVP: number
	PrevG: number
	PrevA: number
	PrevP: number
	PrevPPP: number
	PrevSOG: number
	PrevHIT: number
	PrevBLK: number
	PrevW: number
	PrevGA: number
	PrevGAA: number
	PrevSV: number
	PrevSA: number
	PrevSVP: number
	CRk: number
	LWRk: number
	RWRk: number
	DRk: number
	GRk: number
}
export type DraftOrderDataType = {
	Round: number
	Pick: number
	Owner: string
	NewOwner: string
	Player: string
	picktrade: string
	pickowner: string
	signing: string
	Rk: number
	Salary: number
	pickRtg: number
	orderId: number
	TeamPos: string
	teamID: number
}
export type DraftBoardQueryOptions = {
	owner?: string
	PlayerName?: string
	position?: string
}

export function useDraftBoardData(options: DraftBoardQueryOptions) {
	const queryKey = [seasonToString(), 'MainInput', 'DraftBoard']
	const queryKeyTwo = [seasonToString(), 'MainInput', 'LiveDraftOrder']
	const draftboard = useQuery(queryKey, queryFunc)
	const draftorder = useQuery(queryKeyTwo, queryFunc)
	if (draftboard.isLoading || draftorder.isLoading) return { loading: true }
	if (draftboard.isError || draftorder.isError) return { error: draftboard.error }
	if (!draftboard.isSuccess || !draftorder.isSuccess) return { error: draftboard }
	let draftBoardData: DraftBoardDataType[] = draftboard.data.map((obj: { [key: string]: string | number | Date | null }) => formatDraftBoard(obj))
	let draftOrderData: DraftOrderDataType[] = draftorder.data.map((obj: { [key: string]: string | number | Date | null }) => formatDraftOrder(obj))
	if (options.owner) {
		draftBoardData = draftBoardData.filter(obj => obj.Owner === options.owner)
	}
	if (options.PlayerName) {
		draftBoardData = draftBoardData.filter(obj => obj.Player === options.PlayerName)
	}
	if (options.position) {
		draftBoardData = draftBoardData.filter(obj => obj.Pos1 === options.position || obj.Pos2 === options.position || obj.Pos3 === options.position)
	}
	return { data: { draftboard: draftBoardData, draftorder: draftOrderData } }
}
