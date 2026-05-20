/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import type TagDto from "./TagDto";


export const defaultUserDetailsDto: UserDetailsDto = {
	id: 0,
	password: "",
	repeatPassword: "",
	passwordneeded: false,
	username: "",
	firstname: "",
	lastname: "",
	rolle: "",
	SelectedRollenIDs: [],
	Tags: [],
	tags_name: "",
};

export default interface UserDetailsDto {
	id: number;
	firstname: string;
	lastname: string;
	password?: string;
	repeatPassword?: string;
	passwordneeded?: boolean;
	username: string;
	rolle?: string;
	SelectedRollenIDs: number[];
	Tags: TagDto[];
	tags_name: string;
}
