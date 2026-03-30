# 博客操作指南

仅供自己维护这个项目时查阅，不作为站内文章发布。

## 1. 项目定位

- 这是一个基于 VuePress 2 + `vuepress-theme-hope` 的静态博客。
- 真正参与站点构建的内容目录是 `src/`，不是 `docs/`。
- 这份手册放在 `docs/`，只是本地说明，不会被站点发布。

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
- Windows 下如果提示 `npm.ps1` 被限制，直接用 `npm.cmd`
- 如果 build 报 `EBUSY`，先关掉正在运行的 `docs:dev` 或占用 `src/.vuepress/dist` 的进程后再试

## 3. 目录约定

### 3.1 内容都写到哪里

- 首页：`src/README.md`
- 作者介绍页：`src/intro.md`
- 计算机基础：`src/ComputerBasics/`
- 数据库：`src/Database/`
- 前端：`src/FrontEnd/`
- 随笔：`src/Essays/`
- 工具类：`src/Tools/`

### 3.2 新文章放哪里

原则：

- 放到对应栏目目录里
- 文件名尽量用英文、数字、短横线，避免太随意
- 同一专题的目录首页统一用 `README.md`

示例：

- 写 Vue 文章：放到 `src/FrontEnd/Vue/`
- 写 SQL 基础：放到 `src/Database/SQL/01Basics/`
- 写随笔：放到 `src/Essays/Daily/`

### 3.3 栏目首页怎么做

栏目首页一般使用 `README.md`，这样目录路径会直接映射成栏目首页。

例如：

- `src/FrontEnd/Vue/README.md` 对应 `/FrontEnd/Vue/`
- `src/Essays/Poem/README.md` 对应 `/Essays/Poem/`

## 4. 写文章的最小流程

1. 选好栏目目录。
2. 新建一个 `.md` 文件。
3. 先写 Frontmatter。
4. 再写标题、摘要和正文。
5. 如果是栏目首页，就改对应目录下的 `README.md`。
6. 本地用 `npm.cmd run docs:dev` 预览确认。

## 5. Frontmatter 模板

### 5.1 普通文章模板

```md
---
title: 文章标题
date: 2026-03-27
category:
  - Front End
  - Vue
tag:
  - Vue3
  - 总结
---

# 文章标题
<!-- more -->

正文开始
```

说明：

- `title`：建议写，便于统一
- `date`：建议写，页面信息里会显示日期
- `category`：建议至少写一个
- `tag`：按需写
- `<!-- more -->`：用来截断摘要，博客列表展示更友好

### 5.2 栏目首页模板

```md
---
index: true
order: number
category:
  - Front End
  - Vue
---

# Vue
<!-- more -->

这里写栏目介绍
```

说明：

- `index: true` 常用于目录首页
- `order: number` 用于结构排序
- 栏目页通常是目录说明，不要写成普通长文

### 5.3 单独控制页面功能

如果某个页面不想显示评论、页脚、上一篇下一篇之类，可以在 Frontmatter 里关掉：

```md
---
comment: false
contributors: false
editLink: false
lastUpdated: false
prev: false
next: false
footer: false
---
```

`src/intro.md` 就是一个完整例子。

## 6. 当前项目已经启用的功能

这些能力是在 `src/.vuepress/theme.ts` 里开着的，写文章时可以直接用：

- 博客分类和标签
- 全文搜索
- Giscus 评论
- 提示块
- 任务列表
- 选项卡
- 代码演示
- 代码分组
- 组件语法
- 图片懒加载
- 图片尺寸
- 文本标记
- 下标 / 上标
- 对齐
- 属性附加
- `v-pre`
- `include`

## 7. 最常用写法

下面只记我自己最常用、最值得直接上手的格式。

### 7.1 提示块

```md
::: tip
这是提示
:::

::: warning
这是警告
:::

::: note
这是备注
:::

::: details 点我展开
这里写折叠内容
:::
```

### 7.2 选项卡

```md
::: tabs

@tab 方案一

这里写方案一

@tab 方案二

这里写方案二

:::
```

适合放：

- 不同写法对比
- Windows / macOS / Linux 命令
- Vue2 / Vue3 对比

### 7.3 任务列表

```md
- [x] 已完成
- [ ] 未完成
```

### 7.4 高亮文本

```md
这是 ==重点内容==
```

### 7.5 上标和下标

```md
H~2~O
19^th^
```

### 7.6 图片

普通写法：

```md
![图片说明](./assets/example.png)
```

指定尺寸：

```md
![封面图](./assets/example.png =400x)
![封面图](./assets/example.png =400x240)
```

建议：

- 当前文章使用的图片尽量放在当前目录的 `assets/` 下
- 本地图片优先相对路径，不要到处混用外链

