/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {Icon} from "@iconify-icon/react";
import {Box, Button} from "@mui/material";
import type { MouseEventHandler } from "react";


/** ButtonCreate renders a button for creating new entities. */
export default function ButtonCreate({text, onClick}: {text: string, onClick: MouseEventHandler<HTMLButtonElement>}) {
    return <Box sx={{m: 2}}>
        <Button startIcon={<Icon icon="el:file-new" />} color="primary" onClick={onClick}>{text}</Button>
    </Box>;
}
