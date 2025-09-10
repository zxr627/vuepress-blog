# Redis 学习小结 —— 以 Refresh Token 存储为例

## 📖 Redis 简介
Redis（Remote Dictionary Server）是一个基于内存的高性能 **键值数据库**，以其超快的读写速度、丰富的数据结构和内置过期机制，被广泛应用在缓存、分布式存储、消息队列等场景中。

**常见应用场景：**
- **缓存层**：减少数据库压力，加快响应速度
- **分布式锁**：利用原子操作实现高效锁机制
- **消息队列**：通过 `list` 或 `stream` 作为消息中转
- **Token 管理**：存储用户登录状态和刷新令牌（Refresh Token）

---

## 🔑 为什么要用 Refresh Token
在 Web 系统中，用户认证通常使用 JWT（JSON Web Token）。

但存在一个矛盾：
- **Access Token 太长**：容易泄露，风险高
- **Access Token 太短**：用户频繁掉线，体验差

👉 于是就有了 **双 Token 机制**：
- **Access Token**：短期有效（如 15 分钟），用于接口调用认证
- **Refresh Token**：长期有效（如 7 天），用于刷新 Access Token

这样即便 Access Token 过期，用户只要 Refresh Token 还有效，就可以“无感续期”，提升体验。

---

## 📦 为什么选择 Redis 存储 Refresh Token
- **高性能**：Redis 基于内存，读写速度极快
- **天然过期机制**：支持 TTL（Time To Live），不用额外写清理逻辑
- **集中式管理**：分布式环境下多服务共享同一份 Redis
- **易于注销**：用户退出时，直接删除 Redis 的 Key 即可

---

## ⚙️ Refresh Token 存储思路
1. 用户登录成功后：
    - 生成 **Access Token**（短期）
    - 生成 **Refresh Token**（长期）
    - 将 Refresh Token 存入 Redis，并设置过期时间

2. 用户刷新 Access Token 时：
    - 校验用户传来的 Refresh Token 是否和 Redis 中一致
    - 如果有效 → 生成新的 Access Token
    - 如果无效 / 过期 → 要求重新登录

---

## 📝 Redis 存储示例
常见的存储方式：**用户 ID 作为 key**，Refresh Token 作为 value。

```bash
SETEX refresh_token:123 604800 "eyJhbGciOiJIUzI1NiIs..."

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// 保存 Refresh Token（7 天有效期）
async function saveRefreshToken(userId, token) {
  await redis.set(`refresh_token:${userId}`, token, "EX", 7 * 24 * 60 * 60);
}

// 校验 Refresh Token 是否有效
async function verifyRefreshToken(userId, token) {
  const storedToken = await redis.get(`refresh_token:${userId}`);
  return storedToken === token;
}

// 删除 Refresh Token（用户登出）
async function deleteRefreshToken(userId) {
  await redis.del(`refresh_token:${userId}`);
}
