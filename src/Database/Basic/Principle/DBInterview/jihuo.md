---
order: 5
date: 2026-09-15
category: 
  - 激活
---


# Microsoft Activation Scripts（MAS）使用教程



本教程仅用于虚拟机内学习研究，**商业环境严禁使用**，有条件请购买微软正版授权。

---

## 一、官方地址

| 用途 | 地址 |
|---|---|
| **官方网站** | https://massgrave.dev/ |
| **GitHub 源码仓库** | https://github.com/massgravel/Microsoft-Activation-Scripts |
| 备用仓库（Azure DevOps） | https://massgrave.dev/ 首页「Latest Release」区链接 |
| 备用仓库（自托管 Git） | https://massgrave.dev/ 首页「Latest Release」区链接 |
| 最新版本 | **v3.12**（2026-07-04 发布） |


---

## 二、工具简介

**MAS（Microsoft Activation Scripts）** 是一套**完全开源**的 Windows 与 Office 激活脚本，使用批处理脚本编写，内置 **4 套激活方案**，并附带高级故障排查功能：

- **HWID**：永久激活 Windows（数字许可证）
- **Ohook**：永久激活 Office
- **TSforge**：永久激活 Windows / ESU 扩展更新 / Office
- **Online KMS**：激活 Windows / Office 180 天（配合自动续期任务可长期使用）

特点是：不安装后台服务、不常驻内存、杀毒软件检出率低、代码完全透明可自查。

---

## 三、功能特性

- HWID（数字许可证）：永久激活 Windows
- Ohook：永久激活 Office
- TSforge：永久激活 Windows、ESU 扩展更新和 Office
- Online KMS：激活 Windows/Office 180 天（配合续期任务可长期使用）
- 高级激活故障排查
- `$OEM$` 预激活支持（制作预激活安装盘）
- 更改 Windows 版本（如 Home→Pro）
- 更改 Office 版本（如 Retail→Volume）
- 检查 Windows/Office 激活状态
- 提供「全合一版」与「单独文件版」
- 完全开源、基于批处理脚本
- 杀毒软件检出率较低

---

## 四、激活方式对比表

| 激活方式 | 支持产品 | 激活时长 | 需要联网 |
|---|---|---|---|
| HWID | Windows 10-11 | **永久** | 是 |
| Ohook | Office 全系列 | **永久** | 否 |
| TSforge | Windows / ESU / Office | **永久** | 仅 StaticCID 方法需要（Windows 11 26100 及以上构建） |
| Online KMS | Windows / Office | **180 天**（配合续期任务可长期） | 是 |

> 若需激活 Mac 版 Office 等不受支持的产品，请参考官网「Unsupported Products」说明。

---

## 五、方法一：PowerShell 在线一键运行（官方推荐）

支持 **Windows 8.1 / 10 / 11**，最便捷，无文件残留。

1. 按下键盘 `Win` 键，搜索 **PowerShell**，**右键选择「以管理员身份运行」**。
   > Windows 11 也可以打开「Windows 终端（管理员）」。

2. 复制下面完整命令，粘贴到窗口，按回车执行：

```powershell
irm https://get.activated.win | iex
```

> 命令说明：`irm`（Invoke-RestMethod）从指定网址下载脚本，`iex`（Invoke-Expression）直接执行该脚本。**务必确认域名是 `get.activated.win`**，网上大量恶意版本篡改了这条命令的域名。

3. 等待脚本加载完成，弹出操作菜单，输入菜单中**绿色高亮选项**对应的数字，按回车，等待激活完成即可。

### 常见报错修复

1. **运营商屏蔽网址，命令执行失败（Windows 10/11）**
   部分运营商/ISP 会屏蔽官方域名，用下面这条命令开启 DoH（DNS-over-HTTPS）绕过：

```powershell
iex (curl.exe -s --doh-url https://1.1.1.1/dns-query https://get.activated.win | Out-String)
```

