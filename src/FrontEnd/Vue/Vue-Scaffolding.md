---
order: 8
date: 2025-11-28
category: 
  - Vue
---

# MobileTopup Admin 脚手架·开发指南

## 1. 项目介绍
基于 Vue3 + Vite + TypeScript + Element Plus + Pinia + TailwindCSS 构建的Vue3后台管理系统模板。
这个项目说白了，就是我自己专用的后台通用脚手架模板。  
以后再做任何后台系统，都不需要从零开始折腾环境、调路由、封 axios、写主题……  
改标题 → 换 Logo → 对下接口 → 加点页面，就能开工。

整个项目基于：

- **Vue3**（更快更爽）
- **Vite**（启动快到飞起）
- **TS**（不写类型就浑身难受）
- **Element Plus**（能省多少 UI 就省多少）
- **Pinia**（比 Vuex 省心）
- **TailwindCSS**（写样式像搭积木）

简单来说就是：**主流 + 稳定 + 不折腾 + 扩展友好。**

做这个脚手架的出发点很朴素：

- **后台项目八成长得都差不多，能复用就别重复写。**
- **把每次项目都要做的通用功能固化下来。**
- **让以后启动一个新后台比泡杯咖啡还快。**



框架内置了动态菜单、亮暗主题、运行时配置、常用组件库、统一请求封装等能力。  
你可以把它当成：

> **一个可无限复制的后台系统底盘，只需要按你的需求“上外壳”。**

一句话总结：  
**为了不再造轮子！**


## 2. 目录结构

```text
├── build           # 构建工具
│   ├── cdn.ts      # 打包时采用 cdn 模式
│   ├── compress.ts # 打包时启用 gzip 压缩或 brotli 压缩
│   └── utils.ts    # 构建工具常用方法抽离
├── mock            # mock 模拟后台数据
│   ├── asyncRoutes.ts # 模拟后台返回动态路由
│   └── ...
├── node_modules    # 模块依赖
├── public          # 静态资源
│   ├── favicon.ico # favicon
│   ├── logo.svg    # logo
│   └── platform-config.json # 全局配置文件（打包后修改也可生效）
├── src
│   ├── api         # 接口请求统一管理（基础接口定义）
│   ├── assets      # 字体、图片等静态资源
│   ├── components  # 自定义通用组件
│   │   ├── ReAnimateSelector # animate.css 选择器组件
│   │   ├── ReAuth    # 按钮级别权限组件（根据路由meta中的auths字段判断）
│   │   ├── ReBarcode # 条形码组件
│   │   ├── ReCol     # 封装 element-plus 的 el-col 组件
│   │   ├── ReCountTo # 数字动画组件
│   │   ├── ReCropper # 图片裁剪组件
│   │   ├── ReCropperPreview # 图片裁剪预览组件
│   │   ├── ReDialog  # 基于 el-dialog 组件开发的函数式弹框
│   │   ├── ReFlicker # 圆点、方形闪烁动画组件
│   │   ├── ReFlop    # 时间翻牌组件
│   │   ├── ReFlowChart # LogicFlow 流程图组件
│   │   ├── ReIcon    # 图标组件
│   │   ├── ReImageVerify # 图形验证码组件
│   │   ├── ReMap     # 高德地图组件
│   │   ├── RePerms   # 按钮级别权限组件（根据登录接口返回的permissions字段判断）
│   │   ├── RePureTableBar # 配合 @pureadmin/table 实现快速便捷的表格操作
│   │   ├── ReQrcode  # 二维码组件
│   │   ├── ReSeamlessScroll # 无缝滚动组件
│   │   ├── ReSegmented # 分段控制器组件
│   │   ├── ReSelector # 选择器组件
│   │   ├── ReSplitPane # 切割面板组件
│   │   ├── ReText    # 支持 Tooltip 提示的文本省略组件
│   │   ├── ReTreeLine # 树形连接线组件（基于element-plus）
│   │   ├── ReTypeit  # 打字机效果组件
│   │   └── ReVxeTableBar # 配合 vxe-table 实现快速便捷的表格操作
│   ├── config      # 获取平台动态全局配置
│   ├── directives  # 自定义指令
│   │   ├── auth    # 按钮级别权限指令（根据路由meta中的auths字段判断）
│   │   ├── copy    # 文本复制指令（默认双击复制）
│   │   ├── longpress # 长按指令
│   │   ├── optimize # 防抖、节流指令
│   │   ├── perms   # 按钮级别权限指令（根据登录接口返回的permissions字段判断）
│   │   └── ripple  # 水波纹效果指令
│   ├── layout      # 主要页面布局
│   ├── plugins     # 处理一些库或插件，导出更方便的 api
│   ├── router      # 路由配置
│   ├── store       # pinia 状态管理
│   ├── style       # 全局样式
│   │   ├── dark.scss # 暗黑模式样式适配文件
│   │   ├── element-plus.scss # 全局覆盖 element-plus 样式文件
│   │   ├── reset.scss # 全局重置样式文件
│   │   ├── sidebar.scss # layout 布局样式文件
│   │   └── tailwind.css # tailwindcss 自定义样式配置文件
│   ├── utils       # 全局工具方法
│   │   ├── http    # 封装 axios 文件
│   │   ├── localforage # 二次封装 localforage，支持设置过期时间，提供完整的类型提示
│   │   ├── progress # 封装 nprogress
│   │   ├── auth.ts # 处理用户信息和 token 相关
│   │   ├── chinaArea.ts # 汉字转区域码
│   │   ├── globalPolyfills.ts # 解决 `global is not defined` 报错
│   │   ├── message.ts # 消息提示函数
│   │   ├── mitt.ts # 触发公共事件，类似 EventBus
│   │   ├── preventDefault.ts # 阻止默认行为（F12、右键菜单、元素选中等）的方法
│   │   ├── print.ts # 打印函数
│   │   ├── propTypes.ts # 二次封装 vue 的 propTypes
│   │   ├── responsive.ts # 全局响应式 storage 配置
│   │   ├── sso.ts # 前端单点登录逻辑处理
│   │   └── tree.ts # 树结构相关处理函数
│   ├── views       # 存放编写业务代码页面
│   ├── App.vue     # 入口页面
│   └── main.ts     # 入口文件
├── types           # 全局 TS 类型配置
│   ├── directives.d.ts # 全局自定义指令类型声明
│   ├── global-components.d.ts # 自定义全局组件获得 Volar 提示
│   ├── global.d.ts # 全局类型声明（无需引入即可使用）
│   ├── index.d.ts  # 零散的全局类型声明（无需引入即可使用）
│   ├── router.d.ts # 全局路由类型声明
│   ├── shims-tsx.d.ts # 为 .tsx 文件提供类型支持
│   └── shims-vue.d.ts # 告诉 typescript 识别 .vue、.scss 文件类型
└── ... (各类配置文件)
    ├── .env.development # 开发环境变量配置
    ├── .env.production  # 生产环境变量配置
    ├── .env.staging     # 预发布环境变量配置
    ├── eslint.config.js # eslint 语法检查配置
    ├── tailwind.config.ts # tailwindcss 配置
    └── vite.config.ts   # vite 配置
```

