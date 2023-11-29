import * as React from "react";
import { cn } from "../lib/utils";

export function Header({ className }: React.HTMLAttributes<HTMLElement>) {
	return (
		<header className={cn(className)}>
			<div className="container flex items-center justify-center pt-10 drop-shadow-[0px_0px_25px_rgba(255,255,255,0.25)]">
				<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
					<div className="flex items-center flex-col gap-4">
						<h1 className="text-7xl font-bold tracking-tighter">git.show</h1>
						<p className="hidden md:block text-md font-light">
							show off your contributions
						</p>
					</div>
				</div>
			</div>
		</header>
	);
}
