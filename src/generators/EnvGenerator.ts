import { envVarsData } from "@/types/custom-types";
import { Generator } from "./base/Generator";

/**
 * EnvGenerator: Creates the environment variable file
 */
export class EnvGenerator extends Generator {
	async generate(): Promise<void> {
		const vars = this.getEnvVars();

		const envContent = this.buildEnvFile(vars, false);
		await this.writeFile(".env", envContent);

		const envExampleContent = this.buildEnvFile(vars, true);
		await this.writeFile(".env.example", envExampleContent);
	}
	private getEnvVars(): envVarsData {
		const vars: envVarsData = [];

		vars.push({
			key: "NODE_ENV",
			value: "development",
			example: "development",
			comments: "Application environment(development, production, test)",
		});
		vars.push({
			key: "PORT",
			value: "3000",
			example: "3000",
			comments: "The Port the server will listen to",
		});
		if (this.blueprint.hasDatabase) {
			vars.push({
				key: "DATABASE_URL",
				value: this.getDbUrl(false),
				example: this.getDbUrl(true),
				comments: "Database connection string",
			});
		}
		if (this.blueprint.orm === "prisma") {
			vars.push({
				key: "SHADOW_DATABASE_URL",
				value: this.getDbUrl(false, true),
				example: this.getDbUrl(true, true),
				comments: "Prisma shadow database for safe migrations(dev only)",
			});
		}
		return vars;
	}
	private getDbUrl(isExample: boolean, isShadow: boolean = false): string {
		const db = this.blueprint.database;
		if (db === "sqlite") {
			const filename = isShadow ? "shadow.db" : "dev.db";
			return `file:./${filename}`;
		}
		const dbName =
			isExample ?
				this.getExampleDbName(isShadow)
			:	this.getDefaultDbName(isShadow);
		switch (db) {
			case "postgres":
				return this.buildPostgresUrl(dbName, isExample);
			case "mysql":
				return this.buildMySqlUrl(dbName, isExample);
			case "mongo":
				return this.buildMongoUrl(dbName);
			default:
				throw new Error(`Unsupported db: ${db}`);
		}
	}
	private getDefaultDbName(isShadow: boolean): string {
		const base = this.blueprint.projectName.replace(/-/g, "_");
		return isShadow ? `${base}_shadow` : base;
	}
	private getExampleDbName(isShadow: boolean): string {
		const base = "mydb";
		return isShadow ? `${base}_shadow` : base;
	}
	private buildPostgresUrl(dbName: string, isExample: boolean): string {
		const user = "postgres";
		const pass = isExample ? "pass123" : "postgres";
		const host = "localhost";
		const port = "5432";
		return `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
	}
	private buildMySqlUrl(dbName: string, isExample: boolean): string {
		const user = "root";
		const pass = isExample ? "pass123" : "root";
		const host = "localhost";
		const port = "3306";
		return `mysql://${user}:${pass}@${host}:${port}/${dbName}`;
	}
	private buildMongoUrl(dbName: string): string {
		const host = "localhost";
		const port = "27017";
		return `mongodb://${host}:${port}/${dbName}`;
	}
	private buildEnvFile(vars: envVarsData, isExample: boolean): string {
		const lines: string[] = [];
		if (isExample) {
			lines.push("# Environment Variable Template");
			lines.push("# Copy this .env and fill in your actual values");
			lines.push("");
		}
		for (const v of vars) {
			if (v.comments) {
				lines.push(`# ${v.comments}`);
			}
			const value = isExample ? v.example : v.value;
			lines.push(`${v.key}=${value}`);
			lines.push("");
		}
		return lines.join("\n");
	}
}
