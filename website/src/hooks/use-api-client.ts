import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useMemo } from "react";
import useSWR from "swr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error("Add URL of the API server to environment variables");
}

export function useApiClient() {
	const { getToken } = useAuth();

	const { data: accessToken } = useSWR("accessToken", () => getToken());

	const apiClient = useMemo(() => {
		return axios.create({
			baseURL: API_BASE_URL,
		});
	}, []);

	return {
		accessToken,
		apiClient,
	};
}
