---
order: 7
date: 2025-09-11
category: 
  - Redis
---



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


我之所以写徐霞客，是想告诉你，所谓百年功名、千秋霸业、万古流芳，与一件事情相比，其实算不了什么。
这件事情就是用你喜欢的方式度过一
生。人仅此一生，人生仅此一次。
你看整个明朝，无论是朱元璋、朱棣、朱由检还是张居正、徐阶、王阳明，他们都是被时代裹挟着往前走，或许他们在政治上、思想上占据顶峰，脾睨一切，可是在他们的漫漫人生中，是否有过真的快乐呢？
至少，徐霞客是真正的快乐。
当同朝的其他人在追逐富贵与功名时，徐霞客却坐在黄山绝顶，听了一整天的大雪融化声。

读史明智，近些年来愈发喜欢看明史相关的小说，越贴近史书内容，越发喜欢。 当你翻开历史的长卷，就会发现，诸如此事，屡见不鲜。无论伟大的还是渺小的，英雄的还是狗熊的，
人的一生在时间的长河里，不过是渺小而短暂的一瞬。那些曾经让我们痛不欲生的事情，在历史的宏大叙事面前，瞬间变得微不足道。 我们常常被情绪困在当下，把痛苦无限放大。
但当你跳脱出来，站在历史的高处俯瞰，你会发现，人生不过几十年，无论好坏，都只是时间长河中的一朵小浪花，甚至可能连一丝涟漪都掀不起。 
就像读历史，你会发现那些人中龙凤尚且举步维艰，
我们这些平凡人又何必纠结于一时的得失呢?正所谓:“三千年读史，无外乎功名利禄；九万里悟道，终归于田园。”读完历史，你会发现，那些曾经的辉煌与悲壮，那些曾经的功名与利禄，最终都化作了历史的尘埃。 
历史告诉我们，人之渺小在时间长河中犹如沧海一粟。 每一笔的轻描淡写，可能就是一个人波润壮阔的一生。 那些伟大的人物尚且如此，我们又何必为一时的挫折而烦恼呢? 
读史明智鉴往而知来，见天地见众生见自己


所谓百年功名、干秋霸业、万古流芳，与一件事情相比，其实算不了什么。这件事情就是用你喜欢的方式度过一生

《明朝那些事儿》最后一章，崇祯皇帝自
尽后，作者却没接着写李自成入关，而写了徐霞客。 纵观整个明王朝，无论是朱元璋，朱棣，朱赡基，还是张居正，于谦，严嵩，他们在政治上，思想上，睥睨一切，但在他们的人生中，是否有过真的快乐呢，
在其他人争名夺利时，而徐霞客坐在了黄山顶，听了一天的大雪声。 而我认为，这最后一篇章，讲解的不仅仅是历史，更是在让我们找到真正的自己，和以自己喜欢的方式度过一生。