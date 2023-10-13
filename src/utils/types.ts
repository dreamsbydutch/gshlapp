import { SetURLSearchParams } from "react-router-dom"
import { ScheduleWeekType, WeeksQueryOptions } from "../api/queries/weeks"
import { SeasonInfoDataType } from "../api/types"
import { TeamInfoType, TeamsQueryOptions } from "../api/queries/teams"

export type TeamsTogglePropsType = {
	activeKey: TeamInfoType | string | undefined
	seasonActiveKey?: SeasonInfoDataType
	paramState: (URLSearchParams|SetURLSearchParams)[]
	teamOptions: TeamsQueryOptions
}
export type WeeksTogglePropsType = {
	activeKey: ScheduleWeekType | string | undefined
	seasonActiveKey?: SeasonInfoDataType
	paramState: (URLSearchParams|SetURLSearchParams)[]
	weekOptions: WeeksQueryOptions
}
export type PageToolbarPropsType = {
	activeKey: string
	seasonActiveKey?: SeasonInfoDataType
	paramState: (URLSearchParams|SetURLSearchParams)[]
	toolbarKeys: {'key':string, 'value':string}[]
}
export type SecondaryPageToolbarPropsType = {
	activeKey: string
	seasonActiveKey?: SeasonInfoDataType
	paramState: (URLSearchParams|SetURLSearchParams)[]
	toolbarKeys: {'key':string, 'value':string}[]
}
export type SeasonTogglePropsType = {
	activeKey: SeasonInfoDataType | string
	paramState: (URLSearchParams|SetURLSearchParams)[]
	position?: string[]
}