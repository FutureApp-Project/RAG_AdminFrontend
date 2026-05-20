/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {createContext} from "react";
import type {Dispatch, SetStateAction} from "react";

/** CancelTestContext manages the global state for canceling assessments or checking if they are running. */
export const CancelTestContext = createContext({
	isTestRunning: false,
	setIsTestRunning: null! as Dispatch<SetStateAction<boolean>>,
});
