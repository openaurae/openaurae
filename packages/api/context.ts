export type AuthVariables = {
	userId: string;
	permissions: {
		readAll: boolean;
		updateAll: boolean;
	};
};
