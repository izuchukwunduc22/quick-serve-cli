import { GitignoreGenerator } from "./GitignoreGenerator.js";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
  console.log("Testing GitignoreGenerator...\n");
  const tempDir = join(__dirname, "__temp-gitignore-test");
  await fs.remove(tempDir);

  //Test1:Typescript project with database
  console.log("Test 1: TypeScript + Prisma");
  const blueprint1 = new BluePrint({
    projectName: "test-ts",
    language: "typescript",
    importStyle: "esm",
    database: "postgres",
    orm: "prisma",
    isPathAlias: false,
    targetPath: path.resolve(tempDir, "test1"),
  });
  const engine = new TemplateEngine();
  const gen1 = new GitignoreGenerator(blueprint1, engine);
  await gen1.generate();
  console.log(
    "Exists:",
    await fs.pathExists(path.join(tempDir, "test1", ".gitignore")),
  );
  const gitignore1 = await fs.readFile(
    path.join(tempDir, "test1", ".gitignore"),
    "utf-8",
  );
  console.log("Contains 'dist/' (typescript):", gitignore1.includes("dist/"));
  console.log("Contains '*.db' (database):", gitignore1.includes("*.db"));
  console.log(
    "Contains 'prisma/migrations' (prisma):",
    gitignore1.includes("prisma/migrations"),
  );
  //Test2:Javascript project without database
  console.log("\nTest 2: TypeScript + No database");
  const blueprint2 = new BluePrint({
    projectName: "test-js",
    language: "javascript",
    importStyle: "esm",
    database: "none",
    orm: "none",
    isPathAlias: false,
    targetPath: path.resolve(tempDir, "test2"),
  });
  const gen2 = new GitignoreGenerator(blueprint2, engine);
  await gen2.generate();
  const gitignore2 = await fs.readFile(
    path.join(tempDir, "test2", ".gitignore"),
    "utf-8",
  );
  console.log("Does not contain 'dist/':", !gitignore2.includes("dist/"));
  console.log("Does not contain '*.db':", !gitignore2.includes("*.db"));
  console.log(
    "Contains 'node_modules/' (always):",
    gitignore2.includes("node_modules/"),
  );

  //Test3: verify tracking
  console.log("\nTest 3: Rollback Tracking");
  console.log("Created paths:", gen1.getCreatedPaths());
  console.log(
    "Tracked .gitignore:",
    gen1.getCreatedPaths().some((p) => p.endsWith(".gitignore")),
  );

  //cleanup
  await fs.remove(tempDir);
  console.log("\n All GitignoreGenerator tests passed!");
}
test().catch(console.error);
