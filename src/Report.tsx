"use client";
import { useEffect, useState } from 'react';
import {getInventory} from "./Inventory";
import {useSearchParams, useNavigate} from 'react-router-dom';

// component to view the status of the inventory, with a set of filters and an option to go to the inventory editor
function Report() {
  const [serverData, setServerData] = useState<any[]>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // if the URL query parameters change, update the filters accordingly
  // this does run when the component loads, because the useEffect() detects the searchParams changing when they initialize
  useEffect(() => {
    const filter = searchParams.get('filter')
    if(filter) {
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
    }
    else {
      getInventory("all").then((response) => {
        setServerData(response)
      })
    }
  },[searchParams])

  return(
    <>
      {/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
      {serverData && serverData[0]!=="You don't have permissions for that!" ? <div className="flex flex-col">
        {/* button to refresh the displayed data with new changes from the server */}
        <button className="mt-2 ml-2 w-32 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
          const filter = searchParams.get("filter")
          getInventory(filter ? filter : "all").then((response) => {
            setServerData(response)
          })
        }}>Refresh</button>
        <div>
          {/* button to set the filter to all items */}
          <button className="mt-5 ml-2 w-20 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("all").then((response) => {
              setServerData(response)
              navigate("/report?filter=all")
            })
          }}>All</button>

          {/* button to set the filter to just the weekly items */}
          <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("weekly").then((response) => {
              setServerData(response)
              navigate("/report?filter=weekly")
            })
          }}>Weekly</button>

          {/* button to set the filter to just the needed items */}
          <button className="mt-5 ml-2 w-24 h-8 bg-oatnet-light rounded-lg select-none" onClick={() => {
            getInventory("needed").then((response) => {
              setServerData(response)
              navigate("/report?filter=needed")
            })
          }}>Needed</button>
        </div>
          {/* table to display the report results */}
          <table className="mt-5 mx-2 table-auto select-none">
            <thead>
              <tr>
                <td className="border-b border-r border-white border-dashed">Name:</td>
                <td className="border-b border-r border-white border-dashed pl-1">We Have:</td>
                <td className="border-b border-l border-white border-dashed pl-1">We Need:</td>
              </tr>
            </thead>
            <tbody>
              {/* for each row of data returned, generate the rows and data cells */}
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
      {/* if the user doesn't have permissions, let them know */}
      </div> : serverData && serverData[0]==="You don't have permissions for that!" && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
    </>
  )
}

export default Report