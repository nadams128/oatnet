/*
Oatnet - A utility application for mutual aid organizations
Copyright (C) 2025 Oatnet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Inventory from './Inventory';
import Report from './Report';
import Login from './Login'
import Admin from './Admin'
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
	Outlet,
} from "react-router-dom";
import './index.css'

const router = createBrowserRouter(createRoutesFromElements(
	<Route
		element={<App><Outlet/></App>}
		errorElement = {
			<div className="mt-24 flex flex-col flex-wrap text-oatnet-text place-content-center text-center font-rubik select-none text-3xl">
				<div className="mb-8">404 Not Found!</div>
				<div>The Requested Page Isn't Real, But You Can Imagine It If You'd Like!</div>
			</div>
		}
	>
		<Route
			path = "/"
			element = {localStorage.getItem("sessionID") ? <Report/> : <Login/>}
		/>
		<Route
			path = "/inventory"
			key=""
			element = {<Inventory/>}
		/>
		<Route
			path = "/report"
			element = {<Report/>}
		/>
		<Route
			path = "/login"
			element = {<Login/>}
		/>
		<Route
			path = "/admin"
			element = {<Admin/>}
		/>
		<Route
			path = "/search"
			element = {<Inventory/>}
		/>
		<Route
			path = "/add"
			element = {<Inventory/>}
		/>
	</Route>
));

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>,
)
