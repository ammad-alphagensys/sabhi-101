import importPlugin from "eslint-plugin-import";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["src/**/*.ts"],
    extends: [prettier], // ⬅️ Prettier

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
      "import/no-default-export": "error",
      "import/no-named-as-default": "error",

      /* 🔥 CIRCULAR IMPORT KILLER */
      "import/no-cycle": ["error", { maxDepth: 1 }],

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

      /* SAFETY */
      "import/no-self-import": "error",
      "import/no-mutable-exports": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
];
