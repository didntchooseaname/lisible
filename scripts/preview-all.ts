import { join } from "node:path";
import { VARIANTS } from "../shared/variants";
import { buildVariant, installVariantDependencies } from "./variant-setup";

const root = new URL("..", import.meta.url).pathname;

for (const { id: name } of VARIANTS) {
  const dir = join(root, "versions", name);
  const installExitCode = installVariantDependencies(name, dir, {
    force: true,
  });
  if (installExitCode !== 0) process.exit(installExitCode);

  const buildExitCode = buildVariant(name, dir);
  if (buildExitCode !== 0) process.exit(buildExitCode);
}

const children: { name: string; proc: ReturnType<typeof Bun.spawn> }[] = [];
for (const { id: name, port } of VARIANTS) {
  const dir = join(root, "versions", name);
  const proc = Bun.spawn(["bunx", "astro", "preview", "--port", String(port)], {
    cwd: dir,
    stdout: "ignore",
    stderr: "ignore",
  });
  children.push({ name, proc });
  console.log(`${name}: http://localhost:${port}`);
}

console.log("\nPress Ctrl+C to stop all preview servers.");
process.on("SIGINT", () => {
  for (const c of children) c.proc.kill();
  process.exit(0);
});
await Promise.all(children.map((c) => c.proc.exited));
