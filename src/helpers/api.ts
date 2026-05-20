/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import {useContext, useEffect} from "react";
import {useLocation, useNavigate} from "react-router";
import config from "../config.ts";
import {AuthContext} from "../context/AuthContext.tsx";
import {BlobConverter} from "./blob.ts";

const headers = {
	"Accept": "application/json",
	"Content-Type": "application/json",
};

/**
 * useApiQuery fetches data from the API using React Query.
 * @param endpoint The API endpoint
 * @param options Optional React Query options
 * @param cache If false, invalidates cache on location change
 * @param nullOn404 If true, resolves to null instead of throwing on 404
 * @return React Query result object
 */
export function useApiQuery<T>(
	endpoint: string,
	options: Partial<UseQueryOptions<T>> = {},
	cache = false,
	nullOn404 = false,
) {
	const location = useLocation();
	const queryClient = useQueryClient();
	const {token} = useContext(AuthContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!cache) {
			queryClient.invalidateQueries({queryKey: [endpoint, token]});
		}
	}, [location]);

	return useQuery<T>({
		queryKey: [endpoint, token],
		queryFn: async () => {
			console.log(`Fetching data from: ${config.BASE_URL + endpoint}`);
			const response = await fetch(config.BASE_URL + endpoint, {
				method: "GET",
				headers: {...headers, "Authorization": `Bearer ${token}`},
			});
			if (response.status == 401) {
				navigate("/logout");
			}
			if (response.status == 404 && nullOn404) {
				return null as T;
			}
			if (!response.ok) {
				throw new Error(`HTTP status ${response.status}`);
			}
			return response.json();
		},
		staleTime: Infinity,
		...options,
	});
}

/**
 * usePdf fetches a PDF from the API and triggers a download.
 * @param endpoint The API endpoint
 * @param filename The filename for the downloaded PDF
 * @param data Optional POST data
 * @param options Optional React Query options
 * @return React Query result object
 */
export function usePdf(
	endpoint: string, filename: string,
	data: object | null = null, options: Partial<UseQueryOptions<Blob>> = {}
) {
	const {token} = useContext(AuthContext);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const queryKey = ([endpoint, token] as QueryKey).concat(data ?? []);

	const query = useQuery<Blob>({
		queryKey,
		queryFn: async () => {
			const options: RequestInit = {
				method: (data ? "POST" : "GET"),
				headers: {
					"Accept": "application/pdf",
					"Authorization": `Bearer ${token}`,
				},
			};
			if (data) {
				const formData = new FormData();
				for (const [key, value] of Object.entries(data)) {
					formData.append(key, value);
				}
				if (BlobConverter.savedBlob) {
					const uniqueFileName = `divImage_${new Date().toISOString().replace(/[-:.]/g, "")}.png`;
					formData.append("image", BlobConverter.savedBlob, uniqueFileName);
				}
				options.body = formData;
			}
			const response = await fetch(config.BASE_URL + endpoint, options);
			if (response.status == 401) {
				navigate("/logout");
			}
			if (!response.ok) {
				throw new Error(`HTTP status ${response.status}`);
			}
			return response.blob();
		},
		staleTime: Infinity,
		...options,
	});

	useEffect(() => {
		queryClient.invalidateQueries({queryKey: [endpoint, token]});
	}, [location]);

	useEffect(() => {
		if (!filename || query.isPending || query.error || !query.data) {
			return;
		}

		const blobUrl = URL.createObjectURL(query.data);
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = filename;
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(blobUrl);
		// setHasDownloaded(true);
		navigate(-1);
	}, [query.data]);

	return query;
}

/**
 * useVideo fetches a video file from the API.
 * @param endpoint The API endpoint
 * @param options Optional React Query options
 * @return React Query result object
 */
export function useVideo(
	endpoint: string, options: Partial<UseQueryOptions<Blob>> = {}
) {
	const {token} = useContext(AuthContext);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const query = useQuery<Blob>({
		queryKey: [endpoint, token],
		queryFn: async () => {
			const response = await fetch(config.BASE_URL + endpoint, {
				method: "GET",
				headers: {
					"Accept": "video/*",
					"Authorization": `Bearer ${token}`,
				},
			});
			if (response.status == 401) {
				navigate("/logout");
			}
			if (!response.ok) {
				throw new Error(`HTTP status ${response.status}`);
			}
			return response.blob();
		},
		staleTime: Infinity,
		...options,
	});

	useEffect(() => {
		queryClient.invalidateQueries({queryKey: [endpoint, token]});
	}, [location]);

	return query;
}

/**
 * useApiMutation performs a POST request to the API.
 * @param endpoint The API endpoint
 * @param ignore401 If true, does not auto-logout on 401
 * @return React Query mutation object
 */
export function useApiMutation(endpoint: string, ignore401 = false) {
	const {token} = useContext(AuthContext);
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (data: object) => {
			  console.log(`Sending request to: ${config.BASE_URL + endpoint}`);
               console.log('Request data:', data);
			const response = await fetch(config.BASE_URL + endpoint, {
				method: "POST",
				headers: {...headers, "Authorization": `Bearer ${token}`},
				body: JSON.stringify(data),
			});
			  console.log(`Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
			if (response.status == 401 && !ignore401) {
				navigate("/logout");
			}
			if (!response.ok) {
				throw new Error(`HTTP status ${response.status}`);
			}
			const responseText = await response.text();
			if (!responseText) {
				return null;
			}
			try {
				console.log('Response text:', responseText);
				return JSON.parse(responseText);
			} catch {
				return responseText;
			}
		}
	});
}

/**
 * useApiDelete performs a DELETE request to the API.
 * @param endpoint The API endpoint
 * @return React Query mutation object
 */
export function useApiDelete(endpoint: string) {
	const {token} = useContext(AuthContext);
	const navigate = useNavigate();
	console.log(`Sending DELETE request to: ${config.BASE_URL + endpoint}`);
	return useMutation({
			
		mutationFn: async () => {
			console.log(`Sending DELETE request to: ${config.BASE_URL + endpoint}`);	
			const response = await fetch(config.BASE_URL + endpoint, {
				method: "DELETE",
				headers: {...headers, "Authorization": `Bearer ${token}`},
			});
			if (response.status == 401) {
				navigate("/logout");
			}
			if (!response.ok) {
				console.log(`DELETE request failed with status: ${response.status}`);
				throw new Error(`HTTP status ${response.status}`);
			}
			if (response.status == 204) {
				console.log("DELETE request successful with no content.");
				return true;
			}
			//console.log("delete response ",  response.json());
			return response.json();
		}
	});
}
