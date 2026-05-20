/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useContext} from "react";

import {AuthContext} from "../context/AuthContext.tsx";
import styles from "../styles/Error404.module.css";
import AuthorizedPage from "../components/AuthorizedPage.tsx";


/** Error404 page displays a not found error for invalid routes. */
export default function Error404() {
	const {user} = useContext(AuthContext);

	const errorText = <p className={user ? styles.error404 : styles.error404WithoutLogin}>Seite nicht gefunden.</p>;
	if (user) {
		return <AuthorizedPage>
			{errorText}
		</AuthorizedPage>;
	}
	return errorText;
}
