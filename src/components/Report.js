"use client";
import { useEffect, useState } from 'react';
import {Inventory, getInventory} from "./Inventory";

// Component to see the status of the inventory as a whole, with a set of filters
export function Report({setSelected}) {
  const [serverData, setServerData] = useState([])

  useEffect(() => {
    getInventory("").then((response) => {
      setServerData(response)
    })
  },[])

  return(
    <div className="flex flex-col">
      {/* Button to refresh the displayed data with new changes from backend */}
      <button className="mt-5 ml-2 w-32 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
        getInventory("").then((response) => {
          setServerData(response)
        })
      }}>Refresh</button>
      <div>
        {/* Button to set the filter to all items */}
        <button className="mt-5 ml-2 w-28 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          getInventory("").then((response) => {
            setServerData(response)
          })
        }}>All</button>

        {/* Button to set the filter to just the weekly items */}
        <button className="mt-5 ml-2 w-28 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          getInventory("check-weekly").then((response) => {
            setServerData(response)
          })
        }}>Weekly</button>
      </div>

      {/* Table to display report results */}
      <table className="mt-5 mx-2 table-auto select-none">
        <thead>
          <tr>
            <td className="border-b border-r border-white border-dashed">Name:</td>
            <td className="border-b border-r border-white border-dashed pl-1">We Have:</td>
            <td className="border-b border-l border-white border-dashed pl-1">We Need:</td>
          </tr>
        </thead>
        <tbody>
          {/* For each row of data returned, generate the rows and data cells */}
          {serverData.map(
            (row) => {
              return(<tr key={"row-"+row[1]}>
                <td key={row[1]} className="
                  border-b border-r border-white border-solid 
                  hover:ring hover:ring-white hover:ring-offset-4 hover:ring-offset-oatnet-background" 
                  onClick={()=>{
                    setSelected(<Inventory selectedItem={row[1]} setSelected={(item) => setSelected(item)}/>)
                  }}
                >{row[1]}</td>
                <td key={row[1]+"-need"} className="border-b border-r border-white border-solid pl-1">{row[2]}</td>
                <td key={row[1]+"-have"} className="border-b border-white border-solid pl-1">{row[3]}</td>
              </tr>)
            })
          }
        </tbody>
      </table>
    </div>
  )
}