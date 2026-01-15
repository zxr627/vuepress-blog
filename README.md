# vuepress-blog

[![Deploy](https://github.com/zxr627/vuepress-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/zxr627/vuepress-blog/actions/workflows/deploy.yml)

一个基于 [VuePress](https://vuepress.vuejs.org/) 搭建的个人博客项目，用来记录学习、随笔与创作。  
目前已部署到 GitHub Pages，并绑定自定义域名 [zxroo.top](https://zxroo.top)。

##  功能特色

-  **博客记录**：支持 Markdown 写作，适合技术文章与随笔笔记  
-  **个性化主题**：自定义主题配置（`theme.js`），美观简洁  
-  **移动端适配**：针对手机端样式进行了优化  
-  **中文字体支持**：引入 [霞鹜文楷屏幕字体](https://github.com/lxgw/LxgwWenKai-Screen)  
-  **快速构建**：使用 Vite 作为打包工具，开发体验更流畅  

## 本地运行

克隆仓库到本地：

```bash
git clone https://github.com/zxr627/vuepress-blog.git
cd vuepress-blog
npm install
vuepress-blog/
├─ docs/               # 博客内容目录
│  ├─ .vuepress/       # VuePress 配置（主题、插件、样式等）
│  ├─ essays/          # 随笔/文章
│  ├─ README.md        # 首页
│  └─ ... 
├─ package.json
└─ README.md
