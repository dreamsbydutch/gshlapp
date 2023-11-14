import { Link } from 'react-router-dom'

type BackButtonPropsType = {
	searchParams: URLSearchParams
}

export function BackButton({ searchParams }: BackButtonPropsType) {
	return (
		<Link to={'/' + searchParams.get('prev') + '?' + searchParams.toString()} className="shadow-emboss rounded-lg bg-slate-100 px-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={4}
				stroke="currentColor"
				className="w-5 mb-1.5 inline-block">
				<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
			</svg>
		</Link>
	)
}
