# 静态资源缓存说明

> 页面更新后用户看不到变化？先读这份文档。
> 更新时间：2026-10-15

---

## 一、问题根源

GitHub Pages 对不同文件类型的缓存策略不同：

| 文件类型 | Cache-Control | 实际缓存时长 |
|---|---|---|
| HTML 页面 | `max-age=600` | **10 分钟** |
| CSS / JS / 图片 | `max-age=14400` | **4 小时** |

**这会造成一个严重问题**：

改版后 HTML 10 分钟就更新了，但 CSS 可能要等 4 小时。
结果就是「新 HTML + 旧 CSS」的错配：

- 新版 HTML 引用了新版 class 名（如 `.brand__logo`）
- 旧版 CSS 里没有这个类的定义
- → logo 无尺寸约束，显示成原始巨幅
- → 新版 CSS 里的橙色变量在旧 HTML 里不存在，页面仍是蓝色

---

## 二、解决方案：资源版本号

所有静态资源引用都加了 `?v=YYYYMMDD` 查询参数：

```html
<!-- 改版时同步更新这里的日期 -->
<link rel="stylesheet" href="assets/css/base.css?v=20261015">
<link rel="stylesheet" href="assets/css/site.css?v=20261015">
<img src="assets/img/logo.png?v=20261015" alt="公司名">
<script src="assets/js/site.js?v=20261015"></script>
```

### 为什么有效

浏览器把 `base.css` 和 `base.css?v=20261015` 视为**两个不同的文件**，
各自独立缓存。更新版本号后，浏览器找不到旧缓存，会重新下载。

### 每次改版必做

**改完 CSS/JS/图片后，把两个 HTML 里的版本号改成当天日期。**

| 文件 | 需要检查的引用 |
|---|---|
| `index.html` | base.css / site.css / site.js / logo.png / favicon.svg |
| `admin/index.html` | base.css / admin.css / admin.js / logo.png / favicon.svg |

改完直接搜索 `v=2026` 就能找到全部位置。

---

## 三、双重保险：logo 尺寸加固

logo 是最容易出问题的资源（HTML 原尺寸 1580×457 很大），
所以加了两层保护：

**1. CSS 中约束**

```css
.brand__logo {
  height: 42px;
  width: auto;
  max-width: 190px;
  aspect-ratio: 1580 / 457;
  object-fit: contain;
}
```

**2. HTML 内联样式（CSS 未加载时也生效）**

```html
<img class="brand__logo" src="..." width="145" height="42"
     style="height:42px;width:auto;max-width:190px;object-fit:contain">
```

`width` / `height` 属性写成**显示尺寸**而非原始尺寸，
浏览器会在图片加载前就按正确比例预留空间，避免布局跳动。

---

## 四、遇到「页面还是旧样子」时的处理

按顺序尝试：

### 1. 强制刷新（电脑）

```
Ctrl + Shift + R     Chrome / Edge
Ctrl + F5           Firefox
```

### 2. 检查版本号是否改了

```bash
grep -n 'v=2026' index.html
```

如果改版了但版本号没变，浏览器会继续用 4 小时前的缓存。

### 3. 带参数访问（临时验证）

```
https://kanerg.com/?t=123456
```

### 4. 清空浏览器全部缓存

浏览器设置 → 隐私与安全 → 清除浏览数据 → 选「缓存的图片和文件」

### 5. 等 4 小时

最坏情况下，等待 Cloudflare 的 `max-age=14400` 自然过期。

---

## 五、Cloudflare 侧可选项

如果希望更快生效，可在 Cloudflare 控制台调整：

**Caching → Configuration → Edge Cache TTL**

- 默认 `Respect origin`（跟随 GitHub 的 4 小时）
- 改成 `Bypass cache` 可让每次都回源，但会牺牲性能

**建议**：保持现状 + 用版本号机制，两者配合已经足够可靠。

---

## 六、验证是否已更新

```bash
# 看实际返回的 CSS 内容是否含新变量
curl -s --noproxy '*' "https://kanerg.com/assets/css/base.css?v=20261015" \
  | grep "c-primary"

# 看缓存头
curl -sI --noproxy '*' "https://kanerg.com/assets/css/base.css?v=20261015" \
  | grep -i "cache-control"
```

带上版本号参数后，URL 唯一，Cloudflare 不会返回旧缓存。