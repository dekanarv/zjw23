# DNS 配置清单（Cloudflare）

> 照着这份清单在 Cloudflare 控制台填写即可。
> 更新时间：2026-10-16

---

## ✅ 当前状态（已修复）

```
https://kanerg.com/          200                主域名
https://www.kanerg.com/      301 → kanerg.com   自动跳转，最终 200
证书CN=kanerg.com，SAN 含 *.kanerg.com
CNAME 文件                   kanerg.com（裸域为主，www 跳转过来）
```

---

## 历史记录：403 的根因

`https://www.kanerg.com` 曾返回：

```
403 Forbidden
DNS points to prohibited IP | www.kanerg.com | Cloudflare
```

这是 Cloudflare 的 **Error 1000**。导出 DNS 记录后定位到原因：

```
kanerg.com.     → 185.199.108~111.153           ✅ GitHub Pages 的 IP
www.kanerg.com. → 172.67.204.218 / 104.21.77.60 ❌ Cloudflare 自己的 IP
```

**www 的记录误填了 Cloudflare 自身的 IP**，等于让域名指向 Cloudflare 自己，
形成自我引用 → Cloudflare 拒绝服务。

删除 www 下指向 Cloudflare 自身 IP 的记录，只保留 GitHub 的四条后立即恢复。

### IP 地址速查

| IP 段 | 归属 | 能否填入 A 记录 |
|---|---|---|
| `185.199.108~111.153` | GitHub Pages | ✅ 可以 |
| `104.21.x.x` | Cloudflare | ❌ Error 1000 |
| `172.67.x.x` | Cloudflare | ❌ Error 1000 |

> **关键**：Cloudflare 会把记录自动展开成自己的边缘 IP。
> **不要**把「解析出来的结果」拿去当 A 记录的值填 ——
> 要填**源站的原始 IP**（本项目即 GitHub Pages 的四个 IP）。

---

## ⚠️ 导入 DNS 文件的注意事项

**Cloudflare 的导入是「追加」而非「替换」。**

导入前必须先在控制台删除要替换的记录，否则新旧混杂。
本项目踩过这个坑：导入 4 条正确记录后，旧的 2 条错误记录仍在，403 持续存在。

建议流程：

1. 先导出当前配置存档
2. 在 Records 页面**手工删除**要替换的记录
3. 再导入修改后的文件
4. 验证：`nslookup 域名 1.1.1.1`

---

## 关于切换 CNAME

**当前配置（裸域为主 + www 跳转）已经可用，无需改动。**

若将来想改主域名，务必：

1. 先确认目标域名能返回 **200**（不是 403，也不是 DNS 解析正确）
2. 再改仓库 CNAME
3. 验证原域名 301 到新域名，两者都可访问

⚠️ 实测踩过两次：CNAME 先改、目标域名还不可用 → **整站中断**。

---

## 参考配置（备用）

以下为配置时用的参考值，正常情况下**不需要重复添加**。

### www 的 A 记录

| 类型 | 名称 | IPv4 地址 | 代理状态 | TTL |
|---|---|---|---|---|
| A | `www` | `185.199.108.153` | 🟠 Proxied | Auto |
| A | `www` | `185.199.109.153` | 🟠 Proxied | Auto |
| A | `www` | `185.199.110.153` | 🟠 Proxied | Auto |
| A | `www` | `185.199.111.153` | 🟠 Proxied | Auto |

### IPv6（可选）

| 类型 | 名称 | IPv6 地址 | 代理状态 |
|---|---|---|---|
| AAAA | `@` | `2606:4700:3036::6815:4d3c` | 🟠 Proxied |
| AAAA | `@` | `2606:4700:3033::ac43:ccda` | 🟠 Proxied |
| AAAA | `www` | `2606:4700:3036::6815:4d3c` | 🟠 Proxied |
| AAAA | `www` | `2606:4700:3033::ac43:ccda` | 🟠 Proxied |

---

## 不要添加的记录

| 类型 | 名称 | 原因 |
|---|---|---|
| MX | `@` | 用 Cloudflare Email Routing 代替 |
| TXT | `@` | 域名邮箱未启用，SPF/DKIM 暂不需要 |
| CNAME | `blog` / `shop` 等 | 暂无对应站点，等需要时再加 |

> **原则**：不加用不到的记录。DNS 记录越多，日后排查越困难。

---
