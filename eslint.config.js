import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["coverage/**", "node_modules/**", "dist/**"]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.serviceworker
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
