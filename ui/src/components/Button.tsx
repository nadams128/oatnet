"use client"

type Props = {
	children?: any;
	onClick?: () => void;
	className?: string;
}

function Button({children, onClick, className}:Props){
	return(<>
		<button className={"w-fit max-w-40 min-w-24 py-1 px-2 bg-oatnet-foreground rounded-lg select-none " + className} onClick={onClick}>
			{children}
		</button>
	</>)
}

export default Button
