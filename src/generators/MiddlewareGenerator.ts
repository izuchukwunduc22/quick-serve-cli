import { Generator } from "./base/Generator";
/** Middleware generator: Creates Express middleware (error handling, 404 handler) */
export class MiddlewareGenerator extends Generator {
	async generate(): Promise<void> {
		const ext = this.blueprint.fileExtension;
		const templateData = {
			isTypeScript: this.blueprint.isTypescript,
			isESM: this.blueprint.isESM,
		};

		await this.renderTemplate(
			"middleware/errorHandler.hbs",
			`src/middlewares/errorHandler.${ext}`,
			templateData,
		);
		await this.renderTemplate(
			"middleware/notFoundHandler.hbs",
			`src/middlewares/notFoundHandler.${ext}`,
			templateData,
		);
	}
}
