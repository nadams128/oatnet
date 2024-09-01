import { useState } from 'react'
import {
  Link
} from "react-router-dom";

function App({children}:any) {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className='w-full h-full bg-oatnet-background text-white p-px'>
      {/* Hamburger menu button, constructed out of div elements */}
      <div onClick={() => {setShowMenu(!showMenu)}} className="w-fit h-fit">
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
      </div>

      {/* Menu, shown/hidden by the menu button */}
      {showMenu && 
        <div className="flex flex-wrap:wrap flex-col select-none">
          {/* Set displayed component to Inventory via routing */}
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setShowMenu(false)
          }}>
            <Link to="/inventory">Inventory</Link>
          </div>

          {/* Set displayed component to Report via routing */}
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setShowMenu(false)
          }}>
            <Link to="/report">Report</Link>
          </div>

          {/* Divider */}
          <div className="flex flex-wrap:nowrap justify-center select-none">
            ----------------------------
          </div>
        </div>
      }
      {/* Page title */}
      <div className={("flex justify-center font-rubik select-none text-2xl mb-4")}>OatNet</div>
      {/* Currently selected component is passed in as a child via routing */}
      {children}
    </div>
  )
}

export default App