/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useContext, useMemo} from "react";
import {useNavigate} from "react-router";
import {AuthContext} from "../context/AuthContext.tsx";
import {useApiQuery} from "../helpers/api.ts";
import AuthorizedPage from "../components/AuthorizedPage.tsx";
import type { Action, ColumnDefinition } from "../components/DataTable.tsx";
import DataTable from "../components/DataTable.tsx";

import { defaultUserDetailsDto } from "../models/UserDetailsDto.ts";
import PageTitle from "../components/PageTitle.tsx";

import type UserDto from "../models/UserDto.ts";

const columns: ColumnDefinition<UserDto>[] = [
    {propertyKey: "name", header: "Login-Name", isTitle: true},
   
];

/** Users page manages the list of users and their details. */
export default function ChatHistory() {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);
    const {isPending, error, data} = useApiQuery<UserDto[]>("/UserResource/GetAllPatientUsers");
 
    const defaultDto = defaultUserDetailsDto;

   

    const actions: Action<UserDto>[] = useMemo(() =>[
        {icon: "bx-show", label: "Details", handler: userId => {
			navigate(`/userchat/${userId}`);
		}},
      
    ], [defaultDto, user]);

    

 

    return (
        <AuthorizedPage isPending={isPending} error={error}>
            <PageTitle title="Chatverlauf" />
            <DataTable
                columns={columns}
                data={data}
                actions={actions}
                idColumn="id"
                // createButton={user?.isAdmin && <ButtonCreate text="Neuer Benutzer" onClick={createUser} />}
            />
          
        </AuthorizedPage>
    );
}