### 7.7 代码块

````md
```ts
const msg = "hello";
console.log(msg);
```
````

常见语言标记：

- `js`
- `ts`
- `vue`
- `html`
- `css`
- `scss`
- `bash`
- `sql`
- `json`

### 7.8 代码分组

````md
::: code-tabs

@tab JavaScript
```js
console.log("js");
```

@tab TypeScript
```ts
const msg: string = "ts";
```

:::
````

### 7.9 徽章

```md
<span class="vp-badge info">info</span>
<span class="vp-badge tip">tip</span>
<span class="vp-badge warning">warning</span>
<span class="vp-badge danger">danger</span>

<Badge text="新" type="tip" />
```

这个项目里已经注册了 `Badge` 组件，可以直接用。

### 7.10 对齐和属性

居中：

```md
::: center
这段文字居中
:::
```

附加 class / id：

```md
## 自定义标题 {#custom-id}

这是一段文字
{.custom-class}
```

### 7.11 原样输出 Vue / 模板代码

````md
```vue
<div>{{ message }}</div>
```
````

如果某些内容被错误解析，可以试试：

```md
::: v-pre
{{ 这里不会被当模板解析 }}
:::
```

## 8. 资源管理规范

### 8.1 图片放置规则

- 当前文章图片放在当前目录的 `assets/`
- 不同栏目各自维护自己的 `assets/`
- 不要把文章图片随手丢到 `src/.vuepress/public/assets/`，除非它是全站共用资源

### 8.2 什么东西放到 `src/.vuepress/public/`

全站资源才放这里，例如：

- 图标
- favicon
- 首页背景图
- 作者头像
- 全站共用 logo

特点：

- 放进去后路径从站点根开始引用
- 例如 `src/.vuepress/public/assets/icon/vue.svg`
- 页面中引用时写 `/assets/icon/vue.svg`

## 9. 新增文章后的检查清单

- 路径放对了吗
- 标题写了吗
- `date` 写了吗
- `category` 合理吗
- 摘要是否需要 `<!-- more -->`
- 图片路径是否正常
- 代码块语言标记是否正确
- 页面预览有没有乱码、错位、空白图
- 搜索能不能搜到关键词

## 10. 导航和侧边栏维护

要改栏目入口时，主要看这几个文件：

- `src/.vuepress/navbar.ts`
- `src/.vuepress/sidebar.ts`
- `src/.vuepress/theme.ts`
- `src/.vuepress/config.ts`

规则：

- `navbar.ts` 管顶部导航
- `sidebar.ts` 管左侧结构侧边栏
- 新增大栏目时，通常要同时看导航和侧边栏
- 普通新增文章一般不用改 `sidebar.ts`，因为这里大多用的是 `"structure"` 自动生成

## 11. 发布流程

正常流程：

1. 本地写完文章
2. `npm.cmd run docs:dev` 自查
3. 提交到 `main`
4. GitHub Actions 自动执行部署

部署文件见：

- `.github/workflows/deploy.yml`

当前实际构建目录是：

- `src/.vuepress/dist`

## 12. 我自己最常用的写法建议

- 普通文章优先写 `title + date + category + tag`
- 正文开头尽量加 `<!-- more -->`
- 图片优先本地 `assets/`
- 外链图片只在确实没法本地保存时使用
- 栏目入口页用 `README.md`
- 大段说明优先用 `tip` / `warning` / `details`
- 对比内容优先用 `tabs`
- 代码优先注明语言类型

## 13. 现成参考

可以直接参考项目里已有文件：

- 首页：`src/README.md`
- 作者页：`src/intro.md`
- Markdown 示例：`src/Tools/MarkDown/markdown01.md`
- Vue 栏目页：`src/FrontEnd/Vue/README.md`
- SQL 栏目页：`src/Database/SQL/README.md`

官方文档只作为语法补充，优先以当前项目实际配置为准：

- 入门：<https://theme-hope.vuejs.press/zh/get-started/>
- Markdown 介绍：<https://theme-hope.vuejs.press/zh/guide/markdown/>
- 提示块：<https://theme-hope.vuejs.press/zh/guide/markdown/stylize/hint.html>
- 选项卡：<https://theme-hope.vuejs.press/zh/guide/markdown/content/tabs.html>
- 任务列表：<https://theme-hope.vuejs.press/zh/guide/markdown/grammar/tasklist.html>
- 图片：<https://theme-hope.vuejs.press/zh/guide/markdown/grammar/image.html>

## 14. 以后我再维护时的原则

- 先写内容，再考虑花哨效果
- 能用现有目录就不要乱开新目录
- 能复用已有格式就不要每篇都换一套
- 全站资源和文章资源分开放
- 改配置前先确认是不是只需要改文章 Frontmatter
