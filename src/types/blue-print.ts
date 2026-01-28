import { BluePrintData } from "./blue-print-data";
import { ext, importStyle, language } from "./union-types";

/**
 * Blueprint: The immutable project configuration that drives all generation.
 *
 * Design philosophy:
 * - Immutable: Once created, cannot be modified.
 * - Intent-revealing: Methods/getters expose semantic meaning, not raw data.
 * - Domain-focused: Groups related concerns.
 */
export class BluePrint {
  private readonly data: BluePrintData;

  constructor(data: BluePrintData) {
    this.data = Object.freeze({ ...data });
    this.validate();
  }

  //Core properties
  get projectName(): string {
    return this.data.projectName;
  }
  get targetPath(): string {
    return this.data.targetPath;
  }
  get language(): language {
    return this.data.language;
  }
  get importStyle(): importStyle {
    return this.data.importStyle;
  }
  get database(): BluePrintData["database"] {
    return this.data.database;
  }
  get orm(): BluePrintData["orm"] {
    return this.data.orm;
  }

  //Language helpers
  get isTypescript(): boolean {
    return this.data.language === "typescript";
  }
  get isJavascript(): boolean {
    return this.data.language === "javascript";
  }
  get fileExtension(): ext {
    return this.isTypescript ? "ts" : "js";
  }
  get isESM(): boolean {
    return this.data.importStyle === "esm";
  }
  get isCommonJs(): boolean {
    return this.data.importStyle === "commonjs";
  }

  // DB helpers
  get hasDatabase(): boolean {
    return this.data.database !== "none";
  }
  get hasORM(): boolean {
    return this.data.orm !== "none";
  }
  get databaseConfig() {
    return {
      type: this.data.database,
      orm: this.data.orm,
      hasORM: this.hasORM,
      hasDatabase: this.hasDatabase,
    };
  }
  get isNoSQLDatabase(): boolean {
    return this.data.database === "mongo";
  }
  get isSQLDatabase(): boolean {
    return ["postgres", "mysql", "sqlite"].includes(this.data.database);
  }

  // Template selection helpers
  getServerTemplatePath(): string {
    return `server/${this.importStyle}-${this.language}.hbs`;
  }
  getHealthRouteTemplatePath(): string {
    return `routes/health-${this.language}.hbs`;
  }
  getDatabaseClientTemplatePath(): string | null {
    if (!this.hasORM) return null;
    const ormTemplates: Record<BluePrintData["orm"], string> = {
      prisma: "db/prisma-client.hbs",
      drizzle: "db/drizzle-client.hbs",
      mongoose: "db/mongoose-client.hbs",
      none: "",
    };
    return ormTemplates[this.data.orm];
  }

  // Package.json helpers
  // Gets runtime deps
  getRuntimeDependencies(): Record<string, string> {
    const deps: Record<string, string> = {
      express: "^4.18.2",
    };
    //Adds ORM clients
    if (this.data.orm === "prisma") {
      deps["@prisma/client"] = "^5.8.0";
    } else if (this.data.orm === "drizzle") {
      deps["drizzle-orm"] = "^0.29.3";
    } else if (this.data.orm === "mongoose") {
      deps["mongoose"] = "^8.1.0";
    }
    //Adds database drivers
    if (this.hasDatabase) {
      if (this.data.database === "postgres") {
        deps["pg"] = "^8.11.3";
      } else if (this.data.database === "mysql") {
        deps["mysql2"] = "^3.6.5";
      } else if (this.data.database === "sqlite") {
        deps["better-sqlite3"] = "^9.2.2";
      }
    }
    // Adds env variable handling
    deps["dotenv"] = "^16.3.1";
    return deps;
  }

  //gets dev deps
  getDevDependencies(): Record<string, string> {
    const deps: Record<string, string> = {
      nodemon: "^3.0.2",
    };

    if (this.isTypescript) {
      deps["typescript"] = "^5.3.3";
      deps["@types/node"] = "^20.11.0";
      deps["@types/express"] = "^4.17.21";
      deps["ts-node"] = "^10.9.2";
      if (this.data.database === "postgres") {
        deps["@types/pg"] = "^8.10.9";
      }
    }
    if (this.data.orm === "prisma") {
      deps["prisma"] = "^5.8.0";
    } else if (this.data.orm === "drizzle") {
      deps["drizzle-kit"] = "^0.20.10";
    }
    return deps;
  }
  //Scripts helpers
  getPackageScripts(): Record<string, string> {
    const scripts: Record<string, string> = {};
    if (this.isTypescript) {
      scripts["dev"] = "nodemon";
      scripts["build"] = "tsc";
      scripts["start"] = "node dist/server.js";
    } else {
      scripts["dev"] = "nodemon src/server.js";
      scripts["start"] = "node src/server.js";
    }
    //Adds orm-specific scripts
    if (this.data.orm === "prisma") {
      scripts["prisma:generate"] = "prisma generate";
      scripts["prisma:migrate"] = "prisma migrate dev";
      scripts["prisma:studio"] = "prisma studio";
    } else if (this.data.orm === "drizzle") {
      scripts["db:generate"] = "drizzle-kit generate:pg";
      scripts["db:push"] = "drizzle-kit push:pg";
      scripts["db:studio"] = "drizzle-kit studio";
    }
    return scripts;
  }

  //Validation
  private validate(): void {
    //Rule 1:MongoDB must use mongoose and none else.
    if (
      this.data.database === "mongo" &&
      this.data.orm !== "mongoose" &&
      this.data.orm !== "none"
    ) {
      throw new Error(
        `Invalid configuration: MongoDB requires Mongoose ORM, but got "${this.data.orm}"`,
      );
    }

    //Rule 2: SQL Databases must not use Mongoose
    if (this.isSQLDatabase && this.data.orm === "mongoose") {
      throw new Error(
        `Invalid configuration: SQL database "${this.data.database}"`,
      );
    }
    // Rule 3: Project name must follow npm conventions
    if (!/^[a-z0-9-_]+$/.test(this.data.projectName)) {
      throw new Error(
        `Invalid project name: "${this.data.projectName}". Must contain only lowercase letters, numbers, hyphens, and underscores`,
      );
    }
    //Rule 4: target path must be absolute
    if (!this.data.targetPath.startsWith("/")) {
      throw new Error(
        `Invalid target path: "${this.data.targetPath}". Must be an absolute path.`,
      );
    }
  }

  //Utility methods
  toJSON(): BluePrintData {
    return { ...this.data };
  }
  with(overrides: Partial<BluePrintData>): BluePrint {
    return new BluePrint({ ...this.data, ...overrides });
  }
}
