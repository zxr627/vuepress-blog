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
  plugins: [],
  shouldPrefetch: false,
});
