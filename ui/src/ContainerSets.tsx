import { useState, useEffect } from 'react';
import { serverDomain } from './App.tsx';
import Modal from './components/Modal.tsx';
import Button from './components/Button.tsx';
import Input from './components/Input.tsx';
import InvalidInputIndicator from './components/InvalidInputIndicator.tsx';

export type Container = {
	name : string,
	percentage : number | undefined
}

export type ContainerSet = {
	name : string,
	containers : Container[]
}

type ModalInputContainer = {
	name : string,
	percentage : number | undefined,
	nameIsInvalid : boolean
}

export async function getContainerSets(containerSetName:string): ContainerSet | ContainerSet[] {
	let response: any
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID) {
//		if (containerSetName) {
//			response = await fetch(serverDomain+"/containersets?container="+containerSetName, {
//				method: "GET",
//				headers: {
//					"sessionID": sessionID
//				}
//			})
//			let containerSet: ContainerSet = response.json()
//			return containerSet
//		}
//		else {
		response = await fetch(serverDomain+"/containersets", {
			method: "GET",
			headers: {
				"sessionID": sessionID
			}
		})
		let containerSets: ContainerSet[] = response.json()
		return containerSets
//		}
	}
}

async function postContainerSet(containerSet: ContainerSet) {
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID) {
		await fetch(serverDomain+"/containersets", {
			method: "POST",
			headers: {
				"sessionID": sessionID
			},
			body: JSON.stringify(containerSet)
		})
	}
	else {
		return "No session ID"
	}
}

async function deleteContainerSet(containerSetName:string) {
	let sessionID = localStorage.getItem("sessionID")
	if (sessionID) {
		await fetch(serverDomain+"/containersets?container="+containerSetName, {
			method: "DELETE",
			headers: {
				"sessionID": sessionID
			}
		})
	}
	else {
		return "No session ID"
	}
}

