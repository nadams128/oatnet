"use client";
import { useState } from 'react';

function Inventory({setSelected}){
  const [serverData, setServerData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [needAmount, setNeedAmount] = useState("")
  const [haveAmount, setHaveAmount] = useState("")
  return(
    <div className="flex flex-col">
      <div className=''>
        <input id="searchBox" className="mx-2 w-64 bg-oatnet-light rounded-lg" placeholder='Search' list="searchResults" onKeyUp={ e => {
          //client submits a GET request with e.target.value.toString() and receive the list of items that match the search
          //after GET, display results using a searchbox with a scrollable dropdown
          //when a dropdown item is pressed, find that value and refresh the quantity controls with that value
          //the user's current typed text will always be the first option, if they select it with no matching result, a new item is queued for creation
          //changes that the user is making to the items they're searching will accumulate and be POSTed/UPDATEd on Submit button press
          setSearchQuery(e.target.value)
          let matchFound = false
          if(e.target.value != ""){
            console.log("im not even trying to work LOLLLL")
            getInventory((e.target.value).replaceAll(" ", "-").toLowerCase()).then((response) => {
              console.log(response)
              setServerData(response)
              response.map((row) => {
                if(row[1].toLowerCase()==e.target.value.toLowerCase()){
                  console.log("Attempting field set to typed value")
                  matchFound = true
                  setHaveAmount(row[2])
                  setNeedAmount(row[3])
                }
              })
            })
            if(serverData.length < 1 || !matchFound){
              setHaveAmount("")
              setNeedAmount("")
            }
          }
        }}/>
        {/* Datalist will be populated with search results based on the text in the input */}
        <datalist id="searchResults">
          {serverData.map((row) => {
            return <option key={row[1]}>{row[1]}</option>
          })}
        </datalist>
      </div>
      <div className="mt-5 mx-2">
        <input id="haveBox" className="w-40 pl-1 bg-oatnet-light rounded-lg" placeholder='Have' value={haveAmount} onChange={e => {
          setHaveAmount(e.target.value)
        }}/>
        <button className="ml-2 px-4 py-2 bg-oatnet-light rounded-lg" onClick={()=>{
          if(haveAmount != ""){
            setHaveAmount((parseInt(haveAmount)+1).toString())
          }
        }}>+</button>
        <button className="ml-2 px-4 py-2 bg-oatnet-light rounded-lg" onClick={()=>{
          if(haveAmount != ""){
            setHaveAmount((parseInt(haveAmount)-1).toString())
          }
        }}>-</button>
        {/* additonal item quantity input box, plus, and minus controls*/}
      </div>
      <div className="mt-2 ml-2">
        <input id="haveBox" className="w-40 pl-1 bg-oatnet-light rounded-lg" placeholder='Need' value={needAmount} onChange={ e =>{
          setNeedAmount(e.target.value)
        }}/>
        <button className="ml-2 px-4 py-2 bg-oatnet-light rounded-lg" onClick={()=>{
          if(needAmount != ""){
            setNeedAmount((parseInt(needAmount)+1).toString())
          }
        }}>+</button>
        <button className="ml-2 px-4 py-2 bg-oatnet-light rounded-lg" onClick={()=>{
          if(needAmount != ""){
            setNeedAmount((parseInt(needAmount)-1).toString())
          }
        }}>-</button>
        {/* additonal item quantity input box, plus, and minus controls*/}
      </div>
      <button className="mt-5 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
        console.log([searchQuery, haveAmount, needAmount])
        postInventory([searchQuery, haveAmount, needAmount])
      }}>Submit</button>
    </div>
  )
}

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
            setSelected(<Inventory setSelected = {() => setSelected()}/>)
          }}>
            {"<< Inventory >>"}
          </div>
          <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setSelected(null)
          }}>
            {"<< Zines >>"}
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

async function getInventory(item){
  console.log("http://127.0.0.1:5000/inventory/" + item)
  const serverResponse = await fetch("http://127.0.0.1:5000/inventory/" + item)
  let response = serverResponse.json()
  return response
}

async function postInventory(itemData){
  const serverResponse = await fetch("http://127.0.0.1:5000/inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(itemData),
  })
  let response = serverResponse.json()
  console.log(response)
}
