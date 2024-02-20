import { useState } from 'react'

export default function Rulebook() {
	return (
		<div className="pt-4 w-5/6 m-auto">
			<div className="font-varela font-extrabold text-4xl pt-2 pb-4 text-center">Rulebook</div>
			<div className="w-full mx-auto border-b border-2 border-slate-600"></div>
			{rulebook.map((section, i) => (
				<>
					<RuleCategory {...{ ruleData: section, i }} />
					<div className="w-4/6 mx-auto border-b border-2 border-slate-600"></div>
				</>
			))}
		</div>
	)
}

function RuleCategory({ ruleData, i }: { ruleData: [string, (string | [string, string[]])[]]; i: number }) {
	const [showState, setShowState] = useState(false)
	return (
		<div className="py-2" onClick={() => setShowState(!showState)}>
			<div className="text-center font-varela font-extrabold text-2xl py-3">{ruleData[0]}</div>
			{showState &&
				ruleData[1].map((rule, j) => {
					if (typeof rule === 'string') {
						return (
							<div key={i + '.' + j} className="py-2 text-base text-center">
								<span className="font-bold pr-3">{`${i + 1}.${j + 1}`}</span>
								{rule}
							</div>
						)
					}
					return (
						<div key={i + '.' + j} className="py-2">
							<div className="text-base font-bold text-center">
								<span className="pr-3">{`${i + 1}.${j + 1}`}</span>
								{rule[0]}
							</div>
							<div className="pt-1">
								{rule[1].map((subrule, k) => {
									return (
										<div className="text-sm text-center py-1">
											<span className="text-xs font-bold pr-2">{`${i + 1}.${j + 1}.${k + 1}`}</span>
											{subrule}
										</div>
									)
								})}
							</div>
						</div>
					)
				})}
		</div>
	)
}

