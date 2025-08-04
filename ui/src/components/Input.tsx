type Props = {
	className?: string;
	id?: string;
	value?: string | number;
	defaultValue?: string | number;
	onChange?: (e:any) => void;
	placeholder?: string;
	readOnly?: boolean;
	list?: string;
	autoComplete?: string;
	type?: string;
	invalid?: boolean;
}

function Input(props: Props) {
	let elementProps = {...props}
	delete elementProps.invalid
	return(
		<input {...elementProps} className={`
			px-1 w-full bg-oatnet-foreground rounded rounded-lg 
			${props.className ? props.className : ""} 
			${props.invalid ? " bg-oatnet-invalid text-oatnet-text-dark placeholder-oatnet-placeholder-dark" : ""}
		`}/>
	)
}

export default Input
