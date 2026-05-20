/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useCallback, useContext, useMemo, useState, useRef} from "react";
import {Icon} from "@iconify-icon/react";
import ButtonCreate from "../components/ButtonCreate.tsx";
import {AuthContext} from "../context/AuthContext.tsx";
import {useApiQuery} from "../helpers/api.ts";
import {usePopup} from "../helpers/popup.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import type { Action, ColumnDefinition } from "../components/DataTable.tsx";
import DataTable from "../components/DataTable.tsx";
import type UserDetailsDto from "../models/UserDetailsDto.ts";
import { defaultUserDetailsDto } from "../models/UserDetailsDto.ts";
import PageTitle from "../components/PageTitle.tsx";
import PopupDelete from "../components/PopupDelete.tsx";
import PopupForm, { type FieldDefinition } from "../components/PopupForm.tsx";
import type UserDto from "../models/UserDto.ts";

const columns: ColumnDefinition<UserDto>[] = [
	{propertyKey: "username", header: "Benutzername", isTitle: true},
	{propertyKey: "name", header: "Login-Name", icon: <Icon icon="mdi:user-circle" style={{  color: "#13d36dff" }} />},
	{propertyKey: "rolle", header: "Rolle", icon: <Icon icon="mdi:shield-account-outline" style={{ color: "#c818e7ff" }} />},
];

