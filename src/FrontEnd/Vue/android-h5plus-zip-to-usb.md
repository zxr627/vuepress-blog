---
title: 安卓H5+开发记录：外部存储写入与Native.js调用
index: true
order: 1
date: 2026-03-27
category:
  - Android
---



# 安卓设备上把 ZIP 下载到外部 U 盘，并落成解压后的内容

这篇记录一个很具体的项目需求：

设备是安卓 7.1.2，应用是用 HBuilder 打包出来的壳，页面层走的是 HTML5+ 能力。现场要做的事情不是“单纯下载一个文件”，而是把服务端给的 ZIP 资源包下载下来，最后让 U 盘里呈现的是**解压过后的文件和目录**，而不是一个孤零零的压缩包。

这个需求看上去不复杂，真正做起来坑不少。尤其是外部 U 盘、安卓文件系统、H5+ 的 `plus.*` 能力，以及 Native.js 调 Java 对象这几层叠在一起之后，很多“按直觉写”的方案都会翻车。

我把这次实现过程完整记一下，后面再遇到类似场景，直接照着落就行。

## 一、项目场景

先说清楚我当时的环境，不然后面很多细节不好理解。

- 系统环境：安卓 7.1.2
- 应用形态：HBuilder / HTML5+ 打包应用
- 页面技术：HTML + jQuery
- 原生能力：`plus.downloader`、`plus.zip`、`plus.io`、`plus.android`
- 目标介质：外部 U 盘
- 最终要求：U 盘里看到的是解压后的目录内容

这个场景和普通浏览器完全不是一回事。浏览器里你能做的是“下载”；这里要做的是：

1. 从接口拿到 ZIP 地址  
2. 下载到应用可控的本地目录  
3. 解压  
4. 找到外部 U 盘对应的可写目录  
5. 把解压后的目录树完整复制过去

如果一步走错，后面全断。

## 二、为什么不能一上来就往 U 盘根目录写

最开始最容易想到的方案，就是直接写死一个路径，比如：

```js
const USB_ROOT_PATH = "/storage/USB1/";
```

然后：

- 直接在这个目录下建文件夹
- 直接把 ZIP 下载进去
- 直接把 ZIP 解压到这个目录

这个思路在很多设备上都不稳，原因主要有三个。

### 1. U 盘挂载路径并不固定

不同机器、不同 ROM、不同 USB 挂载方式，外部存储挂载点很可能都不一样。你看到资源管理器里有 “USB”，不代表它真实对应的就是 `/storage/USB1/`。

所以把路径写死，本身就不可靠。

### 2. H5+ 对“任意绝对路径”的支持没有想象中那么直接

`plus.io` 更适合处理应用可控目录，比如 `_doc`、`_downloads` 这类逻辑路径。你把它直接甩到一个不确定的外部挂载点上，经常就会出现：

- 目录解析失败
- 看得见但写不进去
- ZIP 解压时报 `operate_dir_error`

### 3. 直接往 U 盘解压，不好排错

如果把“下载”“建目录”“解压”“复制”全堆在 U 盘上做，一旦失败，很难判断到底是哪一步有问题。

所以这类场景更稳的方案不是“直接往 U 盘怼”，而是把流程拆开。

## 三、最后采用的实现思路

我最后用的是一条更稳的链路：

```text
接口返回 download_url
  -> ZIP 先下载到应用缓存目录
  -> 在应用私有目录解压
  -> 检测外部 U 盘对应的可写目录
  -> 把解压后的目录树递归复制到 U 盘
```

这样做有两个明显好处。

第一，下载和解压都在应用可控目录里完成，出错更容易定位。  
第二，写 U 盘这一步被压缩成了“纯文件复制”，比“直接在 U 盘里解压”稳定很多。

## 四、我用到的几类能力

### 1. 下载 ZIP：`plus.downloader`

ZIP 下载这一步没什么特别花的，直接用 H5+ 的下载能力就够了：

```js
let dtask = plus.downloader.createDownload(downloadUrl, {
  filename: "_downloads/temp_" + id + ".zip",
  timeout: 30,
  retry: 2
}, function(d, status) {
  if (status === 200) {
    // 下载成功
  }
});

dtask.start();
```

这里我没有直接下载到 U 盘，而是先落在 `_downloads`。

原因很简单：这一步必须稳，下载本身不要和 U 盘写入耦在一起。

### 2. 解压 ZIP：`plus.zip.decompress`

ZIP 解压是走 H5+ 自带的压缩能力：

```js
plus.zip.decompress(zipLocalUrl, targetLocalUrl, function() {
  // 解压成功
}, function(err) {
  // 解压失败
});
```

但这里有个前提：**解压目标目录必须是应用自己能稳定控制的目录**。

所以我解压时用的是 `_doc` 下的私有目录，而不是外部 U 盘。

