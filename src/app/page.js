"use client";
import { useState } from 'react';

function Inventory({setSelected}){
  return(
    <div className="flex flex-col">
      <div className='mx-10'>
        <input id="searchBox" className="bg-oatnet-light w-full rounded-lg" placeholder='Search' list="searchResults" onChange={ e => {
          //client submits a GET request with e.target.value.toString() and receive the list of items that match the search
          //after GET, display results using a searchbox with a scrollable dropdown
          //when a dropdown item is pressed, find that value and refresj the quantity controls with that value
          //the user's current typed text will always be the first option, if they select it with no matching result, a new item is queued for creation
          //changes that the user is making to the items they're searching will accumulate and be POSTed/UPDATEd on Submit button press
        }}/>
        {/* Datalist will be populated with search results based on the text in the input */}
        <datalist id="searchResults">
          {/* Placeholder Data */}
          <option>Salt</option>
          <option>Seasoned Salt</option>
          <option>Sharpies</option>
          <option>Socks</option>
          <option>Sugar</option>
        </datalist>
      </div>
      <div className="mt-4 mx-10 w-full">
        <input id="quantityBox" className="bg-oatnet-light rounded-lg" placeholder='100g'/>
        <button className="ml-5 px-4 py-2 bg-oatnet-light rounded-lg">+</button>
        <button className="ml-2 px-4 py-2 bg-oatnet-light rounded-lg">-</button>
        {/* additonal item quantity input box, plus, and minus controls*/}
      </div>
      <button className="mt-5 mx-20 bg-oatnet-light rounded-lg" onClick={() => {
        setSelected(null)
        setSearchQuery("");
        //reset variables
        //slide quantity controls off the screen to the right
        //send UPDATE request to backend
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
