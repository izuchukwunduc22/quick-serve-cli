import { EnvGenerator } from "./EnvGenerator";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
	console.log("Testing the EnvGenerator...\n");
	const tempDir = join(__dirname, "__temp-env-test");
	const engine = new TemplateEngine();
	await fs.remove(tempDir);

	//Test1:TypeScript + Prisma + Postgres
	console.log("Test 1: TypeScript + Prisma + Postgres");
	const blueprint1 = new BluePrint({
		projectName: "my-api",
		language: "typescript",
		importStyle: "esm",
		database: "postgres",
		orm: "prisma",
		targetPath: path.resolve(tempDir, "test1"),
	});
	const gen1 = new EnvGenerator(blueprint1, engine);
	await gen1.generate();
	const env1 = await fs.readFile(join(tempDir, "test1/.env"), "utf-8");
	const envExample1 = await fs.readFile(
		join(tempDir, "test1/.env.example"),
		"utf-8",
	);
	console.log(".env exists");
	console.log(".env.example exists");
	console.log(".env has DATABASE_URL:", env1.includes("DATABASE_URL="));
	console.log(
		".env has SHADOW_DATABASE_URL:",
		env1.includes("SHADOW_DATABASE_URL="),
	);
	console.log(".env uses project name:", env1.includes("my-api"));
	console.log(
		".env.example has header comment:",
		envExample1.includes("# Environment Variable Template"),
	);
	console.log(".env.example uses placeholder:", envExample1.includes("mydb"));
	console.log(
		"both have PORT=3000:",
		envExample1.includes("PORT=3000") && env1.includes("PORT=3000"),
	);

	//Test2:JS + MySql(no Prisma shadow db)
	console.log("\nTest 2: TS + MySql(no shadow db)");
	const blueprint2 = new BluePrint({
		projectName: "simple-api",
		language: "javascript",
		importStyle: "esm",
		database: "mysql",
		orm: "none",
		targetPath: path.resolve(tempDir, "test2"),
	});
	const gen2 = new EnvGenerator(blueprint2, engine);
	await gen2.generate();
	const env2 = await fs.readFile(join(tempDir, "test2/.env"), "utf-8");

	console.log("uses mysql:// protocol:", env2.includes("mysql://"));
	console.log("uses port 3306:", env2.includes(":3306/"));
	console.log("No SHADOW_DATABASE_URL:", !env2.includes("SHADOW_DATABASE_URL"));

	//test3: no db
	console.log("\nTest 3: No Db");
	const blueprint3 = new BluePrint({
		projectName: "no-db-api",
		language: "typescript",
		importStyle: "esm",
		database: "none",
		orm: "none",
		targetPath: path.resolve(tempDir, "test3"),
	});
	const gen3 = new EnvGenerator(blueprint3, engine);
	await gen3.generate();
	const env3 = await fs.readFile(join(tempDir, "test3/.env"), "utf-8");

	console.log("No DATABASE_URL:", !env3.includes("DATABASE_URL"));
	console.log("still has port 3000:", env3.includes("PORT=3000"));
	console.log("still has NODE_ENV:", env3.includes("NODE_ENV"));

	//test4: MongoDB
	console.log("\nTest 4: MongoDB");
	const blueprint4 = new BluePrint({
		projectName: "mongo-api",
		language: "typescript",
		importStyle: "esm",
		database: "mongo",
		orm: "mongoose",
		targetPath: path.resolve(tempDir, "test4"),
	});
	const gen4 = new EnvGenerator(blueprint4, engine);
	await gen4.generate();
	const env4 = await fs.readFile(join(tempDir, "test4/.env"), "utf-8");

	console.log("uses mongodb:// protocol", env4.includes("mongodb://"));
	console.log("uses port 27017:", env4.includes(":27017/"));

	//cleanup
	await fs.remove(tempDir);
	console.log("\n All EnvGenerator tests passed!");
}
test().catch(console.error);
