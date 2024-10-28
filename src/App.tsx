import { useState, createContext } from 'react'
import {
  Link, useLocation
} from "react-router-dom";

export const LoginContext = createContext({})

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
    default:
      return "Oatnet"
  }
}

function App({children}:any) {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [loggedIn, setLoggedIn] = useState<boolean>(localStorage.getItem("sessionID")!==null)
  return (
    <LoginContext.Provider value={{loggedIn,setLoggedIn}}>
      <div className='w-full h-full bg-oatnet-background text-white p-px'>
        {/* Hamburger menu button, constructed out of div elements */}
        <div className="flex flex-row justify-between">
          <div onClick={() => {setShowMenu(!showMenu)}} className="w-fit h-fit">
            <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
            <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
            <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
          </div>
          <img className="w-16 h-16" src="/assets/kropotkin_spin_tilt_small.gif"/>
        </div>
        

        {/* Menu, shown/hidden by the menu button */}
        {showMenu && 
          <div className="flex flex-wrap:wrap flex-col select-none">
            {/* Set displayed component to Inventory via routing */}
            {localStorage.getItem("sessionID") && <div className="flex justify-center font-rubik text-lg" onClick={() => {
              setShowMenu(false)
            }}>
              <Link to="/search">Search</Link>
            </div>}

            {/* Set displayed component to Report via routing */}
            {localStorage.getItem("sessionID") && <div className="flex justify-center font-rubik text-lg" onClick={() => {
              setShowMenu(false)
            }}>
              <Link to="/report">Report</Link>
            </div>}

            {/* Set displayed component to Login via routing */}
            <div className="flex justify-center font-rubik text-lg" onClick={() => {
              setShowMenu(false)
            }}>
              <Link to="/login">{(localStorage.getItem("sessionID") ? "Logout" : (localStorage.getItem("username") ? "Login" : "Register"))}</Link>
            </div>

            {/* Set displayed component to Admin via routing */}
            {localStorage.getItem("username") === "administrator" && <div className="flex justify-center font-rubik text-lg" onClick={() => {
              setShowMenu(false)
            }}>
              <Link to="/admin">Admin Panel</Link>
            </div>}

            {/* Divider */}
            <div className="flex flex-wrap:nowrap justify-center select-none">
              ----------------------------
            </div>
          </div>
        }
        {/* Page title */}
        <div className={("flex justify-center font-rubik select-none text-2xl mb-4")}>{getTitle(localStorage.getItem("username")!==null, loggedIn)}</div>
        {/* Currently selected component is passed in as a child via routing */}
        {children}
      </div>
    </LoginContext.Provider>
  )
}

export default App