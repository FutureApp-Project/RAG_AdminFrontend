/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {lazy, Suspense} from "react";
import {createBrowserRouter, createRoutesFromElements, Route} from "react-router";

import Spinner from "../layouts/full/shared/loadable/Spinner.tsx";

const Dashboard = lazy(() => import("../pages/Dashboard.tsx"));
const Error404 = lazy(() => import("../pages/Error404.tsx"));
const Faq = lazy(() => import("../pages/Faq.tsx"));
const Home = lazy(() => import("../pages/Home.tsx"));
const Login = lazy(() => import("../pages/Login.tsx"));
const Logout = lazy(() => import("../pages/Logout.tsx"));
const Menu = lazy(() => import("../pages/Menu.tsx"));
const Roles = lazy(() => import("../pages/Roles.tsx"));
const Users = lazy(() => import("../pages/Users.tsx"));
const RouteError = lazy(() => import("../pages/RouteError.tsx"));
const BlankLayout = lazy(() => import("../layouts/blank/BlankLayout.tsx"));
const FullLayout = lazy(() => import("../layouts/full/FullLayout.tsx"));
const Upload = lazy(() => import("../pages/upload.tsx"));
const ChatHistory = lazy(() => import("../pages/ChatHistory.tsx"));
const UserChatHistory = lazy(() => import("../pages/UserChatHistory.tsx"));
const UserFullChatHistory = lazy(() => import("../pages/UserFullChatHistory.tsx"));

function withSuspense(element: React.ReactNode) {
	return <Suspense fallback={<Spinner />}>{element}</Suspense>;
}


/** Router defines the application's route structure and maps URLs to pages. */
export const router = createBrowserRouter(
	createRoutesFromElements(<>
		<Route element={withSuspense(<BlankLayout />)} errorElement={withSuspense(<RouteError />)}>
			<Route path="/login" element={withSuspense(<Login/>)} />
			<Route path="/logout" element={withSuspense(<Logout/>)} />
		</Route>
		<Route element={withSuspense(<FullLayout />)} errorElement={withSuspense(<RouteError />)}>
			<Route index element={withSuspense(<Home/>)} />
			<Route path="/dashboard" element={withSuspense(<Dashboard/>)} />
			<Route path="/users" element={withSuspense(<Users/>)} />
			<Route path="/faq" element={withSuspense(<Faq/>)} />
			<Route path="/roles" element={withSuspense(<Roles/>)} />
			<Route path="/menu" element={withSuspense(<Menu/>)} />
			<Route path="/upload" element={withSuspense(<Upload/>)} />
			<Route path="/chat-history" element={withSuspense(<ChatHistory/>)} />
			<Route path="/userchat/:userId" element={withSuspense(<UserChatHistory/>)} />
			<Route path="/userchats/:userId/:sessionId" element={withSuspense(<UserFullChatHistory/>)} />
			<Route path="*" element={withSuspense(<Error404/>)} />
		</Route>
	</>)
);
