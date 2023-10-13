import { useParams } from 'react-router-dom'
import { useScheduleData } from '../api/queries/schedule'
import { useStandingsData } from '../api/queries/standings'

function Home() {
	const z = useParams()
	const x = useScheduleData({ ownerID: 1, season: 2023, gameType: 'RS' })
	const y = useStandingsData({ season: 2023 })
	console.log(x)
	console.log(y)
	console.log(z)
	return <div></div>
}

export default Home
