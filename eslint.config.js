import importPlugin from "eslint-plugin-import";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  // 1️⃣ Prettier MUST come first (disables formatting rules)
  prettier,

  // 2️⃣ Your actual TypeScript rules
  {
    files: ["src/**/*.ts"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      boundaries,
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.eslint.json",
        },
      },

      "boundaries/elements": [
        { type: "config", pattern: "src/constant/*" },
        { type: "shared", pattern: "src/{enum,type,validation,schema}/*" },
        { type: "infra", pattern: "src/{library,cache}/*" },
        { type: "domain", pattern: "src/{model,handler,service}/*" },
        { type: "http", pattern: "src/{middleware,router,api-docs}/*" },
        { type: "bootstrap", pattern: "src/app.ts" },
      ],
    },

    rules: {
      /* IMPORT SAFETY */
      "import/no-default-export": "error",
      "import/no-named-as-default": "error",
      "import/no-self-import": "error",
      "import/no-mutable-exports": "error",
      /* ❌ NO SECRET LEAKS */
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",

      /* ❌ PREVENT LOGGING REQUEST OBJECTS */
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",

      /* ❌ NO DYNAMIC REQUIRE / IMPORT */
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-implied-eval": "error",

      /* 🔥 CIRCULAR IMPORT KILLER */
      "import/no-cycle": ["error", { maxDepth: 1 }],

      /* ❌ ANY = OUTAGE */
      "@typescript-eslint/no-explicit-any": "error",

      /* ❌ FORCE EXPLICIT API CONTRACTS */
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: false }],

      /* ❌ PREVENT UNCHECKED NULLS */
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",

      /* ❌ BAD TYPE ASSERTIONS */
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
      ],

      /* ❌ NO FALLTHROUGH */
      "default-case": "error",
      "no-fallthrough": "error",

      /* ❌ PREVENT LEAKING RAW DOCUMENTS */
      "@typescript-eslint/no-unsafe-return": "error",

      /* ❌ NO IMPLICIT STRING COERCION */
      "no-implicit-coercion": "error",

      /* 🧱 ARCHITECTURE ENFORCEMENT */
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "config", allow: ["config", "shared"] },
            { from: "shared", allow: ["shared"] },
            { from: "infra", allow: ["config", "shared"] },
            { from: "domain", allow: ["shared"] },
            { from: "http", allow: ["domain", "infra", "shared"] },
            { from: "bootstrap", allow: ["http", "infra", "config"] },
          ],
        },
      ],

      /* ASYNC SAFETY */
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
];
