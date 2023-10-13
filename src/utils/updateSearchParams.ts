export default function updateSearchParams(newParams: { key: string; value: string }[], searchParams: URLSearchParams, setSearchParams: SetURLSearchParams) {
	newParams.map(param => searchParams.set(param.key, param.value))
	searchParams.forEach((value, key) => {
		if (value === '') {
			searchParams.delete(key)
		}
	})
	setSearchParams(searchParams)
}