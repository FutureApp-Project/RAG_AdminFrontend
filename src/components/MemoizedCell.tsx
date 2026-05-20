/* Copyright (C) 2025, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import {Icon} from "@iconify-icon/react";
import { flexRender, type Cell} from "@tanstack/react-table";
import React, { type ReactElement, type ReactNode } from "react";
import {Avatar, Box, Collapse, Stack, styled, Typography, useTheme} from "@mui/material";
import {renderToStaticMarkup} from "react-dom/server";

const CardRow = styled(Box)(() => ({
	display: "flex",
	mb: 0.5,
	alignItems: "baseline",
}));

/** Renders a single label-value pair inside a card. */
export default React.memo(
	function MemoizedCell({cell, headerLabel, icon, contentOnly, defaultValue}: {
		cell: Cell<unknown, unknown>;
		headerLabel?: ReactNode;
		icon?: ReactElement | ((cell: Cell<unknown, unknown>) => ReactElement);
		contentOnly?: boolean;
		cmpKey?: (data: unknown) => string,
		defaultValue?: string;
	}) {
		const theme = useTheme();
		const prerendered = flexRender(cell.column.columnDef.cell, cell.getContext());
		const rendered = renderToStaticMarkup(prerendered) ? prerendered : (defaultValue ?? "Nicht eingetragen");
		if (contentOnly && icon) {
			return <>{typeof icon == "function" ? icon(cell) : icon} {rendered}</>;
		} else if (contentOnly) {
			return rendered;
		} else if (!headerLabel && !icon) {
			return <CardRow>{rendered}</CardRow>;
		}
        return (
            <Collapse key={JSON.stringify(cell.getValue())} in timeout={800}>
                <CardRow>
                    <Stack direction="row" alignItems="center" spacing={2} mt={1}>
                        <Avatar
                            sx={{
                                bgcolor: "transparent",
                                color: theme.palette.primary.main,
                                width: 30,
                                height: 30,
                                px: 2,
                            }}
                        >
                            {icon && (typeof icon == "function" ? icon(cell) : icon)}
                            {!icon && <Icon icon="tabler:mail" width={20}/>}
                        </Avatar>
                        {headerLabel && <Box>
                            <Typography sx={{
                                wordBreak: 'break-word', fontSize: '0.875rem',
                                fontWeight: 600,

                                color: 'rgba(0, 0, 0, 0.87)', // Dark color for headers
                                display: 'inline-block',
                                minWidth: '100px',
                                verticalAlign: 'top'
                            }}>
                                {headerLabel}
                            </Typography>
                            <Typography color="textSecondary" sx={{
                                wordBreak: 'break-word', fontSize: '0.875rem',
                                fontWeight: 500,
                            }}>
                                {rendered}
                            </Typography>
                        </Box>}
                        {!headerLabel && <Typography sx={{
                            wordBreak: 'break-word', fontSize: '0.875rem',
                            fontWeight: 600,

                            color: 'rgba(0, 0, 0, 0.87)', // Dark color for headers

                            minWidth: '100px',
                            verticalAlign: 'top'
                        }}>
                            {rendered}
                        </Typography>}
                    </Stack>
                </CardRow>
            </Collapse>
        );
	},
	(prev, next) =>
		JSON.stringify({value: prev.cell.getValue(), key: prev.cmpKey?.(prev.cell.row.original)}) ===
		JSON.stringify({value: next.cell.getValue(), key: next.cmpKey?.(next.cell.row.original)})
);