比如：

```text
_doc/vr_unzip_cache/item_xxx/
```

这一步的意义非常大。因为只要 ZIP 能在私有目录解压成功，后面的问题就只剩“怎么把目录复制到 U 盘”了。

### 3. 找到 U 盘可写目录：`plus.android`

这个是整个需求里最关键的一步。

我最后没有去猜 `/storage/USB1/`，而是通过安卓应用上下文去拿外部文件目录：

```js
var main = plus.android.runtimeMainActivity();
var dirs = plus.android.invoke(main, "getExternalFilesDirs", "");
```

然后做两件事：

1. 排除主存储目录  
2. 在剩下的目录里探测哪个是可写的可移动存储

这里拿到的路径通常会长这样：

```text
/storage/xxxx-xxxx/Android/data/包名/files
```

或者类似的变体。

这类目录有一个好处：它不是“U 盘根目录”，而是**应用在外部存储上的专属目录**。在安卓上，这比直接写根目录靠谱得多。

## 五、这次最关键的坑：Native.js 调 Java 对象不能全靠点调用

这是我这次踩得最实的一坑。

最初检测 U 盘目录的时候，我拿到 `java.io.File` 对象之后，习惯性写成这样：

```js
var absPath = dir.getAbsolutePath();
```

结果现场直接报错：

```text
dir.getAbsolutePath is not a function
```

后来确认下来，不是目录没有，也不是 U 盘没挂载，而是 **Native.js 返回的 Java 对象，在当前设备环境下不能稳定用 JS 的点调用方式去调方法**。

改成下面这种就稳定了：

```js
var absPath = plus.android.invoke(dir, "getAbsolutePath");
```

这个结论不只影响一个方法。后面凡是 `java.io.File`、`FileInputStream`、`FileOutputStream`、`FileChannel` 这一类对象，我都统一收口成了 `plus.android.invoke(...)`。

比如：

```js
function jInvoke(target, method) {
  var argCount = arguments.length - 2;
  if (argCount <= 0) return plus.android.invoke(target, method);
  if (argCount === 1) return plus.android.invoke(target, method, arguments[2]);
  if (argCount === 2) return plus.android.invoke(target, method, arguments[2], arguments[3]);
  if (argCount === 3) return plus.android.invoke(target, method, arguments[2], arguments[3], arguments[4]);
  throw new Error("jInvoke only supports up to 3 args");
}
```

然后把常用操作都包起来：

```js
function jPath(target) {
  return plus.android.invoke(target, "getAbsolutePath");
}

function jExists(target) {
  return !!plus.android.invoke(target, "exists");
}

function jMkdirs(target) {
  return !!plus.android.invoke(target, "mkdirs");
}
```

这一步做完之后，后面的“检测目录”“创建目录”“删除目录”“复制文件”才真正稳定下来。

## 六、怎么判断这个目录是不是可写的 U 盘目录

我没有只靠目录名字判断，也没有只靠资源管理器里有没有 “USB” 图标判断。

我的做法是：

1. 先枚举 `getExternalFilesDirs("")` 返回的目录  
2. 过滤掉主存储  
3. 对剩余目录创建一个探针文件  
4. 能创建、能删除，就认为这个目录可写

探针逻辑大概这样：

```js
function prepareUsbBaseDir(basePath) {
  var targetDir = plus.android.newObject("java.io.File", basePath + "/vr_unzip_cache");

  if (!jExists(targetDir) && !jMkdirs(targetDir)) {
    return { ok: false };
  }

  var probeFile = plus.android.newObject("java.io.File", jPath(targetDir) + "/.probe_" + Date.now());
  var created = jExists(probeFile) || jCreateNewFile(probeFile);
  var writable = created && jCanWrite(probeFile);

  if (jExists(probeFile)) {
    jDelete(probeFile);
  }

  return {
    ok: writable,
    path: jPath(targetDir)
  };
}
```

这个方法比较朴素，但对现场设备非常有用。因为它不靠猜，而是直接用“能不能写进去”说话。

## 七、解压完以后，怎么把目录树复制到 U 盘

当 ZIP 已经在 `_doc` 里成功解压，后面的事情就简单很多了：把整个目录树递归复制到 U 盘目录。

核心分两步。

### 1. 复制单个文件

单文件复制我走的是 `FileInputStream + FileOutputStream + FileChannel`：

```js
function copyJavaFile(sourceFile, destFile) {
  var inputStream = plus.android.newObject("java.io.FileInputStream", sourceFile);
  var outputStream = plus.android.newObject("java.io.FileOutputStream", destFile);

  var inputChannel = jInvoke(inputStream, "getChannel");
  var outputChannel = jInvoke(outputStream, "getChannel");

  var totalSize = jInvoke(inputChannel, "size");
  jInvoke(inputChannel, "transferTo", 0, totalSize, outputChannel);
  jInvoke(outputChannel, "force", true);
}
```

