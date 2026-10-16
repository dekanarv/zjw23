# DNS 配置清单（Cloudflare）

> 照着这份清单在 Cloudflare 控制台填写即可。
> 更新时间：2026-10-16

---

## 一、当前状态

```
kanerg.com         已配置 → Cloudflare 橙云代理 ✅（正常使用中）
www.kanerg.com     DNS 记录已添加且指向 Cloudflare，但访问仍报 403
CNAME 文件         保持 kanerg.com（**先不要改**）
```

---

## 排查结论

已用多源交叉验证（Google / Cloudflare / 腾讯三家 DoH）：

```
kanerg.com      → 104.21.77.60, 172.67.204.218   ✅ Cloudflare
www.kanerg.com  → 104.21.77.60, 172.67.204.218   ✅ Cloudflare
NS 委派         → arely/randy.ns.cloudflare.com  ✅ Cloudflare
```

**DNS 层完全正确**，与裸域一致。所以 403 不是 DNS 问题。

---

## ⚠️ 403 的真实原因

访问 <https://www.kanerg.com> 返回：

```
403 Forbidden
DNS points to prohibited IP | www.kanerg.com | Cloudflare
```

**DNS 已正确指向 Cloudflare，但仍报 prohibited IP ——
这说明 www 那几条记录在 Cloudflare 控制台的状态不是「已代理」。**

即使显示的IP 是 Cloudflare 的，只要记录本身是灰云，
Cloudflare 仍会认为「这个域名指向了我的 IP 但没开启代理」，因而拒绝。

### 解决方法

Cloudflare 控制台 → kanerg.com → DNS → Records → 找到主机记录为 `www` 的几条：

```
问题：仅 DNS（灰云）        需要：已代理（橙云）
      ⬜ ← 灰色云朵              🟧 ← 橙色云朵
```

**点击每条记录右侧的云朵图标，切换为橙色。**

⚠️ 也检查一下有没有**重复的 www 记录** ——
若有灰云和橙云各一份，删掉灰云那几条。重复记录会造成冲突。

---

## ⚠️ 切换 CNAME 的顺序（重要）

**必须先确认 www 能正常打开，再改 CNAME。**

实测踩过两次这个坑：CNAME 先改成 www后，
裸域会 301 到 www，而 www 当时是 403 → **整站不可访问**。

正确顺序：

1. Cloudflare 把 www 切成**橙云**（并清理重复记录）
2. 打开 <https://www.kanerg.com> 确认能正常显示
3. 把仓库 CNAME 改成 `www.kanerg.com`
4. 验证裸域 301 到 www，且两者都可访问

---

## 二、需要你添加的记录

**入口**：<https://dash.cloudflare.com/> → kanerg.com → DNS → Records → Add record

### 2.1 www 的 A 记录（4 条）

照抄裸域的 IP，**代理状态全部选橙色云朵**（Proxied）：

| 类型 | 名称 | IPv4 地址 | 代理状态 | TTL |
|---|---|---|---|---|
| A | `www` | `104.21.77.60` | 🟠 Proxied | Auto |
| A | `www` | `172.67.204.218` | 🟠 Proxied | Auto |

> **说明**：Cloudflare 免费版会自动在边缘展开，
> 表面只需 2 条 A 记录即可，无需像在阿里云那样加 4 条。
> 若你想与裸域完全一致，加4 条（含 `104.21.78.60`、`172.67.205.218`）也能正常工作。

### 2.2 如需 IPv6（可选，建议加）

| 类型 | 名称 | IPv6 地址 | 代理状态 |
|---|---|---|---|
| AAAA | `www` | `2606:4700:3033::ac43:ccda` | 🟠 Proxied |
| AAAA | `www` | `2606:4700:3036::6815:4d3c` | 🟠 Proxied |

> 不加也能用，Cloudflare 会自动处理。

---

## 三、一次加齐的建议配置

下面是「以后不会麻烦」的完整清单，按需添加：

| 类型 | 名称 | 内容 | 代理 | 用途 |
|---|---|---|---|---|
| A | `@` | `104.21.77.60` | 🟠 |裸域（已有） |
| A | `@` | `172.67.204.218` | 🟠 | 裸域（已有） |
| A | `www` | `104.21.77.60` | 🟠 | **本次要加** |
| A | `www` | `172.67.204.218` | 🟠 | **本次要加** |
| AAAA | `@` | `2606:4700:3033::ac43:ccda` | 🟠 | 裸域 IPv6（已有） |
| AAAA | `@` | `2606:4700:3036::6815:4d3c` | 🟠 | 裸域 IPv6（已有） |
| AAAA | `www` | 同上两条 | 🟠 | **建议加** |
| CNAME | `@` | `dekanarv.github.io` | ⚪灰云 | 邮件路由备用，**先别加** |

### 暂时不要加的

| 类型 | 名称 | 原因 |
|---|---|---|
| MX | `@` | 用Cloudflare Email Routing 代替，功能更简单 |
| TXT | `@` | SPF/DKIM 等邮件记录，域名邮箱未启用时不需要 |
| CNAME | `blog` / `shop` 等 | 暂时没有对应站点，等需要时再加 |

> **原则**：不加用不到的记录。DNS 记录越多，日后排查越困难。

---

## 四、加完后的验证

DNS 生效通常需要 5 ~ 30 分钟（Cloudflare 通常几秒就到）。

### 4.1 查解析

```bash
nslookup www.kanerg.com 1.1.1.1
```

应返回 `104.21.x.x` 或 `172.67.x.x`。

### 4.2 查访问（DNS 生效后）

```
https://kanerg.com     →  正常显示官网（当前状态）
https://www.kanerg.com →  也能正常显示
```

此时 CNAME 仍是 `kanerg.com`，两个地址各自独立可达。

确认 www 可用后，再决定是否切换主域名。

### 4.3 查证书

```bash
openssl s_client -connect www.kanerg.com:443 -servername www.kanerg.com </dev/null \
  | openssl x509 -noout -subject
```

应显示 `CN=www.kanerg.com` 或包含 `*.kanerg.com`。

---

## 五、⚠️ 注意事项

### 不要开Enforce HTTPS

GitHub Pages 设置里的 **Enforce HTTPS 保持关闭**。
Cloudflare 已负责 HTTPS，两边都开会造成跳转死循环。

### 不要改代理状态

`www` 的记录必须选 **橙色云朵（Proxied）**。
若误选灰色云朵，流量会绕过 Cloudflare，HTTPS 证书就失效了。

### DNS 生效前的过渡

在你加记录前，`www.kanerg.com` 会短暂不可用，
但**裸域 `kanerg.com` 仍正常**——因为 Cloudflare 上还有旧的解析缓存。

---

## 六、备案后要改的地方（以后再说）

若未来完成 ICP 备案并接入国内 CDN，届时需要：

1. 在 Cloudflare 把 `@` 和 `www` 的记录**改成灰色云朵**（仅 DNS）
2. 在国内 CDN 平台配置加速域名
3. 用智能解析按线路分流

**当前阶段不需要考虑这些**，先把网站内容做好。