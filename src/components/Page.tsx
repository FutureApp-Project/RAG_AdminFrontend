/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import styles from "../styles/Page.module.css";
import cryGirl from "../images/cryGirl.png";
import Spinner from "../layouts/full/shared/loadable/Spinner";
import type { ReactElement, ReactNode } from "react";

/**
 * Page is a layout wrapper for content received from the backend.
 * This component handles loading and error states.
 */
export default function Page(
	{isPending, error, children}: {isPending: boolean, error: Error | null, children: ReactNode}
): ReactElement {
	if (isPending) {
		return (
			<Spinner />
		);
	}

	if (error) {
		console.error(error);
		return (
			<>
				<div className={styles.errorContainer}>
					<div className={styles.errorContent}>
						<p className={styles.errorHeader}>Entschuldigung, du hast keine Berechtigung dafür.</p>
						<p className={styles.errorText}>Hoppla! Es sieht so aus, als hättest du keine
						Berechtigung für den Zugriff auf diese Funktion oder Ressource. Bitte
						stelle sicher, dass du mit dem richtigen Konto angemeldet bist, oder
						wende dich für Unterstützung an deinen Administrator.</p>
					</div>
					<div className={styles.errorImage}>
						<img src={cryGirl} alt="Error" />
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{children}
		</>
	);
}
