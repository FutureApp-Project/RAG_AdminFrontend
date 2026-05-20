/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import html2canvas from "html2canvas";

/**
 * Helper for converting HTML elements to Blob objects (e.g., for PDF/image export).
 */
export class BlobConverter {
	public static savedBlob: Blob | null;

	public static async saveElementToBlob(htmlElementId: string): Promise<void> {
		const canvas = await html2canvas(document.getElementById(htmlElementId)!);
		return new Promise((resolve) => {
			canvas.toBlob(blob => {
				BlobConverter.savedBlob = blob;
				resolve();
			});
		});
	}
}
