"use client";
import { useEffect, useState } from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import { serverDomain } from './App';

async function getInventory(filter: string){
	let serverResponse
	let sessionID = localStorage.getItem("sessionID")
	if(sessionID){
		serverResponse = await fetch(serverDomain+"/inv?filter="+filter, {
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

	return(<>
		{/* if the server returned a response and doesn't indicate the user not having permissions, render inputs */}
		{serverData && serverData[0]!=="You don't have permissions for that!" ? <div className="flex flex-col">
			{/* button to refresh the displayed data with new changes from the server */}
			<div className="flex">
				{/* button to set the filter to all items */}
					<button className="ml-2 w-20 h-8 bg-oatnet-foreground rounded-lg select-none" onClick={() => {
						getInventory("all").then((response) => {
							setServerData(response)
							navigate("/report?filter=all")
						})
					}}>
						All
					</button>
				{/* button to set the filter to just the weekly items */}
				<button className="ml-2 w-24 h-8 bg-oatnet-foreground rounded-lg select-none" onClick={() => {
					getInventory("weekly").then((response) => {
						setServerData(response)
						navigate("/report?filter=weekly")
					})
				}}>
					Weekly
				</button>
				{/* button to set the filter to just the needed items */}
				<button className="ml-2 w-24 h-8 bg-oatnet-foreground rounded-lg select-none" onClick={() => {
					getInventory("needed").then((response) => {
						setServerData(response)
						navigate("/report?filter=needed")
					})
				}}>
					Needed
				</button>
				<button className="ml-2 w-8 h-8 bg-oatnet-foreground rounded-lg select-none" onClick={() => {
					const filter = searchParams.get("filter")
					getInventory(filter ? filter : "all").then((response) => {
						setServerData(response)
					})
				}}>
					<img className="inline" src="/assets/refresh.svg"/>
				</button>
			</div>
			{/* table to display the report results */}
			<table className="mt-5 mx-2 table-auto select-none">
				<thead>
					<tr>
						<td className="border-b border-r border-oatnet-text border-dashed">Name:</td>
						<td className="border-b border-r border-oatnet-text border-dashed pl-1">We Have:</td>
						<td className="border-b border-l border-oatnet-text border-dashed pl-1">We Need:</td>
					</tr>
				</thead>
				<tbody>
					{/* for each row of data returned, generate the rows and data cells */}
					{serverData.map((row:any[]) => {
						return(
							<tr 
								key={"row-"+row.name} 
								className="hover:ring hover:ring-oatnet-text hover:ring-offset-4 hover:ring-offset-oatnet-background"
								onClick={() => {
									navigate(searchParams.get("filter") ? "/inventory?item="+row.name+"&filter="+searchParams.get("filter") : "/inventory?item="+row.name+"&filter=all")
								}}
							>
								<td key={row.name} className="border-b border-r border-oatnet-text border-solid">{row.name}</td>
								<td key={row.name+"-have"} className="border-b border-r border-oatnet-text border-solid pl-1">{row.have+" "+row.unit}</td>
								<td key={row.name+"-need"} className="border-b border-oatnet-text border-solid pl-1">{row.need+" "+row.unit}</td>
							</tr>
						)
					})
					}
				</tbody>
			</table>
			{/* if the user doesn't have permissions, let them know */}
		</div> : serverData && serverData[0]==="You don't have permissions for that!" && <div className=" ml-8 mr-8 text-center">You don't have permissions to view this page! Please contact your Oatnet administrator for read and/or write permissions!</div>}
	</>)
}

export default Report
