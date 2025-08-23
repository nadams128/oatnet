"use client"

type Props = {
	children?: any; 
	className?: string;
	onClickOut?: () => void;
}

function Modal({children, className, onClickOut}:Props) {
	return(<>
		<div className={"absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center " + className}>
			<div className="z-0 absolute top-0 left-0 w-screen h-screen bg-oatnet-foreground/75" onClick={onClickOut ? onClickOut : ()=>{}}></div>
			<div className="z-10 mx-8 p-4 bg-oatnet-background-modal rounded-3xl flex flex-col items-center">
				{children}
			</div>
		</div>
	</>)
}

export default Modal