### 2. 递归复制目录

目录递归的思路也很直接：

- 如果是目录，就先建目录，再递归子项  
- 如果是文件，就走单文件复制

伪代码如下：

```js
function copyJavaEntryRecursive(sourceFile, destFile) {
  if (jIsDirectory(sourceFile)) {
    if (!jExists(destFile)) {
      jMkdirs(destFile);
    }

    var children = jListFiles(sourceFile);
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childDest = plus.android.newObject(
        "java.io.File",
        jPath(destFile) + "/" + jGetName(child)
      );
      copyJavaEntryRecursive(child, childDest);
    }
    return;
  }

  copyJavaFile(sourceFile, destFile);
}
```

这一步完成后，U 盘里最终落下来的就是完整解压后的目录内容。

## 八、为什么这条链路比“直接解压到 U 盘”稳

我最后保留的是：

```text
下载到缓存
-> 私有目录解压
-> 复制解压后的内容到 U 盘
```

不是：

```text
下载到 U 盘
-> 直接在 U 盘解压
```

原因很现实。

### 1. 出错边界更清楚

如果下载成功、私有目录解压成功，那就说明：

- ZIP 没问题
- 下载能力没问题
- 解压能力没问题

这时候剩下的问题只可能在 “外部存储写入” 这一段。

### 2. 外部存储只承担复制，不承担复杂操作

U 盘写入本来就比应用私有目录脆弱。既然这样，就不要让它同时承担“创建复杂目录结构 + 解压大量小文件”这种工作。

把复杂动作留在私有目录，把 U 盘这边降级成纯复制，稳定性会高很多。

### 3. 更方便做失败重试

如果复制到 U 盘过程中失败，最多重新复制一次。  
如果直接在 U 盘解压失败，很多时候你还得处理半拉子目录和残缺文件。

## 九、页面侧是怎么组织的

页面本身我没有做得太花，主要保留几件事：

- 列表来自首页同一套 VR 接口
- 每项展示名称、状态、下载地址、目标目录
- 支持多选
- 支持分页
- 批量任务串行执行

串行执行是我刻意保守处理的。因为外部 U 盘写入是慢操作，多任务并发会把现场设备搞得很难看，出错也不容易定位。

所以我是一个一个下、一个一个解、一个一个复制。

对现场系统来说，这比堆并发更稳。

## 十、我这次踩过的坑

最后把最有价值的几个坑单独列一下。

### 1. 不要写死 `/storage/USB1/`

这是最容易写、也是最容易翻车的方式。不同设备上根本不一定是这个路径。

### 2. 不要默认 Java 对象都能直接 `obj.method()`

至少在这次项目里，`dir.getAbsolutePath()` 这种写法就翻了。Native.js 这层更稳的做法是统一走 `plus.android.invoke(...)`。

### 3. 不要直接把 U 盘当成解压目标目录

真要做，也不是绝对不行，但稳定性和排错成本都差很多。  
先解压到私有目录，再复制过去，实战里更省事。

### 4. 先做“探针写入”，再认为目录可用

不要看到路径就认为能写。  
真正靠谱的是：试着建目录、试着建文件、试着删文件。

### 5. 批量任务不要一股脑并发

外部 U 盘不是本地 NVMe，现场设备也不是开发机。  
多选批量下载的时候，串行反而更稳。

## 十一、适合这套方案的场景

我觉得下面几类场景都可以直接复用这套做法：

- 展馆类离线资源下发
- VR / 全景内容包下发
- 安卓一体机资源同步
- HBuilder 打包的本地壳应用
- 需要把服务端 ZIP 资源落到 U 盘的场景

如果你的目标不是 “U 盘里保留 ZIP”，而是 “U 盘里最终可直接使用的目录内容”，那这套方案就比较合适。

## 十二、总结

这次需求真正的难点，不是“下载 ZIP”，而是：

**在安卓设备上，如何稳定地把解压后的资源内容落到外部 U 盘。**

最后落地下来，关键其实就三点：

1. 不猜 U 盘根目录，走安卓应用的外部文件目录  
2. 不直接在 U 盘里解压，先在私有目录解压  
3. Native.js 调 Java 对象统一走 `plus.android.invoke(...)`

这三点卡住了，整条链路就能跑顺。  
至少在我这次安卓 7.1.2 + HBuilder + HTML5+ 的项目里，它是可用的。

后面如果我再把这块整理得更完整一点，可能会继续补两篇：

- 一篇专门写 H5+ 外部存储和 U 盘检测
- 一篇专门写 Native.js 调 Java 对象时的兼容性问题

这篇先把完整实现链路记下来，留给之后的自己和同类项目直接复用。
