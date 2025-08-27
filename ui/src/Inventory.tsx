/*
Oatnet - A utility application for mutual aid organizations
Copyright (C) 2025 Oatnet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { serverDomain } from './App';
import { ContainerSet, getContainerSets } from './ContainerSets';

export type InventoryItem = {
	name: string,
	have: number,
	need: number,
	unit: string,
	checkWeekly: boolean,
	amountNeededWeekly: number,
	assignedSet: string
}

export type Inventory = InventoryItem[]

/**
 * Gets details of an inventory item from the backend
 * @param {string} item - the name of the item to be retrieved, if the string is empty, every item is returned
 */
export async function getInventory(item: string = ""){
	let serverResponse
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
		if (item === "" || item === undefined)
			serverResponse = await fetch(serverDomain+"/inv", {
				method: "GET",
				headers: {
					"sessionID": sessionID
				}
			})
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

/**
 * Send a new or updated item to the server for storage
 * @param {any} itemData - an object containing the data for the item being sent
 */
async function postInventory(itemData: any){
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
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

/**
 * Delete a new/existing item from the server
 * @param {string} item - the name of the item to be deleted
 */
async function deleteInventory(item: string){
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
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
	const [needAmount, setNeedAmount] = useState<number | undefined>()
	const [haveAmount, setHaveAmount] = useState<number | undefined>()
	const [unit, setUnit] = useState<string | undefined>()
	const [checkWeekly, setCheckWeekly] = useState<boolean>(false)
	const [amountNeededWeekly, setAmountNeededWeekly] = useState<number | undefined>()
	const [containerSets, setContainerSets] = useState<ContainerSet[]>()
	const [selectedContainerSet, setSelectedContainerSet] = useState<ContainerSet | undefined>()
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
	let statelessContainerSets: ContainerSet[]

	/** 
	 * Get an item's data from the server, and update the UI with the resulting data 
	 * If the user's input doesn't match an existing inventory item, show search results
	 * @param {string} item - the text typed by the user which will be used to search the inventory via getInventory
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
						if (statelessContainerSets)
							setSelectedContainerSet(statelessContainerSets.find((set) => {
								return set.name === response[0].assignedSet
							}))
					}
					// otherwise, show search suggestions
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
			setHaveAmount(undefined)
			setNeedAmount(undefined)
			setUnit(undefined)
			setCheckWeekly(false)
			setAmountNeededWeekly(undefined)
			setSelectedContainerSet(undefined)
		}
	}

	function createSplitDirections(set: ContainerSet, total: number): string[] {
		let splits = []
		let remainder = total
		let amounts = []
		set.containers.sort((a, b) => {
			if (!a.percentage)
				return 1
			if (!b.percentage)
				return -1
			else if (a.percentage > b.percentage)
				return -1
			else if (a.percentage < b.percentage)
				return 1
			else
				return 0
		})
		for (let container of set.containers) {
			if (container.percentage !== undefined) {
				let splitAmount = Math.floor(total * (container.percentage * 0.01))
				amounts.push(splitAmount)
				remainder -= splitAmount
			}
		}
		for (let i = set.containers.length-1; remainder > 0; i--, remainder--) {
			amounts[i] = amounts[i] + 1
		}
		for (let i = 0; i < set.containers.length; i++) {
			splits.push(`${amounts[i]}${unit ? ` ${unit}` : ""} in the ${set.containers[i].name}`)
		}
		return splits
	}

	// get container sets and inventory items on page load
	useEffect(() => {
		getContainerSets().then((sets) => {
			statelessContainerSets = sets
			setContainerSets(sets)
			getInventory().then((response) => {
				setServerData(response)
				const item = searchParams.get('item')
				if(item){
					updateInputs(item)
					setEditing(true)
				}
				else{
					updateInputs("")
					setEditing(false)
				}
			})
		})
	},[])

	// if the page URL changes while still on the page, like when switching from /add to /search, clear the inputs
	useEffect(()=> {
		updateInputs("")
		setHaveAmount(undefined)
		setNeedAmount(undefined)
		setUnit(undefined)
		setCheckWeekly(false)
		setAmountNeededWeekly(undefined)
		setSelectedContainerSet(undefined)
		setEditing(false)
	}, [location])

	return(<>
		{/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
		{serverData && serverData[0]!=="You don't have permissions for that!" ? <div>
			{/* if the have and needed amounts are loaded in, render */}
			<div className="flex flex-col items-center mt-2 select-none">
				<div className="mb-2">
					{/* search box for items */}
					<input
						id="searchInput"
						readOnly={editing ? true : false}
						className={"w-72 pl-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.searchInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}
						placeholder={addingNewItem ? 'Oats, Soap, Socks, etc.' : 'Search'}
						value={searchQuery ? searchQuery:""}
						list="searchResults"
						autoComplete="off"
						onChange={ e => {
							setInputValidityMap({...inputValidityMap, "searchInput":true})
							updateInputs(e.target.value)
						}}
					/>
					{/* the datalist is populated with search results based on the text in the input */}
					{searchSuggestionsEnabled && <datalist id="searchResults">
						{serverData && serverData.map((row) => {
							return <option key={row.name}>{row.name}</option>
						})}
					</datalist>}
				</div>
				{!!(selectedContainerSet && amountNeededWeekly) && <div className="px-1 mt-2 mb-2 border-solid border-4 border-oatnet-foreground rounded-lg text-center">
					<div>{"To restock this, make sure there are:"}</div>
					{createSplitDirections(selectedContainerSet, amountNeededWeekly).map((split: string) => {
						return <div key={split}>{split}</div>
					})}
				</div>}
				{!!(checkWeekly && amountNeededWeekly && !selectedContainerSet) && <div className="px-1 mt-2 mb-2 border-solid border-4 border-oatnet-foreground rounded-lg">
					{"We need "+amountNeededWeekly+" "+unit+" of this item per serve :D"}
				</div>}
				{/* text input for the have property */}
				<div className="mt-2 mb-2 max-w-68 flex">
					<div className="">Have:</div>
					<input
						id="haveInput"
						className={"w-16 h-6 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.haveInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}
						type="number"
						placeholder="16"
						value={haveAmount!==undefined ? haveAmount:""}
						autoComplete="off"
						onChange={e => {
							setInputValidityMap({...inputValidityMap, "haveInput":true})
							setHaveAmount(isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value))
						}}
					/>
					<div className="w-auto ml-1">{unit}</div>
				</div>
				{/* text input for the need property */}
				<div className="mt-2 mb-2 max-w-68 flex">
					<div className="">Need:</div>
					<input
						id="needInput"
						className={"w-16 h-6 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.needInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}
						type="number"
						placeholder="16"
						value={needAmount!==undefined ? needAmount:""}
						autoComplete="off"
						onChange={ e => {
							setInputValidityMap({...inputValidityMap, "needInput":true})
							setNeedAmount(isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value))
						}}
					/>
					<div className="w-auto ml-1">{unit}</div>
				</div>
				{/* this section is only shown when adding items, replacing the settings panel so all options are shown*/}
				{addingNewItem && <>
					{/* input to set the units of an item */}
					<div className="mt-2 mb-2">
						<div className="float-left">Unit (Plural):</div>
						<input
							id="unitInput"
							className={"w-36 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.unitInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}
							placeholder="pairs, oz, etc."
							value={unit!==undefined ? unit:""}
							autoComplete="off"
							onChange={e => {
								setInputValidityMap({...inputValidityMap, "unitInput":true})
								setUnit(e.target.value)
							}}
						/>
					</div>
					{/* dropdown to select the container set that the item belongs to */}
					<div className="flex mt-2 mb-2">
						<div className="shrink-0 mr-1">Container Set:</div>
						<select
							className="px-1 bg-oatnet-foreground rounded rounded-lg"
							value={selectedContainerSet && selectedContainerSet.name ? selectedContainerSet.name : ""}
							onInput={(e) => {
								if (containerSets)
									setSelectedContainerSet(containerSets.find((set) => {
										return set.name === e.currentTarget.value
									}))
							}}
						>
							<option value="">Not Applicable</option>
							{containerSets && containerSets.map((set:ContainerSet) => {
								return(<option value={set.name} key={set.name}>{set.name}</option>)
							})}
						</select>
					</div>
					{/* checkbox to mark an item as one to check the status of weekly */}
					<div className="flex items-center mt-1 mx-1 mb-2">
						<div className="">
							Check Weekly?:
						</div>
						<div
							id="checkWeeklyInput"
							className="w-5 h-5 ml-2 bg-oatnet-foreground rounded-md flex items-center justify-center"
							onClick={() => {
								setCheckWeekly(!checkWeekly)
							}}
						>
							{checkWeekly ? <img className="oatnet-text" src="/assets/check.svg" alt="Checkmark"/> : ""}
						</div>
					</div>
					{/* input to set how many of an item we need to restock weekly */}
					{checkWeekly && <div className="mt-1 mb-2">
						<div className="float-left">Needed Weekly:</div>
						<input 
							id="amountNeededWeeklyInput"
							className="w-16 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"
							type="number"
							placeholder="16"
							value={amountNeededWeekly!==undefined ? amountNeededWeekly:""}
							autoComplete="off"
							onChange={e => {
								setAmountNeededWeekly(isNaN(parseFloat(e.currentTarget.value)) ? undefined : parseFloat(e.currentTarget.value))
							}}
						/>
					</div>}
				</>}
				{/* notify the user that they need to complete all required fields*/}
				{formInvalid && <div className="p-1 mt-2 mb-2 rounded-md border-4 border-oatnet-invalid">Please fill in the required fields!</div>}
				{/* button to submit data to the backend */}
				<button id="submitButton" className="mt-4 ml-2 w-40 h-8 bg-oatnet-foreground rounded-lg" onClick={() => {
					// if required inputs are filled, submit item
					if(searchQuery !== undefined && haveAmount !== undefined && needAmount !== undefined && unit != undefined){
						if(searchParams.get("item"))
							setServerData(undefined)
						postInventory({
							name: searchQuery,
							have: haveAmount,
							need: needAmount,
							unit: unit,
							checkWeekly: checkWeekly,
							amountNeededWeekly: amountNeededWeekly !== undefined ? amountNeededWeekly : 0,
							assignedSet: selectedContainerSet && selectedContainerSet.name ? selectedContainerSet.name : null
						}).then(()=>{
							// if there's a filter on this URL, the user should be sent back to the reports page
							if(searchParams.get("item"))
								navigate("/report")
							updateInputs("")
							setHaveAmount(undefined)
							setNeedAmount(undefined)
							setUnit(undefined)
							setCheckWeekly(false)
							setAmountNeededWeekly(undefined)
							setSelectedContainerSet(undefined)
							setEditing(false)
						})
					}
					// if a required input is invalid, update the validity map entry for that input so it's updated accordingly
					else {
						let inputValidityMapLocal = {...inputValidityMap}
						if (searchQuery === undefined)
							inputValidityMapLocal = {...inputValidityMapLocal, "searchInput":false}
						if (haveAmount === undefined)
							inputValidityMapLocal = {...inputValidityMapLocal, "haveInput":false}
						if (needAmount === undefined)
							inputValidityMapLocal = {...inputValidityMapLocal, "needInput":false}
						if (unit === undefined){
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
							<input
								id="unitInput"
								className={"w-36 pl-1 ml-1 bg-oatnet-foreground rounded-lg select-none"+(!inputValidityMap.unitInput && " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark")}
								placeholder="pairs, oz, etc."
								value={unit!==undefined ? unit:""}
								autoComplete="off"
								onChange={e => {
									setInputValidityMap({...inputValidityMap, "unitInput":true})
									setUnit(e.currentTarget.value)
								}}
							/>
						</div>
						{/* input to set how many of an item we need to restock weekly */}
						<div className="mt-2 mx-1 mb-2">
							<div className="float-left">Needed Weekly:</div>
							<input
								id="amountNeededWeeklyInput"
								className="w-32 ml-2 px-1 bg-oatnet-foreground rounded-lg"
								type="number"
								placeholder="16"
								value={amountNeededWeekly!==undefined ? amountNeededWeekly:""}
								autoComplete="off" 
								onChange={e => {
									setAmountNeededWeekly(isNaN(parseFloat(e.currentTarget.value)) ? undefined : parseFloat(e.currentTarget.value))
								}}
							/>
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
						{/* dropdown to select the container set that the item belongs to */}
						<div className="flex mt-2 mb-2">
							<div className="shrink-0 mr-1">Container Set:</div>
							<select
								className="px-1 bg-oatnet-foreground rounded rounded-lg"
								defaultValue={selectedContainerSet && selectedContainerSet.name ? selectedContainerSet.name : ""}
								onInput={(e) => {
									if (containerSets)
										setSelectedContainerSet(containerSets.find((set: ContainerSet) => {
											return set.name === e.currentTarget.value
										}))
								}}
							>
								<option value="">Not Applicable</option>
								{containerSets && containerSets.map((set: ContainerSet) => {
									return(<option value={set.name} key={set.name}>{set.name}</option>)
								})}
							</select>
						</div>
						{/* button to delete data from the server */}
						<button className="w-28 h-8 ml-1 mb-2 bg-red-600 rounded-lg" onClick={() => {
							if(searchQuery && searchQuery != ""){
								if(searchParams.get("item"))
									setServerData(undefined)
								deleteInventory((searchQuery)).then(() => {
									if(searchParams.get("item"))
										navigate("/report")
								})
							}
							updateInputs("")
							setHaveAmount(undefined)
							setNeedAmount(undefined)
							setUnit(undefined)
							setCheckWeekly(false)
						}}>
							Delete
						</button>
					</div>}
				</div>}
			</div>
		{/* if the user doesn't have permissions, let them know */}
		</div> : (serverData && serverData[0]==="You don't have permissions for that!") && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
	</>)
}

export default Inventory
