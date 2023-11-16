export type Season = 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035
export type WeekType = 'RS' | 'NC' | 'CC' | 'PO' | 'QF' | 'SF' | 'F' | 'LT'
export type SeasonInfoDataType = {
	Season: Season
	ListName: string
	CurrentNHLGamesPlayed: number
	SeasonStartDate: Date
	SeasonEndDate: Date
	SeasonDays: number
	SeasonLength: number
	PlayoffStartDate: Date
	PlayoffEndDate: Date
	PlayoffDays: number
	EarlySigningStartDate: Date
	EarlySigningEndDate: Date
	LateSigningStartDate: Date
	LateSigningEndDate: Date
	Positions: [string[], number[]]
	Categories: string[]
	PlayerData: string
	TeamData: string
	SalaryCap: number
}