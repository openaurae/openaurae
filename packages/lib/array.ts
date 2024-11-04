export function chunks<T>(array: T[], chunkSize = 10): T[][] {
	if (array.length === 0) {
		return [];
	}

	const chunks: T[][] = [];

	for (let i = 0; i < array.length; i = Math.min(i + chunkSize, array.length)) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	return chunks;
}
