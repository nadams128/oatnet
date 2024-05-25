"use client";
import { useEffect, useState } from 'react';

// Get details of an item from the backend, if no item is specified, return all items
export async function getInventory(item){
    let serverResponse
    if (item === "")
        serverResponse = await fetch("http://127.0.0.1:5000/inventory")
    else
        serverResponse = await fetch("http://127.0.0.1:5000/inventory/" + item)
    let response = serverResponse.json()
    return response
  }

// Send the current new/updated item to the backend for storage
export async function postInventory(itemData){
  const serverResponse = await fetch("http://127.0.0.1:5000/inventory", {
      method: "POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify(itemData),
  })
}

// Component to manage the inventory
export function Inventory() {
  const [serverData, setServerData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [needAmount, setNeedAmount] = useState("")
  const [haveAmount, setHaveAmount] = useState("")
  const [checkWeekly, setCheckWeekly] = useState("")
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)

  useEffect(() => {
    if(serverData[0]){
      if(serverData[0][1].toLowerCase() !== searchQuery.toLowerCase()){
        setHaveAmount("")
        setNeedAmount("")
        setCheckWeekly(false)
      }
    }
    else {
      setHaveAmount("")
      setNeedAmount("")
      setCheckWeekly(false)
    }
  },[serverData])

  return(
    <div className="flex flex-col">
      <div className=''>
        {/* Search box for items */}
        <input id="searchBox" className="mx-2 w-64 pl-1 bg-oatnet-light rounded-lg" placeholder='Search' list="searchResults" autoComplete="off" onChange={ e => {
          setSearchQuery(e.target.value)
          let matchFound = false
          if(e.target.value != ""){
            getInventory((e.target.value).replaceAll(" ", "-").toLowerCase()).then((response) => {
              setServerData(response)
              response.map((row) => {
                if(row[1].toLowerCase()==e.target.value.toLowerCase()){
                  matchFound = true
                  setHaveAmount(row[2])
                  setNeedAmount(row[3])
                  setCheckWeekly(row[4] === 'true')
                }
              })
            })
          }
        }}/>
        {/* Datalist is populated with search results based on the text in the input */}
        <datalist id="searchResults">
          {serverData.map((row) => {
            return <option key={row[1]}>{row[1]}</option>
          })}
        </datalist>
      </div>

      {/* Text input for the have property */}
      <div className="mt-5 mx-2">
        <div className="w-12 float-left">Have: </div>
        <input id="haveBox" className="w-48 pl-1 bg-oatnet-light rounded-lg" placeholder='Have' value={haveAmount} autoComplete="off" onChange={e => {
          setHaveAmount(e.target.value)
        }}/>
      </div>

      {/* Text input for the need property */}
      <div className="mt-4 ml-2">
        <div className="w-12 float-left">Need: </div>
        <input id="needBox" className="w-48 pl-1 bg-oatnet-light rounded-lg" placeholder='Need' value={needAmount} autoComplete="off" onChange={ e =>{
          setNeedAmount(e.target.value)
        }}/>
      </div>

      {/* Collapsible panel for settings */}
      <div className={settingsPanelOpen ? "w-64 mt-3 pb-1 border-solid border-4 border-white rounded-lg" : "w-64 mt-4 ml-1"}>
        <button className="w-9 ml-2 mt-1 mr-2 px-3 py-1 rounded-lg bg-oatnet-light inline-block" onClick={() => {
          setSettingsPanelOpen(!settingsPanelOpen)
        }}>
          {settingsPanelOpen ? "-": "+"}
        </button> 
        
        <div className="inline-block">
          <div className='mr-1 inline-block'>Settings:</div>
          {!settingsPanelOpen && <div className="w-32 h-1 mb-1 bg-white rounded-lg inline-block"></div>}
        </div>

        {settingsPanelOpen &&
          <div className="w-60 rounded-lg">
          {/* Checkbox to mark an item as one to check the status of weekly */}
          <div className="mt-2 ml-2 mb-1 pl-4">
            Check Weekly?:
            <input className="ml-2 bg-oatnet-light rounded-lg" type='checkbox' checked={checkWeekly} onChange={e => {
              setCheckWeekly(e.target.checked)
            }}/>
          </div>
          {/* Button to submit data to the backend */}
          <button className="w-32 h-8 ml-6 mb-1 bg-red-600 rounded-lg" onClick={() => {
              // Code for delete function will be here
            }}>Delete
          </button>
        </div>
        }
      </div>
      

      {/* Button to submit data to the backend */}
      <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
        postInventory([searchQuery, haveAmount, needAmount, checkWeekly.toString()])
      }}>Submit</button>
    </div>
  )
}