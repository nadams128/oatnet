"use client";
import { useState, useEffect } from "react";

let serverDomain = "http://127.0.0.1:5000"

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

function Admin() {
    const [usersData, setUsersData] = useState<any>()

    useEffect(() => {
        let responseData:any = {}
        getUsers().then((response)=>{
            if(response !== "You aren't an administrator"){
                response.map((user:any[])=>{
                    let read
                    let write
                    if(user[1] === 0)
                        read = false
                    else
                        read = true
                    if(user[2] === 0)
                        write = false
                    else
                        write = true
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
                    {/* for users in userdata, generate row and cells for each*/}
                    {Object.entries(usersData).map((user:any[])=>{
                        const name = user[0]
                        if(name && user[1]){
                            const read = user[1].read
                            const write = user[1].write
                            return(
                                <tr className="" key = {name}>
                                    <td className="border-b border-r border-white border-solid">{name}</td>
                                    <td className="w-16 border-b border-r border-white border-solid">
                                        <div className="flex flex-row justify-center">
                                            <div className="w-6 h-6 my-0.5 bg-oatnet-light rounded-md flex items-center justify-center" onClick={() => {
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
                                                deleteUser(name)
                                                setUsersData({...usersData,[name]:null})
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