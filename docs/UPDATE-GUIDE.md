# 日常更新网站内容指南

> 一次完整的更新流程，约 3 分钟生效。
> 更新时间：2026-10-15

---

## 一、结论：直接 `git push` 即可

当前采用 **GitHub Pages 自动部署**，推送到 `main` 分支后自动构建上线，
**不需要 FTP、不需要手动上传、不需要买服务器、不需要配置 CI/CD**。

```
本地修改 → git push → GitHub Pages 自动构建 → Cloudflare 自动分发 → 网站更新
```

整个链路全自动，唯一需要手动敲的就是一条 `git push` 命令。

---

## 二、标准更新流程

### 第1 步：本地起服务预览（可选但建议）

```bash
cd F:/zjw23
python -m http.server 8124
```

浏览器打开 <http://127.0.0.1:8124> 确认效果。

### 第 2 步：提交并推送

```bash
git add -A
git commit -m "描述你改了什么"
git push origin main
```

### 第 3 步：等待并验证

约 **1 分钟**后刷新 <https://kanerg.com> 即可看到新内容。

如果浏览器没变化，是 Cloudflare 或本地缓存，加个随机参数强制刷新：
```
https://kanerg.com/?v=任意数字
```

---

## 三、本次更新记录（2026-10-15）

### 内容

- 接入公司 logo「嘉能恒业」（`assets/img/logo.png`，1580×457）
- 导航栏、页脚、后台侧边栏的占位方块替换为真实 logo
- 页脚版权、后台站点名称更新为「嘉能恒业」

### 配色调整

从蓝色体系改为橙黄体系，色值取自 logo 像素统计：

| 变量 | 原值 | 新值 |
|---|---|---|
| `--c-primary` | `#1668dc` 蓝 | **`#e07010` 橙** |
| `--c-primary-hover` | `#0f52b3` | `#c25a08` |
| `--c-primary-light` | `#e8f1fd` | `#fdf1e3` |
| `--c-accent` | `#f5a623` | **`#f0a000` 金黄** |
| `--c-bg-soft` | `#f6f8fa` 冷灰 | `#fbf8f4` 暖白 |
| `--c-bg-dark` | `#1a1f2b` 深蓝灰 | `#241a12` 深棕 |
| `--c-text` | `#1f2430` | `#2a2118` 暖黑 |

同时给阴影加入橙色调，并清理了 4 处硬编码蓝色。

### 验证结果

线上计算样式实测：

```
--c-primary : #e07010          ✅
--c-accent  : #f0a000          ✅
.logo实际尺寸 : 145×42          ✅
按钮背景色   : rgb(224,112,16) ✅
```

---

## 四、配色怎么改

所有颜色集中在 `assets/css/base.css` 顶部的 `:root` 中，**改这几行就能整体换肤**：

```css
:root {
  --c-primary: #e07010;      /* 主色：按钮、链接、强调 */
  --c-accent:  #f0a000;      /* 辅色：点缀、高亮 */
}
```

页面样式一律用 `var(--c-*)` 引用，**不硬编码颜色**，所以改一处全站生效。

若要匹配新logo，同一方法：先用取色工具统计 logo 主色占比最高的几个值，
再填进 `--c-primary` / `--c-accent`。

---

## 五、图片怎么替换

占位图统一用 `.ph` 类，替换时直接换成 `<img>`：

```html
<!-- 占位 -->
<div class="ph ph--4x3">主视觉图片占位</div>

<!-- 替换为真实图片 -->
<img src="assets/img/your-photo.jpg" alt="图片说明">
```

建议图片放在 `assets/img/`，文件名用英文小写。

---

## 六、注意事项

### ⚠️ 不要在 GitHub 开启 Enforce HTTPS

Cloudflare 已负责 HTTPS。GitHub 侧再开会造成跳转死循环。
当前状态是关闭的，**保持不动**。

### 沙箱环境的两个坑

- 测试线上站点必须加 `--noproxy '*'`，否则拿到的是代理缓存的旧响应
- 截图工具会复用缓存，验证线上效果优先用「计算样式」而非截图

### .gitignore 已忽略

- `111.png`（原始素材，已复制到 `assets/img/logo.png`）
- `.preview/`（截图临时目录）

---

## 七、常用验证命令

```bash
# 本地预览
python -m http.server 8124

# 查看线上配色是否更新
curl -s --noproxy '*' https://kanerg.com/assets/css/base.css | grep "c-primary"

# 确认 Pages 构建状态
gh api repos/dekanarv/zjw23/pages --jq '.status'
```

线上地址：**<https://kanerg.com>**