2. **TLS/SSL 报错（旧版 Win8.1、老版本 Win10）**
   先执行下面这条命令开启 TLS 1.2，之后再运行主激活命令：

```powershell
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
```

3. **以上都无效**
   使用 Cloudflare WARP 等 VPN 工具，或改用「方法二：传统离线文件方式」。

---

## 六、方法二：传统离线文件方式（命令被拦截时使用）

适合浏览器/杀毒软件/网络策略拦截命令的场景，下载本地脚本运行。

1. 在官网下载文件：
    - **`MAS_AIO.cmd`**（直接脚本文件）
    - 若浏览器阻止 .cmd 文件下载，则下载 **`MAS_AIO.zip`**（压缩包）
2. 解压压缩包（如果下载的是 zip），**右键 `MAS_AIO.cmd`，选择「以管理员身份运行」**。
3. 在弹出的菜单中，输入**绿色高亮选项**对应的数字，按回车执行激活。

> 小提示：部分运营商 DNS 会屏蔽官方域名，可在浏览器中开启 **DNS-over-HTTPS（DoH）** 解决访问失败问题。

---

## 七、HWID 激活（Windows 永久激活）

### 适用产品
仅支持 **Windows 10 / 11**（x86、x64、arm64 全架构），**不支持 Windows Server**。

### 原理
利用微软官方「数字许可证」机制：脚本安装对应版本的通用零售密钥，生成正版授权票据（GenuineTicket.xml），联网向微软服务器换取**绑定硬件（HWID）的数字许可证**，永久有效。

### 重要特点
- **不在系统中存储或修改任何文件**
- 激活后可正常绑定微软账户
- 激活记录保存在**微软服务器**上，系统本地无法删除
- 更换主板等重大硬件变化可能导致失效；若已绑定微软账户，可重新激活
- 重装系统后自动激活的条件：① 联网；② 使用**零售（Consumer）版**安装介质；③ 若用批量（VL/Business）版介质安装，需手动输入对应版本的通用零售密钥（见下表）

### 操作步骤
1. 管理员打开 PowerShell 执行官方一行命令，调出 MAS 主菜单
2. 选择 **HWID Activation**（菜单绿色高亮选项），输入对应数字回车
3. 等待脚本完成，出现绿色提示 `Windows 10 Pro is permanently activated with a digital license.` 即成功

### 成功界面（官网截图）

