import { useQuery } from "react-query"
import { formatDate, seasonToString } from "../../utils/utils"
import { queryFunc } from "../fetch"


export type HeadlineType = {
    StartDate:string
    EndDate:string
    Teams?:number[]
    Priority:number
    Headline:string
}


export function useHeadlineData () {
    const queryKey = [seasonToString(), 'MainInput', 'Headlines']
	const headlines = useQuery(queryKey,queryFunc)
    if (headlines.isLoading) return {'loading':true}
    if (headlines.isError) return {'error':headlines.error}
    if (!headlines.isSuccess) return {'error':headlines}
    const currentDate = new Date()
    currentDate.setHours(currentDate.getHours()-8)
    const output:HeadlineType[] = headlines.data.filter((obj:{StartDate:string,EndDate:string,Teams:string,Priority:string,Headline:string}) => obj.EndDate >= formatDate(currentDate) && obj.StartDate <= formatDate(currentDate)).map((obj:{StartDate:string,EndDate:string,Teams:string,Priority:string,Headline:string}) => {
        const out: HeadlineType = {StartDate:'',EndDate:'',Priority:0,Headline:''}
        out.StartDate = obj.StartDate
        out.EndDate = obj.EndDate
        out.Teams = obj.Teams ? obj.Teams.split(",").map(a => +a) : undefined
        out.Priority = +obj.Priority
        out.Headline = obj.Headline
        return out
    })
    return {data: output}
}