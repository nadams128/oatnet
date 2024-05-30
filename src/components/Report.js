"use client";
import { useEffect, useState } from 'react';
import {Inventory, getInventory} from "./Inventory";

// Component to see the status of the inventory as a whole, with a set of filters
export function Report({setSelected, openReport}) {
  const [serverData, setServerData] = useState([])
  const [reportRequest, setReportRequest] = useState("")

  useEffect(() => {
    if (openReport) {
      getInventory(openReport).then((response) => {
        setServerData(response)
      })
    }
    else {
      getInventory(reportRequest).then((response) => {
        setServerData(response)
      })
    }
    
  },[])

  return(
    <div className="flex flex-col">
      {/* Button to refresh the displayed data with new changes from backend */}
      <button className="mt-2 ml-2 w-32 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
        getInventory(reportRequest).then((response) => {
          setServerData(response)
        })
      }}>Refresh</button>
      <div>
        {/* Button to set the filter to all items */}
        <button className="mt-5 ml-2 w-20 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          getInventory("").then((response) => {
            setServerData(response)
            setReportRequest("")
          })
        }}>All</button>

        {/* Button to set the filter to just the weekly items */}
        <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          getInventory("check-weekly").then((response) => {
            setServerData(response)
            setReportRequest("check-weekly")
          })
        }}>Weekly</button>

        {/* Button to set the filter to just the needed items */}
        <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          getInventory("needed-items").then((response) => {
            setServerData(response)
            setReportRequest("needed-items")
          })
        }}>Needed</button>
      </div>

      {serverData && 
        // {/* Table to display report results */}
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
                      setSelected(<Inventory selectedItem={row[1]} setSelected={(item) => setSelected(item)} reportRequest={reportRequest}/>)
                    }}
                  >{row[1]}</td>
                  <td key={row[1]+"-need"} className="border-b border-r border-white border-solid pl-1">{row[2]}</td>
                  <td key={row[1]+"-have"} className="border-b border-white border-solid pl-1">{row[3]}</td>
                </tr>)
              })
            }
          </tbody>
        </table>
      }
    </div>
  )
}