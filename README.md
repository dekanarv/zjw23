# 嘉能恒业官网

零依赖、零构建的纯静态站点，包含**公司官网**与**后台管理**两部分。

**线上地址**：<https://kanerg.com>

> 当前文案、图片、图表均为**占位内容**，用于确定页面结构与布局，后续按实际需求替换。

---

## 快速开始

本项目无需安装任何依赖，有静态服务器即可。

```bash
# 方式一：直接双击打开
start index.html

# 方式二：本地静态服务器（推荐，可手机预览）
python -m http.server 8080
# 访问 http://localhost:8080
```

后台入口：<http://localhost:8080/admin/index.html>

---

## 目录结构

```
.
├── index.html              # 官网首页（入口，必须在根目录）
├── about.html              # 关于我们
├── business.html           # 业务领域
├── cases.html              # 项目案例
├── news.html               # 新闻动态
├── contact.html            # 联系我们
├── legal.html              # 隐私政策与服务条款
├── sitemap.html            # 网站地图
│
├── admin/                  # 后台管理
│   ├── index.html
│   ├── css/admin.css
│   └── js/admin.js
│
├── assets/                 # 静态资源
│   ├── css/base.css        #   设计令牌（改这里可整体换肤）
│   ├── css/site.css        #   官网样式
│   ├── js/site.js          #   官网脚本
│   └── img/logo.png        #   公司标识
│
├── docs/                   # 项目文档（不参与部署）
│   ├── STRUCTURE.md            扩展指引
│   ├── UPDATE-GUIDE.md         日常更新流程
│   ├── DNS-SETUP.md            DNS 配置
│   ├── CACHE-STRATEGY.md       缓存与版本号
│   ├── HTTPS-GUIDE.md          HTTPS 与 Cloudflare
│   ├── CN-ACCESS-STRATEGY.md   国内外访问方案
│   └── TROUBLESHOOTING.md      故障排查
│
├── src/                    # 页面模板（本地参考，不部署）
│   └── pages/
│
├── CNAME                   # GitHub Pages 域名配置
└── README.md
```

---

## 日常更新

```bash
git add -A
git commit -m "描述改动"
git push origin main
```

推送后约 1 分钟自动部署完成，无需其他操作。

### ⚠️ 改完样式必须更新版本号

改过CSS / JS / 图片后，把 HTML 里的 `?v=` 日期改成当天：

```html
<link rel="stylesheet" href="assets/css/base.css?v=20261016">
```

GitHub Pages 对静态资源缓存 4 小时、HTML 只缓存 10 分钟，
不改版本号会出现「新页面 + 旧样式」的错配。详见 `docs/CACHE-STRATEGY.md`。

---

## 换肤指南

所有颜色集中在 `assets/css/base.css` 的 `:root`，改这几行即可整体换肤：

```css
:root {
  --c-primary: #e07010;   /* 主色：按钮、链接 */
  --c-accent:  #f0a000;   /* 辅色：点缀、高亮 */
}
```

页面样式一律用 `var(--c-*)` 引用，不硬编码颜色。

---

## 技术栈

| 项 | 选择 |
|---|---|
| 构建工具 | 无 |
| 依赖 | 无 |
| 前端 | 原生 HTML + CSS + JavaScript |
| 托管 | GitHub Pages + Cloudflare CDN |
| 域名 | kanerg.com |

无构建步骤意味着改完即生效，适合当前规模的展示型站点。
若后续内容规模显著增长，可平滑迁移到 Vite 等构建工具。

---

## 文档索引

| 文档 | 内容 |
|---|---|
| [STRUCTURE.md](docs/STRUCTURE.md) | 如何新增区块、路由、数据 |
| [UPDATE-GUIDE.md](docs/UPDATE-GUIDE.md) | 日常更新流程 |
| [DNS-SETUP.md](docs/DNS-SETUP.md) | Cloudflare DNS 配置 |
| [CACHE-STRATEGY.md](docs/CACHE-STRATEGY.md) | 缓存机制与版本号规范 |
| [HTTPS-GUIDE.md](docs/HTTPS-GUIDE.md) | HTTPS 与证书配置 |
| [CN-ACCESS-STRATEGY.md](docs/CN-ACCESS-STRATEGY.md) | 国内外访问方案 |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 常见故障排查 |

---

## 注意事项

- **不要**在 GitHub Pages 设置里开启 Enforce HTTPS，会与 Cloudflare 冲突导致跳转死循环
- **不要**把 CNAME 改成未经DNS 验证的域名，会导致整站不可访问
- 开发时测试线上站点加 `--noproxy '*'`，避免读到代理缓存的旧响应