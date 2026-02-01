import { Generator } from "./base/Generator";
/**
 * RoutesGenerator: Creates routes and their corresponding handlers.
 */
export class RouteGenerator extends Generator {
	// Generates the routes and controllers
	async generate(): Promise<void> {
		const ext = this.blueprint.fileExtension;
		const tempData = {
			isTypeScript: this.blueprint.isTypescript,
			isESM: this.blueprint.isESM,
			hasDatabase: this.blueprint.hasDatabase,
		};
		await this.renderTemplate(
			"routes/health.hbs",
			`src/routes/health.${ext}`,
			tempData,
		);
		await this.renderTemplate(
			"controllers/healthController.hbs",
			`src/controllers/healthController.${ext}`,
			tempData,
		);
	}
}
