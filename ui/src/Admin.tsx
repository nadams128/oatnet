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

"use client";
import { useState, useEffect } from "react";
import { serverDomain } from './App';

/**
 * Gets the list of users from the server
 */
async function getUsers() {
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID){
		let userData = await fetch(serverDomain+"/auth", {
			method: "GET",
			headers: {
				"sessionID": sessionID
			}
		})
		return userData.json()
	}
	else{
		return "No Session ID"
	}
}

/**
 * Update the permissions of a given user
 * @param {string} username - the username of the user whose permissions are being changed
 * @param {boolean} read - what you want to set the user's read permission to
 * @param {boolean} write - what you want to set the user's write permission to
 */
async function changeUserPermissions(username:string, read:boolean, write:boolean) {
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID){
		await fetch(serverDomain+"/auth", {
			method: "POST",
			headers: {
				"Content-Type":"application/json",
				"sessionID": sessionID,
				"action": "changepermissions"
			},
			body: JSON.stringify({username:username, read:read, write:write})
		})
	}
}

/**
 * Delete a given user
 * @param {string} username - the username of the user being deleted
 */
export async function deleteUser(username:string) {
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID){
		await fetch(serverDomain+"/auth", {
			method: "DELETE",
			headers: {
				"Content-Type":"application/json",
				"sessionID": sessionID
			},
			body: JSON.stringify(username),
		})
	}
}

// administrator panel, only available to the auto-generated 'administrator' user
function Admin() {
	const [usersData, setUsersData] = useState<any>({})

	// attempt to get the user list, runs once on component load
	useEffect(() => {
		let responseData:any = {}
		getUsers().then((response)=>{
			// if the server validates the user as the administrator, setup the usersData
			if(response !== "You aren't an administrator"){
				response.map((user:any)=>{
					responseData[user.username] = {read:user.read, write:user.write}
				})
				setUsersData(responseData)
			}
		})
	},[])

	return(
		usersData && <div className="flex flex-col">
			{/* table showing users and their permissions */}
			<table className="mt-5 mx-2">
				<thead>
					<tr>
						<td className="border-b border-r border-oatnet-text border-dashed">Username</td>
						<td className="border-b border-r border-oatnet-text border-dashed text-center">Read?</td>
						<td className="border-b border-l border-oatnet-text border-dashed text-center">Write?</td>
						<td className="border-b border-l border-oatnet-text border-dashed text-center">Delete User</td>
					</tr>
				</thead>
				<tbody>
					{/* convert usersData into an array for iteration, then for each user in usersData, generate the row and the cells */}
					{Object.entries(usersData).map((user:any)=>{
						// set name to the first index, which contains the key of the original object
						const name = user[0]
						/*
							if the name exists, and it has a second index(this contains the value of usersData[name], which is an object),
							then set the read and write variables to the values of the object stored in the second index
						*/
						if(name && user[1]){
							const read = user[1].read
							const write = user[1].write
							return(
								<tr className="" key = {name}>
									<td className="border-b border-r border-oatnet-text border-solid">{name}</td>
									<td className="w-16 border-b border-r border-oatnet-text border-solid">
										<div className="flex flex-row justify-center">
											<div className="w-6 h-6 my-0.5 bg-oatnet-foreground rounded-md flex items-center justify-center" onClick={() => {
												/*
													set usersData to a new object, which has all the values of the original, but with
													the specified user's key swapped out for a new object with the updated values
												*/
												setUsersData({...usersData,[name]:{read:!read, write:write}})
												changeUserPermissions(name, !read, write)
											}}>
												{read ? <img className="oatnet-text" src="/assets/check.svg" alt="Checkmark"/> : ""}
											</div>
										</div>
									</td>
									<td className="w-16 border-b border-r border-oatnet-text border-solid">
										<div className="flex flex-row justify-center">
											<div className="w-6 h-6 my-0.5 bg-oatnet-foreground rounded-md flex items-center justify-center" onClick={() => {
												/*
													set usersData to a new object, which has all the values of the original, but with
													the specified user's key swapped out for a new object with the updated values
												*/
												setUsersData({...usersData,[name]:{read:read, write:!write}})
												changeUserPermissions(name, read, !write)
											}}>
												{write ? <img src="/assets/check.svg" alt="Checkmark"/> : ""}
											</div>
										</div>
									</td>
									<td className="w-24 border-b border-oatnet-text border-solid">
										<div className="flex flex-row justify-center">
											<div className="w-6 h-6 my-0.5 bg-oatnet-foreground rounded-md flex items-center justify-center" onClick={() => {
												/*
													set usersData to a new object, which has all the values of the original, but with
													the specified user's key swapped out for a null value
												*/
												setUsersData({...usersData,[name]:null})
												deleteUser(name)
											}}>
												<img src="/assets/trashcan.svg" alt="Trash Can"/>
											</div>
										</div>
									</td>
								</tr>
							)
						}
					})}
				</tbody>
			</table>
		</div>
	)
}

export default Admin
