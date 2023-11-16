import { useSearchParams } from 'react-router-dom'
import { seasons } from '../utils/constants'
import { useGSHLTeams } from '../api/queries/teams'
import { getSeason } from '../utils/utils'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { PageToolbarPropsType } from '../utils/types'
import { PageToolbar } from './ui/PageNavBar'
import { Season } from '../api/types'

type LeagueOfficePagesType = 'Rulebook' | 'Free Agency' | 'History'

export default function LeagueOffice() {
	const [searchParams, setSearchParams] = useSearchParams()
	const leagueOfficePage: LeagueOfficePagesType = searchParams.get('pgType') as LeagueOfficePagesType
	const season = seasons.filter(obj => obj.Season === Number(searchParams.get('season')))[0] || seasons.slice(-1)[0]
	const currentTeamData = useGSHLTeams({ season, teamID: Number(searchParams.get('teamID')) }).data
	const plyrStatsSeason: Season = (searchParams.get('statSzn') || getSeason().Season) as Season
	if (!currentTeamData) return <LoadingSpinner />
	const currentTeam = searchParams.get('teamID') ? currentTeamData[0] : undefined

	const pageToolbarProps: PageToolbarPropsType = {
		activeKey: leagueOfficePage,
		paramState: [searchParams, setSearchParams],
		toolbarKeys: [
			{ key: 'pgType', value: 'Rulebook' },
			{ key: 'pgType', value: 'Free Agency' },
			{ key: 'pgType', value: 'History' },
		],
	}
	console.log(plyrStatsSeason)
	return (
		<div className="my-4 text-center">
			<PageToolbar {...pageToolbarProps} />
			{currentTeam && <></>}
			{!currentTeam && <></>}
		</div>
	)
}
