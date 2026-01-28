import { importStyle, language, orm, db } from "./union-types";

/**
 * Raw config data collected from CLI prompts/flags.
 * This is the dumb data structure-just values, no logic.
 */
export interface BluePrintData {
  // Project name(must follow npm package naming rules)
  projectName: string;
  // Programming language choice
  language: language;
  // Module system
  importStyle: importStyle;
  // Database selection
  database: db;
  // ORM selection
  orm: orm;
  // Abs path where project will be created
  targetPath: string;
}
