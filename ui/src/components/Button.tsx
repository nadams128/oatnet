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
