import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([{
    plugins: {
      next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
    }
}]);
