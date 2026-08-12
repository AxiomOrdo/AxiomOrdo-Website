import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const appDirectory = path.join(repositoryRoot, "apps", "aopdf");
const exportDirectory = path.join(appDirectory, "out");
const publicDirectory = path.join(repositoryRoot, "public", "ao-pdf");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      AOPDF_COMMERCIAL_ENABLED: "false",
      AOPDF_BILLING_ENABLED: "false",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(npmCommand, ["ci", "--no-audit", "--no-fund"], appDirectory);
run(npmCommand, ["run", "build"], appDirectory);

if (!existsSync(exportDirectory)) {
  throw new Error(`AO-PDF export was not created at ${exportDirectory}`);
}

rmSync(publicDirectory, { recursive: true, force: true });
cpSync(exportDirectory, publicDirectory, { recursive: true });
