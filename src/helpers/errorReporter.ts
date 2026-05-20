import config from "../config.ts";

type ErrorMetadata = Record<string, unknown>;
const REPORT_DEDUPE_WINDOW_MS = 30_000;
const REPORT_CACHE_LIMIT = 200;
const recentReports = new Map<string, number>();

function normalizeError(error: unknown): { message: string; stack?: string } {
	if (error instanceof Error) {
		return {
			message: error.message || "Unknown error",
			stack: error.stack,
		};
	}

	if (typeof error === "string") {
		return {message: error};
	}

	return {
		message: "Unknown error",
		stack: JSON.stringify(error),
	};
}

function hashFingerprint(input: string) {
	let hash = 0;

	for (let index = 0; index < input.length; index += 1) {
		hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
	}

	return hash.toString(16).padStart(8, "0");
}

function createFingerprint(
	source: string,
	normalized: { message: string; stack?: string },
	route: string,
	metadata: ErrorMetadata,
) {
	const rawFingerprint = [
		source,
		route,
		normalized.message,
		normalized.stack?.slice(0, 512) || "",
		JSON.stringify(metadata),
	].join("::");

	return `${source}:${route}:${hashFingerprint(rawFingerprint)}`.slice(0, 128);
}

function shouldSendReport(fingerprint: string) {
	const now = Date.now();

	for (const [key, timestamp] of recentReports.entries()) {
		if (now - timestamp > REPORT_DEDUPE_WINDOW_MS) {
			recentReports.delete(key);
		}
	}

	const previousTimestamp = recentReports.get(fingerprint);
	recentReports.set(fingerprint, now);

	if (recentReports.size > REPORT_CACHE_LIMIT) {
		const oldestKey = recentReports.keys().next().value;
		if (oldestKey) {
			recentReports.delete(oldestKey);
		}
	}

	return !previousTimestamp || now - previousTimestamp > REPORT_DEDUPE_WINDOW_MS;
}

export function reportClientError(
	source: string,
	error: unknown,
	metadata: ErrorMetadata = {},
) {
	const normalized = normalizeError(error);
	const route = window.location.pathname;
	const fingerprint = createFingerprint(source, normalized, route, metadata);

	if (!shouldSendReport(fingerprint)) {
		return;
	}

	const payload = {
		app: "adminfrontend",
		source,
		message: normalized.message,
		fingerprint,
		stack: normalized.stack,
		url: window.location.href,
		route,
		userAgent: window.navigator.userAgent,
		metadata,
	};

	try {
		const body = JSON.stringify(payload);
		const endpoint = `${config.BASE_URL}/client-errors`;

		if (navigator.sendBeacon) {
			const blob = new Blob([body], {type: "application/json"});
			navigator.sendBeacon(endpoint, blob);
			return;
		}

		void fetch(endpoint, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body,
			keepalive: true,
		}).catch(() => undefined);
	} catch {
		// Never throw from error reporting.
	}
}