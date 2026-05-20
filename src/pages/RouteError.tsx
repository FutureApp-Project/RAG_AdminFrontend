/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {Box, Button, Typography} from "@mui/material";
import {useEffect, useRef} from "react";
import {isRouteErrorResponse, useRouteError} from "react-router";
import { reportClientError } from "../helpers/errorReporter.ts";

export default function RouteError() {
	const error = useRouteError();
	const hasReportedRef = useRef(false);

	let title = "Page error";
	let message = "This page could not be loaded.";
	let reportSource = "route-boundary";
	let reportPayload: unknown = error;
	let reportMetadata: Record<string, unknown> = {};

	if (isRouteErrorResponse(error)) {
		title = `Request failed (${error.status})`;
		message = typeof error.data === "string" ? error.data : error.statusText || message;
		console.error("Admin route error response:", error.status, error.data);
		reportSource = "route-error-response";
		reportPayload = message;
		reportMetadata = {
			status: error.status,
			statusText: error.statusText,
		};
	} else if (error instanceof Error) {
		message = error.message;
		console.error("Admin route render error:", error);
	} else {
		console.error("Admin route render error:", error);
	}

	useEffect(() => {
		if (hasReportedRef.current) {
			return;
		}
		hasReportedRef.current = true;
		reportClientError(reportSource, reportPayload, reportMetadata);
	}, [reportMetadata, reportPayload, reportSource]);

	return (
		<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.50" p={4}>
			<Box textAlign="center" bgcolor="white" borderRadius={2} boxShadow={3} p={4} maxWidth={420}>
				<Typography variant="h5" color="error" gutterBottom>{title}</Typography>
				<Typography color="text.secondary" mb={3}>{message}</Typography>
				<Box display="flex" justifyContent="center" gap={2}>
					<Button variant="outlined" color="inherit" onClick={() => window.history.back()}>Go back</Button>
					<Button variant="contained" color="primary" onClick={() => window.location.reload()}>Reload</Button>
				</Box>
			</Box>
		</Box>
	);
}