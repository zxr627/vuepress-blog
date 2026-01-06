---
order: 1
date: 2026-1-5
category: 
  - Vue
---



# RackNerd服务器搭建 Shadowsocks 教程

这篇文档教你如何在 **RackNerd 的 VPS** 上搭建 **Shadowsocks（SS）** 服务。

考虑到不同用户的使用习惯，本文提供两种方案：

1. **经典脚本方案**：基于 GitHub 上常用的一键脚本（适合熟悉命令行的用户）。  
2. **可视化面板方案（推荐）**：使用 **X-UI 面板**，支持新协议、配置直观、安全性更高。

> **强烈建议优先使用方案二**，支持最新加密算法，更稳定、不容易被封锁。

---

## 一、准备工作

在开始之前，请确保你已经购买了海外服务器，并收到了开通邮件。

你需要准备以下信息：

- **服务器 IP**：邮件中的 `Main IP Address`
- **登录账号**：`root`
- **登录密码**：邮件中的 `Root Password`
- **SSH 连接工具**：
  - Windows：FinalShell / PuTTY
  - macOS / Linux：终端（Terminal）

### 登录服务器

```bash
ssh root@你的服务器IP
```

> 输入密码时终端不会显示内容，直接输入完成后回车即可。

---

## 二、方案一：经典脚本安装（传统方式）

该方案使用一键脚本快速安装 Shadowsocks，适合熟悉 Linux 命令行的用户。

### 1️⃣ 下载并运行安装脚本

```bash
yum install wget
wget –no-check-certificate -O shadowsocks.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks.sh
chmod +x shadowsocks.sh
```
开源地址参照：[clown-coding/vpn](https://github.com/clown-coding/vpn)



### 2️⃣ 按提示配置参数

脚本运行过程中会依次询问：

- **Password（密码）**：设置连接用密码  
- **Port（端口）**：建议使用 `10000 - 60000` 之间的端口  
- **Encryption（加密方式）**：
  - `7`：aes-256-cfb（兼容性好）
  - `16`：aes-256-gcm（更安全，推荐）

看到提示 **Enjoy it** 即表示安装成功。

---

## 三、方案二：X-UI 可视化面板安装（推荐）

该方案通过 Web 后台管理账号，支持更新的 Shadowsocks 2022 协议，更加安全、稳定。

### 1️⃣ 安装 X-UI 面板

```bash
bash <(curl -Ls https://raw.githubusercontent.com/vaxilu/x-ui/master/install.sh)
```

安装过程中需要设置：

- **面板账号**（默认：admin）
- **面板密码**（默认：admin）
- **面板端口**（建议使用冷门端口，如 `54321`）

### 2️⃣ 浏览器访问面板

在浏览器中打开：

```
http://你的服务器IP:面板端口
```

登录后操作步骤：

1. 点击左侧 **入站列表**
2. 点击 **添加**
3. 协议选择：`shadowsocks`
4. **加密方式（强烈推荐）**：  
   `2022-blake3-aes-128-gcm`
5. 设置端口
6. 点击 **添加**

创建完成后：

- 点击 **查看**
- 扫描二维码或复制链接
- 导入到客户端即可使用

---

## 四、必做步骤：开启 BBR 加速

> 不开启 BBR，高峰期看视频、下载会非常慢。

### 1️⃣ 检查是否已开启

```bash
sysctl net.ipv4.tcp_congestion_control
```

如果输出包含 `bbr`，说明已经开启。

### 2️⃣ 强制开启 BBR（未开启时）

```bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```

再次检查，确认出现 `bbr` 即可。

---

## 五、客户端软件下载推荐

| 设备 | 推荐客户端 |
|----|----|
| Windows | v2rayN / Shadowsocks-Windows |
| Android | v2rayNG / Shadowsocks |
| iPhone | Shadowrocket（需非国区 Apple ID） |
| macOS | V2RayXS / Clash Verge |

---

## 六、常见问题排查

### Q1：连不上怎么办？

- 检查服务器端口是否放行  
- 可临时关闭防火墙测试：

```bash
ufw disable
```

- 登录 RackNerd 控制台确认服务器状态为 **Running**
- 本地 `ping` 服务器 IP，若不通可能 IP 被封

---

### Q2：速度慢怎么办？

- 确认 **BBR 已开启**
- 晚上 8 点 - 11 点是高峰期，廉价 VPS 速度下降属正常现象
- 建议避开高峰期下载或看高清视频

---

