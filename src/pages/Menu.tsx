/* Copyright (C) 2025, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useQueryClient} from "@tanstack/react-query";
import {useCallback, useContext, useEffect, useState} from "react";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import ButtonCreate from "../components/ButtonCreate.tsx";
import DataTable, { type Action, type ColumnDefinition } from "../components/DataTable.tsx";
import PopupForm, { type FieldDefinition } from "../components/PopupForm.tsx";
import {AuthContext} from "../context/AuthContext.tsx";
import {useApiMutation, useApiQuery} from "../helpers/api.ts";
import {usePopup} from "../helpers/popup.ts";
import { Icon } from "@iconify-icon/react";
import PageTitle from "../components/PageTitle.tsx";
import type MenuItemDto from "../models/MenuItemDto.ts";
import { defaultMenuItemDto } from "../models/MenuItemDto.ts";
import PopupDelete from "../components/PopupDelete.tsx";
const columns: ColumnDefinition<MenuItemDto>[] = [
	{propertyKey: "itemOrder", isHidden: true, enableSorting: true},
	{propertyKey: "icon", header: "Symbol",icon: <Icon icon="mdi:tag-outline" style={{color: "#cc8d2dff"}}/>,},
	{propertyKey: "text", header: "Text", isTitle: true},
	{propertyKey: "rolle", header: "Rolle", icon: <Icon icon="mdi:shield-account-outline" style={{ color: "#c818e7ff" }} />},
];

/** Menu page manages the navigation menu items, including drag & drop reordering. */
export default function Menu() {
	const {isPending, error, data} = useApiQuery<MenuItemDto[]>("/MenuResource/GetMenuData");
	const [id, setId] = useState<number>(0);
	const [dto, setDto] = useState<MenuItemDto>(defaultMenuItemDto);
	const [popupCreateFormProperties, openPopupCreateForm] = usePopup();
	const [popupEditFormProperties, openPopupEditForm] = usePopup();
	const [popupDeleteProperties, openPopupDelete] = usePopup();
	const reorderMenuItemsMutations = useApiMutation("/MenuResource/ReorderMenuItems");
	// Remove localData state, use data from query directly
	const queryClient = useQueryClient();
	const {token} = useContext(AuthContext);

	// No need to sync localData with data, just use data directly
	console.log("Menu data:", data);
	
	useEffect(() => {
		console.log("dto state changed:", dto);
	}, [dto]);
	
	useEffect(() => {
		if (reorderMenuItemsMutations.isSuccess) {
			queryClient.invalidateQueries({queryKey: ["/MenuResource/GetMenuData", token]});
			queryClient.invalidateQueries({queryKey: ["/auth/GetMenu", token]});
		}
	}, [reorderMenuItemsMutations.isSuccess,queryClient, token]);

	const actions: Action<MenuItemDto>[] = [
		{icon: "bx-pencil", label: "Bearbeiten", handler: (id, item) => {
			console.log("Edit clicked - id:", id, "item:", item);
			setId(id);
			setDto(item);
			console.log("After setDto - dto will be:", item);
			openPopupEditForm();
		}},
		{icon: "bx-trash", label: "Löschen", handler: id => {
			setId(id);
			openPopupDelete();
		}}
	];

	const fields = useCallback((menuItemDto: MenuItemDto): FieldDefinition<MenuItemDto>[] => {
		console.log("fields callback - menuItemDto:", menuItemDto);
		return [
			{propertyKey: "icon", label: "Symbol", required: true, maxLength: 255},
			{propertyKey: "text", label: "Text", required: true, maxLength: 255},
			{
				propertyKey: "selectedRollenIDs",
				label: "Rollen",
				multiListData: menuItemDto.tags?.map(tag => ({ 
					value: tag.id, 
					label: tag.name ?? "" 
				})) ?? [],
				required: "Bitte wählen Sie mindestens eine Rolle aus.",
			},
		];
	}, []);

	const onDragEnd = (from: number, to: number) => {
		const fromEl = data?.find(el => el.id == from);
		const toEl = data?.find(el => el.id == to);
		if (!data?.length || !fromEl || !toEl) {
			console.error("Menu items not found.");
			return;
		}

		const newOrder = toEl.itemOrder ?? 0;
		const draggedOrder = fromEl.itemOrder ?? 0;
		const isMovingDown = newOrder > draggedOrder;
		if (fromEl.itemOrder == newOrder) {
			return;
		}

		// Create an array of updated positions
		const reorderedMenuItems = data
			.filter(el => {
				// Only include items that need their itemOrder changed
				if (el.id === fromEl.id) return true;
				const itemOrder = el.itemOrder ?? 0;
				if (isMovingDown) {
					return itemOrder > draggedOrder && itemOrder <= newOrder;
				} else {
					return itemOrder < draggedOrder && itemOrder >= newOrder;
				}
			})
			.map(el => {
				if (el.id === fromEl.id) {
					// Set dragged item to the target order
					return {id: el.id, itemOrder: newOrder, rolle: ""};
				} else {
					const itemOrder = el.itemOrder ?? 0;
					const calcedOrder = isMovingDown ? itemOrder - 1 : itemOrder + 1;
					// Shift orders of affected items
					return {
						id: el.id,
						itemOrder: calcedOrder,
						rolle: "",
					};
				}
			});

		if (
			reorderedMenuItems.length < 1 ||
			reorderedMenuItems.some((item1, index) => reorderedMenuItems.findIndex(item2 => item1.id == item2.id) !== index) ||
			reorderedMenuItems.some((item1, index) => reorderedMenuItems.findIndex(item2 => item1.itemOrder == item2.itemOrder) !== index)
		) {
			console.error("Error during drag & drop.");
			return;
		}
		reorderMenuItemsMutations.mutate(reorderedMenuItems);
		// No need to update localData, query will refetch on success
	};

	const onSave = useCallback((dto: MenuItemDto) => {
		console.log("Menu.tsx onSave - dto:", dto);
		//	dto.tags.forEach(tag => tag.floorName ??= "");
	}, []);

	const duplicateError = "Ein Menüelement mit demselben Namen existiert bereits. Bitte wählen Sie einen anderen Namen.";
	return (
		<AuthorizedPage isPending={isPending} error={error}>
			<PageTitle title="Menüverwaltung" />
			<DataTable
				columns={columns}
				data={data || []}
				actions={actions}
				idColumn="id"
				disableSortingByDefault={true}
				enableDnd={true}
				onDragEnd={onDragEnd}
				createButton={<ButtonCreate text="Neues Menüelement" onClick={openPopupCreateForm} />}
			/>
			<PopupForm
				name="Neues Menüelement"
				endpoint="/MenuResource/SaveMenuDetails"
				getEndpoint="/MenuResource/GetMenuDetailsById"
				fields={fields}
				defaultDto={defaultMenuItemDto}
				idColumn="id"
				onSave={onSave}
				duplicateError={duplicateError}
				{...popupCreateFormProperties}
			/>
			<PopupForm
				name="Menüelement"
				endpoint="/MenuResource/SaveMenuDetails"
			defaultDto={dto}
			fields={fields}
			getEndpoint="/MenuResource/GetMenuDetailsById"
			idColumn="id"
			id={id}
				onSave={onSave}
				duplicateError={duplicateError}
				{...popupEditFormProperties}
			/>
			<PopupDelete
				shortName="Menüelement"
				longName="dieses Menüelement"
				endpoint="/MenuResource/DeletedMenuById"
				id={id}
				{...popupDeleteProperties}
			/>
		</AuthorizedPage>
	);
}
