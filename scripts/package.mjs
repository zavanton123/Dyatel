import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILES = ["main.js", "manifest.json", "styles.css"];

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const { id, version } = manifest;

// Staged under a folder named after the plugin id, so the archive unzips
// straight into a vault's .obsidian/plugins/ directory.
const stage = path.join(ROOT, "build");
const pluginDir = path.join(stage, id);
const archive = path.join(ROOT, `${id}-${version}.zip`);

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(pluginDir, { recursive: true });

for (const file of FILES) {
	const source = path.join(ROOT, file);
	if (!fs.existsSync(source)) {
		throw new Error(`Missing ${file} — run "npm run build" first.`);
	}
	fs.copyFileSync(source, path.join(pluginDir, file));
}

fs.rmSync(archive, { force: true });
execFileSync("zip", ["-r", "-q", "-X", archive, id], { cwd: stage });
fs.rmSync(stage, { recursive: true, force: true });

const { size } = fs.statSync(archive);
console.log(`${path.basename(archive)} (${(size / 1024).toFixed(1)} KB)`);
