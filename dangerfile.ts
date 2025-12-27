import { danger, fail, warn, message } from "danger";

/* =====================================================
   HELPERS
===================================================== */

const hasFile = (pattern: RegExp) =>
  danger.git.modified_files.some((f) => pattern.test(f));

const modified = danger.git.modified_files;
const created = danger.git.created_files;
const deleted = danger.git.deleted_files;
const allFiles = [...modified, ...created];

/* =====================================================
   PR METADATA QUALITY
===================================================== */

// Title discipline (warn only)
if (!danger.github.pr.title.match(/^(feat|fix|chore|refactor|docs|test|ci):/)) {
  warn(
    "PR title should follow Conventional Commits: `feat:`, `fix:`, `chore:`, etc."
  );
}

// Body quality (warn only)
if ((danger.github.pr.body || "").trim().length < 30) {
  warn(
    "PR description is too short. Explain *why* the change is needed."
  );
}

/* =====================================================
   ENV & SECRETS GOVERNANCE (HARD FAILS)
===================================================== */

// No real env files ever
const forbiddenEnvFiles = allFiles.filter((f) =>
  /^\.env\/env\.(dev|staging|test|prod)\.local$/.test(f)
);

if (forbiddenEnvFiles.length > 0) {
  fail(
    `🚨 Forbidden env files committed:\n\n${forbiddenEnvFiles.join(
      "\n"
    )}\n\nOnly \`.template\` files are allowed.`
  );
}

// Template must be updated when env template changes
const envTemplates = allFiles.filter((f) =>
  /\.env\/env\.(dev|staging|test|prod)\.template$/.test(f)
);

if (envTemplates.length > 0) {
  message(
    `🧩 Env templates updated:\n${envTemplates.join("\n")}`
  );
}

/* =====================================================
   ARCHITECTURE & RISK SIGNALS
===================================================== */

// Large diffs = higher review risk
const LARGE_DIFF = 500;
const largeFiles: string[] = [];

for (const file of modified) {
  const diff = await danger.git.diffForFile(file);
  if (diff && diff.added_lines > LARGE_DIFF) {
    largeFiles.push(`${file} (+${diff.added_lines})`);
  }
}

if (largeFiles.length > 0) {
  warn(
    `⚠️ Large changes detected (>${LARGE_DIFF} LOC):\n\n${largeFiles.join(
      "\n"
    )}\n\nConsider breaking this into smaller PRs.`
  );
}

/* =====================================================
   TEST DISCIPLINE
===================================================== */

const srcChanged = hasFile(/^src\//);
const testsChanged = hasFile(/(\.test\.|__tests__)/);

if (srcChanged && !testsChanged) {
  warn(
    "Source code changed without corresponding tests. Is this intentional?"
  );
}

/* =====================================================
   ESLINT / CODE QUALITY SIGNAL
===================================================== */

// Detect eslint-disable usage (warn)
const eslintDisabled = modified.filter((f) => f.endsWith(".ts"));

for (const file of eslintDisabled) {
  const diff = await danger.git.diffForFile(file);
  if (diff?.patch?.includes("eslint-disable")) {
    warn(
      `⚠️ ESLint rule disabled in ${file}. Prefer fixing the rule instead of disabling it.`
    );
  }
}

/* =====================================================
   CI / SECURITY AWARENESS
===================================================== */

// Gitleaks / ESLint already block CI — Danger just signals
if (hasFile(/^src\//)) {
  message("🔍 ESLint & Gitleaks enforced via CI");
}

/* =====================================================
   POSITIVE SIGNAL
===================================================== */

message("✅ Danger checks complete");

