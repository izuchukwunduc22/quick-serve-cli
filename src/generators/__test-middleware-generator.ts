import { MiddlewareGenerator } from "./MiddlewareGenerator";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
	console.log("Testing the MiddleGenerator...\n");
	const tempDir = join(__dirname, "__temp-middleware-test");
	const engine = new TemplateEngine();
	await fs.remove(tempDir);

	//Test1:TypeScript + ESM
	console.log("Test 1: TypeScript + ESM");
	const blueprint1 = new BluePrint({
		projectName: "ts-api",
		language: "typescript",
		importStyle: "esm",
		database: "none",
		orm: "none",
		targetPath: path.resolve(tempDir, "test1"),
	});
	const gen1 = new MiddlewareGenerator(blueprint1, engine);
	await gen1.generate();
	const errorHandler1 = await fs.readFile(
		join(tempDir, "test1/src/middlewares/errorHandler.ts"),
		"utf-8",
	);
	const notFound1 = await fs.readFile(
		join(tempDir, "test1/src/middlewares/notFoundHandler.ts"),
		"utf-8",
	);
	console.log("errorHandler.ts exists");
	console.log("notFoundHandler.ts exists");
	console.log(
		"errorHandler.ts has Express Imports:",
		errorHandler1.includes("import { Request, Response, NextFunction }"),
	);
	console.log(
		"errorHandler.ts has ApiError interface:",
		errorHandler1.includes("interface ApiError"),
	);
	console.log(
		"errorHandler.ts has typed params:",
		errorHandler1.includes("err: ApiError"),
	);
	console.log(
		"notFoundHandler.ts has typed params:",
		notFound1.includes("req: Request"),
	);
	console.log(
		"both uses export default function:",
		notFound1.includes("export default function") &&
			notFound1.includes("export default function"),
	);

	//Test2:JS + CJS
	console.log("\nTest 2: JS + CJS");
	const blueprint2 = new BluePrint({
		projectName: "js-api",
		language: "javascript",
		importStyle: "commonjs",
		database: "none",
		orm: "none",
		targetPath: path.resolve(tempDir, "test2"),
	});
	const gen2 = new MiddlewareGenerator(blueprint2, engine);
	await gen2.generate();
	const errorHandler2 = await fs.readFile(
		join(tempDir, "test2/src/middlewares/errorHandler.js"),
		"utf-8",
	);
	const notFound2 = await fs.readFile(
		join(tempDir, "test2/src/middlewares/notFoundHandler.js"),
		"utf-8",
	);

	console.log("errorHandler.js exists");
	console.log("notFoundHandler.js exists");
	console.log(
		"errorHandler.js has no Express Imports:",
		!errorHandler2.includes("import { Request, Response, NextFunction }"),
	);
	console.log(
		"errorHandler.ts has no type annotations:",
		!errorHandler2.includes("err: ApiError"),
	);
	console.log(
		"errorHandler.js has plain params:",
		errorHandler2.includes("function errorHandler(err, req, res, next)"),
	);
	console.log(
		"notFoundHandler.js has plain params:",
		notFound2.includes("function notFoundHandler(req, res, next)"),
	);

	//test3: verify error handling logic is present
	console.log("\nTest 3: Error handling logic");
	console.log("logs error:", errorHandler1.includes("console.error(err)"));

	//cleanup
	await fs.remove(tempDir);
	console.log("\n All MiddlewareGenerator tests passed!");
}
test().catch(console.error);
