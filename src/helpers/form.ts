/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import type { UseMutateFunction } from "@tanstack/react-query";
import type { SubmitHandler } from "react-hook-form";

/**
 * Creates a submit handler for react-hook-form that merges form data and triggers mutation/onSave.
 * @param dto The default or existing data object
 * @param mutate The mutation function to call
 * @param onSave Optional callback after merging data
 * @return A submit handler function for react-hook-form
 */
export function createSubmitHandler<T extends object>(
	dto: T, mutate: UseMutateFunction<unknown, Error, object>, onSave?: (dto: T) => void
): SubmitHandler<T> {
	return (formData: T) => {
		console.log("createSubmitHandler - dto:", dto, "formData:", formData);
		const newDto: T = {...dto, ...formData};
		console.log("createSubmitHandler - merged newDto:", newDto);
		const result = onSave?.(newDto);
		console.log("createSubmitHandler - calling mutate with:", newDto);
		mutate(newDto);
		return result;
	};
}
