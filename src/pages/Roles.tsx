/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useCallback, useState } from "react";
import ButtonCreate from "../components/ButtonCreate.tsx";
import { useApiQuery } from "../helpers/api.ts";
import { usePopup } from "../helpers/popup.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import type { Action, ColumnDefinition } from "../components/DataTable.tsx";
import PageTitle from "../components/PageTitle.tsx";
import DataTable from "../components/DataTable.tsx";
import PopupDelete from "../components/PopupDelete.tsx";
import PopupForm, { type FieldDefinition } from "../components/PopupForm.tsx";
import type TagDto from "../models/TagDto.ts";
import type RoleDetailsDto from "../models/RoleDetailsDto.ts";
import { defaultRoleDetailsDto } from "../models/RoleDetailsDto.ts";

/** Roles page manages user roles and their associated permissions (Wohnbereiche). */
export default function Roles() {
  const { isPending, error, data } = useApiQuery<TagDto[]>(
    "/RoleResource/GetRoles"
  );
  
  const [id, setId] = useState<number>(0);
  const [popupCreateFormProperties, openPopupCreateForm] = usePopup();
  const [popupEditFormProperties, openPopupEditForm] = usePopup();
  const [popupDeleteProperties, openPopupDelete] = usePopup();
  
  // Create state for form data instead of mutating the default
  const [createFormData, setCreateFormData] = useState<RoleDetailsDto>({ ...defaultRoleDetailsDto });
  const [editFormData, setEditFormData] = useState<RoleDetailsDto>({ ...defaultRoleDetailsDto });



  // Create a more explicit transformation
  const tableData = data?.map((item) => {
    return {
      id: item.id,
      name: item.role || item.name || "Nicht eingetragen",
      originalItem: item
    };
  }) || [];

  const columns: ColumnDefinition<any>[] = [
    { 
      propertyKey: "name", 
      header: "Name", 
      isTitle: true,
    },
  ];

  const createRole = useCallback(() => {
    // Create fresh object for new role
    setCreateFormData({
      ...defaultRoleDetailsDto,
      name: "",
      role: ""
    });
    openPopupCreateForm();
  }, [openPopupCreateForm]);

  const actions: Action<any>[] = [
    {
      icon: "bx-pencil",
      label: "Bearbeiten",
      handler: (id, rowData) => {
        console.log("Edit clicked - id:", id, "rowData:", rowData);
        setId(id);
        
        // Create fresh object for edit with the row data
        const original = rowData.originalItem || rowData;
        setEditFormData({
          ...defaultRoleDetailsDto,
          id: original.id,
          name: original.name || original.role || "",
          role: original.role || original.name || ""
        });
        
        openPopupEditForm();
      },
    },
    {
      icon: "bx-trash",
      label: "Löschen",
      handler: (id) => {
        setId(id);
        openPopupDelete();
      },
    },
  ];

  const fields = useCallback(
    (): FieldDefinition<RoleDetailsDto>[] => [
      { propertyKey: "role", label: "Name", required: true, maxLength: 255 },
      { emptySpace: true },
    ],
    []
  );

  return (
    <AuthorizedPage isPending={isPending} error={error}>
      <PageTitle title="Rollen" />
      <DataTable
        columns={columns}
        data={tableData}
        actions={actions}
        idColumn="id"
        createButton={<ButtonCreate text="Neue Rolle" onClick={createRole} />}
      />
      
      {/* Create Popup - uses createFormData */}
      <PopupForm
      key={`create-${JSON.stringify(createFormData)}`}
        name="Neue Rolle"
        endpoint="/RoleResource/SaveRoleDetails"
        fields={fields}
        // getEndpoint="/RoleResource/GetRoleDetailsById"
        defaultDto={createFormData}
        idColumn="id"
        errorProperty="name"
        {...popupCreateFormProperties}
      />
      
      {/* Edit Popup - uses editFormData */}
      <PopupForm
      key={`edit-${id}-${JSON.stringify(editFormData)}`} 
        name="Rolle"
        endpoint="/RoleResource/UpdateRoleDetails"
        getEndpoint="/RoleResource/GetRoleDetailsById"
        defaultDto={editFormData}
        fields={fields}
        id={id}
        idColumn="id"
        errorProperty="name"
        {...popupEditFormProperties}
      />
      
      <PopupDelete
        shortName="Rolle"
        longName="diese Rolle"
        endpoint="/RoleResource/DeletedRoleById"
        id={id}
        {...popupDeleteProperties}
      />
    </AuthorizedPage>
  );
}