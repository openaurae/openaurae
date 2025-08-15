// @ts-check
import eslintPluginPrettier from "eslint-plugin-prettier";

import withNuxt from ".nuxt/eslint.config.mjs";

export default withNuxt({
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    "prettier/prettier": "error",
    "sort-imports": "off",
    "import/order": "off",
  },
});
