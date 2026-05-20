/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
export const defaultUserDto: UserDto = Object.freeze({
	id: 0,
	name: "",
	username: "",
	isUserExit: false,
	isPassWordWrong: false,
	userCanLogin: false,
	isDeleted: false,
	rolle: "",
	isAdmin: false,
	isLoggedInId: 0,
});

export default interface UserDto {
	id: number;
	name: string;
	password?: string;
	passwordneeded?: boolean;
	username: string;
	isUserExit: boolean;
	isPassWordWrong: boolean;
	userCanLogin: boolean;
	isDeleted: boolean;
	rolle: string;
	isAdmin: boolean;
	isLoggedInId: number;
}
