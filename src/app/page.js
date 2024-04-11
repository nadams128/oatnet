"use client";
import { useEffect, useState } from 'react';
import {Inventory} from '../components/Inventory';
import {Report} from '../components/Report';

export default function Home() {
  const [selected, setSelected] = useState()
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className='w-screen h-screen bg-oatnet-background text-white p-px'>
      <div onClick={() => {setShowMenu(!showMenu)}} className="w-fit h-fit">
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
        <div className="w-9 h-1 m-1 my-2 bg-white rounded-lg"></div>
      </div>
      {showMenu && 
        <div className="flex flex-wrap:wrap flex-col">
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setSelected(<Inventory/>)
          }}>
            {"Inventory"}
          </div>
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setSelected(<Report/>)
          }}>
            {"Report"}
          </div>
          <div className="flex flex-wrap:nowrap justify-center">
            ------------------------------
          </div>
        </div>
      }
      <div className="flex justify-center font-rubik text-3xl">OatNet</div>
      {selected}
    </div>
  )
}


