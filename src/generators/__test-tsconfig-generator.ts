import { TsconfigGenerator } from "./TsconfigGenerator";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
	console.log("Testing the TsconfigGenerator...\n");
	const tempDir = join(__dirname, "__temp-ts-config-json-test");
	await fs.remove(tempDir);
	const engine = new TemplateEngine();

	//Test1: TS + Prisma + Postgres
	console.log("Test 1: TS + ESM + DB");
	const blueprint1 = new BluePrint({
		projectName: "test-esm-db",
		language: "typescript",
		importStyle: "esm",
		database: "postgres",
		orm: "prisma",
		targetPath: path.resolve(tempDir, "test1"),
	});
	const gen1 = new TsconfigGenerator(blueprint1, engine);
	await gen1.generate();
	const pkg = await fs.readJSON(join(tempDir, "test1/tsconfig.json"));
	console.log(pkg);

	//Test2: TS + No DB + CJS
	console.log("\nTest 2: JS + No DB + CJS");
	const blueprint2 = new BluePrint({
		projectName: "js-cjs-no-db",
		language: "typescript",
		importStyle: "commonjs",
		database: "none",
		orm: "none",
		targetPath: path.resolve(tempDir, "test2"),
	});
	const gen2 = new TsconfigGenerator(blueprint2, engine);
	await gen2.generate();
	const pkg2 = await fs.readJSON(join(tempDir, "test2/tsconfig.json"));
	console.log(pkg2);

	//Test3: JS + No DB
	console.log("\nTest 3: JS + No DB + CJS");
	const blueprint3 = new BluePrint({
		projectName: "js-project",
		language: "javascript",
		importStyle: "esm",
		database: "none",
		orm: "none",
		targetPath: path.resolve(tempDir, "test3"),
	});
	const gen3 = new TsconfigGenerator(blueprint3, engine);
	await gen3.generate();
	const tsconfigExists = await fs.pathExists(
		join(tempDir, "test3/tsconfig.json"),
	);
	console.log("No tsconfig.json created:", !tsconfigExists);
	console.log("No path tracked:", gen3.getCreatedPaths().length);

	await fs.remove(tempDir);
	console.log("\n All TsconfigGenerator tests passed!");
}
test().catch(console.error);
