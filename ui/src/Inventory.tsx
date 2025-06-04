"use client";
import { useEffect, useState } from 'react';
import {useSearchParams, useNavigate, useLocation} from "react-router-dom";
import { serverDomain } from './App';

// get details of an inventory item from the backend
async function getInventory(item: string){
	let serverResponse
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
		// if there's no item specified in the url, send a request to the server along with the user's sessionID
		if (item === "" || item === "all" || item === undefined)
			serverResponse = await fetch(serverDomain+"/inv", {
				method: "GET",
				headers: {
					"sessionID": sessionID
				}
			})
		// if there is an item specified in the url, send a request to the server along with the user's sessionID
		else
			serverResponse = await fetch(serverDomain+"/inv?item="+item, {
				method: "GET",
				headers: {
					"sessionID": sessionID
				}
			})
		return serverResponse.json()
	}
	else{
		return "No Session ID"
	}
}

// send a new/updated item to the server for storage
async function postInventory(itemData: any){
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
		// send item data to the server along with the sessionID
		await fetch(serverDomain+"/inv", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"sessionID": sessionID
			},
			body: JSON.stringify(itemData),
		})
	}
	else{
		return "No Session ID"
	}
}

// delete a new/existing item from the server
async function deleteInventory(item: string){
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
		// send delete request to the server along with the sessionID
		await fetch(serverDomain+"/inv?item="+item, {
			method: "DELETE",
			headers: {
				"sessionID": sessionID
			}
		})
	}
	else{
		return "No Session ID"
	}
}