/** Users page manages the list of users and their details. */
export default function Users() {
	const {user} = useContext(AuthContext);
	const {isPending, error, data} = useApiQuery<UserDto[]>("/UserResource/GetUsers");
	const [selectedId, setSelectedId] = useState<number>(0);
	const [popupCreateFormProperties, openPopupCreateForm] = usePopup();
	const [popupEditFormProperties, openPopupEditForm] = usePopup();
	const [popupDeleteProperties, openPopupDelete] = usePopup();
	
	// Use a ref to store table data for use in callbacks
	const tableDataRef = useRef<UserDto[]>([]);
	tableDataRef.current = data || [];

	const createUser = useCallback(() => {
		openPopupCreateForm();
	}, [openPopupCreateForm]);

	const actions: Action<UserDto>[] = useMemo(() =>[
		{
			icon: "bx-pencil", 
			label: "Bearbeiten", 
			disabled: id => !user?.isAdmin && id != user?.id, 
			handler: (id, rowData) => {
				console.log('Edit clicked for id:', id, 'RAW data:', rowData);
				setSelectedId(id);
				// Small delay to ensure state is updated before opening popup
				setTimeout(() => {
					openPopupEditForm();
				}, 0);
			}
		},
		{
			icon: "bx-trash", 
			label: "Löschen", 
			disabled: id => !user?.isAdmin && id != user?.id, 
			handler: id => {
				console.log('Delete clicked for id:', id);
				setSelectedId(id);
				// Small delay to ensure state is updated before opening popup
				setTimeout(() => {
					openPopupDelete();
				}, 0);
			}
		}
	], [user, openPopupEditForm, openPopupDelete]);

	console.log('Users render');
	
	const fields = useCallback((userDetails: UserDetailsDto): FieldDefinition<UserDetailsDto>[] => {
		console.log('fields called with userDetails:', userDetails);
		
		// Early return if no userDetails yet
		if (!userDetails) {
			return [];
		}
		
		console.log('userDetails.tags', userDetails.Tags);
		console.log('userDetails.SelectedRollenIDs', userDetails.SelectedRollenIDs);
		
		// Check if Tags are available
		const tagOptions = userDetails.Tags && userDetails.Tags.length > 0 
			? userDetails.Tags.map(tag => ({
					id: tag.id,
					name: tag.name ?? "",
				}))
			: [{ id: 0, name: "Rollen werden geladen..." }];
		
		// Add default option
		const allOptions = [{ id: 0, name: "Rolle auswählen" }].concat(tagOptions);
		
		return [
			{propertyKey: "username", label: "Benutzername", required: true, disableEditing: true, maxLength: 255},
			{propertyKey: "firstname", label: "Vorname", required: true, maxLength: 255},
			{propertyKey: "lastname", label: "Nachname", required: true, maxLength: 255},
			{
				propertyKey: "SelectedRollenIDs" as keyof UserDetailsDto,
				label: "Rollen",
				required: true,
				type: "select",
				options: allOptions,
			},
			{
				propertyKey: "password", 
				label: "Passwort", 
				required: !userDetails.id ? true : undefined,
				type: "password", 
				maxLength: 255, 
				watch: true,
			},
			{
				propertyKey: "repeatPassword", 
				label: "Passwort wiederholen", 
				required: !userDetails.id ? true : undefined,
				type: "password", 
				maxLength: 255,
				validate: (value, watched) => {
					// Only validate if password field is not empty
					if (watched.password && value !== watched.password) {
						return "Die Passwörter stimmen nicht überein.";
					}
					return true;
				}
			},
		];
	}, []);

	const adjustEditData = useCallback((dto: UserDetailsDto) => {
		console.log('adjustEditData - dto before:', dto);
		
		// If SelectedRollenIDs is empty but rolle and Tags exist, populate SelectedRollenIDs
		if ((!Array.isArray(dto.SelectedRollenIDs) || dto.SelectedRollenIDs.length === 0) && 
		    dto.rolle && 
		    Array.isArray(dto.Tags) && 
		    dto.Tags.length > 0) {
			console.log('Looking for rolle:', dto.rolle, 'in Tags:', dto.Tags);
			const matchingTag = dto.Tags.find(tag => tag.name === dto.rolle);
			if (matchingTag) {
				console.log('Found matching tag:', matchingTag);
				// Set as a single value (not array) because the select field expects a single value
				dto.SelectedRollenIDs = matchingTag.id as any;
			} else {
				console.log('No matching tag found');
			}
		} else if (Array.isArray(dto.SelectedRollenIDs) && dto.SelectedRollenIDs.length > 0) {
			// Convert array to single value for the select field
			console.log('Converting SelectedRollenIDs array to single value:', dto.SelectedRollenIDs[0]);
			dto.SelectedRollenIDs = dto.SelectedRollenIDs[0] as any;
		}
		
		console.log('adjustEditData - dto after:', dto);
	}, []);

	const onSave = useCallback((dto: UserDetailsDto) => {
		// Ensure SelectedRollenIDs is always an array of numbers
		if (!Array.isArray(dto.SelectedRollenIDs)) {
			dto.SelectedRollenIDs = dto.SelectedRollenIDs !== undefined && dto.SelectedRollenIDs !== null
				? [Number(dto.SelectedRollenIDs)]
				: [];
		} else {
			dto.SelectedRollenIDs = dto.SelectedRollenIDs.map(Number).filter(v => !isNaN(v));
		}
		
		// Clear password fields if they're empty (for edit)
		if (!dto.password) {
			delete dto.password;
			delete dto.repeatPassword;
		}
		
		console.log('onSave - final dto:', dto);
	}, []);

	return (
		<AuthorizedPage isPending={isPending} error={error}>
			<PageTitle title="Benutzerübersicht" />
			<DataTable
				columns={columns}
				data={data}
				actions={actions}
				idColumn="id"
				createButton={user?.isAdmin && <ButtonCreate text="Neuer Benutzer" onClick={createUser} />}
			/>
			
			{/* Create Form */}
			<PopupForm
				name="Neuen Benutzer"
				endpoint="/UserResource/SaveUserDetails"
				getEndpoint="/UserResource/GetUserDetailsById"
				defaultDto={defaultUserDetailsDto}
				idColumn="id"
				onSave={onSave}
				errorProperty="username"
				fields={fields}
				twoColumns={false}
				{...popupCreateFormProperties}
			/>
			
			{/* Edit Form - Only render when we have a valid selectedId */}
			{selectedId > 0 && (
				<PopupForm
					key={`edit-${selectedId}`} // Force re-render when ID changes
					name="Benutzer"
					endpoint="/UserResource/SaveUserDetails"
					getEndpoint="/UserResource/GetUserDetailsById"
					defaultDto={defaultUserDetailsDto}
					fields={fields}
					idColumn="id"
					onSave={onSave}
					adjustData={adjustEditData}
					id={selectedId}
					errorProperty="username"
					{...popupEditFormProperties}
				/>
			)}
			
			{/* Delete Popup - Only render when we have a valid selectedId */}
			{selectedId > 0 && (
				<PopupDelete
					shortName="Benutzer"
					longName="diesen Benutzer"
					endpoint="/UserResource/DeletedUserById"
					id={selectedId}
					{...popupDeleteProperties}
				/>
			)}
		</AuthorizedPage>
	);
}