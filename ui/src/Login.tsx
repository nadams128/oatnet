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
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { serverDomain, LoginContext } from './App';

// ask the server to log a given user in
export async function loginUser(username:string, password:string) {
	let serverResponse = await fetch(serverDomain+"/auth", {
			method: "POST",
			headers: {
				"Content-Type":"application/json",
				action:"login"
			},
			body: JSON.stringify({username:username, password:password}),
	})
	return serverResponse.json()
}

// ask the server to log a given user out
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
	const [passwordConfirmation, setPasswordConfirmation] = useState<string>()
	// set loggedIn and setLoggedIn to the state variable and setter method supplied from App via the LoginContext
	const {loggedIn, setLoggedIn} = useContext<any>(LoginContext)
	const [incorrectPassword, setIncorrectPassword] = useState<boolean>(false)
	const [passwordsMatch, setpasswordsMatch] = useState<boolean>(true)
	const navigate = useNavigate()
	return(
		<div className="flex flex-col items-center mt-2 select-none">
			{/* a message for if the user hasn't logged in before */}
			{!localStorage.getItem("username") && <div className="ml-8 mr-8 text-center">
				If you want to sign into an organization's shared account, please use the shared account credentials below! Otherwise, entering credentials will create an account, then you can ask your Oatnet administrator for permissions. If you already have an account and are seeing this, your credentials will log you in.
			</div>}
			
			{/* text input for the username property */}
			{!loggedIn && <div className="mt-6">
				<div className="w-24 float-left">Username: </div>
				<input id="usernameBox" className="w-48 pl-1 bg-oatnet-foreground rounded-lg" placeholder='oat200' value={username ? username:""} onChange={e => {
					setUsername(e.target.value)
				}}/>
			</div>}

			{/* text input for the password property */}
			{!loggedIn && <div className="mt-4">
				<div className="w-24 float-left">Password: </div>
				<input id="passwordBox" type="password" className="w-48 pl-1 bg-oatnet-foreground rounded-lg" placeholder='123password321' value={password ? password:""} onChange={ e =>{
					setPassword(e.target.value)
				}}/>
			</div>}

			{/* text input for password confirmation on registration*/}
			{!localStorage.getItem("username") && <div className="mt-4">
				<div className="w-20 float-left">Confirm: </div>
				<input id="passwordConfirmBox" type="password" className={passwordsMatch ? "w-48 pl-1 bg-oatnet-foreground rounded-lg" : "w-48 text-black pl-1 bg-red-400 rounded-lg"} placeholder='123password321' value={passwordConfirmation ? passwordConfirmation:""} onChange={ e =>{
					setPasswordConfirmation(e.target.value)
					setpasswordsMatch(true)
				}}/>
			</div>}

			{incorrectPassword && <div className="pt-2">Haha WHOOPS! Wrong password!</div>}

			{!passwordsMatch && <div className="pt-2">Your passwords don't match, please try again!</div>}

			{loggedIn && <div className="pt-2">You're logged in as "{localStorage.getItem("username")}", congrats! :D</div>}

			{/* button to either log the user in or log the user out*/}
			<button className="mt-6 ml-2 w-40 h-8 bg-oatnet-foreground rounded-lg" onClick={() => {
				/*
					if the user has logged in before but isn't logged in now, or if the user hasn't logged in before
					and is therefore registering, and their passwords match, then log the user in/register the user
				*/
				if ((localStorage.getItem("username") && !localStorage.getItem("sessionID") && username && password) || (!localStorage.getItem("username") && !localStorage.getItem("sessionID") && username && password && password===passwordConfirmation)){
					loginUser(username, password).then((response)=>{
						if (response !== "Incorrect Password!") {
							localStorage.setItem("username",username)
							localStorage.setItem("sessionID",response)
							// because this function is supplied from context, this also changes loggedIn in App as well
							setLoggedIn(true)
							navigate("/report")
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
				// if the user is registering and their passwords don't match, toggle the flag to update the UI and let them know
				else if(!localStorage.getItem("username") && !localStorage.getItem("sessionID") && username && password && password!==passwordConfirmation){
					setpasswordsMatch(false)
				}
			// chained ternary operator to update button text
			}}>{loggedIn ? "Logout" : (localStorage.getItem("username") ? "Login" : "Register")}</button>
		</div>
	)
}

export default Login
