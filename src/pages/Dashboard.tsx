/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */

import AuthorizedPage from "../components/AuthorizedPage.tsx";
import PageTitle from "../components/PageTitle.tsx";
import config from "../config.ts";

export default function Dashboard() {
  const isTitle = config.ASSESSMENT_CLINIC_NAME === "Bonn";
  return (
    <AuthorizedPage >
      <PageTitle title={isTitle ? "Dashboard" : "Dashboard"} />

     
    </AuthorizedPage>
  );
}