function ContainerSets(){
	const [showModal, setShowModal] = useState<boolean>(false)
	const [containerSets, setContainerSets] = useState<ContainerSet[]>([])
	const [newSetName, setNewSetName] = useState<string>("")
	const [previousSetName, setPreviousSetName] = useState<string|undefined>(undefined)
	const [newSetContainers, setNewSetContainers] = useState<ModalInputContainer[]>([{name:"", percentage:undefined, nameIsInvalid:false}])
	const [invalidMessages, setInvalidMessages] = useState<{[message : string]:null}>({})
	const invalidMessageOptions = {
		SETNAME: "enter a name for the set",
		CONTAINERNAME: "check that all containers have names",
		PERCENTAGES: "check that all percentages total 100%"
	}
	function hideModal() {
		setNewSetName("")
		setPreviousSetName(undefined)
		setNewSetContainers([{name:"", percentage:undefined, nameIsInvalid: false}])
		setInvalidMessages({})
		setShowModal(false)
	}
	useEffect(() => {
		getContainerSets().then((response) => {
			let serverSets : ContainerSet[] = []
			for (let set of response) {
				serverSets.push({name: set.name, containers: set.containers})
			}
			setContainerSets(serverSets)
		})
	}, [])
	return(<>
		{containerSets && 
			<div className="flex flex-col items-center">
				<div className="w-full flex justify-end max-w-128">
					<Button className="mr-8" onClick={() => {
						setShowModal(true)
					}}>
						+ Add New Set
					</Button>
				</div>
				<div className="mx-4 mt-4">
					<table className="w-full table-auto select-none max-w-128">
						<thead>
							<tr>
								<td className="border-b border-r border-oatnet-text border-dashed bg-oatnet-background-modal rounded-tl-xl p-2 min-w-24">Set Name</td>
								<td className="border-b border-oatnet-text border-dashed bg-oatnet-background-modal rounded-tr-xl p-2">Containers</td>
							</tr>
						</thead>
						<tbody className="bg-oatnet-foreground">
							{containerSets.map((set) => {
								let containerNamesCombined
								for (let container of set.containers) {
									if (!containerNamesCombined) {
										containerNamesCombined = container.name
									} else {
										containerNamesCombined += ", " + container.name
									}
								}
								return(
									<tr key={`row-${set.name}`} onClick={() => {
										setNewSetName(set.name)
										setPreviousSetName(set.name)
										let convertedContainers : ModalInputContainer[] = []
										for (let container of set.containers) {
											convertedContainers.push({...container, nameIsInvalid: false})
										}
										convertedContainers.push({name: "", percentage: undefined, nameIsInvalid:false})
										setNewSetContainers(convertedContainers)
										setShowModal(true)
									}}>
										<td key={`${set.name}-name`} className="border-b border-r border-oatnet-text border-solid px-2 py-1">{set.name}</td>
										<td key={`${set.name}-containers`} className="border-b border-oatnet-text border-solid px-2 py-1">{containerNamesCombined}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		}
		{showModal && <Modal onClickOut={() => {
			hideModal()
		}}>
			<div className="flex mt-2">
				<label className="min-w-20" htmlFor="setName">Set Name:</label>
				<Input
					className="ml-1"
					id="setName"
					placeholder="Clothes"
					value={newSetName}
					invalid={invalidMessages[invalidMessageOptions.SETNAME] !== undefined}
					onChange={e => {
						setNewSetName(e.target.value)
						let localInvalidMessages = {...invalidMessages}
						delete localInvalidMessages[invalidMessageOptions.SETNAME]
						setInvalidMessages(localInvalidMessages)
					}}
				/>
			</div>
			<div className="bg-oatnet-foreground h-1 w-full rounded-lg mt-2"/>
			<div className="font-youngserif text-xl mt-1">Containers</div>
			{Object.keys(invalidMessages).length > 0 && <InvalidInputIndicator className="mt-2 mb-2" messages={invalidMessages}/>}
			<table className="w-full table-auto select-none">
				<thead>
					<tr>
						<td className="border-b border-r border-oatnet-text border-dashed pl-1">Name</td>
						<td className="border-b border-oatnet-text border-dashed max-w-24">
							<div className="ml-1 text-center">
								<div>% of Total</div>
							</div>
						</td>
					</tr>
				</thead>
				<tbody>
					{/* for each row of data returned, generate the rows and data cells */}
					{newSetContainers.map((container, i) => {
						let nameInputInvalid = invalidMessages[invalidMessageOptions.CONTAINERNAME] !== undefined && container.nameIsInvalid
						let percentageInvalid = invalidMessages[invalidMessageOptions.PERCENTAGES] !== undefined && container.percentage
						return(
							<tr key={`row-${i}`}>
								<td key={`name-${i}`} className="border-b border-r border-oatnet-text border-solid">
									<div className="mx-1 my-1">
										<Input
											className="min-w-16"
											value={container.name}
											invalid={nameInputInvalid}
											onChange={ e => {
												let localNewSetContainers = [...newSetContainers]
												if (i == newSetContainers.length - 1 && container.name=="" && container.percentage && e.target.value !== "") {
													localNewSetContainers.push({name:"", percentage:undefined, nameIsInvalid:false})
												}
												localNewSetContainers[i] = {name: e.target.value, percentage: container.percentage, nameIsInvalid: false}
												setNewSetContainers(localNewSetContainers)
											}}
										/>
									</div>
								</td>
								<td key={`percentage-${i}`} className="border-b border-oatnet-text border-solid max-w-24">
									<div className="flex justify-center mx-1 my-1">
										<Input
											className="max-w-10 min-w-10 appearance-none"
											defaultValue={container.percentage ? container.percentage : ""}
											type="number"
											invalid={percentageInvalid}
											onChange={ e => {
												let convertedInput = parseInt(e.target.value)
												let localNewSetContainers = [...newSetContainers]
												if (convertedInput !== NaN) {
													if (i == newSetContainers.length - 1 && !container.percentage && container.name !== "") {
														localNewSetContainers.push({name:"", percentage:undefined, nameIsInvalid: false})
													}
													let localInvalidMessages = {...invalidMessages}
													delete localInvalidMessages[invalidMessageOptions.PERCENTAGES]
													setInvalidMessages(localInvalidMessages)
													localNewSetContainers[i] = {name: newSetContainers[i].name, percentage: convertedInput, nameIsInvalid: newSetContainers[i].nameIsInvalid}
												} else {
													localNewSetContainers[i] = {name: newSetContainers[i].name, percentage: undefined}
												}
												setNewSetContainers(localNewSetContainers)
											}}
										/>
									</div>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<div className="flex mt-4">
				<Button onClick={() => {
					let localInvalidMessages = {...invalidMessages}
					let localNewSetContainers = [...newSetContainers]
					function handleInvalid(condition:boolean, message:string){
						if (condition) {
							localInvalidMessages[message] = null
						} else {
							delete localInvalidMessages[message]
						}
					}
					let addedPercentages = 0
					let allContainersAreNamed = true
					let slicedNewSetContainers = []
					localNewSetContainers.map((container, i) => {
						if (!(container.name === "" && !container.percentage)) {
							if (container.name == "") {
								allContainersAreNamed = false
								container.nameIsInvalid = true
							}
							if (container.percentage) {
								addedPercentages += container.percentage
							}
							slicedNewSetContainers.push(container)
						}
					})
					// handle invalid conditions
					handleInvalid(newSetName === "", invalidMessageOptions.SETNAME)
					handleInvalid(addedPercentages !== 100, invalidMessageOptions.PERCENTAGES)
					handleInvalid(!allContainersAreNamed, invalidMessageOptions.CONTAINERNAME)
					// if there are no invalid inputs, submit
					if (Object.keys(localInvalidMessages).length === 0) {
						let trimmedNewSetContainers : Containers[] = []
						for (let container of slicedNewSetContainers) {
							trimmedNewSetContainers.push({name: container.name, percentage: container.percentage})
						}
						if (newSetName === previousSetName) {
							let localContainerSets = [...containerSets]
							localContainerSets.splice((set) => { set.name === newSetName }, 1, {name: newSetName, containers: trimmedNewSetContainers})
							setContainerSets(localContainerSets)
						} else {
							let localContainerSets = [...containerSets]
							localContainerSets.push({name: newSetName, containers: trimmedNewSetContainers})
							let previousSetNameIndex = localContainerSets.findIndex((set) => { 
								return set.name === previousSetName
							})
							if (previousSetNameIndex > 0) {
								localContainerSets.splice(previousSetNameIndex, 1)
							}
							localContainerSets.sort((a:ContainerSet, b:ContainerSet) => {
								if (a.name.toUpperCase() > b.name.toUpperCase())
									return 1
								else if (a.name.toUpperCase() < b.name.toUpperCase())
									return -1
								else
									return 0
							})
							setContainerSets(localContainerSets)
						}
						postContainerSet({name: newSetName, containers: trimmedNewSetContainers}).then(() => {
							hideModal()
						})
					} else {
						setNewSetContainers(localNewSetContainers)
					}
					setInvalidMessages(localInvalidMessages)
				}}>
					Save Set
				</Button>
				<Button className={"ml-4 bg-oatnet-invalid"} onClick={() => {
					deleteContainerSet(newSetName).then(() => {
						let localContainerSets = [...containerSets]
						localContainerSets.splice(localContainerSets.findIndex((set) => {
							if(set.name === newSetName)
								return true
							else
								return false
						}), 1)
						setContainerSets(localContainerSets)
						hideModal()
					})
				}}>
					Delete Set
				</Button>
				<Button className={"ml-4"} onClick={() => {
					hideModal()
				}}>
					Close
				</Button>
			</div>
		</Modal>}
	</>)
}

export default ContainerSets
