/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */




export const defaultMenuItemDto: MenuItemDto = {
	id: 0,
	icon: "",
	itemOrder: 0,
	route: "",
	text: "",
	selectedRollenIDs: [],
	tags: [],
	rolle: "",
};

export default interface MenuItemDto {
	id: number;
	icon?: string;
	itemOrder?: number;
	route?: string;
	text?: string;
	selectedRollenIDs: number[],
	tags?: Array<{id: number, name: string}>,
	rolle: string;
}
