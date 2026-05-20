/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import type TagDto from "./TagDto";
export const defaultRoleDetailsDto: RoleDetailsDto = {
	id: 0,
	name: "",
	transferable: false,
	role: "",
	tags: [],
	
};

export default interface RoleDetailsDto {
	id: number;
	name?: string;
	transferable?: boolean;
	role?: string;
	tags: TagDto[];
	
}
