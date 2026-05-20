/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {createContext, type Dispatch, type SetStateAction} from "react";
import type UserDto from "../models/UserDto";


/** AuthContext provides authentication state and user information globally. */
export const AuthContext = createContext({
	token: "",
	setToken: null! as Dispatch<SetStateAction<string>>,
	user: null as UserDto | null,
	setUser: null! as Dispatch<SetStateAction<UserDto | null>>,
});
