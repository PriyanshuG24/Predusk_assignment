import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
    // ignore build output etc.
    { ignores: ["dist/**", "node_modules/**"] },

    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript recommended rules (no type-aware rules yet)
    ...tseslint.configs.recommended,

    // Turn off ESLint formatting rules that conflict with Prettier
    prettierConfig,
];
