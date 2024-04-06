"use client";
import { useEffect, useState } from 'react';

function Inventory(){
  const [serverData, setServerData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [needAmount, setNeedAmount] = useState("")
  const [haveAmount, setHaveAmount] = useState("")

  useEffect(() => {
    if(serverData.length < 1){
      setHaveAmount("")
      setNeedAmount("")
    }
    console.log(serverData)
  },[serverData])

  return(
    <div className="flex flex-col">
      <div className=''>
        <input id="searchBox" className="mx-2 w-64 bg-oatnet-light rounded-lg" placeholder='Search' list="searchResults" autoComplete="off" onKeyUp={ e => {
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
      <div className="mt-5 mx-2">
        <input id="haveBox" className="w-40 pl-1 bg-oatnet-light rounded-lg" placeholder='Have' value={haveAmount} autoComplete="off" onChange={e => {
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
        <input id="haveBox" className="w-40 pl-1 bg-oatnet-light rounded-lg" placeholder='Need' value={needAmount} autoComplete="off" onChange={ e =>{
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
            setSelected(<Inventory/>)
          }}>
            {"<< Inventory >>"}
          </div>
          {/* <div className="flex justify-center font-rubik text-lg" onClick={() => {
            setSelected(null)
          }}>
            {"<< Zines >>"}
          </div> */}
          <div className="flex flex-wrap:nowrap justify-center">
            ------------------------------
          </div>
        </div>
      }
      <div className="flex justify-center font-rubik text-3xl">OatNet</div>
      {/* {selected} */}
      <Inventory/>
    </div>
  )
}

async function getInventory(item){
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
