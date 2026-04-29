import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: false,
    setupNodeEvents() {
    // setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