![HWID激活成功界面](https://aka.doubaocdn.com/s/Abc6uKFrdo)

> 截图说明：脚本依次检测系统信息（Windows 10 Pro | 19045.6456 | AMD64）→ 检测网络（Connected）→ 诊断测试 → 检查 WPA 注册表计数 → 安装通用产品密钥 → 生成 GenuineTicket.xml → 激活成功（绿色高亮）。

### 支持的 Windows 10/11 版本及通用密钥表（官网原文）

| Windows 10/11 产品 | EditionID | 通用零售/OEM/MAK 密钥 |
|---|---|---|
| Education | Education | YNMGQ-8RYV3-4PGQ3-C8XTP-7CFBY |
| Education N | EducationN | 84NGF-MHBT6-FXBX8-QWJK7-DRR8H |
| Enterprise | Enterprise | XGVPP-NMH47-7TTHJ-W3FW7-8HV2C |
| Enterprise N | EnterpriseN | 3V6Q6-NQXCX-V8YXR-9QCYV-QPFCT |
| Enterprise LTSB 2015 | EnterpriseS | FWN7H-PF93Q-4GGP8-M8RF3-MDWWW |
| Enterprise LTSB 2016 | EnterpriseS | NK96Y-D9CD8-W44CQ-R8YTK-DYJWX |
| Enterprise LTSC 2019 | EnterpriseS | 43TBQ-NH92J-XKTM7-KT3KK-P39PB |
| Enterprise N LTSB 2015 | EnterpriseSN | NTX6B-BRYC2-K6786-F6MVQ-M7V2X |
| Enterprise N LTSB 2016 | EnterpriseSN | 2DBW3-N2PJG-MVHW3-G7TDK-9HKR4 |
| Home | Core | YTMG3-N6DKC-DKB77-7M9GH-8HVX7 |
| Home N | CoreN | 4CPRK-NM3K3-X6XXQ-RXX86-WXCHW |
| Home China | CoreCountrySpecific | N2434-X9D7W-8PF6X-8DV9T-8TYMD |
| Home Single Language | CoreSingleLanguage | BT79Q-G7N6G-PGBYW-4YWX6-6F4BT |
| IoT Enterprise | IoTEnterprise | XQQYW-NFFMW-XJPBH-K8732-CKFFD |
| IoT Enterprise Subscription | IoTEnterpriseK | P8Q7T-WNK7X-PMFXY-VXHBG-RRK69 |
| IoT Enterprise LTSC 2021 | IoTEnterpriseS | QPM6N-7J2WJ-P88HH-P3YRH-YY74H |
| IoT Enterprise LTSC 2024 | IoTEnterpriseS | CGK42-GYN6Y-VD22B-BX98W-J8JXD |
| IoT Enterprise LTSC Subscription 2024 | IoTEnterpriseSK | N979K-XWD77-YW3GB-HBGH6-D32MH |
| **Pro** | Professional | **VK7JG-NPHTM-C97JM-9MPGT-3V66T** |
| Pro N | ProfessionalN | 2B87N-8KFHP-DKV6R-Y2C8J-PKCKT |
| Pro Education | ProfessionalEducation | 8PTT6-RNW4C-6V7J2-C2D3X-MHBPB |
| Pro Education N | ProfessionalEducationN | GJTYN-HDMQY-FRR76-HVGC7-QPF8P |
| Pro for Workstations | ProfessionalWorkstation | DXG7C-N36C4-C4HTG-X4T3X-2YV77 |
| Pro N for Workstations | ProfessionalWorkstationN | WYPNQ-8C467-V2W6J-TX4WX-WT2RQ |
| S | Cloud | V3WVW-N2PV2-CGWC3-34QGF-VMJ2C |
| S N | CloudN | NH9J3-68WK7-6FB93-4K3DF-DJ4F6 |
| SE | CloudEdition | KY7PN-VR6RX-83W6Y-6DDYQ-T6R4W |
| SE N | CloudEditionN | K9VKN-3BGWV-Y624W-MCRMQ-BHDCD |
| Team | PPIPro | XKCNC-J26Q9-KFHD2-FKTHY-KD72Y |

> 说明：IoTEnterpriseS（LTSC）2021/2024 密钥也用于激活不受支持的 EnterpriseS（LTSC）2021/2024 版本；评估版（EVAL）无法激活，可用 TSforge 重置。

### 如何移除 HWID 激活？
**无法移除**——许可证存储在微软服务器上，仅更换 CPU/主板等重大硬件变化才会失效。若只想让系统显示「未激活」状态，可在激活设置中安装 KMS 密钥，或在 MAS 中用「Change Windows Edition」切换版本（这只会隐藏激活，重装后联网仍会自动激活）。

---

## 八、Ohook 激活（Office 永久激活）

### 适用产品
**Windows Vista 及之后**的所有 Office 版本（含 Server 对应版本），**唯独不支持 Office UWP 商店应用**（此类请用 TSforge）。覆盖 Office 2010 / 2013 / 2016 / 2019 / 2021 / 2024 及 Office 365。

### 原理
不修改、不补丁任何系统文件。脚本在 Office 目录中安装一个**开源的定制 `sppc.dll`**，让 Office 在查询激活状态时始终得到「已激活」的答复。

### 重要特点
- **完全离线、永久激活**
- 不怕 Office 修复、更新，甚至 Windows 大版本升级
- Office 365 订阅的服务器端功能（如 OneDrive 1TB 存储）不可用，但大部分功能正常（免费 OneDrive 5GB 可用）

### 操作步骤
1. 确保电脑**已提前安装好 Office 套件**（脚本不负责下载安装 Office）
2. MAS 主菜单选择 **Ohook Activation**（绿色高亮选项），回车
3. 看到绿色提示 `Office is permanently activated` 即成功，直接打开 Word/Excel 使用，忽略 Office 应用内的「购买」按钮

### 成功界面（官网截图）

![Ohook激活成功界面](https://aka.doubaocdn.com/s/dklRv53UOS)

> 截图说明：脚本检测到 Office 版本（C2R | 16.0.19328.20178 | x64）→ 激活 Office → 安装通用密钥 → 建立系统 sppc.dll 符号链接 → 释放定制 sppc.dll 并修改哈希 → 清除许可锁定 → 添加跳过许可检查的注册表 → 绿色提示激活成功。

### 安全校验（自定义 sppc.dll 官方校验值）
定制 `sppc.dll` 完全开源（Ohook 0.5），官方给出的 SHA-256 校验值：

```
09865ea5993215965e8f27a74b8a41d15fd0f60f5f404cb7a8b3c7757acdab02 *sppc32.dll
393a1fa26deb3663854e41f2b687c188a9eacd87b23f17ea09422c4715cb5a9f *sppc64.dll
```

### 如何卸载 Ohook？
1. MAS → **Ohook Activation** → 选择 **Uninstall**（卸载）
2. （可选）MAS → **Troubleshoot**（故障排查）→ **Fix Licensing**（修复授权）
3. 完成

---

## 九、TSforge 激活（Windows / ESU / Office 永久激活）

### 适用产品
- **Windows**：Vista / 7 / 8 / 8.1 / 10 / 11（Windows 11 自 26100.4188 起不再支持 ZeroCID）
- **Windows Server**：2008 ~ 2025（Server 2025 同上限制）
- **Office**（需 Windows 8 及以上，支持 UWP 版）：2013 / 2016 / 2019 / 2021 / 2024
- **Windows 附加组件**：各版本 ESU 扩展安全更新、8/8.1 APPXLOB
- **KMS 主机（CSVLK）**：Windows Vista 及之后、Server 2008 及之后、Office 2010 及之后

### 原理（三种方式）
- **ZeroCID（离线）**：直接向 SPP 软件保护平台的「物理存储」与「令牌存储」写入伪造的缓存数据，使系统认为已安装有效密钥与确认 ID，从而永久激活；支持换硬件不失效
- **StaticCID（联网，Win11 26100 及以上）**：微软在 Win11 build 27802 引入的漏洞导致 ZeroCID 失效，改为联网用 VAMT API 获取有效确认 ID
- **KMS4k（离线）**：向可信存储写入伪造的 KMS 服务器响应，激活有效期最长可达 **4083 年**

### 重要特点
- **不修改任何 Windows 组件、不安装任何新文件**
- 永久有效，直到系统重装或大版本功能升级
- ZeroCID / KMS4k 模式下更换硬件不会失效
- 附带功能：重置重新武装计数、重置评估期、清除篡改状态、移除评估密钥锁定

### 操作步骤
MAS 主菜单选择 **TSforge**（绿色高亮选项），回车，等待绿色提示出现即完成。

### 成功界面（官网截图：Windows ESU 激活）

![TSforge激活ESU界面](https://aka.doubaocdn.com/s/pjVOVa4GI3)

> 截图说明：脚本检测系统信息 → 处理 Windows ESU → 校验激活 ID（Year1~Year6）→ 安装伪造产品密钥数据 → 写入零确认 ID → 绿色提示 `[Client-ESU-Year1/2/3/6] is permanently activated with ZeroCID`。

### 关于 Windows ESU（扩展安全更新）
- 微软官方对多数系统只提供 **3 年** ESU（如 Windows 10：2025.10 ~ 2028.10）
- TSforge 可激活 **4-6 年** ESU 许可证，但 4-6 年属于**非官方支持**，可能仍可手动安装 LTSC 更新（Windows 10 LTSC 2021 与 22H2 同属 19041 基础构建）
- 验证 ESU 是否激活：命令行执行 `slmgr.vbs /dlv`（简短输出用 `slmgr.vbs /dli`），或在 MAS 中运行「Check Activation Status」

### 如何移除 TSforge？
TSforge 不修改任何系统组件，只向 SPP 数据文件追加数据。想重置激活状态：MAS → **Troubleshoot** → **Fix Licensing** 即可。

---

## 十、Online KMS 激活（180 天 + 自动续期）

### 适用产品
- Windows：Vista / 7（仅专业版与企业版）/ 8 / 8.1 / 10 / 11、Server 2008 ~ 2025 各版本
- Office：2010 / 2013 / 2016 / 2019 / 2021 / 2024（C2R 零售版会自动转换为 Volume 版；不支持 2010/2013 MSI 零售版）

### 原理
KMS（密钥管理服务）是微软面向批量授权客户的**正规激活协议**。开发者逆向实现了 KMS 主机服务，本脚本连接**全球 16 个最稳定的公共 KMS 服务器**（自动随机选择、在线检测、失败最多重试 3 次），无需在本机运行任何二进制文件。

### 重要特点
- 激活有效期 **180 天**（Windows 10/11 Home 系列及个别版本为 30/45 天）
- 脚本**默认创建自动续期任务**：生成以下两个文件并创建计划任务 `\Activation-Renewal`，每 7 天联网自动续期：
    - `C:\Program Files\Activation-Renewal\Activation_task.cmd`
    - `C:\Program Files\Activation-Renewal\Info.txt`
- 不想要续期任务，可在脚本菜单关闭「Renewal Task With Activation」选项
- 激活后不影响 Windows/Office 更新

### 操作步骤
MAS 主菜单选择 **Online KMS**（绿色高亮选项），回车，等待提示完成。

### 支持产品密钥示例（Windows 10/11 通用批量密钥，节选）

| Windows 10/11 产品 | EditionID | 通用批量许可密钥 |
|---|---|---|
| Pro | Professional | W269N-WFGWX-YVC9B-4J6C9-T83GX |
| Pro N | ProfessionalN | MH37W-N47XK-V7XM9-C7227-GCQG9 |
| Enterprise | Enterprise | NPPR9-FWDCX-D2C8J-H872K-2YT43 |
| Enterprise LTSC 2024 | EnterpriseS | M7XTQ-FN8P6-TTKYV-9D4CC-J462D |
| Education | Education | NW6C2-QMPVW-D7KKK-3GKT6-VCFB2 |
| Home | Core | TX9XD-98N7V-6WMQ6-BX7FG-H8Q99 |
| Pro for Workstations | ProfessionalWorkstation | NRG8B-VKK3Q-CXVCJ-9G2XF-6Q84J |

> 完整密钥表（Server 2008~2025、Office 2010~2024 等数百个密钥）见官网文档：https://massgrave.dev/online_kms

### 隐私说明
KMS 客户端会向主机服务器共享：客户端 FQDN、CMID、时间戳、产品许可状态、到期时间、IP 地址——这是 KMS 协议设计使然，不含敏感数据。IP 本身为上网所必需，动态 IP 并不对应特定个人；微软从未因使用盗版激活而对个人用户采取法律行动。

### 如何卸载 Online KMS？
1. MAS → **Online KMS** → 选择 **Uninstall**
2. MAS → **Troubleshoot** → **Fix Licensing**
3. 完成

### 关于 Office「非正版」横幅
2021 年 2 月之后的 Click-to-Run 版 Office 在 KMS 激活后会检查注册表中的 KMS 服务器名，若不存在则显示「Office 未正确授权」横幅。脚本会保留一个不存在的 IP（10.0.0.10）作为 KMS 服务器名以规避该横幅。

---

## 十一、FAQ 常见问题

**Q：如何永久激活 Windows / Office？**
A：在 MAS 菜单中选择**绿色高亮**的选项（HWID 激活 Windows、Ohook 激活 Office、TSforge 激活两者）。

**Q：MAS 安全吗？如何确认没有恶意代码？**
A：MAS 完全开源，GitHub 上拥有 **15 万+ Star**、全球数百万用户。你可以用记事本打开批处理文件自行审查代码，也可以选择官网提供的手动激活方式。

**Q：为什么杀毒软件报毒 / 报木马？**
A：杀毒软件通常会将激活类软件标记为恶意程序，即使它是安全的，这叫**误报（False Positive）**。可在第三方杀软中加排除项，或使用手动激活方式规避告警。注意：**Windows Defender 在 PowerShell 方式或官网方法二下载运行时不会触发告警**。

**Q：激活后还能正常更新吗？**
A：可以，MAS 不干扰 Windows 或 Office 更新。

**Q：MAS 与正版授权有什么区别？**
A：对 Windows 与 Office 而言，推荐方式的激活结果与官方激活后**几乎无差别**。

**Q：微软会因此封我的账号吗？**
A：微软从未仅因此类激活而封禁账号。

**Q：合法吗？会不会有后果？**
A：MAS 绕过官方授权，**技术上不属于合法授权**。对个人用户，微软通常不追究（诉讼成本高于授权费）；但**企业用户不推荐**——微软会对企业进行授权审计。

**Q：如何卸载 / 移除 MAS？**
A：各激活方式有对应卸载步骤（见上文各节），也可在 Troubleshoot 中执行 Fix Licensing 修复授权。

**Q：能更改 Windows 版本吗？会不会丢数据？**
A：可以，在 MAS 中选择「Change Windows Edition」。不会丢失数据，但版本更改后需要重新激活（许可证与版本绑定）。

**Q：激活后能链接微软账户吗？**
A：可以，没有任何问题。

**Q：能激活 Office 365 吗？**
A：可以（用 Ohook），但无法获得 O365 服务器端功能（如 OneDrive 1TB），免费账户的 5GB 及大多数功能正常。

**Q：能用 MAS 获得 Copilot 或 Excel 里的 Python 功能吗？**
A：不能，这两者都是微软 365 订阅的服务器端功能。

**Q：激活完成后可以删除 MAS 文件夹吗？**
A：可以。

**Q：支持 Windows Vista / 7 / 8.1 吗？**
A：支持。TSforge、Ohook、Online KMS 选项支持这些旧系统。

**Q：怎么捐赠支持项目？**
A：MAS 项目**不接受任何捐赠**，完全免费。

---

## 十二、安全与法律提醒

1. **只认官方来源**：脚本仅从 massgrave.dev、GitHub 官方仓库获取；网上大量复制粘贴教程会篡改命令域名，执行后运行恶意脚本，运行前务必核对 URL。
2. **杀软误报**：脚本修改系统授权组件，被杀毒软件报为 HackTool 属于误报，只使用官方来源即可放心；可临时关闭实时防护或将脚本文件夹加入排除项。
3. **合规**：此教程仅用于**学习研究**，商业环境请务必购买微软正版授权；微软会对企业进行授权审计，风险自担。
4. 建议操作前**创建系统还原点**，防止授权异常。
5. 脚本仅支持 Windows 系统，**Mac 版 Office 无法用 MAS 激活**。

---

## 来源

- 官方网站：https://massgrave.dev/
- GitHub 源码仓库：https://github.com/massgravel/Microsoft-Activation-Scripts
- HWID 文档：https://massgrave.dev/hwid
- Ohook 文档：https://massgrave.dev/ohook
- TSforge 文档：https://massgrave.dev/tsforge
- Online KMS 文档：https://massgrave.dev/online_kms
- FAQ：https://massgrave.dev/faq

> 再次提醒：本教程仅用于学习研究，商业环境请务必使用微软正版授权。