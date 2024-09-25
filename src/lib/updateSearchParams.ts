import { SetURLSearchParams } from "react-router-dom";

export default function updateSearchParams(newParams: { key: string; value: string }[], searchParams: URLSearchParams, setSearchParams: SetURLSearchParams) {
	newParams.map(param => searchParams.set(param.key, param.value))
	searchParams.forEach((value:string, key:string) => {
		if (value === '') {
			searchParams.delete(key)
		}
	})
	setSearchParams(searchParams)
}