const rulebook: [string, (string | [string, string[]])[]][] = [
	[
		'Rosters',
		[
			'2 Centers, 2 Left Wingers, 2 Right Wingers, 3 Defensemen, 1 Utility Skater, 1 Goalie, 4 Bench Spots',
			'Teams have 1 IR slot and 1 IR+ slot for injury relief',
			'Maximum of two healthy goalies are allowed on a roster at any point. The third goalie to be added will not be allowed to accumulate stats for the team, even if they start games on Yahoo their stats will be deleted from the official record.',
		],
	],
	[
		'Scoring/Categories',
		[
			['7 skater categories', ['Goals, Assists, Points, Powerplay Points, Shots, Hits, Blocks']],
			['3 goalie categories', ['Wins, Goals Against Average, Save Percentage']],
			'Tiebreaker for all matchups is "home-ice advantage". The designated home team wins any ties.',
			'Teams must have a minimum of 2 goalie starts during a matchup. If a team does not meet this minimum, then all 3 goalie categories are conceded',
		],
	],
	[
		'Waivers/Trades',
		[
			"Dropped players remain on waivers for 2 days beore being processed using Yahoo's continuous rolling list system",
			'Trade deadline is 2.5 weeks prior to the end of the regular season',
			'Trades are not subject to any league or commissioner approval and are processed immediately',
			'Any trades with suspected foul play or collusion will be investigated immediately and violaters will be punished at commissioners discretion',
			'Players under contract can be traded with their contract fully intact. No salary retention allowed.',
		],
	],
	[
		'Schedule/Tiebreakers',
		[
			'The GSHL season will be the length of the NHL regular season minus 3 playoff weeks. 21-23 weeks depending on the year.',
			'Each team plays a home-and-home with every team in their conference for a 14 game conference schedule',
			'The rest of the schedule is made up of non-conference games that rotate home and away yearly',
			'Tiebreak points are awarded using a 3 point system, Win = 3 pts, Home-ice win = 2 pts, Home-ice loss = 1 pt, Loss = 0 pts',
			[
				'Standings Tiebreakers',
				[
					'Total Points',
					'Head-to-Head Points',
					'Head-to-Head Category Differential',
					'Overall Category Differential',
					'Conference Points',
					'Conference Category Differential',
					'Coin Flip',
				],
			],
		],
	],
	[
		'Playoffs/Payouts',
		[
			[
				'Top 8 teams qualify for the playoffs',
				[
					'The top 3 teams in each conference along with the best two remaining teams as wildcards',
					'Each conference will play 1 v 4 and 2 v 3',
					'If a crossover is required then the #1 overall team will play the second wildcard and the other Conference champion will play the first wildacrd',
				],
			],
			'Second round playoff matchups are the Conference Championship games',
			'Both Conference Championship winners will play in the annual GSHL Cup Final',
			'When a team is eliminated from the playoffs their roster is locked immediately and there are no consolation games',
			'The yearly buy-in for each team is $60. Yearly Payouts are $600 for the GSHL Cup champion, $150 for the GSHL Cup runner up, and the final $210 go to admin fees (engraving, draft food, etc.)',
		],
	],
	[
		'Draft',
		[
			'The GSHL Draft will be held on Thanksgiving Friday night',
			'The GSHL Draft is 15 rounds long and follows a delayed snake draft format. The snake does not begin until after the 2nd round',
			'Players under contract at the start of the draft will be slotted in to a teams draft class from their worst pick and up',
		],
	],
	[
		"Draft Lottery/Loser's Tournament",
		[
			[
				"Loser's Tournament",
				[
					'Four worst teams at the end of the regular season will play a 3-week round robin during the three playoff weeks',
					'Rosters will be frozen on the final day of the regular season and lineups wll be auto set',
					'1st Place earns the #1 Pick in the draft, 2nd place gets the #3 Pick, 3rd place gets the #5 pick, and the loser gets the Adam Brophy Trophy and the #8 pick',
				],
			],
			[
				'Draft Points',
				[
					'Each team gets a base number of ponts based on their regular season and playoff finish',
					'Teams lose 2 points for every missed start throughout the season',
					'First Team All-GSHL players earn 15 points each for their team',
					'Second Team All-GSHL players earn 5 points each for their team',
					'Playoff All-GSHL players earn 10 points each for their team',
					'Counting Stat Awards earn a team 50 points',
					'Performance Awards earn a team 100 points',
					'Nominated Awards earn a team 150 points',
					'The Commissioner has the ability to award a positive or negative draft point adjustment to each owner',
				],
			],
			[
				'Draft Lottery Operation',
				[
					'The lottery for the second and fourth picks will include the 9th to 12th teams in the standings',
					'Teams that lost in the first round of the playoffs will be added for the sixth and seventh pick lotteries',
					'Teams that lost in the conference finals will be added for the ninth and tenth pick lotteries',
					'Teams that lost in the conference finals will be added for the eleventh and twelvth pick lotteries',
					'All remaining teams will be involved in the lotteries for picks 13 through 16',
				],
			],
		],
	],
	[
		'Awards',
		[
			[
				'Counting Stat Awards',
				['Rocket Richard - Most Goals', 'Art Ross - Most Points', 'Selke - Most Hits + Blocks', 'Lady Byng - Most Players Used'],
			],
			[
				'Performance Awards',
				[
					"Adam Brophy Award - Loser's Tournament 'Winner'",
					"President's Trophy - Best Regular Season Record",
					'Two-Seven-Six Trophy - Sunview Regular Season Title',
					'Unit 4 Trophy - Hickory Hotel Regular Season Title',
					'GSHL Cup Champion',
				],
			],
			[
				'Nominated Awards',
				[
					'Vezina - Best Goaltending',
					'Norris - Best Defensemen',
					'Hart - Best Team',
					'Calder - Best Draft',
					'Jack Adams - Coach of the Year',
					'GM of the Year',
				],
			],
		],
	],
	[
		'Salary Cap System',
		[
			"The Salary Cap only applies to your players under contract each year or 'keepers'",
			'The Salary Cap has a hard limit of $25,000,000',
			'There is a 3-year maximum on all contracts and teams can sign as many contracts as they would like',
			'There is no retention, proration, or exceptions allowed with salaries or the salary cap',
			'Buyouts are when a player under contract is dropped by the team. That players salary is cut in half for the same number of years, minimum 1 year',
			'Every player to play in the NHL in the past 2 years is assigned a salary between $10,000,000 and $1,000,000 at the start of each signing period',
			'A players salary does not change for the length of the contract',
			[
				'There are two signing periods every year and the summer free agency period',
				[
					'Early Signing Period starts on December 15th and finishes on December 31st',
					'Late Signing Period starts at the end of the GSHL Playoffs and finishes at the end of the NHL playoffs. (GSHL Cup to Stanley Cup)',
					'Free Agency starts when the Stanley Cup is awarded and finishes at the GSHL Draft',
				],
			],
			'Contracts can be signed at any point during a signing period',
			'Players can only play under 2 consecutive contracts. Players coming off of their second consecutive contract must go back in to the draft pool',
			'Players coming off of their first contract are considered RFAs and can be signed for 115% of their updated salary',
			'Players are only eligible to be signed to a contract if they have been on a GSHL roster for over 2/3 of the season or on that GSHL roster for over 1/3 of the season',
			'At the end of the late signing period, every player that is not under contract becomes a UFA',
			'UFAs can be signed by any team for a 125% premium through a lottery process',
			'UFA contract offers can be submitted at any time. UFA signings are processed on the 1st of each month throughout the summer',
		],
	],
]
