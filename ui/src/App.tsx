import { useState, createContext } from 'react'
import {
	Link, useLocation
} from "react-router-dom";

// change this address to the address of the oatnet-server that you want to connect to
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
				{/* hamburger menu button, constructed out of div elements */}
				<div className="flex flex-row justify-between">
					<div className="flex flex-row items-center text-xl font-youngserif">
						<img src="/assets/oatnet-menu.svg" onClick={() => {setShowMenu(!showMenu)}} className="w-11 h-11 p-1 mr-1"/>
						MENU
					</div>
					<div className="flex flex-row justify-between items-center">
						{/* set displayed component to the report page via routing */}
						<Link to="/report"><img className="w-11 h-11 p-1 mr-1" src="/assets/document.svg"/></Link>
						{/* set displayed component to the search page via routing */}
						<Link to="/search"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-magnifying-glass.svg"/></Link>
						{/* set displayed component to the search page via routing */}
						<Link to="/add"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-plus.svg"/></Link>
						<img className="w-12 h-12" src="/assets/kropotkin_spin_tilt_small.gif"/>
					</div>
				</div>

				{/* menu, shown/hidden by the menu button */}
				{showMenu && 
					<div className="flex flex-wrap:wrap flex-col select-none font-youngserif ml-2">
						{/* set displayed component to the report page via routing */}
						{localStorage.getItem("sessionID") && <div className="flex text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/search">/SEARCH</Link>
						</div>}
						{/* set displayed component to the report page via routing */}
						{localStorage.getItem("sessionID") && <div className="flex text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/add">/ADD</Link>
						</div>}
						{/* set displayed component to the report page via routing */}
						{localStorage.getItem("sessionID") && <div className="flex text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/report">/REPORT</Link>
						</div>}
						{/* set displayed component to the login page via routing */}
						<div className="flex text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/login">{(localStorage.getItem("sessionID") ? "/LOGOUT" : (localStorage.getItem("username") ? "/LOGIN" : "/REGISTER"))}</Link>
						</div>
						{/* set displayed component to the admin panel via routing */}
						{localStorage.getItem("sessionID") && localStorage.getItem("username") === "administrator" && <div className="flex text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/admin">/ADMIN</Link>
						</div>}
					</div>
}
				{/* page title */}
				<div className={("flex justify-center font-youngserif select-none text-2xl mb-4 mt-2")}>{getTitle(localStorage.getItem("username")!==null, loggedIn)}</div>
				{/* currently selected component is passed in as a child via routing */}
				{children}
			</div>
		</LoginContext.Provider>
	)
}

export default App
