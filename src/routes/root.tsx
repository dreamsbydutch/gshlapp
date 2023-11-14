import { Outlet } from 'react-router-dom'
import MobileNavbar from '../components/ui/MobileNavBar'

export default function Root() {
	return (
		<>
			<div id="detail" className="mb-48 mt-4 mx-2">
				<Outlet />
			</div>
			<MobileNavbar />
		</>
	)
}
