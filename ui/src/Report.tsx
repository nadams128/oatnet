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
import { useNavigate } from 'react-router-dom';
import { Inventory, getInventory } from './Inventory'
import { ContainerSet, getContainerSets } from './ContainerSets'
import Modal from './components/Modal';
import Button from './components/Button';

type FilterMap = {
	predefined: Map<string, boolean>,
	containerSet: Map<string, boolean>
}

// component to view the status of the inventory, with a set of filters and an option to go to the inventory editor
function Report() {
	const [report, setReport] = useState<Inventory>()
	const [inventory, setInventory] = useState<Inventory>()
	const [showModal, setShowModal] = useState<boolean>(false)
	const [filters, setFilters] = useState<FilterMap>({
		predefined: new Map([
			["all", true],
			["weekly", false],
			["needed", false]
		]),
		containerSet: new Map<string, boolean>()
	})
	const navigate = useNavigate()

	function toggleFilter(filter: string, filters: FilterMap): FilterMap {
		let localFilters: FilterMap = {...filters}
		// try getting the value from predefined filters
		let existingValue = localFilters.predefined.get(filter)
		if (existingValue !== undefined) {
			localFilters.predefined.set(filter, !existingValue)
			if (filter === "all" && !existingValue) {
				Array.from(localFilters.predefined.keys()).forEach((filterName: string) => {
					if (filterName !== "all")
						localFilters.predefined.set(filterName, false)
				})
				Array.from(localFilters.containerSet.keys()).forEach((filterName: string) => {
					if (filterName !== "all")
						localFilters.containerSet.set(filterName, false)
				})
			}
			else {
				localFilters.predefined.set("all", false)
			}
		}
		// if it can't be found, check in container set filters
		else {
			existingValue = localFilters.containerSet.get(filter)
			if (existingValue !== undefined) {
				localFilters.containerSet.set(filter, !existingValue)
				localFilters.predefined.set("all", false)
			}
		}
		// if a value was found, wrap up
		if (existingValue !== undefined) {
			sessionStorage.setItem("filters", JSON.stringify({
				predefined: Object.fromEntries(localFilters.predefined),
				containerSet: Object.fromEntries(localFilters.containerSet)
			}))
			setFilters(localFilters)
			return localFilters
		}
		// if not, throw an error
		else {
			throw new Error("Filter cannot be toggled because a filter with the specified name doesn't exist")
		}
	}

	function updateReport(inventory: Inventory | undefined, filters: FilterMap) {
		let filteredInventory: Inventory = []
		if (inventory)
			filteredInventory = [...inventory]
		if (filters.predefined.get("all")) {
			setReport(inventory)
			return
		}
		let filterName: string
		let activated: boolean
		for ([filterName, activated] of filters.predefined) {
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
		if (filters.containerSet) {
			let activeFilters: {[name: string]: boolean} = {}
			for ([filterName, activated] of filters.containerSet) {
				if (activated)
					activeFilters[filterName] = activated
			}
			if (Object.keys(activeFilters).length > 0)
				filteredInventory = filteredInventory.filter((item) => {
					return activeFilters[item.assignedSet]
				})
		}
		setReport(filteredInventory)
	}

	useEffect(() => {
		getContainerSets().then((containerSets: ContainerSet[]) => {
			let localFilters: FilterMap = {...filters}
			let storedFiltersString = sessionStorage.getItem("filters")
			if (storedFiltersString) {
				let filtersObject = JSON.parse(storedFiltersString)
				localFilters.predefined = new Map(Object.entries(filtersObject.predefined))
				localFilters.containerSet = new Map(Object.entries(filtersObject.containerSet))
				let existingFilterValue: boolean
				for (let set of containerSets) {
					existingFilterValue = !!(localFilters.containerSet.get(set.name))
					if (existingFilterValue !== undefined)
						localFilters.containerSet.set(set.name, existingFilterValue)
					else
						localFilters.containerSet.set(set.name, false)
				}
				getInventory().then((inventory) => {
					setInventory(inventory)
					setFilters(localFilters)
					updateReport(inventory, localFilters)
				})
			}
			else {
				let localFilters = {...filters}
				for (let set of containerSets) {
					localFilters.containerSet.set(set.name, false)
				}
				getInventory().then((inventory) => {
					setInventory(inventory)
					setFilters(localFilters)
					setReport(inventory)
				})
			}
		})
	}, [])

	return(<>
		{/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
		{report ? <div className="flex flex-col items-center">
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
					{Array.from(filters.predefined.entries()).map(([filterName, activated]: [string, boolean]) => {
						return(
							<Button className={"m-1"} pressed={
								(activated && filterName !== "all" && !filters.predefined.get("all")) ||
								(activated && filterName === "all")
							} key={filterName} onClick={() => {
								updateReport(inventory, toggleFilter(filterName, filters))
							}}>
								{filterName.split(" ").map((word) => {return word[0].toUpperCase() + word.substring(1)}).join(" ")}
							</Button>
						)
					})}
				</div>
				<div className="bg-oatnet-foreground h-1 w-full rounded-lg my-2"/>
				<div className="flex flex-wrap justify-center">
					{filters.containerSet && Array.from(filters.containerSet.entries()).map(([filterName, activated]: [string, boolean]) => {
						return(
							<Button className="m-1" pressed={!filters.predefined.get("all") && activated} key={filterName} onClick={() => {
								updateReport(inventory, toggleFilter(filterName, filters))
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
		</div> : report && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
	</>)
}

export default Report
