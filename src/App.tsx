import { useState, createContext } from 'react'
import {
	Link, useLocation
} from "react-router-dom";

// change this address to the address of the oatnet-server that you want to connect to
export const serverDomain = "http://127.0.0.1:5000"

// creates the context used for the login page's 'loggedIn' state variable
export const LoginContext = createContext({})

// determines the page title based off of page and auth status
function getTitle(registered:boolean, loggedIn:boolean){
	let location = useLocation()
	switch (location.pathname){
		case "/":
			return (loggedIn ? "Oatnet/Report" : (registered ? "Oatnet/Login" : "Oatnet/Register"))
		case "/inventory":
			return "Oatnet/Inventory"
		case "/report":
			return "Oatnet/Report"
		case "/login":
			return loggedIn ? "Oatnet/Logout" : "Oatnet/Login"
		case "/admin":
			return "Oatnet/Admin"
		case "/search":
			return "Oatnet/Search"
		case "/add":
			return "Oatnet/Add"
		default:
			return "Oatnet"
	}
}

function App({children}:any) {
	const [showMenu, setShowMenu] = useState<boolean>(false)
	const [loggedIn, setLoggedIn] = useState<boolean>(localStorage.getItem("sessionID")!==null)
	return (
		<LoginContext.Provider value={{loggedIn,setLoggedIn}}>
			<div className='w-full h-full bg-oatnet-background text-oatnet-text p-px'>
				{/* hamburger menu button, constructed out of div elements */}
				<div className="flex flex-row justify-between">
					<div onClick={() => {setShowMenu(!showMenu)}} className="w-fit h-fit">
						<div className="w-9 h-1 m-1 my-2 bg-oatnet-text rounded-lg"></div>
						<div className="w-9 h-1 m-1 my-2 bg-oatnet-text rounded-lg"></div>
						<div className="w-9 h-1 m-1 my-2 bg-oatnet-text rounded-lg"></div>
					</div>
					<div className="flex flex-row justify-between">
						{/* set displayed component to the search page via routing */}
						<Link to="/search"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-magnifying-glass.svg"/></Link>
						{/* set displayed component to the search page via routing */}					
						<Link to="/add"><img className="w-11 h-11 p-1 mr-1" src="/assets/oatnet-plus.svg"/></Link>
						<img className="w-12 h-12" src="/assets/kropotkin_spin_tilt_small.gif"/>
					</div>
				</div>

				{/* menu, shown/hidden by the menu button */}
				{showMenu && 
					<div className="flex flex-wrap:wrap flex-col select-none">
						{/* set displayed component to the report page via routing */}
						{localStorage.getItem("sessionID") && <div className="flex justify-center font-rubik text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/report">Report</Link>
						</div>}

						{/* set displayed component to the login page via routing */}
						<div className="flex justify-center font-rubik text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/login">{(localStorage.getItem("sessionID") ? "Logout" : (localStorage.getItem("username") ? "Login" : "Register"))}</Link>
						</div>

						{/* set displayed component to the admin panel via routing */}
						{localStorage.getItem("sessionID") && localStorage.getItem("username") === "administrator" && <div className="flex justify-center font-rubik text-lg" onClick={() => {
							setShowMenu(false)
						}}>
							<Link to="/admin">Admin Panel</Link>
						</div>}

						{/* divider */}
						<div className="flex flex-wrap:nowrap justify-center select-none">
						----------------------------
						</div>
					</div>
}
				{/* page title */}
				<div className={("flex justify-center font-rubik select-none text-2xl mb-4")}>{getTitle(localStorage.getItem("username")!==null, loggedIn)}</div>
				{/* currently selected component is passed in as a child via routing */}
				{children}
			</div>
		</LoginContext.Provider>
	)
}

export default App
