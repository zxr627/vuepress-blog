# 博客维护手册（自用）

这份文件只给我自己维护项目时查阅，不作为站内文章发布。

## 1. 项目定位

- 这是一个基于 `VuePress 2 + vuepress-theme-hope` 的静态博客。
- 真正参与构建和发布的内容目录是 `src/`。
- `docs/` 里的文件只是我本地维护说明，不会被站点发布。

## 2. 常用命令

在项目根目录执行：

```bash
npm.cmd install
npm.cmd run docs:dev
npm.cmd run docs:build
```

说明：

- 本地预览：`npm.cmd run docs:dev`
- 生产构建：`npm.cmd run docs:build`
- Windows 下如果 `npm.ps1` 被限制，直接用 `npm.cmd`
- 如果 build 提示 `EBUSY`，先关掉正在运行的 `docs:dev` 或占用 `src/.vuepress/dist` 的进程

## 3. 目录约定

### 3.1 内容目录

- 首页：`src/README.md`
- 作者页：`src/intro.md`
- 计算机基础：`src/ComputerBasics/`
- 数据库：`src/Database/`
- 前端：`src/FrontEnd/`
- 随笔：`src/Essays/`
- 工具：`src/Tools/`

### 3.2 栏目首页

- 一个目录的入口页通常用 `README.md`
- 例如 `src/FrontEnd/Vue/README.md` 对应 `/FrontEnd/Vue/`
- 普通文章不要都写成 `README.md`，避免目录入口混乱

### 3.3 全站资源和文章资源怎么放

- 文章自己的图片优先放到当前目录的 `assets/`
- 全站公共资源放到 `src/.vuepress/public/`
- `public/` 下的资源引用路径从站点根开始写

示例：

- 文件位置：`src/.vuepress/public/assets/icon/vue.svg`
- 页面引用：`/assets/icon/vue.svg`

## 4. 写文章的最小流程

1. 确定文章属于哪个栏目。
2. 在对应目录新建一个 `.md` 文件。
3. 先写 Frontmatter。
4. 再写标题、摘要、正文。
5. 本地跑 `npm.cmd run docs:dev` 预览。
6. 确认无误后再提交。

## 5. Frontmatter 模板

### 5.1 普通文章模板

```md
---
title: 文章标题
date: 2026-03-30
category:
  - Front End
  - Vue
tag:
  - Vue
  - 调试
---

# 文章标题
<!-- more -->

正文开始
```

说明：

- `title` 建议一定写
- `date` 建议一定写
- `category` 至少写一个
- `tag` 按需写
- `<!-- more -->` 用来控制列表摘要

### 5.2 栏目首页模板

```md
---
index: true
order: 1
category:
  - Front End
  - Vue
---

# Vue
<!-- more -->

这里写栏目说明
```

## 6. 常用写法速查

### 6.1 提示块

```md
::: tip
提示内容
:::

::: warning
警告内容
:::

::: details 点我展开
折叠内容
:::
```

### 6.2 选项卡

```md
::: tabs

@tab 方案一
内容一

@tab 方案二
内容二

:::
```

### 6.3 任务列表

```md
- [x] 已完成
- [ ] 未完成
```

### 6.4 图片

```md
![说明](./assets/example.png)
![说明](./assets/example.png =400x)
![说明](./assets/example.png =400x240)
```

### 6.5 代码块

````md
```ts
const msg = "hello";
console.log(msg);
```
````

### 6.6 徽章

```md
<Badge text="新" type="tip" />
```

## 7. 发布前检查清单

- 路径是否放对
- `title` 是否写了
- `date` 是否写了
- `category` / `tag` 是否合理
- 是否需要 `<!-- more -->`
- 图片路径是否正常
- 代码块语言标记是否正确
- 本地预览是否正常
- 移动端样式是否明显异常

## 8. 站点配置主要看哪里

- 顶部导航：`src/.vuepress/navbar.ts`
- 侧边栏：`src/.vuepress/sidebar.ts`
- 主题与插件：`src/.vuepress/theme.ts`
- 站点总配置：`src/.vuepress/config.ts`
- 客户端调试和兼容逻辑：`src/.vuepress/client.ts`
- 自定义样式：`src/.vuepress/styles/index.scss`

