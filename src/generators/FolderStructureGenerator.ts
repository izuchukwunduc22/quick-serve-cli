import { Generator } from "./base/Generator";
import { folderStructureData } from "@/types/custom-types";

/**
 * FolderStructureGenerator: Creates the base directory structure for the project.
 * Design decision: Folder structure as declarative data, not imperative code.
 * Philosophy:
 * - Only create folders when we are confident it will be used
 * - We won't create folder "just-in-case"
 * Principle: No empty folders(with exception for "docs/")
 * Design: Data-Driven Design(DDD)
 */
export class FolderStructureGenerator extends Generator {
  //Generates the folder structure using N-layered architecture.
  async generate(): Promise<void> {
    const folders = this.getFolderDefinitions();

    for (const folder of folders) {
      if (folder.required) {
        await this.createDirectory(folder.path);
      }
    }
  }
  private getFolderDefinitions(): folderStructureData {
    return [
      {
        path: "src",
        required: true,
        purpose: "Root source directory for all application code",
      },
      {
        path: "src/config",
        required: true,
        purpose: "Application configurations(env vars, constants, settings)",
      },
      {
        path: "src/routes",
        required: true,
        purpose: "Express route definitions(url->controller mapppings)",
      },
      {
        path: "src/controller",
        required: true,
        purpose: "Express route definitions(url->controller mappings)",
      },
      {
        path: "src/middlewares",
        required: true,
        purpose: "Express middleware(auth, validation, error-handling)",
      },
      {
        path: "src/services",
        required: true,
        purpose: "Business logic layer",
      },
      {
        path: "src/models",
        required: this.blueprint.hasDatabase,
        purpose: "Data models and schemas",
      },
      {
        path: "src/db",
        required: this.blueprint.hasDatabase,
        purpose: "db connection and client init",
      },
      {
        path: "docs",
        required: true,
        purpose: "Project documentation(setup, usage, API docs)",
      },
    ];
  }

  //For testing/debugging
  getRequiredFolders(): string[] {
    return this.getFolderDefinitions()
      .filter((f) => f.required)
      .map((f) => f.path);
  }
}
