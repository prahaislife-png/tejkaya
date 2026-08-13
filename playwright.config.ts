import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4177",
    viewport: { width: 1440, height: 900 }
  },
  webServer: {
    command: "npm run preview -- --port 4177 --host 127.0.0.1",
    url: "http://127.0.0.1:4177",
    reuseExistingServer: false,
    timeout: 120000
  }
});