## 9. 当前移动端调试体系

这套调试能力主要是为了查 iPhone 微信 / 特殊 WebView 问题。

### 9.1 调试入口参数

- 开启调试面板：`?debug=1`
- 关闭调试面板并清掉本地记忆：`?debug=0`
- 默认展开调试面板：`?debugOpen=1`
- 指定默认面板：`?debugPanel=log`
- 可选面板：`log`、`system`、`network`、`element`、`storage`
- 开启触摸探针：`?touchProbe=1`
- 指定远程上报地址：`?reportUrl=https://你的地址`
- 绕过 GitHub Pages 首页缓存：`?t=2026033001`

### 9.2 最常用的组合

只看触摸，不让调试面板挡住页面：

```text
https://zxroo.top/?debug=0&touchProbe=1&t=2026033001
```

看 vConsole，但默认不要自动展开：

```text
https://zxroo.top/?debug=1&t=2026033001
```

直接展开 Network：

```text
https://zxroo.top/?debug=1&debugOpen=1&debugPanel=network&t=2026033001
```

### 9.3 触摸探针怎么看

右下角黑框会显示：

- 当前 bundle 文件名
- 当前路径
- `pointerdown / click / touchstart / touchend` 计数
- 最后一条事件命中信息

重点判断：

- `touchstart / touchend` 在涨，但 `click` 一直是 `0`
  - 说明触摸进页面了，但 WebView 没有合成点击
- 出现 `compat-click: ...`
  - 说明 iPhone 微信补点击逻辑生效了
- 出现 `compat-nav: ...`
  - 说明站内链接走了真实页面跳转

## 10. 这次 iPhone 微信问题的关键结论

### 10.1 现象

- PC 正常
- 大部分安卓正常
- iPhone 微信里首页能开，但点目录、点文章没有反应
- 有时进了文章后，再点微信左上角返回会直接回聊天，不回首页

### 10.2 真正原因

最终证据不是报错，而是触摸链路：

- `touchstart / touchend` 有
- `click` 没有

也就是说：

- 页面确实收到了触摸
- 但 iPhone 微信 WebView 没有稳定地把触摸合成为 `click`
- 而主题里的菜单、分页、标签、很多导航逻辑都依赖 `onClick`

### 10.3 最终修复

当前修复都在 `src/.vuepress/client.ts`：

- 只在 `iPhone/iPad + 微信` 下启用兼容逻辑
- 在 `touchend` 后补发一次 `click`
- 对站内链接优先走真实跳转 `window.location.assign(...)`
- 这样既解决“点了没反应”，也改善“返回直接退回聊天”的问题

## 11. iPhone 微信问题排查顺序

如果以后又遇到类似问题，按这个顺序排：

1. 先开 `?debug=0&touchProbe=1&t=...`
2. 点问题位置
3. 看黑框里 `touchstart / touchend / click`
4. 如果 `click=0`，优先怀疑 WebView 点击合成链路
5. 如果需要更多信息，再开 `?debug=1&debugOpen=1&debugPanel=network&t=...`
6. 如果首页 HTML 还是旧的，记得加 `?t=时间戳` 绕缓存

## 12. 维护时要记住的坑

- 不要轻易假设“PC 正常 = 手机正常”
- 不要先怪服务器，先分清是域名风控、缓存，还是前端点击链路
- 调试面板本身也可能影响点击，先确认是工具问题还是页面问题
- GitHub Pages 首页 HTML 有缓存，刚部署完先用 `?t=...` 验证
- 微信上“安全性提示”和页面交互问题是两条线，不要混在一起判断

## 13. 这份手册对应的参考文件

- 调试与兼容：`src/.vuepress/client.ts`
- 调试层样式：`src/.vuepress/styles/index.scss`
- 导航配置：`src/.vuepress/navbar.ts`
- 主题配置：`src/.vuepress/theme.ts`
- 首页内容：`src/README.md`

## 14. 以后继续维护时的原则

- 先保证功能和排障能力，再考虑展示效果
- 遇到移动端问题，尽量先加观测，再下结论
- 尽量把“排查参数”和“临时工具”做成可开关，不要写死
- 自己能复用的踩坑过程，要么写进手册，要么写成博客留档
