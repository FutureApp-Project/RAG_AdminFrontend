/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useContext, useEffect} from "react";
import {useNavigate} from "react-router";
import {AuthContext} from "../context/AuthContext.tsx";

/** Logout page clears authentication and redirects to login. */
export default function Logout() {
	const navigate = useNavigate();
	const {setToken, setUser} = useContext(AuthContext);
	useEffect(() => {
		setToken("");
		setUser(null);
		localStorage.removeItem("authData");
		navigate("/login");
	});
	return <></>;
}
