/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { Typography } from "@mui/material";

/** PageTitle displays the title of a page or section. */
export default function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <Typography sx={{ color: "primary.main", fontSize: { xs: '1.6rem', sm: '2.2rem' }, lineHeight: 1.15, wordBreak: 'break-word' }} variant="h1">
        {title}
      </Typography>
      {subtitle ? (
        <Typography sx={{ color: "text.secondary", mb: 2 }} variant="body2">
          {subtitle}
        </Typography>
      ) : null}
    </>
  );
}
