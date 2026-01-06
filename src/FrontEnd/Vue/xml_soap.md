---
order: 10
date: 2026-01-05
category:
  - Vue
---


# 前端中的 XML 请求与 SOAP 接口对接解析

在现代前端开发中，绝大多数接口通信都通过 **RESTful API + JSON** 完成。然而在某些传统系统中，尤其是**银行、三大运营商、政府系统、企业内部老旧服务（如 ESB、中间件）、SOA 服务体系**，仍然大量使用 **XML + SOAP** 的通信方式。

本篇文章将深入讲解：
- 为什么现在还会遇到 XML 请求
-  XML / SOAP 的通信结构
- 🛠 前端如何构造 XML 请求
- ⚡ 实际项目中如何从 JSON 转成 XML
- 🛡 常见坑点与排查方法
- 📌 前端开发 SOAP/XML 接口的最佳实践

---

## 1. 为什么前端还会遇到 XML 请求？

XML 在 2000 年前后广泛用于企业系统，是 SOAP 协议的基础格式。虽然现代 Web API 已全面 JSON 化，但旧系统仍然沿用 XML。

常见使用场景：

| 场景 | 原因 |
|------|------|
| 银行系统 | 安全审计要求、老旧 ESB 系统、统一报文规范 |
| 运营商内部平台 | BSS/OSS 老系统仍使用 SOAP |
| 政府平台 | 行政审批系统很多十几年前建设 |
| 企业 SOA 中间件 | 某些只支持 SOAP/WSDL |
| 第三方传统 WebService | 系统未改造 JSON API |

所以，在**前端调用旧系统接口**时，很可能要用到：

- XML 请求体（text/xml）
- SOAP Envelope 格式
- 甚至需要构造带 namespace 的复杂 XML

---

## 2. XML / SOAP 请求结构说明

一个典型 SOAP Envelope 示例：

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ns:getUser xmlns:ns="http://example.com/">
        <id>1001</id>
    </ns:getUser>
  </soap:Body>
</soap:Envelope>
```

关键组成：

- **Envelope**：SOAP 最外层包裹
- **Header**：可选，放认证、签名、Token 等
- **Body**：真正的业务数据
- **Namespace**：用于标识 XML 节点来源

---

## 3. 前端如何构造 XML 请求？

使用 `axios` 或 `fetch` 即可，只要：

1. `Content-Type` 为 `text/xml`
2. 手动写 XML 字符串
3. 把 XML 当成普通字符串发送

示例：

```ts
const xmlBody = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUserInfo>
      <phone>${phoneNumber}</phone>
    </getUserInfo>
  </soap:Body>
</soap:Envelope>
`;

const res = await fetch("/api/soap", {
  method: "POST",
  headers: {
    "Content-Type": "text/xml;charset=utf-8"
  },
  body: xmlBody
});
```

---

## 4. 如何把 JSON 数据转成 XML？

现代前端不手写 XML，而是用库自动生成，例如：

- **xml-js**
- **xmlbuilder2**
- **fast-xml-parser**

示例（xmlbuilder2）：
```ts
import { create } from "xmlbuilder2";

const obj = {
    "soap:Envelope": {
        "@xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
        "soap:Body": {
            getUser: {
                id: "1001"
            }

        }
  }
};

const xml = create(obj).end({ prettyPrint: true });
```

---

## 5. 前端 XML 请求常见坑点

###  1. Content-Type 填错
SOAP 必须使用：


```
text/xml;charset=utf-8
```

###  2. XML 有多余空格或换行
某些旧系统会严格校验 XML 格式。

###  3. Namespace 不匹配
如果你有这种报错：

```
Cannot find namespace prefix
```

代表节点声明必须一致。

###  4. 前端跨域问题
SOAP 一样会触发 CORS，需要后端或代理处理。

###  5. 部分 SOAP 服务需要 SOAPAction
旧系统要求 header：

```
SOAPAction: "getUser"
```

---

## 6. 实战：前端发送 SOAP 请求（完整示例）

```ts
const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.test.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:queryUser>
      <phone>${phone}</phone>
    </ser:queryUser>
  </soapenv:Body>
</soapenv:Envelope>
`;

const response = await axios.post("https://api.example.com/user", xml, {
  headers: {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "queryUser"
  }
});
```



---

## 7. 返回结果如何处理？

很多 SOAP 返回是 XML，需要转换为 JSON：

```ts
import { xml2js } from "xml-js";
const json = xml2js(response.data, { compact: true });
```

---


## 8. 前端处理 XML/SOAP 的最佳实践
✔ 使用 XML Builder 自动生成 XML  
✔ 避免手写复杂 namespace  
✔ 返回结果用 xml-js 转成 JSON  
✔ 非必要不直接访问 SOAP，建议后端做透传  
✔ 若系统庞大，强烈建议逐步 JSON 化

---

## 结语

虽然 XML/SOAP 在现代 Web 开发中已不常见，但在 **ToB、政企、运营商、银行等传统业务系统中仍被大量使用**。

掌握 XML 与 SOAP 请求处理能力，将在维护旧系统、对接传统接口时大幅提升效率。


