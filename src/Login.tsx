"use client";
import { useState } from 'react';

let serverDomain = "http://127.0.0.1:5000"

export async function loginUser(username:string, password:string) {
    let serverResponse = await fetch(serverDomain+"/auth", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                action:"login"
            },
            body: JSON.stringify([username, password]),
    })
    return serverResponse.json()
}

export async function logoutUser() {
    let sessionID = localStorage.getItem("sessionID")
    await fetch(serverDomain+"/auth", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                action:"logout"
            },
            body: JSON.stringify(sessionID),
    })
    localStorage.removeItem("sessionID")
}

function Login() {
    const [username, setUsername] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [loggedIn, setLoggedIn] = (localStorage.getItem("sessionID") ? useState<boolean>(true) : useState<boolean>(false))
    const [incorrectPassword , setIncorrectPassword] = useState<boolean>(false)
    return(
        <div className="flex flex-col items-center mt-2 select-none">
            {/* Text input for the username property */}
            <div className="mt-6">
                <div className="w-20 float-left">Username: </div>
                <input id="usernameBox" className="w-48 pl-1 bg-oatnet-light rounded-lg" placeholder='oat200' value={username ? username:""} onChange={e => {
                    setUsername(e.target.value)
                }}/>
            </div>

            {/* Text input for the password property */}
            <div className="mt-4">
                <div className="w-20 float-left">Password: </div>
                <input id="passwordBox" type="password" className="w-48 pl-1 bg-oatnet-light rounded-lg" placeholder='123password321' value={password ? password:""} onChange={ e =>{
                    setPassword(e.target.value)
                }}/>
            </div>

            {/* Button to either log the user in or log the user out*/}
            <button className="mt-6 ml-2 w-40 h-8 bg-oatnet-light rounded-lg" onClick={() => {
                if (!localStorage.getItem("sessionID") && username && password){
                    loginUser(username, password).then((response)=>{
                        if (response !== "Incorrect Password!") {
                            localStorage.setItem("username",username)
                            localStorage.setItem("sessionID",response)
                            setLoggedIn(true)
                            setIncorrectPassword(false)
                        }
                        else if (response === "Incorrect Password!"){
                            setIncorrectPassword(true)
                        }
                    })
                    
                }
                else if(localStorage.getItem("sessionID")){
                    logoutUser()
                    setLoggedIn(false)
                }
            }}>{loggedIn ? "Logout": "Login"}</button>
            {incorrectPassword && <div>Wrong Password!</div>}
        </div>
    )
}

export default Login