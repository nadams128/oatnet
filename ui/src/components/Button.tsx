"use client"

type Props = {
	children?: any;
	onClick?: () => void;
	className?: string;
	pressed?: boolean;
}

function Button({children, onClick, className, pressed}:Props){
	if (pressed)
		return(<>
			<button className={"w-fit max-w-40 min-w-24 py-1 px-2 bg-oatnet-background rounded-lg select-none " + className} onClick={onClick}>
				{children}
			</button>
		</>)
	else
		return(<>
			<button className={"w-fit max-w-40 min-w-24 py-1 px-2 bg-oatnet-foreground rounded-lg select-none " + className} onClick={onClick}>
				{children}
			</button>
		</>)
}

export default Button