function Inventory() {
	const [serverData, setServerData] = useState<any[]>()
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [needAmount, setNeedAmount] = useState<number>()
	const [haveAmount, setHaveAmount] = useState<number>()
	const [unit, setUnit] = useState<string>()
	const [checkWeekly, setCheckWeekly] = useState<boolean>(false)
	const [amountNeededWeekly, setAmountNeededWeekly] = useState<number>()
	const [settingsPanelOpen, setSettingsPanelOpen] = useState<boolean>(false)
	const [searchSuggestionsEnabled, setSearchSuggestionsEnabled] = useState<boolean>(false)
	const [editing, setEditing] = useState<boolean>(false)
	const [inputValidityMap, setInputValidityMap] = useState<any>({
		"searchInput": true,
		"haveInput": true,
		"needInput": true,
		"unitInput": true,
	})
	const formInvalid = !(inputValidityMap.searchInput && inputValidityMap.haveInput && inputValidityMap.needInput && inputValidityMap.unitInput)
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const location = useLocation()
	const addingNewItem = location.pathname=='/add'
	/* 
		get an item's data from the server, and update the UI with the resulting data 

		if the user's input doesn't match an existing inventory item, keep the inputs empty
	*/
	function updateInputs(item: string) {
		setSearchQuery(item)
		if (item){
			getInventory(item).then((response) => {
				// if the server returned a valid response with an item name
				if (response[0] && response[0].name){
					// if that item matches what the user has typed, update the inputs with the item data
					if (response[0].name.toLowerCase() === item.toLowerCase()){
						setSearchSuggestionsEnabled(false)
						setSearchQuery(response[0].name)
						setHaveAmount(response[0].have)
						setNeedAmount(response[0].need)
						setUnit(response[0].unit)
						setCheckWeekly(response[0].checkWeekly)
						setAmountNeededWeekly(response[0].amountNeededWeekly)
					}
					else{
						setSearchSuggestionsEnabled(true)
					}
				}
				setServerData(response)
			})
		}
		// if the search input is empty, don't give suggestions and keep the inputs empty
		else{
			setSearchSuggestionsEnabled(false)
			setHaveAmount("")
			setNeedAmount("")
			setUnit("")
			setCheckWeekly(false)
			setAmountNeededWeekly("")
		}
	}
	// if the URL query parameters change, update the inputs accordingly
	// this does run when the component loads, because the useEffect() detects the searchParams changing when they initialize
	useEffect(() => {
		const item = searchParams.get('item')
		if(item){
			updateInputs(item)
			setEditing(true)
		}
		else{
			updateInputs("")
			setEditing(false)
		}
	}, [searchParams])
	useEffect(()=> {
		updateInputs("")
		setHaveAmount("")
		setNeedAmount("")
		setUnit("")
		setCheckWeekly(false)
		setAmountNeededWeekly("")
		setEditing(false)
	}, [location])

	// run a blank get item request to the server just to check perms, nothing else
	useEffect(() => {
		getInventory(("").replaceAll(" ", "-").toLowerCase()).then((response) => {
			setServerData(response)
		})
	},[])

	return(<>
		{/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
		{serverData && serverData[0]!=="You don't have permissions for that!" ? <div>
			{/* if the have and needed amounts are loaded in, render */}
			{((haveAmount !== undefined && needAmount !== undefined)) && <div className="flex flex-col items-center mt-2 select-none">
				<div>
					{/* search box for items */}
					<input id="searchInput" readOnly={editing ? true : false} className={"w-72 pl-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.searchInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}  placeholder={addingNewItem ? 'Oats, Soap, Socks, etc.' : 'Search'} value={searchQuery ? searchQuery:""} list="searchResults" autoComplete="off" onChange={ e => {
						setInputValidityMap({...inputValidityMap, "searchInput":true})
						updateInputs(e.target.value)
					}}/>
					{/* the datalist is populated with search results based on the text in the input */}
					{searchSuggestionsEnabled && <datalist id="searchResults">
						{serverData && serverData.map((row) => {
							return <option key={row.name}>{row.name}</option>
						})}
					</datalist>}
				</div>

				{/* text input for the have property */}
				<div className="mt-6 mb-2">
					<div className="float-left">Have:</div>
					<input id="haveInput" className={"w-16 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.haveInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")} type="number" placeholder="16" value={haveAmount!==undefined ? haveAmount:""} autoComplete="off" onChange={e => {
						setInputValidityMap({...inputValidityMap, "haveInput":true})
						setHaveAmount(isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))
					}}/>
					<div className="w-12 pl-1 float-right">{unit}</div>
				</div>
				{!!(checkWeekly && amountNeededWeekly) && <div>{"We need "+amountNeededWeekly+" "+unit+" of this item per serve :D"}</div>}
				{/* text input for the need property */}
				<div className="mt-2 mb-2">
					<div className="float-left">Need:</div>
					<input id="needInput" className={"w-16 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.needInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")} type="number" placeholder="16" value={needAmount!==undefined ? needAmount:""} autoComplete="off" onChange={ e => {
						setInputValidityMap({...inputValidityMap, "needInput":true})
						setNeedAmount(isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))
					}}/>
					<div className="w-12 pl-1 float-right">{unit}</div>
				</div>
				{/* input to set the units of an item */}
				{addingNewItem && <><div className="mt-2 mb-2">
					<div className="float-left">Unit (Plural):</div>
					<input id="unitInput" className={"w-36 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.unitInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")} placeholder="pairs, oz, etc." value={unit!==undefined ? unit:""} autoComplete="off" onChange={e => {
						setInputValidityMap({...inputValidityMap, "unitInput":true})
						setUnit(e.target.value)
					}}/>
				</div>
				{/* input to set how many of an item we need to restock weekly */}
				<div className="mt-2 mb-2">
					<div className="float-left">Needed Weekly:</div>
					<input id="amountNeededWeeklyInput" className="w-16 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none" type="number" placeholder="16" value={amountNeededWeekly!==undefined ? amountNeededWeekly:""} autoComplete="off" onChange={e => {
						setAmountNeededWeekly(isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))
					}}/>
				</div>
				{/* checkbox to mark an item as one to check the status of weekly */}
				<div className="flex items-center mt-1 mx-1 mb-4">
					<div className="">
						Check Weekly?:
					</div>
					<div id="checkWeeklyInput" className="w-5 h-5 ml-2 bg-oatnet-foreground rounded-md flex items-center justify-center" onClick={() => {
						setCheckWeekly(!checkWeekly)
					}}>
						{checkWeekly ? <img className="oatnet-text" src="/assets/check.svg" alt="Checkmark"/> : ""}
					</div>
				</div></>}
				{formInvalid && <div className="p-1 mt-2 mb-2 rounded-md border-4 border-oatnet-invalid">Please fill in the required fields!</div>}
				{/* button to submit data to the backend */}
				<button id="submitButton" className="mt-4 ml-2 w-40 h-8 bg-oatnet-foreground rounded-lg" onClick={() => {
					if(searchQuery != "" && haveAmount !== "" && needAmount !== "" && unit != ""){
						postInventory({
							name: searchQuery,
							have: haveAmount,
							need: needAmount,
							unit: unit,
							checkWeekly: checkWeekly,
							amountNeededWeekly: amountNeededWeekly && amountNeededWeekly !== "" ? amountNeededWeekly : 0
						}).then(()=>{
							// if there's a filter on this URL, the user should be sent back to the reports page
							if(searchParams.get("filter"))
								navigate("/report?filter="+searchParams.get('filter'))
							updateInputs("")
							setHaveAmount("")
							setNeedAmount("")
							setUnit("")
							setCheckWeekly(false)
							setAmountNeededWeekly("")
							setEditing(false)
						})
					}
					else {
						let inputValidityMapLocal = {...inputValidityMap}
						if (searchQuery === "")
							inputValidityMapLocal = {...inputValidityMapLocal, "searchInput":false}
						if (haveAmount === "")
							inputValidityMapLocal = {...inputValidityMapLocal, "haveInput":false}
						if (needAmount === "")
							inputValidityMapLocal = {...inputValidityMapLocal, "needInput":false}
						if (unit === ""){
							inputValidityMapLocal = {...inputValidityMapLocal, "unitInput":false}
							setSettingsPanelOpen(true)
						}
						setInputValidityMap(inputValidityMapLocal)
					}
				}}>
					{editing ? "Update" : "Submit"}
				</button>

				{/* collapsible panel for settings */}
				{!addingNewItem && <div className={settingsPanelOpen ? "w-72 mt-3 border-solid border-4 border-oatnet-text rounded-lg" : "w-72 mt-4 ml-2"}>
					<button className="w-9 mt-1 mx-1 py-1 rounded-lg bg-oatnet-foreground inline-block" onClick={() => {
						setSettingsPanelOpen(!settingsPanelOpen)
					}}>
						{settingsPanelOpen ? "-": "+"}
					</button> 
					<div className="inline-block">
						<div className="mr-1 inline-block">{settingsPanelOpen ? "<- Close Settings" : "<- Additional Settings"}</div>
					</div>
					{settingsPanelOpen && <div className="w-68 rounded-lg flex flex-col flex-wrap items-center">
						{/* input to set the units of an item */}
						<div className="mt-2 mb-2">
							<div className="float-left">Unit (Plural):</div>
							<input id="unitInput" className={"w-36 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.unitInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")} placeholder="pairs, oz, etc." value={unit!==undefined ? unit:""} autoComplete="off" onChange={e => {
								setInputValidityMap({...inputValidityMap, "unitInput":true})
								setUnit(e.target.value)
							}}/>
						</div>
						{/* input to set how many of an item we need to restock weekly */}
						<div className="mt-2 mx-1 mb-2">
							<div className="float-left">Needed Weekly:</div>
							<input id="amountNeededWeeklyInput" className="w-32 ml-2 px-1 bg-oatnet-foreground rounded-lg" type="number" placeholder="16" value={amountNeededWeekly!==undefined ? amountNeededWeekly:""} autoComplete="off" onChange={e => {
								setAmountNeededWeekly(isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))
							}}/>
						</div>
						{/* checkbox to mark an item as one to check the status of weekly */}
						<div className="flex items-center mt-1 mx-1 mb-2">
							<div className="">
								Check Weekly?:
							</div>
							<div className="w-5 h-5 ml-2 bg-oatnet-foreground rounded-md flex items-center justify-center" onClick={() => {
								setCheckWeekly(!checkWeekly)
							}}>
								{checkWeekly ? <img className="oatnet-text" src="/assets/check.svg" alt="Checkmark"/> : ""}
							</div>
						</div>
						{/* button to delete data from the server */}
						<button className="w-28 h-8 ml-1 mb-2 bg-red-600 rounded-lg" onClick={() => {
							if(searchQuery && searchQuery != ""){
								deleteInventory((searchQuery)).then(() => {
									// if there's a filter on this URL, the user should be sent back to the reports page
									if(searchParams.get("filter"))
										navigate("/report?filter="+searchParams.get('filter'))
								})
							}
							updateInputs("")
							setHaveAmount(null)
							setNeedAmount(null)
							setUnit("")
							setCheckWeekly(false)
						}}>
							Delete
						</button>
					</div>}
				</div>}
			</div>}
		{/* if the user doesn't have permissions, let them know */}
		</div> : (serverData && serverData[0]==="You don't have permissions for that!") && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
	</>)
}

export default Inventory
