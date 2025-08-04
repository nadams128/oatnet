type Props = {
	className?: string;
	messages: {[message: string] : null};
}

function InvalidInputIndicator(props: Props) {
	let outputMessage = "Please "
	let messageList = Object.keys(props.messages)
	switch (messageList.length) {
		case 1:
			outputMessage += messageList[0]
			break
		case 2:
			outputMessage += `${messageList[0]} and ${messageList[1]}`
			break
		default:
			for (let i = 0; i < messageList.length - 1; i++) {
				outputMessage += `${messageList[i]}, `
			}
			outputMessage += ` and ${messageList[messageList.length - 1]}`
	}
	return(
		<div className={`w-full p-1 rounded-md border-4 border-oatnet-invalid ${props.className ? props.className : ""}`}>
			{outputMessage}
		</div>
	)
}

export default InvalidInputIndicator
