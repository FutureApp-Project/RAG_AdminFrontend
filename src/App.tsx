/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import React, {useEffect, useState} from "react";
import {RouterProvider} from "react-router";
import NavBar from "./components/NavBar.tsx";
import config from "./config.ts";
import { router } from "./components/Router.tsx";
import {AuthContext} from "./context/AuthContext.tsx";
import {CancelTestContext} from "./context/CancelTestContext.tsx";
import {MobileContext} from "./context/MobileContext.tsx";

import {CssBaseline, ThemeProvider, Box, Typography, Button } from "@mui/material";
import {ThemeSettings} from "./theme/Theme.tsx";
import type UserDto from "./models/UserDto.ts";
import { reportClientError } from "./helpers/errorReporter.ts";

class ErrorBoundary extends React.Component<
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
		reportClientError("app-boundary", error, {
			componentStack: errorInfo.componentStack,
		});
	}
	render() {
		if (this.state.hasError) {
			return (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.50" p={4}>
					<Box textAlign="center" bgcolor="white" borderRadius={2} boxShadow={3} p={4} maxWidth={400}>
						<Typography variant="h5" color="error" gutterBottom>Something went wrong</Typography>
						<Typography color="text.secondary" mb={3}>{this.state.error?.message}</Typography>
						<Button variant="contained" color="primary" onClick={() => window.location.reload()}>Reload</Button>
					</Box>
				</Box>
			);
		}
		return this.props.children;
	}
}


export default function App() {
	const authDataStr = localStorage.getItem("authData");
	const authData = (authDataStr ? JSON.parse(authDataStr) : null);
	const [token, setToken] = useState<string>(authData?.token || "");
	const [userDto, setUserDto] = useState<UserDto | null>(authData?.user || null);

	const [isMobile, setIsMobile] = useState(
		window.matchMedia("(max-width: 990px)").matches
	);
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setIsMobile(window.matchMedia("(max-width: 990px)").matches);
			}, 50);
		};
		window.addEventListener("resize", handleResize);
		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		document.title = `${config.LONG_TITLE} (${config.SHORT_TITLE})`;
	}, []);

	const [isTestRunning, setIsTestRunning] = useState(false);

	const theme = ThemeSettings();
	return (
		<ErrorBoundary>
		<ThemeProvider theme={theme}>
			<AuthContext.Provider value={{token, setToken, user: userDto, setUser: setUserDto}}>
				<MobileContext.Provider value={isMobile}>
					<CancelTestContext.Provider value={{isTestRunning, setIsTestRunning}}>
						<CssBaseline />
						<NavBar />
						<RouterProvider router={router} />
					</CancelTestContext.Provider>
				</MobileContext.Provider>
			</AuthContext.Provider>
		</ThemeProvider>
		</ErrorBoundary>
	);
}
