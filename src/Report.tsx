"use client";
import { useEffect, useState } from 'react';
import {getInventory} from "./Inventory";
import {useSearchParams, useNavigate} from 'react-router-dom';

// Component to view the status of the inventory, with a set of filters and an option to go to the Inventory editor
function Report() {
  const [serverData, setServerData] = useState<any[]>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const filter = searchParams.get('filter')
    if(filter) {
      getInventory(filter).then((response) => {
        setServerData(response)
        switch (filter){
          case "all":
            getInventory("all").then((response) => {
              setServerData(response)
            })
            break
          case "weekly":
            getInventory("weekly").then((response) => {
              setServerData(response)
            })
            break
          case "needed":
            getInventory("needed").then((response) => {
              setServerData(response)
            })
            break
        }
      })
    }
    else {
      getInventory("all").then((response) => {
        setServerData(response)
      })
    }
  },[searchParams])

  return(
    <>
      {serverData && serverData[0]!=="You don't have permissions for that!" ? <div className="flex flex-col">
        {/* Button to refresh the displayed data with new changes from backend */}
        <button className="mt-2 ml-2 w-32 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          const filter = searchParams.get("filter")
          getInventory(filter ? filter : "all").then((response) => {
            setServerData(response)
          })
        }}>Refresh</button>
        <div>
          {/* Button to set the filter to all items */}
          <button className="mt-5 ml-2 w-20 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("all").then((response) => {
              setServerData(response)
              navigate("/report?filter=all")
            })
          }}>All</button>

          {/* Button to set the filter to just the weekly items */}
          <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("weekly").then((response) => {
              setServerData(response)
              navigate("/report?filter=weekly")
            })
          }}>Weekly</button>

          {/* Button to set the filter to just the needed items */}
          <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("needed").then((response) => {
              setServerData(response)
              navigate("/report?filter=needed")
            })
          }}>Needed</button>
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
                (row:any[]) => {
                  return(
                    <tr 
                      key={"row-"+row[1]} 
                      className="hover:ring hover:ring-white hover:ring-offset-4 hover:ring-offset-oatnet-background"
                      onClick={() => {
                        navigate(searchParams.get("filter") ? "/inventory?item="+row[1]+"&filter="+searchParams.get("filter") : "/inventory?item="+row[1]+"&filter=all")
                      }}
                    >
                      <td key={row[1]} className="border-b border-r border-white border-solid">{row[1]}</td>
                      <td key={row[1]+"-need"} className="border-b border-r border-white border-solid pl-1">{row[2]}</td>
                      <td key={row[1]+"-have"} className="border-b border-white border-solid pl-1">{row[3]}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
      </div> : serverData && serverData[0]==="You don't have permissions for that!" && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
    </>
  )
}

export default Report