/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
/**
 * Formatting helpers for dates, times, and numbers in German locale.
 */
export function formatDate(isoDatetime: string, withWeekday = false): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Europe/Berlin",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	};
	if (withWeekday) {
		options.weekday = "long";
	}
	const formatter = new Intl.DateTimeFormat("de-DE", options);
	return formatter.format(new Date(isoDatetime));
}

/**
 * Formats an ISO date string to a short German date string.
 * @param isoDatetime The ISO date string
 * @return Short formatted date string
 */
export function formatDateShort(isoDatetime: string): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Europe/Berlin",
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	};
	const formatter = new Intl.DateTimeFormat("de-DE", options);
	return formatter.format(new Date(isoDatetime));
}

/**
 * Formats an ISO date string to a German datetime string.
 * @param isoDatetime The ISO date string
 * @param localizedFormat Whether to use localized format
 * @return Formatted datetime string
 */
export function formatDatetime(isoDatetime: string, localizedFormat = false): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	};
	if (!localizedFormat) {
		options.month = "2-digit";
		options.day = "2-digit";
		options.hour = "2-digit";
		options.second = "2-digit";
		options.hourCycle = "h23";
	}
	const formatter = new Intl.DateTimeFormat("de-DE", options);
	const datetime = new Date(isoDatetime);
	if (localizedFormat) {
		return `${formatter.format(datetime)} Uhr`;
	}
	const formatted = formatter
		.formatToParts(datetime)
		.reduce<Record<string, string>>((acc, part: Intl.DateTimeFormatPart) => {
			if (part.type !== "literal") {
				acc[part.type] = part.value;
			}
			return acc;
	}, {});
	return `${formatted.year}-${formatted.month}-${formatted.day} ${formatted.hour}:${formatted.minute}:${formatted.second}`;
}

/**
 * Formats milliseconds to a mm:ss or mm:ss,ms string.
 * @param ms Milliseconds
 * @param withMs Whether to include milliseconds
 * @return Formatted time string
 */
export function formatTime(ms: number, withMs = true): string {
	const min = Math.floor(ms / 60000);
	const sec = ms / 1000 - min * 60;
	return (
		min.toString().padStart(2, "0") + ":" +
		(withMs ?
			sec.toFixed(2).padStart(5, "0").replace(".", ",") :
			Math.floor(sec).toString().padStart(2, "0")
		)
	);
}

/**
 * Returns a human-readable string for the time since the given ISO date.
 * @param isoDatetime The ISO date string
 * @return Time since string
 */
export function formatTimeSince(isoDatetime: string): string {
	const date = new Date(isoDatetime);
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	let interval = Math.floor(seconds / 31536000);
	if (interval >= 1) {
		return `${interval} Jahr${interval > 1 ? "en" : ""}`;
	}
	interval = Math.floor(seconds / 2592000);
	if (interval >= 1) {
		return `${interval} Monat${interval > 1 ? "en" : ""}`;
	}
	interval = Math.floor(seconds / 86400);
	if (interval >= 1) {
		return `${interval} Tag${interval > 1 ? "en" : ""}`;
	}
	interval = Math.floor(seconds / 3600);
	if (interval >= 1) {
		return `${interval} Stunde${interval > 1 ? "n" : ""}`;
	}
	interval = Math.floor(seconds / 60);
	if (interval >= 1) {
		return `${interval} Minute${interval > 1 ? "n" : ""}`;
	}
	return `${seconds} Sekunde${interval > 1 ? "n" : ""}`;
}

/**
 * Formats a number to German locale with up to 2 decimal places.
 * @param number The number to format
 * @return Formatted number string
 */
export function formatNumber(number: number): string {
	const formatter = new Intl.NumberFormat("de-DE", {maximumFractionDigits: 2});
	return formatter.format(number);
}
