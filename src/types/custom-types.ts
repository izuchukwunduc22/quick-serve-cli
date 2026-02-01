export type folderStructureData = Array<{
	path: string;
	required: boolean;
	purpose: string;
}>;

export type envVarsData = Array<{
	key: string;
	value: string;
	example: string;
	comments?: string;
}>;
