import path from "path";
import fs from "fs-extra";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";

/**
 * Generator: Abstract base class for all file generators.
 * Design philosophy: Implicit safety with explicit escape hatches.
 * Principle: Make the right thing easy, make the wrong thing hard.
 */
export abstract class Generator {
  //Tracks all filesystem paths created by this generator. Used by Orchestrator to enable rollback on failure.
  protected createdPaths: string[] = [];

  //Constructor with DI
  constructor(
    protected readonly blueprint: BluePrint,
    protected readonly templateEngine: TemplateEngine,
  ) {}

  //-------------
  //Abstract methods that subclasses must implement.
  //-------------
  // Generate files for this generator's domain.
  abstract generate(): Promise<void>;

  //-------------
  //Public API that is used by orchestrator.
  //-------------
  // Get all filesystem paths created by this generator.
  getCreatedPaths(): string[] {
    return Array.from(this.createdPaths);
  }

  //-------------
  //Protected utility that is available to subclasses.
  //-------------
  // Write content to a file, tracking it for rollback.
  protected async writeFile(relPath: string, content: string): Promise<void> {
    const absPath = this.resolveProjectPath(relPath);
    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, "utf-8");
    this.track(absPath);
  }
  // Creates a directory, and tracks it for rollback.
  protected async createDirectory(relPath: string): Promise<void> {
    const absPath = this.resolveProjectPath(relPath);
    await fs.ensureDir(absPath);
    this.track(absPath);
  }
  // Renders a handlebars template and writes to file.
  protected async renderTemplate(
    templatePath: string,
    targetRelPath: string,
    data?: object,
  ): Promise<void> {
    const content = this.templateEngine.render(
      templatePath,
      data || this.blueprint,
    );
    await this.writeFile(targetRelPath, content);
  }
  // Copy a static file from templates to project for files that doesn't need handlebars.
  protected async copyStaticFile(
    templatePath: string,
    targetRelPath: string,
  ): Promise<void> {
    const content = this.templateEngine.readStatic(templatePath);
    await this.writeFile(targetRelPath, content);
  }
  //Writes a JSON file with formatting
  protected async writeJSON(relPath: string, data: object): Promise<void> {
    const content = JSON.stringify(data, null, 2) + "\n";
    await this.writeFile(relPath, content);
  }
  //Check if a file or directory exists in the project, used for conditional generation.
  protected async pathExists(relPath: string): Promise<boolean> {
    const absPath = this.resolveProjectPath(relPath);
    return fs.pathExists(absPath);
  }

  //-------------
  //Private utility that is only available to base.
  //-------------
  //Converts relative project path to absolute filesystem path
  private resolveProjectPath(relPath: string): string {
    return path.join(this.blueprint.targetPath, relPath);
  }
  //Tracks a path for rollback.
  private track(absPath: string): void {
    if (!this.createdPaths.includes(absPath)) {
      this.createdPaths.push(absPath);
    }
  }
}
