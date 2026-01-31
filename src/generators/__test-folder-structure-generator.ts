import { FolderStructureGenerator } from "./FolderStructureGenerator";
import { BluePrint } from "@/types";
import { TemplateEngine } from "@/core/TemplateEngine";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
  console.log("Testing the FolderStructureGenerator...\n");
  const tempDir = join(__dirname, "__temp-folder-test");
  await fs.remove(tempDir);

  //Test1:Typescript project with database
  console.log("Test 1: TypeScript + Database");
  const blueprint1 = new BluePrint({
    projectName: "test-with-db",
    language: "typescript",
    importStyle: "esm",
    database: "postgres",
    orm: "prisma",
    isPathAlias: false,
    targetPath: path.resolve(tempDir, "test1"),
  });
  const engine = new TemplateEngine();
  const gen1 = new FolderStructureGenerator(blueprint1, engine);

  //test folder list
  const requiredFolders1 = gen1.getRequiredFolders();
  console.log("Required folders:", requiredFolders1.length);
  console.log("Includes src/models:", requiredFolders1.includes("src/models"));
  console.log("Includes src/db:", requiredFolders1.includes("src/db"));

  //Actually create folders
  await gen1.generate();
  console.log("src/ exists:", fs.existsSync(join(tempDir, "test1/src")));
  console.log(
    "src/models/ exists:",
    fs.existsSync(join(tempDir, "test1/src/models")),
  );
  console.log("src/db/ exists:", fs.existsSync(join(tempDir, "test1/src/db")));
  console.log("docs exists:", fs.existsSync(join(tempDir, "test1/docs")));

  //Test1:Typescript project without database
  console.log("\nTest 2: JavaScript + No Database");
  const blueprint2 = new BluePrint({
    projectName: "test-no-db",
    language: "javascript",
    importStyle: "esm",
    database: "none",
    orm: "none",
    isPathAlias: false,
    targetPath: path.resolve(tempDir, "test2"),
  });
  const gen2 = new FolderStructureGenerator(blueprint2, engine);
  const requiredFolders2 = gen2.getRequiredFolders();
  console.log(
    "Does not include src/models:",
    !requiredFolders2.includes("src/models"),
  );
  console.log("Does not include src/db:", !requiredFolders2.includes("src/db"));
  console.log(
    "Still includes src/config:",
    requiredFolders2.includes("src/config"),
  );
  await gen2.generate();
  console.log(
    "src/models/ does not exist:",
    fs.existsSync(join(tempDir, "test2/src/models")),
  );
  console.log(
    "src/config/ exists:",
    fs.existsSync(join(tempDir, "test2/src/config")),
  );
  //test3: verify tracking
  console.log("\nTest 3: Rollback tracking");
  const createdPaths = gen1.getCreatedPaths();
  console.log("Tracked paths:", gen1.getCreatedPaths().length);
  console.log(createdPaths);
  console.log(
    "Tracked src/models:",
    createdPaths.some((p) =>
      p.split(path.sep).join("/").endsWith("src/models"),
    ),
  );

  //cleanup
  await fs.remove(tempDir);
  console.log("\n All FolderStructureGenerator tests passed!");
}
test().catch(console.error);
