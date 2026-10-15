# 结构说明与扩展指引

本文档记录模板的区块划分、设计约定与后续扩展位置，供接手开发时快速定位。

---

## 一、设计约定

### 1.1 样式分层

| 文件 | 层级 | 内容 |
|---|---|---|
| `assets/css/base.css` | 基础层 | CSS 变量（设计令牌）、Reset、通用组件（按钮、表单、卡片、网格、徽章、占位图、进场动画） |
| `assets/css/site.css` | 页面层 | 官网各区块的具体样式，仅依赖 base 的变量与类 |
| `admin/css/admin.css` | 页面层 | 后台布局与组件样式，同样只依赖 base |

**规则**：页面层样式禁止硬编码颜色，一律使用 `var(--c-*)` 变量。改主题只动 base。

### 1.2 命名约定

采用 BEM 简化版：

- 区块：`block__element--modifier`
- 例：`.sidebar__link`、`.sidebar__link.is-active`、`.card--hover`

### 1.3 占位图机制

所有待替换的图片位置使用统一类：

```html
<div class="ph ph--4x3">主视觉图片占位 1200×900</div>
```

`ph` 提供渐变底色与居中文案，`ph--16x9` / `ph--4x3` / `ph--1x1` 控制比例。
替换为真实图片时直接换成 `<img>`，无需保留 `ph` 类。

---

## 二、官网区块锚点对照

修改导航或做锚点跳转时，锚点需与 `<section id>` 一致：

| 锚点 | 元素 | 导航项 |
|---|---|---|
| `#home` | `.hero` | 首页 |
| `#about` | `section#about` | 关于我们 |
| `#business` | `section#business` | 业务领域 |
| `#cases` | `section#cases` | 项目案例 |
| `#news` | `section#news` | 新闻动态 |
| `#contact` | `section#contact` | 联系我们 |

导航高亮由 `site.js` 的 `initHeader()` 扫描 `.nav__link[href^="#"]` 自动匹配，
**新增区块只需在 HTML 里加上对应 id 和导航链接**，无需改 JS。

---

## 三、后台路由机制

`admin/js/admin.js` 中 `ROUTE_META` 是唯一的路由表：

```js
var ROUTE_META = {
  dashboard: { crumb: "仪表盘",   view: "dashboard" },
  posts:     { crumb: "文章管理", view: "list" },
  editor:    { crumb: "内容编辑", view: "form" },
  settings:  { crumb: "系统设置", view: "settings" }
};
```

`view` 字段对应 HTML 中 `<section class="view" data-view="...">`。
新增页面时：

1. 在 `MOCK.lists` 增加数据配置（列表页）或新建 `<section data-view="xxx">`
2. 在 `ROUTE_META` 增加路由项
3. 在侧边栏增加 `<a class="sidebar__link" data-route="xxx">`

---

## 四、Mock 数据位置

`admin/js/admin.js` 顶部 `MOCK` 对象：

```js
var MOCK = {
  recent: [...],        // 仪表盘「最近更新」表格
  lists: {              // 各列表页数据
    posts:     { title, desc, items: [[名称, 分类, 状态, 创建人, 更新时间], ...] },
    cases:     { ... },
    leads:     { ... },
    users:     { ... }
  }
};
```

状态标签配色由 `STATUS_CLASS` 映射表控制，新增状态值时补一行即可。

---

## 五、接入真实后端

代码中已用 `// TODO` 标注所有待接入点：

| 位置 | 文件 | 说明 |
|---|---|---|
| 联系表单提交 | `assets/js/site.js` → `initContactForm()` | 校验已就绪，替换 `say()` 为 `fetch` |
| 列表数据 | `admin/js/admin.js` → `MOCK` | 换成接口请求，保留渲染函数不变 |
| 新建/删除 | `admin/js/admin.js` → `initDelegates()` | 弹窗确认与删除接口 |
| 内容保存 | `admin/js/admin.js` → `#editorForm` | 提交事件已拦截 |

---

## 六、待补齐功能清单

- [ ] **登录页** — 后台目前无鉴权，直接进入
- [ ] **角色权限** — 菜单按角色过滤，按钮级权限
- [ ] **图片上传** — 封面上传目前是按钮占位
- [ ] **富文本编辑器** — 当前为 contenteditable 占位，可换 UEditor / TinyMCE
- [ ] **图表组件** — 当前为 CSS 柱状占位，可换 ECharts / Chart.js
- [ ] **404 页面**
- [ ] **站点地图 / favicon**