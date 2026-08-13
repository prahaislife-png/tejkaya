import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

const pages = {
  ritualFinder: resolve(root, "ritual-finder.html"),
  privateJournal: resolve(root, "private.html"),
  days21: resolve(root, "21-days.html"),
  account: resolve(root, "account.html"),
  signIn: resolve(root, "sign-in.html"),
  consult: resolve(root, "consult.html"),
  clinicDesk: resolve(root, "clinic.html")
};

function copyLegacySite() {
  return {
    name: "copy-legacy-site",
    closeBundle() {
      const dist = resolve(root, "dist");
      const items = [
        "index.html",
        "collection.html",
        "product.html",
        "house.html",
        "ingredients.html",
        "rituals.html",
        "css",
        "js",
        "assets"
      ];
      for (const item of items) {
        const from = resolve(root, item);
        if (!existsSync(from)) continue;
        cpSync(from, resolve(dist, item), { recursive: true });
      }
      mkdirSync(resolve(dist, "ritual-finder"), { recursive: true });
      mkdirSync(resolve(dist, "private"), { recursive: true });
      mkdirSync(resolve(dist, "21-days"), { recursive: true });
      mkdirSync(resolve(dist, "account"), { recursive: true });
      mkdirSync(resolve(dist, "sign-in"), { recursive: true });
      mkdirSync(resolve(dist, "consult"), { recursive: true });
      mkdirSync(resolve(dist, "clinic"), { recursive: true });
      const pretty: Array<[string, string]> = [
        ["ritual-finder.html", "ritual-finder/index.html"],
        ["private.html", "private/index.html"],
        ["21-days.html", "21-days/index.html"],
        ["account.html", "account/index.html"],
        ["sign-in.html", "sign-in/index.html"],
        ["consult.html", "consult/index.html"],
        ["clinic.html", "clinic/index.html"]
      ];
      for (const [src, dest] of pretty) {
        const from = resolve(dist, src);
        if (existsSync(from)) cpSync(from, resolve(dist, dest));
      }
    }
  };
}

export default defineConfig({
  root,
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: pages }
  },
  plugins: [copyLegacySite()],
  server: {
    port: 5173,
    host: "127.0.0.1"
  },
  preview: {
    port: 4173,
    host: "127.0.0.1"
  }
});
