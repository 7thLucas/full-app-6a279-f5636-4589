import path from "node:path";
import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "~/lib/logger";

const logger = createLogger("Models");
const modelFilePattern = /\.model\.(ts|tsx|js|mjs|cjs)$/;

async function scanDirForModels(dirPath: string, resultSet: Set<string>, recursive = false): Promise<void> {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && recursive) {
      await scanDirForModels(fullPath, resultSet, true);
    } else if (entry.isFile() && modelFilePattern.test(entry.name)) {
      resultSet.add(fullPath);
    }
  }
}

async function discoverModelFiles(): Promise<string[]> {
  const modelFilesSet = new Set<string>();

  // Scan app/modules/* for models
  const modulesPath = path.join(process.cwd(), "app", "modules");
  const moduleEntries = await readdir(modulesPath, { withFileTypes: true }).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  });

  for (const entry of moduleEntries) {
    if (!entry.isDirectory()) continue;
    const modulePath = path.join(modulesPath, entry.name);
    const scanPaths = [modulePath, path.join(modulePath, "src", "models")];
    for (const scanPath of scanPaths) {
      await scanDirForModels(scanPath, modelFilesSet);
    }
  }

  // Also scan app/escapeops/**/api/ for models (recursive)
  const escapeopPath = path.join(process.cwd(), "app", "escapeops");
  await scanDirForModels(escapeopPath, modelFilesSet, true);

  return [...modelFilesSet].sort();
}

/**
 * Initialize all discovered models by importing them.
 * This ensures that Typegoose/Mongoose models are registered.
 */
export async function initializeModels(): Promise<void> {
  const modelFiles = await discoverModelFiles();

  for (const modelFile of modelFiles) {
    logger.info(`Initializing model from ${path.relative(process.cwd(), modelFile)}`);
    await import(pathToFileURL(modelFile).href);
  }
}
