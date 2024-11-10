import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useCallback, useMemo } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error("Add URL of the API server to environment variables");
}

export function useApiClient() {
	const { getToken, userId } = useAuth();

	const getAccessToken = useCallback(async () => {
		const token = await getToken();

		return token ? `Bearer ${token}` : null;
	}, [getToken]);

	const apiClient = useMemo(() => {
		return axios.create({
			baseURL: API_BASE_URL,
		});
	}, []);

	return {
		apiClient,
		getAccessToken,
		userId,
	};
}
