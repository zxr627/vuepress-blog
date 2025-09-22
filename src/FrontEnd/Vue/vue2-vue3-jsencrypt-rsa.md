---
title: 使用JSEncrypt进行加密的踩坑总结
date: 2025-09-22
order: 8
tags:
  - Vue3
  - Vue2
  - Vue
  - JSEncrypt
  - 前端加密
categories:
  - 技术
---

# Vue2 → Vue3 项目中使用 JSEncrypt 进行加密的踩坑总结
    
记录最近项目需要用到 **RSA 加密** 遇到的问题 ---------- `Message too long for RSA`，以及解决方法。

## 背景

- 项目使用 npm 包 [`jsencrypt`](https://www.npmjs.com/package/jsencrypt) 进行加密。
- 主要用于登录密码、刷新 token 等接口字段的加密。

加密代码（最开始的写法）：

```js
let encryptedData = (data, key = PUBLIC_KEY) => {
  let encryptor = new JSEncrypt();
  encryptor.setPublicKey(key);
  let cptData = encryptor.encrypt(data);
  return cptData;
};
```

## 问题

在项目中需要加密一个比较长的字符串时，加密直接失败，返回 `false`，并报错：

```
Message too long for RSA
```

## 尝试过程

网上搜到一个方案：**换用另一个库 [encryptlong](https://www.npmjs.com/package/encryptlong)**，号称可以解决长字符串加密问题。  

改造代码如下：

```js
const { JSEncrypt } = require("encryptlong");

let encryptedData = (data, key = PUBLIC_KEY) => {
  let encryptor = new JSEncrypt();
  encryptor.setPublicKey(key);
  let cptData = encryptor.encryptLong(data);
  return cptData;
};
```

但是在我的场景里（只是加密登录密码、refreshToken 这种长度本来就不长的字段），  
**这个方案完全无效**，问题依然存在。

## 真实原因

后来发现问题根本不在数据过长，而是我在 **Vue3 重构项目时公钥没有正确设置**。  

Vue2 的写法里，`setPublicKey` 是在初始化时就设置过的；  
但我在 Vue3 项目里写了一个函数：

```ts
function encryptWithPublicKey(text: string): string {
  encryptor.setPublicKey(PUBLIC_KEY);
  const encrypted = encryptor.encrypt(text);
  return encrypted || '';
}
```

⚠️ 结果我实际调用时，并没有用 `encryptWithPublicKey`，而是直接写成：

```ts
{ refreshToken: encryptor.encrypt(refreshToken) }
```

这样就导致 **公钥从头到尾都没有被设置过**，加密自然失败。  
报错信息里出现的 `Message too long for RSA`，其实是一个 **误导性的提示**。

## 解决方法

### ✅ 方法 1：初始化时就设置公钥

```ts
import JSEncrypt from 'jsencrypt';

const encryptor = new JSEncrypt();

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
xxx...
-----END PUBLIC KEY-----`;

// 初始化时直接设置一次公钥
encryptor.setPublicKey(PUBLIC_KEY);

export function encryptWithPublicKey(text: string): string {
  const encrypted = encryptor.encrypt(text);
  return encrypted || '';
}

export { encryptor };
```

调用方式：

```ts
// 登录加密
const encryptedPassword = encryptWithPublicKey(password);

// 刷新 token
const refreshToken = encryptor.encrypt(localStorage.getItem('refreshToken'));
```

### ✅ 方法 2：强制使用封装好的函数

```ts
{ refreshToken: encryptWithPublicKey(refreshToken) }
```

确保每次加密都会重新设置公钥。

## 总结

- RSA 本身的确有加密长度限制（常见 1024-bit 公钥最多 117 字节）。  
- 但本项目里的字段本来就很短，不会超长。真正原因是 **Vue3 项目里公钥没有初始化**。  
- 看到 `Message too long for RSA` 报错时，不要盲目以为是数据超长，也要检查 **公钥是否正确设置**。  
- 最佳实践：**在初始化阶段设置一次公钥，避免依赖调用时再去设置**。

---

