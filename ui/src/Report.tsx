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
import { useSearchParams, useNavigate } from 'react-router-dom';
import { InventoryItem, Inventory, getInventory } from './Inventory'
import { Container, ContainerSet, getContainerSets } from './ContainerSets'
import Modal from './components/Modal';
import Button from './components/Button';

type FilterMap = Map<string, boolean>

// component to view the status of the inventory, with a set of filters and an option to go to the inventory editor
function Report() {
	const [report, setReport] = useState<Inventory>()
	const [inventory, setInventory] = useState<Inventory>()
	const [containerSets, setContainerSets] = useState<ContainerSet[]>()
	const [showModal, setShowModal] = useState<boolean>(false)
	const [predefinedFilters, setPredefinedFilters] = useState<FilterMap>(new Map([
		["all", true],
		["weekly", false],
		["needed", false]
	]))
	const [containerSetFilters, setContainerSetFilters] = useState<FilterMap>()
	const navigate = useNavigate()

	function toggleFilter(filter: string, filters: FilterMap): FilterMap {
		let existingValue = filters.get(filter)
		if (existingValue !== undefined) {
			let localFilters: FilterMap = new Map(filters)
			localFilters.set(filter, !existingValue)
			if (filters === predefinedFilters) {
				if (filter === "all" && !filters.get("all")) {
					localFilters.entries().toArray().forEach(([filterName, activated]) => {
						if (filterName !== "all")
							localFilters.set(filterName, false)
					})
					let localContainerSetFilters = new Map(containerSetFilters)
					localContainerSetFilters.entries().toArray().forEach(([filterName, activated]) => {
						if (filterName !== "all")
							localContainerSetFilters.set(filterName, false)
					})
					setContainerSetFilters(localContainerSetFilters)
					sessionStorage.setItem("containerSetFilters", JSON.stringify(Object.fromEntries(localContainerSetFilters)))
				}
				else {
					localFilters.set("all", false)
				}
				setPredefinedFilters(localFilters)
				sessionStorage.setItem("predefinedFilters", JSON.stringify(Object.fromEntries(localFilters)))
			}
			if (filters === containerSetFilters) {
				let localPredefinedFilters: FilterMap = new Map(predefinedFilters)
				localPredefinedFilters.set("all", false)
				setPredefinedFilters(localPredefinedFilters)
				setContainerSetFilters(localFilters)
				sessionStorage.setItem("predefinedFilters", JSON.stringify(Object.fromEntries(localPredefinedFilters)))
				sessionStorage.setItem("containerSetFilters", JSON.stringify(Object.fromEntries(localFilters)))
			}
			return localFilters
		}
		else
			throw new Error("Filter cannot be toggled because it doesn't exist")
	}

	function updateReport(inventory: Inventory, predefinedFilters: FilterMap, containerSetFilters: FilterMap) {
		let filteredInventory: Inventory = [...inventory]
		if (predefinedFilters.get("all")) {
			setReport(inventory)
			return
		}
		let filterName: string
		let activated: boolean
		for ([filterName, activated] of predefinedFilters) {
			if (activated) {
				switch (filterName) {
					case "weekly":
						filteredInventory = filteredInventory.filter((item) => {
							return item.checkWeekly
						})
						break
					case "needed":
						filteredInventory = filteredInventory.filter((item) => {
							return item.need > 0
						})
				}
			}
		}
		for ([filterName, activated] of containerSetFilters) {
			if (activated) {
				filteredInventory = filteredInventory.filter((item) => {
					return item.assignedSet === filterName
				})
			}
		}
		setReport(filteredInventory)
	}

	useEffect(() => {
		let storedPredefinedFilters = sessionStorage.getItem("predefinedFilters")
		let storedContainerSetFilters = sessionStorage.getItem("containerSetFilters")
		let localContainerSetFilters = new Map()
		getContainerSets().then((containerSets) => {
			setContainerSets(containerSets)
			if (storedPredefinedFilters) {
				storedPredefinedFilters = new Map(Object.entries(JSON.parse(storedPredefinedFilters)))
				let localPredefinedFilters = new Map()
				localPredefinedFilters.set("all", storedPredefinedFilters.get("all"))
				localPredefinedFilters.set("weekly", storedPredefinedFilters.get("weekly"))
				localPredefinedFilters.set("needed", storedPredefinedFilters.get("needed"))
				setPredefinedFilters(localPredefinedFilters)
				setContainerSets(containerSets)
				if (storedContainerSetFilters) {
					storedContainerSetFilters = new Map(Object.entries(JSON.parse(storedContainerSetFilters)))
					let existingFilterValue: boolean
					for (let set of containerSets) {
						existingFilterValue = storedContainerSetFilters.get(set.name)
						if (existingFilterValue !== undefined) {
							localContainerSetFilters.set(set.name, existingFilterValue)
						}
						else {
							localContainerSetFilters.set(set.name, false)
						}
					}
					setContainerSetFilters(localContainerSetFilters)
				}
				else {
					let localContainerSetFilters = new Map()
					for (let set of containerSets) {
						localContainerSetFilters.set(set.name, false)
					}
					setContainerSetFilters(localContainerSetFilters)
				}
				getInventory().then((inventory) => {
					setInventory(inventory)
					updateReport(inventory, localPredefinedFilters, localContainerSetFilters)
				})
			}
			else {
				for (let set of containerSets) {
					localContainerSetFilters.set(set.name, false)
				}
				setContainerSetFilters(localContainerSetFilters)
				getInventory().then((inventory) => {
					setInventory(inventory)
					setReport(inventory)
				})
			}
		})
	}, [])

	return(<>
		{/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
		{report && report[0]!=="You don't have permissions for that!" ? <div className="flex flex-col items-center">
			{/* button to refresh the displayed data with new changes from the server */}
			<div className="flex w-full justify-end max-w-128 mr-16">
				{/* button to open filter selector */}
					<Button className="ml-2" onClick={() => {
						setShowModal(true)
					}}>
						<div className="flex content-center">
							<img className="inline mr-1" src="/assets/filter.svg"/>
							Open Filters
						</div>
					</Button>
				{/* button to refresh whatever data the user is currently viewing*/}
				<Button className="ml-2" onClick={() => {
				}}>
					<div className="flex content-center">
						<img className="inline mr-1" src="/assets/refresh.svg"/>
						Refresh
					</div>
				</Button>
			</div>
			{/* table to display the report results */}
			<div className="mx-4 mt-4">
				<table className="w-full table-auto select-none max-w-128">
					<thead>
						<tr>
							<td className="border-b border-r border-oatnet-text border-dashed bg-oatnet-background-modal rounded-tl-xl p-2 min-w-24">Name:</td>
							<td className="border-b border-r border-oatnet-text border-dashed bg-oatnet-background-modal p-2">We Have:</td>
							<td className="border-b border-oatnet-text border-dashed bg-oatnet-background-modal rounded-tr-xl p-2">We Need:</td>
						</tr>
					</thead>
					<tbody className="bg-oatnet-foreground wrap-break-word">
						{/* for each row of data returned, generate the rows and data cells */}
						{report.map((row:any) => {
							return(
								<tr 
									key={"row-"+row.name}
									onClick={() => {
										navigate("/inventory?item="+row.name)
									}}
								>
									<td key={row.name} className="border-b border-r border-oatnet-text border-solid px-2 py-1">{row.name}</td>
									<td key={row.name+"-have"} className="border-b border-r border-oatnet-text border-solid px-2 py-1">{row.have+" "+row.unit}</td>
									<td key={row.name+"-need"} className="border-b border-oatnet-text border-solid px-2 py-1">{row.need+" "+row.unit}</td>
								</tr>
							)
						})
						}
					</tbody>
				</table>
			</div>
			{showModal && <Modal 
				onClickOut={() => {
					setShowModal(false)
				}}
			>
				<div className="font-youngserif text-xl mb-3">Report Filters</div>
				<div className="flex">
					{predefinedFilters.entries().toArray().map(([filterName, activated]) => {
						return(
							<Button className={"m-1"} pressed={
								(activated && filterName !== "all" && !predefinedFilters.get("all")) ||
								(activated && filterName === "all")
							} key={filterName} onClick={() => {
								updateReport(inventory, toggleFilter(filterName, predefinedFilters), containerSetFilters)
							}}>
								{filterName.split(" ").map((word) => {return word[0].toUpperCase() + word.substring(1)}).join(" ")}
							</Button>
						)
					})}
				</div>
				<div className="bg-oatnet-foreground h-1 w-full rounded-lg my-2"/>
				<div className="flex flex-wrap justify-center">
					{containerSetFilters.entries().toArray().map(([filterName, activated]) => {
						return(
							<Button className="m-1" pressed={!predefinedFilters.get("all") && activated} key={filterName} onClick={() => {
								updateReport(inventory, predefinedFilters, toggleFilter(filterName, containerSetFilters))
							}}>
								{filterName}
							</Button>
						)
					})}
				</div>
				<div className="bg-oatnet-foreground h-1 w-full rounded-lg my-2"/>
				<div className="flex justify-center">
					<Button className="mt-1" onClick={() => {
						setShowModal(false)
					}}>Close</Button>
				</div>
			</Modal>}
		{/* if the user doesn't have permissions, let them know */}
		</div> : report && report[0]==="You don't have permissions for that!" && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
	</>)
}

export default Report
