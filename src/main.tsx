/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React, {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CustomizerContextProvider } from "./context/CustomizerContext.tsx";
import { reportClientError } from "./helpers/errorReporter.ts";
import { installRuntimeLogger } from "./helpers/runtimeLogger.ts";

installRuntimeLogger();

class RootErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		reportClientError("root-boundary", error, {
			componentStack: errorInfo.componentStack,
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f5f5f5"}}>
					<div style={{background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "32px", maxWidth: "420px", textAlign: "center"}}>
						<h1 style={{marginBottom: "16px", color: "#d32f2f"}}>Application error</h1>
						<p style={{marginBottom: "24px", color: "#666"}}>{this.state.error?.message || "An unexpected error occurred."}</p>
						<button onClick={() => window.location.reload()} style={{padding: "10px 20px", border: 0, borderRadius: "8px", background: "#1976d2", color: "#fff", cursor: "pointer"}}>
							Reload
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

window.addEventListener("error", (event) => {
	reportClientError("window-error", event.error || event.message, {
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno,
	});
});

window.addEventListener("unhandledrejection", (event) => {
	reportClientError("unhandled-rejection", event.reason);
});

const queryClient = new QueryClient();
const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

try {
	createRoot(rootElement).render(
		<StrictMode>
			<RootErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<CustomizerContextProvider>
						<App/>
					</CustomizerContextProvider>
				</QueryClientProvider>
			</RootErrorBoundary>
		</StrictMode>
	);
} catch (error) {
	reportClientError("bootstrap", error);
}
