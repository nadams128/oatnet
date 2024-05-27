"use client";
import { useState } from 'react';
import {Inventory} from '../components/Inventory';
import {Report} from '../components/Report';

export default function Home() {
  const [selected, setSelected] = useState()
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className='w-full h-full bg-oatnet-background text-white p-px'>
      {/* Hamburger menu button, constructed of div elements */}
      <div onClick={() => {setShowMenu(!showMenu)}} className="w-fit h-fit">
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
      </div>

      {/* Menu, shown/hidden by the menu button */}
      {showMenu && 
        <div className="flex flex-wrap:wrap flex-col select-none">
          {/* Set displayed component to Inventory */}
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setShowMenu(false)
            setSelected(<Inventory/>)
          }}>
            {"Inventory"}
          </div>

          {/* Set displayed component to Report */}
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setShowMenu(false)
            setSelected(<Report setSelected = {(component) => setSelected(component)}/>)
          }}>
            {"Report"}
          </div>

          {/* Divider */}
          <div className="flex flex-wrap:nowrap justify-center select-none">
            ------------------------------
          </div>
        </div>
      }
      <div className="flex justify-center font-rubik text-3xl select-none">OatNet</div>
      {/* Variable which contains the currently selected component */}
      {selected ? selected : <Inventory/>}
    </div>
  )
}


