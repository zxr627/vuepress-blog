---
order: 3
date: 2025-10-16
category: 
  - Redis

---

# 双Token鉴权机制详解

在现代 Web 项目中，**Token 鉴权机制** 已经逐渐取代了传统的 Session 认证方式。  
本文将完整介绍一套基于 **Access Token + Refresh Token** 的登录鉴权体系，  
包括前端与后端的存储、交互、刷新逻辑，以及安全设计思路。

---

## 🧩 一、整体思路概览

> 核心思想：  
> 使用短期凭证 `accessToken` 访问接口，使用长期凭证 `refreshToken` 续签新的 accessToken。

- `accessToken`：访问令牌，有效期短（例如 2 小时），每次请求都携带。
- `refreshToken`：刷新令牌，有效期长（例如 7 天），仅在 accessToken 过期时使用。
- 后端将 refreshToken 存储在 Redis 中，用于校验和失效控制。
- 前端将 accessToken 存储在浏览器中，用于每次接口访问。

---

## 🚪 二、登录阶段（Token 生成与存储）

### 1️⃣ 前端行为
用户在登录页输入手机号和验证码（或账号密码），向后端发起登录请求：

该请求不携带任何 Token。

### 2️⃣ 后端行为
后端校验登录信息成功后，生成：

- `accessToken`：有效期 2 小时；
- `refreshToken`：有效期 7 天；

并执行以下操作：

- 将 refreshToken 存入 Redis：

```
key: refresh_token:{userId}
value: <refreshToken>
TTL: 7 days
```

- 返回给前端：

```json
{
  "accessToken": "xxxxxx",
  "refreshToken": "yyyyyy"
}
```

### 3️⃣ 前端存储
前端拿到 Token 后：

- 将 **accessToken** 加密存入 `localStorage` 或 `sessionStorage`；
- 将 **refreshToken** 临时存储在内存或会话存储中；
- 之后每次请求接口时自动携带：

```
Authorization: Bearer <accessToken>
```

---

## 🌐 三、接口请求阶段（正常访问）

### 1️⃣ 前端行为
用户在操作页面时发起各种 API 请求，  
请求头中会自动附带 accessToken：

### 2️⃣ 后端行为
后端拦截请求，验证 accessToken：

| 情况 | 处理方式 |
|------|-----------|
| Token 有效 | 放行请求 |
| Token 无效（签名错误） | 返回 `401 Unauthorized` |
| Token 过期 | 返回特定错误码，如：`40101` |

---

## 🔁 四、Token 刷新阶段（accessToken 过期）

当 accessToken 过期时，系统不要求用户重新登录。  
流程如下：

### 1️⃣ 前端检测
在 Axios 响应拦截器中检测到响应状态为 `40101`（accessToken 过期），  
则自动调用刷新接口：

```js
POST /api/refresh
{
  "refreshToken": "yyyyyy"
}
```

### 2️⃣ 后端处理
后端接收到 refreshToken 后：

1. 从 Redis 中查找 `refresh_token:{userId}`；
2. 若存在且匹配，则说明 refreshToken 有效；
3. 生成新的 accessToken；
4. 更新 Redis 中的存储（可选择刷新 refreshToken 一并更新）；
5. 返回新的 accessToken 给前端。

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### 3️⃣ 前端更新
前端拿到新的 accessToken 后：

- 更新本地存储；
- 重新发起原本失败的请求；
- 用户体验无感知。

---

## ⚠️ 五、刷新失败（refreshToken 过期）

当 refreshToken 也过期时，系统不再允许自动续期。

### 1️⃣ 后端行为
后端校验 Redis 中的 refreshToken 时发现：
- key 不存在；
- 或者已超出有效期；
- 或者值不匹配（被强制下线）。

此时返回：

```json
{
  "code": 401,
  "msg": "refreshToken已过期，请重新登录"
}
```

### 2️⃣ 前端行为
响应拦截器捕获到该状态后：

- 清空本地 Token；
- 跳转到登录页；
- 提示用户重新登录。

---

## 🚪 六、退出登录或强制下线

### 前端：
- 调用登出接口 `/logout`；
- 清空本地存储（accessToken、refreshToken）。

### 后端：
- 删除 Redis 中对应的 refreshToken；
- 若用户尝试携带旧的 accessToken 调用接口，会直接鉴权失败。

---

## 🧠 七、Token 生命周期示意图

```
[ 登录 ]
   ↓
生成 accessToken(2h) & refreshToken(7d)
   ↓
[ 正常请求 - 带 accessToken ]
   ↓
(2h 到期)
   ↓
[ 调用 refreshToken 刷新 Token ]
   ↓
→ refreshToken 有效 → 获取新 accessToken → 继续使用
→ refreshToken 失效 → 返回登录页重新登录
```

---

## 🔒 八、安全建议

| 建议 | 说明 |
|------|------|
| ✅ HTTPS | 所有请求必须走 HTTPS |
| ✅ refreshToken 存储 | 建议仅存于内存或 Session，而非 localStorage |
| ✅ 登出时清理 | 确保 Redis 和前端同时清空 Token |
| ✅ Token 绑定 | 可在 Token 中绑定 userId、设备标识、IP 等信息 |
| ✅ 轮换策略 | 每次刷新都生成新的 refreshToken，提升安全性 |

---

## 🧾 九、配置参数推荐

| 项目 | 说明 | 建议值 |
|------|------|--------|
| Access Token 有效期 | 用户正常使用的时间段 | 2 小时 |
| Refresh Token 有效期 | 用于续签的最长时间 | 7 天 |
| Redis Key 命名 | 防止冲突 | `refresh_token:{userId}` |
| Token 存储位置 | 前端 | localStorage（加密后） |
| Token 存储位置 | 后端 | Redis（带 TTL） |

---

## 🧭 十、总结

整个 Token 鉴权体系遵循以下原则：

> 短期凭证（Access Token）负责访问，  
> 长期凭证（Refresh Token）负责续命。
>
> 后端用 Redis 控制刷新权限，  
> 前端用拦截器实现自动续签。
>
> 当 Refresh Token 过期或被删除时，  
> 用户必须重新登录，安全与体验兼得。

---

