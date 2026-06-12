import { defineConfig, loadConfigFromFile } from "vite";
import type { ConfigEnv } from "vite";
import path from "path";

export default defineConfig(async () => {
  const env: ConfigEnv = { command: "serve", mode: "development" };
  const configFile = path.resolve(__dirname, "vite.config.ts");
  const result = await loadConfigFromFile(env, configFile);
  const userConfig = result?.config;

  return {
    ...userConfig,
    cacheDir: path.resolve(__dirname, "node_modules/.vite"),
    server: {
      ...(userConfig?.server || {}),
      warmup: { clientFiles: ["./src/main.tsx"] }
    }
  };
});
