import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  port: 7070,
  lang: "zh-CN",
  title: "Zxr's Blog",
  description: "Zxr's Blog",
  theme,
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  plugins: [
    {
      name: "poem-contributor",
      onInitialized: (app) => {
        const page = app.pages.find(
          (item) => item.filePathRelative === "Essays/Poem/CunYuMiao.md",
        );
        if (page?.data.git)
          page.data.git.contributors = [{ name: "郭狗", email: "", commits: 1 }];
      },
    },
  ],
  shouldPrefetch: false,
});
