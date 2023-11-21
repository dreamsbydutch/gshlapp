import { seasons } from "../utils/constants";

type PlayerOptions = 'Days' | 'Weeks' | 'Splits' | 'Totals' | 'NHLPlayerStats' | 'NHLGoalieStats' | 'Salaries' | 'CurrentRosters' | 'DraftHistory' | 'AllStars'
type TeamOptions = 'Days' | 'Weeks' | 'Seasons' | 'Standings' | 'AwardWinners' | 'DraftPicks' | 'NHLStandings' | 'Probabilities' | 'DraftOrder' | 'AwardNominees'
type InputOptions = 'Users' | 'GSHLTeams' | 'Weeks' | 'Schedule' | 'Contracts' | 'Rulebook'
type StatTypeType = 'PlayerData' | 'TeamData'


export async function queryFunc({ queryKey }: { queryKey: string[] }) {
	const [season, statType, pageID] = queryKey
  let queryType: StatTypeType = 'PlayerData'
  let pageName = ''
  const querySeason = seasons.filter(obj => String(obj.Season) === season)[0]
  if (statType === 'PlayerData') {
    switch (pageID) {
      case 'Days':
      case 'Weeks':
      case 'Splits':
      case 'Totals':
      case 'NHLPlayerStats':
      case 'NHLGoalieStats':
      case 'Salaries':
      case 'CurrentRosters':
      case 'DraftHistory':
      case 'AllStars':
      case 'TradeBlock':
        pageName = pageID as PlayerOptions
        queryType = statType
        break;
      default:
        return { error: 'Invalid Query Key'}
        break;
    }
  }
  if (statType === 'TeamData') {
    switch (pageID) {
      case 'Days':
      case 'Weeks':
      case 'Seasons':
      case 'Standings':
      case 'AwardWinners':
      case 'DraftPicks':
      case 'NHLStandings':
      case 'Probabilities':
      case 'DraftOrder':
      case 'AwardNominees':
        pageName = pageID as TeamOptions
        queryType = statType
        break;
      default:
        return { error: 'Invalid Query Key'}
        break;
    }
  }
  if (statType === 'MainInput') {
    switch (pageID) {
      case 'Users':
      case 'GSHLTeams':
      case 'Weeks':
      case 'Schedule':
      case 'Contracts':
      case 'Rulebook':
      case 'Awards':
        pageName = pageID as InputOptions
        break;
      default:
        return { error: 'Invalid Query Key'}
        break;
    }
  }
	const sheetID = statType === 'MainInput' ? '1jiL1gtJ-_Drlksr24kWaiRABOEniO0pg4Vlm05SFqYM' : querySeason[queryType]
	console.log('fetching: ' + season + '/' + statType + '/' + pageName)
	const data = await fetch('https://opensheet.elk.sh/' + sheetID + '/' + pageName)
	return data.json()
}
