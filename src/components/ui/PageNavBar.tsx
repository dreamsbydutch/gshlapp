import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { seasons } from '../../lib/constants'
import {
	PageToolbarPropsType,
	SeasonTogglePropsType,
	SecondaryPageToolbarPropsType,
	TeamsTogglePropsType,
	WeeksTogglePropsType,
} from '../../lib/types'
import { SetURLSearchParams } from 'react-router-dom'
import { Season, SeasonInfoDataType } from '../../api/types'
import { useWeeksData } from '../../api/queries/weeks'
import { useGSHLTeams } from '../../api/queries/teams'
import { seasonToString } from '../../lib/utils'
import updateSearchParams from '../../lib/updateSearchParams'

export function WeeksToggle(props: WeeksTogglePropsType) {
	const weeks = useWeeksData(props.weekOptions).data
	const activeWeek =
		typeof props.activeKey === 'string' ? weeks?.filter(obj => props.activeKey && obj.WeekNum === +props.activeKey)[0] : props.activeKey
	return (
		<>
			{props.seasonActiveKey && (
				<SeasonToggleNavbar
					{...{
						activeKey: props.seasonActiveKey,
						paramState: props.paramState,
					}}
				/>
			)}
			<div
				className={
					props.seasonActiveKey
						? 'h-10 w-full pl-2 pr-16 bg-gray-200 shadow-inv fixed left-16 bottom-16 z-30'
						: 'h-10 w-min max-w-full px-2 bg-gray-200 shadow-inv fixed left-0 right-0 mx-auto bottom-16 z-30'
				}>
				<div className="h-10 flex gap-0.5 items-center mx-auto overflow-x-scroll no-scrollbar">
					{weeks?.map((week, i) => {
						if (activeWeek === week) {
							if (week.WeekType === 'PO') {
								return (
									<>
										{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
										<div
											key={week.WeekNum}
											className={`rounded-md px-2 py-1 bg-amber-800 text-amber-200`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'weekNum', value: '' }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											{week.WeekNum}
										</div>
									</>
								)
							} else {
								return (
									<>
										{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
										<div
											key={week.WeekNum}
											className={`rounded-md px-2 py-1 bg-gray-800 text-gray-200`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'weekNum', value: '' }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											{week.WeekNum}
										</div>
									</>
								)
							}
						} else {
							if (week.WeekType === 'PO') {
								return (
									<>
										{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
										<div
											key={week.WeekNum}
											className={`rounded-md px-2 py-1 bg-amber-200 text-amber-700`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'weekNum', value: String(week.WeekNum) }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											{week.WeekNum}
										</div>
									</>
								)
							} else {
								return (
									<>
										{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
										<div
											key={week.WeekNum}
											className={`rounded-md px-2 py-1 bg-gray-200`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'weekNum', value: String(week.WeekNum) }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											{week.WeekNum}
										</div>
									</>
								)
							}
						}
						return (
							<>
								{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
								<div
									key={week.WeekNum}
									className={`rounded-md px-2 py-1 text- ${
										week.WeekType === 'PO' && (!props.activeKey || props.activeKey !== week) && 'text-amber-700'
									}
                            ${
															props.activeKey && props.activeKey === week
																? week.WeekType === 'PO'
																	? 'bg-amber-800 text-amber-200'
																	: 'bg-gray-800 text-gray-200'
																: 'bg-gray-200'
														}
                          `}
									onClick={() =>
										updateSearchParams(
											[{ key: 'weekNum', value: week === week ? '' : String(week.WeekNum) }],
											props.paramState[0] as URLSearchParams,
											props.paramState[1] as SetURLSearchParams
										)
									}>
									{week.WeekNum}
								</div>
							</>
						)
					})}
				</div>
			</div>
		</>
	)
}
export function PageToolbar(props: PageToolbarPropsType) {
	return (
		<>
			{props.seasonActiveKey && (
				<SeasonToggleNavbar
					{...{
						activeKey: props.seasonActiveKey || seasonToString(),
						paramState: props.paramState,
					}}
				/>
			)}
			<div
				className={
					props.seasonActiveKey
						? 'h-10 w-full pl-2 pr-16 py-1 bg-gray-200 shadow-inv fixed left-16 bottom-16 z-30'
						: 'h-10 w-min max-w-full px-2 py-1 bg-gray-200 shadow-inv fixed left-0 right-0 mx-auto bottom-16 z-30'
				}>
				<div key="pageToolberContainer" className="h-8 flex gap-1 items-center mx-auto overflow-x-scroll no-scrollbar">
					{props.toolbarKeys.map((toolbarKey, i) => {
						return (
							<>
								{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
								<div
									key={toolbarKey.value + '-' + i}
									className={`
                            whitespace-nowrap text-center font-bold py-1 px-3 rounded-lg text-sm
                            ${props.activeKey === toolbarKey.value ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-700'}
                          `}
									onClick={() =>
										updateSearchParams(
											[{ key: toolbarKey.key, value: toolbarKey.value }],
											props.paramState[0] as URLSearchParams,
											props.paramState[1] as SetURLSearchParams
										)
									}>
									{toolbarKey.value}
								</div>
							</>
						)
					})}
				</div>
			</div>
		</>
	)
}
export function TeamsToggle(props: TeamsTogglePropsType) {
	const teams = useGSHLTeams(props.teamOptions).data
	const activeTeam = typeof props.activeKey === 'string' ? teams?.filter(obj => props.activeKey && obj.id === +props.activeKey)[0] : props.activeKey
	return (
		<>
			{props.seasonActiveKey && (
				<SeasonToggleNavbar
					{...{
						activeKey: props.seasonActiveKey,
						paramState: props.paramState,
					}}
				/>
			)}
			<div
				key="container"
				className={
					props.seasonActiveKey
						? 'h-10 w-full pl-2 pr-16 bg-gray-200 shadow-inv fixed left-16 bottom-16 z-30'
						: 'h-10 w-min max-w-full px-2 bg-gray-200 shadow-inv fixed left-0 right-0 mx-auto bottom-16 z-30'
				}>
				<div className="h-10 flex gap-0.5 items-center mx-auto overflow-x-scroll no-scrollbar">
					{teams
						?.sort((a, b) => a.TeamName.localeCompare(b.TeamName))
						.sort((a, b) => b.Conf.localeCompare(a.Conf))
						.map((team, i) => {
							return (
								<>
									{i !== 0 && <span key={'split-' + i} className="h-4/6 border-1 border-gray-400" />}
									{activeTeam?.id === team.id ? (
										<div
											key={team.id}
											className={`rounded-md ${team.Conf === 'SV' ? 'bg-sunview-700' : 'bg-hotel-700'}`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'teamID', value: '' }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											<img className="p-1.5 rounded-lg max-w-max h-10" src={team.LogoURL} alt={team.TeamName} />
										</div>
									) : (
										<div
											key={team.id}
											className={`rounded-md bg-gray-200`}
											onClick={() =>
												updateSearchParams(
													[{ key: 'teamID', value: String(team.id) }],
													props.paramState[0] as URLSearchParams,
													props.paramState[1] as SetURLSearchParams
												)
											}>
											<img className="p-1.5 rounded-lg max-w-max h-10" src={team.LogoURL} alt={team.TeamName} />
										</div>
									)}
								</>
							)
						})}
				</div>
			</div>
		</>
	)
}

export function SeasonToggleNavbar({
	activeKey,
	paramState,
	position,
}: {
	activeKey: SeasonInfoDataType | string
	paramState: (URLSearchParams | SetURLSearchParams)[]
	position?: string[]
}) {
	const season: SeasonInfoDataType = typeof activeKey === 'string' ? seasons.filter(szn => szn.Season === +activeKey)[0] : activeKey
	return (
		<div className={`z-40 ${position ? position[0] : 'fixed h-10 bg-gray-200 shadow-inv bottom-16 left-0 py-2 px-1'}`}>
			<Popover className="">
				{({ open }) => (
					<>
						<Popover.Button
							className={`inline-flex items-center rounded-lg bg-gray-300 pl-0.5 pr-1.5 py-1 text-2xs font-bold text-gray-900 shadow-emboss`}>
							<ChevronDownIcon
								className={`${open ? '' : 'text-opacity-70'} h-4 w-4 text-gray-700 transition duration-150 ease-in-out`}
								aria-hidden="true"
							/>
							<span className="whitespace-nowrap">{season.ListName}</span>
						</Popover.Button>
						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1">
							<Popover.Panel className={`absolute ${position ? position[1] : 'bottom-12 left-0'} z-10 mt-3 transform px-4 sm:px-0 lg:max-w-3xl`}>
								<div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
									<div className="relative grid gap-8 bg-white p-7 lg:grid-cols-2">
										{seasons.map(item => (
											<Popover.Button
												key={item.Season}
												onClick={() => {
													updateSearchParams(
														[{ key: 'season', value: String(item.Season) }],
														paramState[0] as URLSearchParams,
														paramState[1] as SetURLSearchParams
													)
												}}
												className="-m-4 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50">
												<div className="ml-1">
													<p className="text-xs font-medium text-gray-800 whitespace-nowrap">{item.ListName}</p>
												</div>
											</Popover.Button>
										))}
									</div>
								</div>
							</Popover.Panel>
						</Transition>
					</>
				)}
			</Popover>
		</div>
	)
}
export function SeasonPageToggleNavbar({
	paramKey,
	activeKey,
	paramState,
	position,
}: {
	paramKey: string
	activeKey: Season
	paramState: (URLSearchParams | SetURLSearchParams)[]
	position?: string[]
}) {
	const season: SeasonInfoDataType = seasons.filter(szn => szn.Season === +activeKey)[0]
	return (
		<div className={`z-40 ${position ? position[0] : 'fixed h-10 bg-gray-200 shadow-inv bottom-16 left-0 py-2 px-1'}`}>
			<Popover className="">
				{({ open }) => (
					<>
						<Popover.Button
							className={`inline-flex items-center rounded-lg bg-gray-300 pl-0.5 pr-1.5 py-1 text-2xs font-bold text-gray-900 shadow-emboss`}>
							<ChevronDownIcon
								className={`${open ? '' : 'text-opacity-70'} h-4 w-4 text-gray-700 transition duration-150 ease-in-out`}
								aria-hidden="true"
							/>
							<span className="whitespace-nowrap">{season.ListName}</span>
						</Popover.Button>
						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1">
							<Popover.Panel className={`absolute ${position ? position[1] : 'bottom-12 left-0'} z-10 mt-3 transform px-4 sm:px-0 lg:max-w-3xl`}>
								<div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
									<div className="relative grid gap-8 bg-white p-7 lg:grid-cols-2">
										{seasons.map(item => (
											<Popover.Button
												key={item.Season}
												onClick={() => {
													updateSearchParams(
														[{ key: paramKey, value: String(item.Season) }],
														paramState[0] as URLSearchParams,
														paramState[1] as SetURLSearchParams
													)
												}}
												className="-m-4 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50">
												<div className="ml-1">
													<p className="text-xs font-medium text-gray-800 whitespace-nowrap">{item.ListName}</p>
												</div>
											</Popover.Button>
										))}
									</div>
								</div>
							</Popover.Panel>
						</Transition>
					</>
				)}
			</Popover>
		</div>
	)
}
export function SecondaryPageToolbar(props: SecondaryPageToolbarPropsType) {
	return (
		<div className="h-10 w-full max-w-min px-1 bg-gray-200 shadow-inv py-1 fixed left-0 right-0 bottom-24 mb-2 mx-auto z-20">
			<div className="h-8 flex gap-1 items-center mx-auto overflow-x-scroll no-scrollbar">
				{props.toolbarKeys.map((toolbarKey, i) => {
					return (
						<>
							{i !== 0 && <span key={'split' + i} className="h-4/6 border-1 border-gray-400" />}
							<div
								key={toolbarKey.value}
								className={`
                            whitespace-nowrap text-center font-bold py-1 px-3 rounded-lg text-sm
                            ${props.activeKey === toolbarKey.value ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-700'}
                          `}
								onClick={() =>
									updateSearchParams(
										props.activeKey === toolbarKey.value ? [{ key: toolbarKey.key, value: '' }] : [toolbarKey],
										props.paramState[0] as URLSearchParams,
										props.paramState[1] as SetURLSearchParams
									)
								}>
								{toolbarKey.value[0].toUpperCase()}
								{toolbarKey.value.slice(1)}
							</div>
						</>
					)
				})}
			</div>
		</div>
	)
}
