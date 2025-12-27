import fs from "fs";
import path from "path";
import crypto from "crypto";

const ENV_DIR = ".env";

/**
 * Explicitly supported environments
 * (add more here if needed)
 */
const SUPPORTED_ENVS = ["dev", "staging", "test", "prod"];

/**
 * Matches:
 *  - env.dev.local
 *  - env.staging.local
 *  - env.test.local
 *  - env.prod.local
 */
const ENV_FILE_REGEX = new RegExp(`^env\\.(${SUPPORTED_ENVS.join("|")})\\.local$`, "i");

function hash(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function generateTemplate(content: string) {
  return content
    .split("\n")
    .map((line) => {
      if (!line || line.startsWith("#")) return line;

      const idx = line.indexOf("=");
      if (idx === -1) return line;

      const key = line.slice(0, idx).trim();
      if (!key) return line;

      // Mask EVERYTHING
      return `${key}=__${key}__`;
    })
    .join("\n");
}

const files = fs.readdirSync(ENV_DIR).filter((f) => ENV_FILE_REGEX.test(f));

let changed = false;

for (const file of files) {
  const match = file.match(ENV_FILE_REGEX);
  if (!match) continue;

  const envName = match[1].toLowerCase(); // dev | staging | test | prod
  const envPath = path.join(ENV_DIR, file);

  // 👉 Template name: env.test.template (no .local)
  const templatePath = path.join(ENV_DIR, `env.${envName}.template`);

  const envContent = fs.readFileSync(envPath, "utf8");
  const newTemplate = generateTemplate(envContent);

  const oldTemplate = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";

  if (hash(newTemplate) !== hash(oldTemplate)) {
    fs.writeFileSync(templatePath, newTemplate);
    console.log(`🔁 Updated: ${templatePath}`);
    changed = true;
  }
}

if (!changed) {
  console.log("✅ Env templates already in sync");
}
