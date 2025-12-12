import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import * as parserVue from "vue-eslint-parser";
import configPrettier from "@vue/eslint-config-prettier";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,mjs,jsx,ts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/*.css"],
  },

  js.configs.recommended,
  ...pluginVue.configs["flat/essential"],

  {
    name: "app/vue-rules",
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Vue 3 Composition API rules
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",

      // Allow Tailwind CSS directives in Vue components
      "css/no-at-rules-from-deprecated-plugins": "off",
      "css/no-unknown-at-rules": "off",

      // General JavaScript rules
      "no-console": "warn",
      "no-debugger": "warn",
      "no-unused-vars": "warn",
      "prefer-const": "error",
    },
  },

  {
    name: "app/prettier-config",
    ...configPrettier,
  },
];
