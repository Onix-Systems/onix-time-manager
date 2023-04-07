const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: "src/main.ts",
    popup: "src/main.ts",
    blockPage: "src/main.ts",
  },
});
