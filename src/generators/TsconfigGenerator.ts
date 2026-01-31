import { Generator } from "./base/Generator";
/**
 * TsconfigGenerator: creates tsconfig.json for ts projects.
 */
export class TsconfigGenerator extends Generator {
	// Generates the tsconfig.json file
	async generate(): Promise<void> {
		if (!this.blueprint.isTypescript) {
			return;
		}
		const templateData = {
			isESM: this.blueprint.isESM,
			hasDatabase: this.blueprint.hasDatabase,
		};
		await this.renderTemplate(
			"base/tsconfig.json.hbs",
			"tsconfig.json",
			templateData,
		);
	}
}
