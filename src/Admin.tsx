"use client";
import { useState, useEffect } from "react";
import { serverDomain } from './App';

// get the list of users
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

// update the permissions for a given user
async function changeUserPermissions(user:string, read:boolean, write:boolean) {
    let sessionID = localStorage.getItem("sessionID")
    if (sessionID){
        await fetch(serverDomain+"/auth", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "sessionID": sessionID,
                "action": "change_permissions"
            },
            body: JSON.stringify([user, read, write])
        })
    }
}

// delete a given user
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
    const [usersData, setUsersData] = useState<any>()

    // attempt to get the user list, runs once on component load
    useEffect(() => {
        let responseData:any = {}
        getUsers().then((response)=>{
            // if the server validates the user as the administrator, setup the usersData
            if(response !== "You aren't an administrator"){
                response.map((user:any[])=>{
                    let read = user[1]
                    let write = user[2]
                    responseData[user[0]] = {read:read, write:write}
                })
                setUsersData(responseData)
            }
        })
    },[])

    return(
        usersData && <div className="flex flex-col">
            <table className="mt-5 mx-2">
                <thead>
                    <tr>
                        <td className="border-b border-r border-white border-dashed">Username</td>
                        <td className="border-b border-r border-white border-dashed text-center">Read?</td>
                        <td className="border-b border-l border-white border-dashed text-center">Write?</td>
                        <td className="border-b border-l border-white border-dashed text-center">Delete User</td>
                    </tr>
                </thead>
                <tbody>
                    {/* convert usersData into an array for iteration, then for each user in usersData, generate the row and the cells */}
                    {Object.entries(usersData).map((user:any[])=>{
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
                                    <td className="border-b border-r border-white border-solid">{name}</td>
                                    <td className="w-16 border-b border-r border-white border-solid">
                                        <div className="flex flex-row justify-center">
                                            <div className="w-6 h-6 my-0.5 bg-oatnet-light rounded-md flex items-center justify-center" onClick={() => {
                                                /*
                                                    set usersData to a new object, which has all the values of the original, but with 
                                                    the specified user's key swapped out for a new object with the updated values
                                                */
                                                setUsersData({...usersData,[name]:{read:!read, write:write}})
                                                changeUserPermissions(name, !read, write)
                                            }}>
                                                {read ? <img className="white" src="/assets/check.svg" alt="Checkmark"/> : ""}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="w-16 border-b border-r border-white border-solid">
                                        <div className="flex flex-row justify-center">
                                            <div className="w-6 h-6 my-0.5 bg-oatnet-light rounded-md flex items-center justify-center" onClick={() => {
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
                                    <td className="w-24 border-b border-white border-solid">
                                        <div className="flex flex-row justify-center">
                                            <div className="w-6 h-6 my-0.5 bg-oatnet-light rounded-md flex items-center justify-center" onClick={() => {
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