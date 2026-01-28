import { BluePrint } from "./index";

//valid config - should work
const validBlueprint = new BluePrint({
  projectName: "my-api",
  language: "typescript",
  importStyle: "esm",
  database: "postgres",
  orm: "prisma",
  targetPath: "/tmp/my-api",
});

console.log("Valid blueprint created");
console.log("-----------------------");
console.log("isTypescript:", validBlueprint.isTypescript);
console.log("hasDatabase:", validBlueprint.hasDatabase);
console.log("serverTemplate:", validBlueprint.getServerTemplatePath());
console.log(
  "dependencies:",
  Object.keys(validBlueprint.getRuntimeDependencies()),
);

//Invalid config - should throw an error
try {
  const invalidBlueprint = new BluePrint({
    projectName: "my-api",
    language: "typescript",
    importStyle: "esm",
    database: "mongo",
    orm: "prisma",
    targetPath: "/tmp/my-api",
  });
  console.error("Should have thrown validation error");
} catch (e) {
  console.log("Validation caught invalid config:", (e as Error).message);
}

//test .with() helper
const baseBlueprint = new BluePrint({
  projectName: "test-base",
  language: "typescript",
  importStyle: "esm",
  database: "postgres",
  orm: "prisma",
  targetPath: "/tmp/test",
});

const variantBlueprint = baseBlueprint.with({ orm: "drizzle" });
console.log(".with() created variant");
console.log("base orm:", baseBlueprint);
console.log("variant orm:", variantBlueprint);
