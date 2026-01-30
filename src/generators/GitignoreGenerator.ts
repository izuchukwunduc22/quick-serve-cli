import { Generator } from "./base/Generator";

/**
 * GitignoreGenerator: Creates .gitignore file for the project.
 */
export class GitignoreGenerator extends Generator {
  // Generates .gitignore file.
  async generate(): Promise<void> {
    const templateData = {
      isTypeScript: this.blueprint.isTypescript,
      isJavaScript: this.blueprint.isJavascript,
      hasDatabase: this.blueprint.hasDatabase,
      orm: this.blueprint.orm,
      database: this.blueprint.database,
    };
    await this.renderTemplate(
      "base/.gitignore.hbs",
      ".gitignore",
      templateData,
    );
  }
}
