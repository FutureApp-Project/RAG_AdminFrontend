interface Config {
  BASE_URL: string;
  ALARM_HUB: string;
  WELCOME_MESSAGE: string;
  SHORT_TITLE: string;
  LONG_TITLE: string;
  CLINIC_NAME: string;
  CLINIC_ADDRESS: string;
  ASSESSMENT_CLINIC_NAME: string;
  SENSOR_TYPE: "camera" | "radar";
  ALARM_API_TYPE: "espax" | "novaalert" | "none";
  WITH_AMS_IOT: "" | "0" | "1";
}

export default (window as unknown as { __CONFIG__: Config }).__CONFIG__ ||
  ({
    BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:8000",
    ALARM_HUB:
      import.meta.env.VITE_ALARM_HUB || "http://localhost:8000/AlarmHub",
    WELCOME_MESSAGE:
      import.meta.env.VITE_WELCOME_MESSAGE ||
      "Willkommen im\nSmart Health Care",
    SHORT_TITLE: import.meta.env.BADGE_TEXT || "sCare",
    LONG_TITLE: import.meta.env.LOGO_TEXT || "Smart Health Care",
    CLINIC_NAME: import.meta.env.VITE_CLINIC_NAME || "Die Gesundheitsplattform",
    CLINIC_ADDRESS:
      import.meta.env.VITE_CLINIC_ADDRESS ||
      "Curata GmbH\nHaus am Rosengarten \nFrankfurt",
    ASSESSMENT_CLINIC_NAME:
      import.meta.env.VITE_ASSESSMENT_CLINIC_NAME || "Bonn",
    SENSOR_TYPE: import.meta.env.VITE_SENSOR_TYPE || "radar",
    ALARM_API_TYPE: import.meta.env.VITE_ALARM_API_TYPE || "none",
    WITH_AMS_IOT: import.meta.env.VITE_WITH_AMS_IOT || "0",
  } as Config);
