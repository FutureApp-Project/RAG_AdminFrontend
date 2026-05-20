/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {useCallback, useState} from "react";

/**
 * usePopup provides state and handlers for opening and closing a popup/modal.
 * @return Array with popup properties, open/close functions, and open state
 */
export function usePopup(): [
	popupProperties: { onClose: () => void; isOpen: boolean },
	openPopup: () => void,
	closePopup: () => void,
	isPopupOpen: boolean,
] {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const openPopup = useCallback(() => setIsPopupOpen(true), []);
	const closePopup = useCallback(() => setIsPopupOpen(false), []);
	const popupProperties = {isOpen: isPopupOpen, onClose: closePopup};
	return [popupProperties, openPopup, closePopup, isPopupOpen];
}
