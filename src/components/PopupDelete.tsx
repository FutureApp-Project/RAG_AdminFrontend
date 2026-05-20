/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useQueryClient} from "@tanstack/react-query";
import { useEffect, type ReactElement} from "react";
import {useApiDelete} from "../helpers/api.ts";
import Popup from "./Popup.tsx";
import Page from "./Page.tsx";

/** PopupDelete displays a confirmation dialog for deleting an entity. */
export default function PopupDelete(
	{shortName, longName, plural = false, endpoint, id, irreversibleWarning, isOpen, onClose, onDelete}: {
	shortName: string,
	longName: string,
	plural?: boolean,
	endpoint: string,
	id?: number,
	irreversibleWarning?: boolean;
	isOpen: boolean,
	onClose: () => void,
	onDelete?: () => void,
}): ReactElement {
	const mutation = useApiDelete((id !== undefined ? `${endpoint}/${id}` : endpoint));
	const queryClient = useQueryClient();
	useEffect(() => {
		mutation.reset();
	}, [isOpen]);
	useEffect(() => {
		if (mutation.status == "success") {
			queryClient.invalidateQueries();
			onDelete?.();
		}
	}, [queryClient, mutation.status]);
	const error = mutation.error ?? (
		mutation.isSuccess && mutation.data !== true ? new Error(`Data is ${mutation.data} (not true).`) : null
	);

	return <Popup
		title={mutation.isSuccess ? "" : `${shortName} löschen?`}
		isOpen={isOpen}
		onClose={onClose}
		onButtonClick={() => mutation.mutate()}
		buttonText="Löschen"
		okInsteadOfCancel={mutation.isSuccess}
		isButtonVisible={mutation.isIdle}
	>
		<Page isPending={mutation.isPending} error={error}>
			{mutation.isSuccess && <p>{shortName} {plural ? "wurden" : "wurde"} erfolgreich gelöscht!</p>}
			{!mutation.isSuccess && <p>
				Möchten Sie {longName} wirklich löschen?
				{irreversibleWarning && " Diese Aktion ist nicht mehr rückgängig zu machen!"}
			</p>}
		</Page>
	</Popup>;
}
