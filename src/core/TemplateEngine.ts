import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";

/**
 * TemplateEngine: Centralised template loading, compilation, and rendering.
 */

export class TemplateEngine {
  //Absolute path to templates directory.
  private readonly templatesRoot: string;

  //Compiled template cache.
  private readonly templateCache: Map<string, HandlebarsTemplateDelegate> =
    new Map();

  // Handlebars instance with registered helpers.
  private readonly handlebars: typeof Handlebars;

  constructor(templatesRoot?: string) {
    this.templatesRoot = templatesRoot || path.join(__dirname, "../templates");
    this.handlebars = Handlebars.create();
    this.registerHelper();
  }
  //Public API
  /**
   * What it does: Render a handlebars template with provided data.
   */
  render(templatePath: string, data: object): string {
    //Loads or retrieves from cache
    const template = this.getCompiledTemplate(templatePath);
    //Executes template function with data.
    return template(data);
  }

  /**
   * Read a static file without Handlebars processing.
   */
  readStatic(sourcePath: string): string {
    const fullPath = this.resolveTemplatePath(sourcePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(
        `Static file not found: ${sourcePath}\nExpected at: ${fullPath}`,
      );
    }
    return fs.readFileSync(fullPath, "utf-8");
  }
  /**
   * Clear the template cache.
   */
  clearCache(): void {
    this.templateCache.clear();
  }
  /**
   * Check if a template exists without loading it.
   */
  templateExists(templatePath: string): boolean {
    const fullPath = this.resolveTemplatePath(templatePath);
    return fs.existsSync(fullPath);
  }

  // Private helpers
  /**
   * Load and compile a template(with caching).
   */
  private getCompiledTemplate(
    templatePath: string,
  ): HandlebarsTemplateDelegate {
    //Cache hit-return immediately
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }
    // Cache miss-compile and store
    const template = this.loadAndCompileTemplate(templatePath);
    this.templateCache.set(templatePath, template);
    return template;
  }
  /**
   * Load template file from disk and compile it.
   */
  private loadAndCompileTemplate(
    templatePath: string,
  ): HandlebarsTemplateDelegate {
    const fullPath = this.resolveTemplatePath(templatePath);
    //Validate existence before reading
    if (!fs.existsSync(fullPath)) {
      throw new Error(
        `Template not found: ${templatePath}\nExpected at: ${fullPath}\n\n` +
          `Available templates: Run 'ls ${this.templatesRoot}' to see what exists.`,
      );
    }
    //Read template source
    const source = fs.readFileSync(fullPath, "utf-8");
    //Compile with Handlebars
    try {
      return this.handlebars.compile(source);
    } catch (e) {
      throw new Error(
        `Failed to compile template: ${templatePath}\n` +
          `Handlebars error: ${(e as Error).message}`,
      );
    }
  }
  /**
   * Convert relative template path to absolute filesystem path.
   */
  private resolveTemplatePath(relativePath: string): string {
    return path.join(this.templatesRoot, relativePath);
  }
  /**
   * Register custom Handlebars helpers for template logic.
   */
  registerHelper(): void {
    //Helper: eq(equality check)-prevents data preprocessing
    this.handlebars.registerHelper("eq", function (a: any, b: any): boolean {
      return a === b;
    });
    //Helper: ne(not equal)
    this.handlebars.registerHelper("ne", function (a: any, b: any): boolean {
      return a !== b;
    });
    //Helper: includes(array membership)
    this.handlebars.registerHelper(
      "includes",
      function (array: any[], value: any): boolean {
        return Array.isArray(array) && array.includes(value);
      },
    );
    // Helper: or(logical OR)
    this.handlebars.registerHelper("or", function (...args: any[]): boolean {
      const values = args.slice(0, -1);
      return values.some(Boolean);
    });
    // Helper: and(logical AND)
    this.handlebars.registerHelper("and", function (...args: any[]): boolean {
      const values = args.slice(0, -1);
      return values.every(Boolean);
    });
    // Helper: not(logical NOT)
    this.handlebars.registerHelper("not", function (value: any): boolean {
      return !value;
    });
    // Helper: JSON(debug helper)
    this.handlebars.registerHelper("json", function (context: any): string {
      return JSON.stringify(context, null, 2);
    });
    // Helper: capitalize(string transformation)
    this.handlebars.registerHelper(
      "capitalize",
      function (str: string): string {
        if (typeof str !== "string") return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
    );
    // Helper: pascalCase(naming convention)
    this.handlebars.registerHelper(
      "pascalCase",
      function (str: string): string {
        if (typeof str !== "string") return "";
        return str
          .split(/[-_\s]+/)
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join("");
      },
    );
    // Helper: camelCase
    this.handlebars.registerHelper("camelCase", function (str: string): string {
      if (typeof str !== "string") return "";
      const pascal = str
        .split(/[-_\s]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join("");
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });
  }
}
