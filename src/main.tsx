import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Root from './routes/root'
import ErrorPage from './error'
import Schedule from './components/Schedule'
import { QueryClient, QueryClientProvider } from 'react-query'
import Home from './components/Home'
import Standings from './components/Standings'

import '@fontsource-variable/oswald'
import '@fontsource/varela-round'
import '@fontsource/barlow-condensed'
import LockerRoom from './components/LockerRoom'

const queryClient = new QueryClient()
const router = createHashRouter([
	{
		path: '/',
		element: <Root />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '',
				element: <Home />,
			},
			{
				path: 'schedule',
				element: <Schedule />,
			},
			{
				path: 'standings',
				element: <Standings />,
			},
			{
				path: 'lockerroom',
				element: <LockerRoom />,
			},
		],
	},
])
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
)
