"use client";
import { useEffect, useState } from 'react';
import {getInventory, postInventory} from "./Inventory";

export function Report() {
  const [serverData, setServerData] = useState([])

  useEffect(() => {
    getInventory("").then((response) => {
      setServerData(response)
      console.log(response)
    })
  },[])

  return(
    <div className="flex flex-col">
      <div>
        <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
          getInventory("").then((response) => {
            setServerData(response)
            console.log(response)
          })
        }}>All</button>
        <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
          getInventory("check-weekly").then((response) => {
            setServerData(response)
            console.log(response)
          })
        }}>Weekly</button>
      </div>
      <div className="mt-5 mx-2">
        {serverData.map(
          (row) => {
            let neededWeekly = ""
            if(row[4] === "true")
              neededWeekly="Yes"
            else
              neededWeekly="No"
            return(<div key={row[1]}>{row[1]} | Need: {row[2]} | Have: {row[3]} | Need Weekly?: {neededWeekly} </div>)
          })
        }
      </div>
      <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
        getInventory("").then((response) => {
          setServerData(response)
          console.log(response)
        })
      }}>Refresh</button>
    </div>
  )
}