## 3. 开箱使用指南

### 3.1 新项目必改项

| 序号 | 配置项    | 文件路径 | 描述 |
| :--- |:-------| :--- | :--- |
| 1 | 系统标题   | `/public/platform-config.json` | 修改 `Title` 变量。 |
| 2 | 系统Logo | `/public/logo.svg` | 替换为项目需要的 Logo 文件。 |
| 3 | 接口地址   | `/src/utils/http/index.ts` | 修改 `baseURL` 变量。 |
| 4 | 登录接口   | `/src/api/user.ts` | 修改 `getLogin` 方法的实现。 |
| 5 | 获取路由接口 | `/src/api/routers.ts` | 修改 `getAsyncRoutes` 方法的实现。 |

### 3.2 业务请求规范

与传统后台项目不同，我不喜欢创建过多零散的 API 文件，直接在业务组件中直接做网络请求。

**请求示例:**

```ts
// 假设 netApi 是封装好的请求实例
try {
    const res = await netApi.post('/auth/sendCode', {
        account: ruleForm.username
    });

    if (res.code === 200) {
        message("验证码发送成功", { type: "success" });
    } else {
        message(res.msg || "验证码获取失败", { type: "error" });
    }
} catch {
    message("验证码获取异常", { type: "error" });
}

```

### 3.3 动态路由与菜单添加

#### 3.3.1 后端返回路由格式要求

后端返回的路由数据必须包含 `path`、`name` 和 `meta` 字段。`meta` 中的 `index` 字段用于排序，值越小排序越靠前。

**后端路由数据示例:**

```json
{
    "code": 200,
    "msg": "权限查询成功",
    "data": [
        {
            "path": "/RechargeRecord",
            "name": "RechargeRecord",
            "meta": { "title": "充值记录", "index": "1" }
        },
        {
            "meta": { "title": "系统配置", "index": "5" },
            "children": [
                {
                    "path": "/projectInfo",
                    "name": "projectInfo",
                    "meta": { "title": "项目详情", "index": "5-1" }
                }
            ]
        }
    ]
}
```

不必创建多余的 xxxApi.ts，代码方便维护，更利于阅读 ，适合小型/中型后台项目。请求结果与 UI 强关联时，组件内处理更合理 ，当然，如果你想保持“接口层统一管理”，脚手架依然支持在 /api 目录集中管理。

#### 3.3.2 前端添加新页面

如需添加新的菜单路由，只需在 **`/src/views/dynamic`** 文件夹下创建对应的 **Vue 文件**。该文件夹下的 `.vue` 文件会被系统自动识别为动态路由页面，并根据后端返回的路由数据添加到菜单中。

**动态组件匹配机制 (`/src/router/index.ts`):**

系统通过 `import.meta.glob` 自动导入 `/src/views/dynamic/**/*.vue` 下的所有组件，并尝试根据路由对象的 `name` 或 `path` 匹配对应的 Vue 文件名。

```ts
// 查找 dynamic 下对应 Vue 文件（支持嵌套路径）
const compKey = Object.keys(dynamicComponents).find(key =>
  key.endsWith(`${compName}.vue`) ||
  key.includes(`${route.component?.split('/').pop()}.vue`)
);
```
## 4.待完善内容（To Be Improved）

以下章节将在后续补充更完整的业务逻辑、最佳实践与工程化方案：
### 1. 具体业务逻辑（具体问题具体分析）
针对不同后台场景（财务、商户、订单、营销等）的业务拆解与通用模式总结。
### 2. 最佳实践：表格 / 弹窗 / 上传 / 分页的统一模式
统一管理后台常见交互（CRUD / 弹窗表单 / 文件上传），沉淀可复用代码模板。
### 3. 大型后台项目的目录组织策略
如何设计适合中大型后台项目的目录结构，包括模块拆分、按业务划分、公共层抽象等。
### 4. 多端主题适配规范（亮色 / 暗色）
从 UI 体系、CSS 变量、Element Plus 主题覆盖三个角度制定主题适配策略。
### 5. 自定义 Hooks 与公共逻辑抽取方式
基于 Vue 组合式 API，如何沉淀 CRUD、请求、表单等通用 Hook。

---
以上内容将在未来版本中持续补充完善。
