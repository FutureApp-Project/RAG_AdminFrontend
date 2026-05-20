import { reportClientError } from './errorReporter.ts';

type ConsoleLevel = 'error' | 'warn' | 'log' | 'info' | 'debug' | 'trace';

function normalizeArgs(args: unknown[]) {
	return args
		.map((arg) => {
			if (arg instanceof Error) {
				return arg.stack || arg.message;
			}
			if (typeof arg === 'string') {
				return arg;
			}
			try {
				return JSON.stringify(arg);
			} catch {
				return String(arg);
			}
		})
		.join(' ')
		.slice(0, 4000);
}

export function installRuntimeLogger() {
	const consoleRef = window.console;
	let isReporting = false;

	const report = (level: ConsoleLevel, args: unknown[]) => {
		if (isReporting) {
			return;
		}

		isReporting = true;
		try {
			reportClientError(`console-${level}`, normalizeArgs(args), {
				level,
			});
		} finally {
			isReporting = false;
		}
	};

	consoleRef.log = (...args: unknown[]) => report('log', args);
	consoleRef.info = (...args: unknown[]) => report('info', args);
	consoleRef.debug = (...args: unknown[]) => report('debug', args);
	consoleRef.trace = (...args: unknown[]) => report('trace', args);
	consoleRef.warn = (...args: unknown[]) => report('warn', args);
	consoleRef.error = (...args: unknown[]) => report('error', args);
}