import { PackageJsonGenerator } from "./PackageJsonGenerator";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
  console.log("Testing the PackageJsonGenerator...\n");
  const tempDir = join(__dirname, "__temp-package-json-test");
  await fs.remove(tempDir);

  //Test1: TS + Prisma + Postgres
  console.log("Test 1: TS + Prisma + Postgres");
  const blueprint1 = new BluePrint({
    projectName: "my-api",
    language: "typescript",
    importStyle: "esm",
    database: "postgres",
    orm: "prisma",
    targetPath: path.resolve(tempDir, "test1"),
  });
  const engine = new TemplateEngine();
  const gen1 = new PackageJsonGenerator(blueprint1, engine);
  await gen1.generate();
  const pkg = await fs.readJSON(join(tempDir, "test1/package.json"));
  console.log(pkg);

  //Test2: JS + No DB
  console.log("Test 2: JS + No DB");
  const blueprint2 = new BluePrint({
    projectName: "simple-api",
    language: "javascript",
    importStyle: "commonjs",
    database: "none",
    orm: "none",
    targetPath: path.resolve(tempDir, "test2"),
  });
  const gen2 = new PackageJsonGenerator(blueprint2, engine);
  await gen2.generate();
  const pkg2 = await fs.readJSON(join(tempDir, "test2/package.json"));
  console.log(pkg2);

  //Test3: MongoDB + Mongoose
  console.log("Test 3: MongoDB + Mongoose");
  const blueprint3 = new BluePrint({
    projectName: "mongo-api",
    language: "typescript",
    importStyle: "esm",
    database: "mongo",
    orm: "mongoose",
    targetPath: path.resolve(tempDir, "test3"),
  });

  const gen3 = new PackageJsonGenerator(blueprint3, engine);
  await gen3.generate();
  const pkg3 = await fs.readJSON(join(tempDir, "test3/package.json"));
  console.log(pkg3);

  await fs.remove(tempDir);
  console.log("\n All PackageJsonGenerator tests passed!");
}
test().catch(console.error);
