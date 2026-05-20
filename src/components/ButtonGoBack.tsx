/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {Button} from "@mui/material";
import {useNavigate} from "react-router";

/** ButtonGoBack renders a button for navigating back to a previous page. */
export default function ButtonCreate({to, text}: {to: string, text?: string}) {
	const navigate = useNavigate();
	return <Button
			color="secondary"
			onClick={() => navigate(to)}
			sx={{my: 1}}
		>
			{text ?? "Zurück"}
		</Button>;
}
