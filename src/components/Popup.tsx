/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import type { TransitionProps } from "@mui/material/transitions";
import React, { type ReactNode } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Fade,
} from "@mui/material";
import styles from "../styles/Popup.module.css";


const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Fade ref={ref} {...props} />;
});

/** Popup renders a modal dialog for displaying content or actions. */
export default function Popup(
	{
		title,
		isOpen,
		onClose,
		children,
		okInsteadOfCancel,
		disableClosing,
		disableClosingOnOverlayClick,
		fullWidth,
		maxWidth,
		firstButtonText,
		isButtonVisible,
		buttonText,
		buttonDisabled,
		onButtonClick,
		buttonVariant,
		buttonColor,
	}: {
		title: ReactNode;
		isOpen: boolean;
		onClose: () => void;
		children: ReactNode;
		okInsteadOfCancel?: boolean;
		disableClosing?: boolean;
		disableClosingOnOverlayClick?: boolean;
		fullWidth?: boolean;
		maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		firstButtonText?: string;
		isButtonVisible?: boolean;
		buttonText?: string;
		buttonDisabled?: boolean;
		onButtonClick?: () => void;
		buttonVariant?: string,
		buttonColor?: string,
	}
) {
	if (!isOpen) return null;

	const handleClose = (_: object, reason?: string) => {
		if (disableClosing) return;
		if (disableClosingOnOverlayClick && reason === "backdropClick") return;
		onClose();
	};

	const container = document.getElementById("popup-root") ?? undefined;

	return (
		<Dialog
			open={isOpen}
			TransitionComponent={Transition}
			TransitionProps={{ timeout: 800 }}
			onClose={handleClose}
			disableEscapeKeyDown={disableClosing}
			container={container}
			fullWidth={fullWidth}
			maxWidth={maxWidth ?? (fullWidth ? "lg" : "sm")}
			slotProps={{
				paper: {sx: {minWidth: 320, minHeight: 100, p: 1}}
			}}
		>
			<DialogTitle sx={{ display: "flex", alignItems: "center" }}>
				<span className={styles.popupTitle}>{title}</span>
			</DialogTitle>

			<DialogContent className={styles.popupContent}>{children}</DialogContent>

			<DialogActions>
				{!disableClosing && (
					<Button
						onClick={onClose}
					>
						{okInsteadOfCancel ? firstButtonText || "Ok" : firstButtonText || "Abbrechen"}
					</Button>
				)}

				{(isButtonVisible || (isButtonVisible === undefined && buttonText)) && (
					<Button
						onClick={onButtonClick}
						disabled={buttonDisabled}
						variant={buttonVariant as any}
						color={buttonColor as any ?? "secondary"}
					>
						{buttonText}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}
