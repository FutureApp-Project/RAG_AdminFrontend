/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
export default interface TagDto {
	id: number;
	name?: string;
	role?: string;
	transferable?: boolean;
	floorName: string;
}
