"use client";
import { useEffect, useState } from 'react';
import {getInventory} from "./Inventory";

// Component to see the status of the inventory as a whole, with a set of filters
export function Report() {
  const [serverData, setServerData] = useState([])

  useEffect(() => {
    getInventory("").then((response) => {
      setServerData(response)
    })
  },[])

  return(
    <div className="flex flex-col">
      <div>
        {/* Button to set the filter to all items */}
        <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
          getInventory("").then((response) => {
            setServerData(response)
          })
        }}>All</button>

        {/* Button to set the filter to just the weekly items */}
        <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
          getInventory("check-weekly").then((response) => {
            setServerData(response)
          })
        }}>Weekly</button>
      </div>

      {/* Current implementation of a "table" to display data */}
      <div className="mt-5 mx-2">
        {serverData.map(
          (row) => {
            let checkWeekly = ""
            if(row[4] === "true")
              checkWeekly="Yes"
            else
              checkWeekly="No"
            return(<div key={row[1]}>{row[1]} | Need: {row[2]} | Have: {row[3]} | Check Weekly?: {checkWeekly} </div>)
          })
        }
      </div>

      {/* Button to refresh the displayed data with new changes from backend */}
      <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
        getInventory("").then((response) => {
          setServerData(response)
        })
      }}>Refresh</button>
    </div>
  )
}