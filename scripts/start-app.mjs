import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CLIENT_DIR = path.join(ROOT_DIR, "client");

console.log("🚀 Iniciando Harvard CV Studio AI...\n");

// 1. Iniciar Backend
const isWindows = process.platform === "win32";
const nodeCmd = "node";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const serverProcess = spawn(nodeCmd, ["server/index.mjs"], {
  cwd: ROOT_DIR,
  stdio: "inherit",
  shell: true,
});

// 2. Iniciar Vite Dev Server
const clientProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: CLIENT_DIR,
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  console.log("\nDeteniendo servidores...");
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
