import {subtitle} from "@/components/primitives";
import * as React from "react";

export default function Page({ params }: { params: { plot: string } }) {
	if(params.plot === '') {
		return (
			<>
				<p className={subtitle()}>Currently at reporting page, viewing NONE</p>
			</>
		);
	} else {
		return (
			<>
				<p className={subtitle()}>Currently at reporting page, viewing {params.plot}</p>
			</>
		);
	}
}