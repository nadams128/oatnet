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

import { useState, createContext } from 'react'
import {
	Link, useLocation
} from "react-router-dom";

// change this address to the address of the oatnet server that you want to connect to
export const serverDomain = "http://localhost:8080"

// creates the context used for the login page's 'loggedIn' state variable
export const LoginContext = createContext({})

// determines the page title based off of page and auth status
function getTitle(registered:boolean, loggedIn:boolean){
	let location = useLocation()
	switch (location.pathname){
		case "/":
			return (loggedIn ? "OATNET/REPORT" : (registered ? "OATNET/REPORT" : "OATNET/REGISTER"))
		case "/inventory":
			return "OATNET/INVENTORY"
		case "/report":
			return "OATNET/REPORT"
		case "/login":
			return loggedIn ? "OATNET/LOGOUT" : "OATNET/LOGIN"
		case "/admin":
			return "OATNET/ADMIN"
		case "/search":
			return "OATNET/SEARCH"
		case "/add":
			return "OATNET/ADD"
		default:
			return "OATNET"
	}
}

function App({children}:any) {
	const [showMenu, setShowMenu] = useState<boolean>(false)
	const [loggedIn, setLoggedIn] = useState<boolean>(localStorage.getItem("sessionID")!==null)
	return (
		<LoginContext.Provider value={{loggedIn,setLoggedIn}}>
			<div className="w-full h-full bg-oatnet-background text-oatnet-text-light p-px font-intervariabletext">
				{/* header bar */}
				<div className="flex flex-row justify-between">
					<div className="flex flex-row items-center text-xl font-youngserif">
						<img src="/assets/oatnet-menu.svg" onClick={() => {setShowMenu(!showMenu)}} className="w-11 h-11 p-1 mr-1"/>
						MENU
					</div>
					<div className="flex flex-row justify-between items-center">
						<Link to="/report"><img className="w-11 h-11 p-1 mr-1" src="/assets/document.svg"/></Link>
						<Link to="/search"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-magnifying-glass.svg"/></Link>
						<Link to="/add"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-plus.svg"/></Link>
						<img className="w-12 h-12" src="/assets/kropotkin_spin_tilt_small.gif"/>
					</div>
				</div>
				{/* menu, shown/hidden by the menu button */}
				{showMenu && <div className="flex flex-wrap:wrap flex-col select-none font-youngserif ml-2">
					{localStorage.getItem("sessionID") && <>
						<div className="flex text-lg" onClick={() => {setShowMenu(false)}}>
							<Link to="/search">/SEARCH</Link>
						</div>
						<div className="flex text-lg" onClick={() => {setShowMenu(false)}}>
							<Link to="/add">/ADD</Link>
						</div>
						<div className="flex text-lg" onClick={() => {setShowMenu(false)}}>
							<Link to="/report">/REPORT</Link>
						</div>
					</>}
					<div className="flex text-lg" onClick={() => {setShowMenu(false)}}>
						<Link to="/login">
							{(localStorage.getItem("sessionID") ? "/LOGOUT" : (localStorage.getItem("username") ? "/LOGIN" : "/REGISTER"))}
						</Link>
					</div>
					{localStorage.getItem("sessionID") && localStorage.getItem("username") === "administrator" && 
						<div className="flex text-lg" onClick={() => {setShowMenu(false)}}>
							<Link to="/admin">/ADMIN</Link>
						</div>
					}
				</div>}
				{/* page title */}
				<div className={("flex justify-center font-youngserif select-none text-2xl mb-4 mt-2")}>
					{getTitle(localStorage.getItem("username")!==null, loggedIn)}
				</div>
				{/* currently selected component is passed in as a child via routing */}
				{children}
			</div>
		</LoginContext.Provider>
	)
}

export default App
