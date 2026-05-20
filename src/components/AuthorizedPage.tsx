/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import { useContext, useEffect, type ReactElement, type ReactNode} from "react";
import {useNavigate} from "react-router";
import {AuthContext} from "../context/AuthContext.tsx";
import Page from "./Page.tsx";
// Global (per-tab) store: last time user dismissed alarm popup (ms since epoch)
// Using globalThis avoids duplicate module instances with varying import paths.
const g: any = globalThis as any;
if (typeof g.__iprLastAlarmDismissedAt !== 'number') g.__iprLastAlarmDismissedAt = 0 as number;

/** AuthorizedPage wraps a page and handles authentication check, loading, and error states. */
export default function AuthorizedPage(
	{isPending = false, error = null, children}: { isPending?: boolean, error?: Error | null, children: ReactNode }
): ReactElement {
	const {user} = useContext(AuthContext);
	const navigate = useNavigate();
	
	useEffect(() => {
		if (!user) {
			navigate("/login");
		}
	}, [user]);
	if (!user) {
		return <></>;
	}
	return <>
		<Page isPending={isPending} error={error} children={children}/>
		
	</>;
}
