# 公司官网 + 后台管理（起始模板）

一个零依赖、零构建的静态站点起始模板，包含 **公司官网主页** 与 **后台管理页面** 两部分。
双击 `index.html` 即可运行，也可直接用任意静态服务器托管。

> 当前所有文案、图片、图表均为**占位内容**，用于确定页面结构与布局，后续按实际需求替换。

---

## 快速开始

```bash
# 方式一：直接打开
start index.html

# 方式二：本地静态服务器（推荐，便于手机/同事预览）
python -m http.server 8080
# 然后访问 http://localhost:8080
```

后台入口：<http://localhost:8080/admin/index.html>

---

## 目录结构

```
.
├── index.html              # 官网主页
├── admin/
│   ├── index.html          # 后台管理入口
│   ├── css/
│   │   └── admin.css       # 后台专属样式
│   └── js/
│       └── admin.js        # 后台交互 + hash 路由 + mock 数据
├── assets/
│   ├── css/
│   │   ├── base.css        # 设计令牌 + Reset + 通用组件（官网/后台共用）
│   │   └── site.css        # 官网专属样式
│   ├── js/
│   │   └── site.js         # 官网交互
│   └── img/                # 图片资源（占位待补充）
├── docs/
│   └── STRUCTURE.md        # 区块结构与扩展说明
├── .editorconfig
├── .gitignore
└── README.md
```

---

## 页面结构

### 官网主页 `index.html`

| 区块 | 锚点 | 说明 |
|---|---|---|
| 顶部条 | — | 服务热线、邮箱、语言切换、后台入口 |
| 导航栏 | — | Logo、主导航、CTA、滚动联动高亮、移动端抽屉 |
| 首屏 Hero | `#home` | 标语、标题、简介、双按钮、数据概览 |
| 关于我们 | `#about` | 形象图 + 简介 + 3 条要点 |
| 业务领域 | `#business` | 4 宫格业务卡片 |
| 核心优势 | — | 4 条编号优势 |
| 项目案例 | `#cases` | 3 张案例卡片 |
| 数据统计 | — | 4 项数字（滚动动画） |
| 新闻动态 | `#news` | 3 条新闻（日期 + 摘要） |
| 联系我们 | `#contact` | 联系方式 + 在线表单 |
| 页脚 | — | 品牌、导航、联系方式、二维码、版权 |

### 后台管理 `admin/index.html`

采用 **hash 路由**（`#/route`），四类视图模板：

| 路由 | 视图类型 | 说明 |
|---|---|---|
| `#/dashboard` | 仪表盘 | 4 张 KPI 卡 + 图表占位 + 待办列表 + 最近更新表格 |
| `#/posts` `#/cases` `#/products` `#/categories` `#/leads` `#/customers` `#/users` | 列表 | 筛选栏 + 数据表格 + 分页 |
| `#/editor` | 表单 | 富文本编辑器占位 + 发布设置侧栏 + 封面上传 |
| `#/settings` | 设置 | 站点基础信息 + 用户列表 |

交互均已就位：侧边栏折叠、路由切换、表格搜索过滤、分页、弹窗、Toast、时间范围切换、时钟。

---

## 设计令牌

所有颜色、间距、圆角、阴影集中在 `assets/css/base.css` 的 `:root` 中，**改一处即可整体换肤**：

```css
:root {
  --c-primary: #1668dc;    /* 品牌主色 */
  --c-accent:  #f5a623;    /* 强调色 */
  --c-bg-soft: #f6f8fa;    /* 浅灰背景 */
  --c-bg-dark: #1a1f2b;    /* 深色（页脚/侧边栏） */
  --sp-1 … --sp-9;         /* 间距刻度 */
  --r-sm / --r-md / --r-lg / --r-pill;
  --shadow-sm / --md / --lg;
  --container: 1200px;     /* 内容最大宽度 */
}
```

---

## 后续扩展建议

### 1. 接入后端接口
`assets/js/site.js` 中的表单提交、`admin/js/admin.js` 中的 `MOCK` 数据，均已标注 `// TODO` 位置，替换为 `fetch` 调用即可。

### 2. 替换占位内容
- **图片**：把 `.ph` 占位块替换为 `<img src="assets/img/xxx.jpg" alt="…">`
- **文案**：直接编辑 `index.html` 中的中文占位文本
- **图表**：`admin/index.html` 中的 `.chart-placeholder` 可替换为 ECharts / Chart.js

### 3. 加入构建工具（可选）
当前为零依赖静态页面。如需组件化，可平滑迁移：
- 引入 Vite + Vue/React（`admin/` 已按组件拆分思路组织）
- 或保留静态方案，用 `<template>` + 原生 JS 做局部复用

### 4. 部署
纯静态产物，可直接推送到：
- GitHub Pages / Gitee Pages
- Nginx / Apache 静态目录
- 公司内网服务器（Nginx 反代 + 内网 IP 访问）

---

## 浏览器支持

现代浏览器（Chrome / Edge / Firefox / Safari 最新版）。使用了 CSS 变量、`aspect-ratio`、`IntersectionObserver`，不支持 IE11。

已适配：桌面端、平板、手机（侧边栏抽屉式导航 + 表格横向滚动）。

---

## 后续待办

- [ ] 替换全部占位文案为实际公司信息
- [ ] 补充 `assets/img/` 下的真实图片资源
- [ ] 确定后端技术栈与接口规范
- [ ] 接入登录鉴权（后台目前无登录页）
- [ ] 配置 GitHub 远程仓库与推送凭据