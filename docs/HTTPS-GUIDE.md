# HTTPS 证书问题与解决方案

> ✅ **状态：已解决。Cloudflare 代理已生效，HTTPS 证书签发成功。**
> 访问地址：**https://kanerg.com**（绿锁正常）
> 更新时间：2026-10-15 16:00

---

## ✅ 最终结果

```
HTTPS 访问 : https://kanerg.com  → 200
证书 CN    : kanerg.com
SAN        : *.kanerg.com, kanerg.com
签发方     : Let's Encrypt (YE1)
有效期     : 2026-10-15 ~ 2027-01-13（自动续期）
服务器     : cloudflare（CF-RAY 已确认经过）
```

浏览器"不安全"提示已消除。

### 实测记录

```bash
curl -sI https://kanerg.com/ | grep -iE "server|cf-ray"
# Server: cloudflare
# CF-RAY: a4ad48cbcd46fdbf-SIN      ← 确认经 Cloudflare

openssl s_client -connect kanerg.com:443 -servername kanerg.com </dev/null \
  | openssl x509 -noout -subject -issuer -dates
# subject = CN=kanerg.com
# issuer  = Let's Encrypt (YE1)
```

### GitHub 侧配置（保持不变，勿动）

| 项目 | 值 | 说明 |
|---|---|---|
| CNAME 文件 | `kanerg.com` | 不变 |
| Enforce HTTPS | **False** | ⚠️ 必须保持关闭，否则死循环 |
| GitHub 自身证书 | 未签发 | 无关紧要，已由 Cloudflare 接管 |

---

## 历史：问题诊断（已解决，保留备查）

### 现象

访问 `https://kanerg.com` 时浏览器提示"不安全"，无法通过验证。

### 根因（GitHub 官方接口确认）

GitHub Pages 官方 health 接口返回：

```
dns_resolves     : false
reason           : Domain's DNS record could not be retrieved (InvalidDNSError)
responds_to_https: false
https_error      : peer_failed_verification
is_https_eligible: false
```

443 端口当时返回的证书是 `CN=*.github.io`（Let's Encrypt 签发），
**不含 kanerg.com** → 浏览器报域名不匹配。

**这不是配置错误**。DNS 记录本身正确，是 GitHub 的服务器解析不到该域名，
导致 ACME 校验失败、证书无法签发。

### 为什么值得换方案

社区反馈显示这是 GitHub Pages 的系统性问题（2026 年多起）：

| 案例 | 等待时长 | 结果 |
|---|---|---|
| hidenoritani.com | 56 小时+ | 仍卡在 `state: new`，最终迁至 Netlify |
| nadezhdavolgina.ru | 36 小时+ | DNS 检查成功但证书未签发 |
| volgina-tutor | 36 小时+ | 无果 |

共同特征：DNS 配置完全正确、无 CAA 限制、反复解绑重绑无效。
**所有最终解决的案例都迁到了 Netlify / Vercel / Cloudflare Pages。**

---

## 二、方案 A：继续等 GitHub（不推荐）

理论上证书会自动签发，但依据上述案例，等待时间不可控，且反复操作会触发
Let's Encrypt 频率限制，反而更慢。

**如果一定要试**：等待 24 小时后查看状态

```bash
gh api repos/dekanarv/zjw23/pages --jq '.https_certificate'
# 从null 变为 { state: approved } 即成功
```

---

## 三、方案 B：Cloudflare 代理（推荐）

### 原理

证书由 Cloudflare 自己签发，**完全不依赖 GitHub**，因此绕开上述故障。
同时获得额外防护能力。

```
访客 ──HTTPS──> Cloudflare ──HTTP──> GitHub Pages
        ↑证书由 CF 提供        ↑源站
```

Cloudflare 在最外层终结访客的 TLS 连接，浏览器看到的是 CF 的有效证书。

### 额外收益

| 能力 | 说明 |
|---|---|
| WAF 防护 | 拦截恶意请求、常见攻击 |
| DDoS 防护 | 自动防御流量攻击 |
| CDN 加速 | 静态资源就近分发，国内访问通常更快 |
| Bot 防护 | 拦截爬虫与自动化工具 |
| 5秒盾/质询 | 你看到的"验证"就是 Turnstile |

### 操作步骤

**1. 注册并添加域名**

<https://dash.cloudflare.com/> → 注册免费账号 → Add a site → 填 `kanerg.com`

**2. 修改 NS 服务器**

Cloudflare 会给你两个 NS，例如：
```
xxx.ns.cloudflare.com
yyy.ns.cloudflare.com
```

去阿里云 DNS 控制台 → 域名管理 → 修改 DNS 服务器，替换为 Cloudflare 给的值。

> 注意：这一步会替换掉现有的 hichina DNS。原有的 `@` 记录需要在新NS 下重建。

**3. 在 Cloudflare 添加 DNS 记录**

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 🟠 已代理 |
| A | `@` | `185.199.109.153` | 🟠 已代理 |
| A | `@` | `185.199.110.153` | 🟠 已代理 |
| A | `@` | `185.199.111.153` | 🟠 已代理 |
| CNAME | `www` | `dekanarv.github.io` | 🟠 已代理 |

**4. SSL/TLS 设置**

左侧菜单 → SSL/TLS → Overview：

| 项目 | 设置 |
|---|---|
| Encryption mode | **Flexible**（免费版） |
| Always Use HTTPS | 开启 |
| Min TLS Version | TLS 1.2 |
| Automatic HTTPS Rewrites | 开启 |

**5. GitHub 侧保持不变**

- CNAME 文件不变（内容 `kanerg.com`）
- **Enforce HTTPS 保持关闭** ⚠️

生效时间：NS 生效后约 15 分钟~ 2 小时。

---

## 四、⚠️ 重要注意事项

### 1. 绝不要在 GitHub 开启 Enforce HTTPS

Cloudflare 已强制 HTTPS，若 GitHub 也开启会产生跳转死循环：

```
浏览器 → https://kanerg.com (CF 301) → http://kanerg.com (GitHub 301) → 无限循环
```

**当前状态是关闭的，保持即可。**

### 2. Flexible 模式的局限

免费版的 Flexible 模式意味着 **CF 到源站这一段是明文 HTTP**：

- ✅ 访客 → CF：加密（浏览器看到绿锁）
- ❌ CF → GitHub：明文

对普通企业官网这可以接受。若有合规要求或涉及敏感数据，
需升级付费版使用 **Full (strict)** 模式做端到端加密。

### 3. 可能需要重新配置 GitHub 域名绑定

Cloudflare 开启代理后，GitHub 解析到的会是 Cloudflare 的 IP，
可能触发域名验证异常。若出现异常：

- GitHub Settings → Pages → Custom domain 清空再填 `kanerg.com` 保存

### 4. 备案问题依旧

Cloudflare 免费版没有中国大陆节点，且**无法备案**。
若正式面向国内客户，后续仍建议迁移到国内云厂商 + ICP 备案。

---

## 五、方案对比

| 维度 | 继续等 GitHub | Cloudflare |
|---|---|---|
| 生效时间 | 不可控（数小时~ 数天） | 约 15 分钟~ 2 小时 |
| 可靠性 | 依赖 GitHub 队列 | 独立于 GitHub |
| HTTPS | 免费 | 免费 |
| WAF/DDoS 防护 | ❌ | ✅ |
| CDN 加速 | 有限 | ✅ |
| 国内访问速度 | 一般 | 通常更快 |
| 成本 | 免费 | 免费 |

**结论：Cloudflare 免费版在速度、可靠性和防护上都优于现状，已采用。**

---

## 六、当前待办

| 项目 | 状态 | 说明 |
|---|---|---|
| HTTPS 证书 | ✅ 已完成 | `CN=kanerg.com`，绿锁正常 |
| HTTP → HTTPS 跳转 | ⏳ 待确认 | Cloudflare 侧开启「Always Use HTTPS」 |
| www 子域 | ⏳ 待配置 | Cloudflare 加 `www` CNAME → `dekanarv.github.io` |

### 建议操作

**1. 开启强制 HTTPS**（消除 HTTP 明文访问）

Cloudflare → SSL/TLS → Edge Certificates → 打开 **Always Use HTTPS**

**2. 配置 www**（可选）

Cloudflare → DNS → 添加记录：

| 类型 | 名称 | 内容 | 代理 |
|---|---|---|---|
| CNAME | `www` | `dekanarv.github.io` | 🟠 已代理 |

**3. 验证命令**

```bash
# 检查是否经过 Cloudflare
curl -sI https://kanerg.com/ | grep -i "cf-ray"

# 检查证书
openssl s_client -connect kanerg.com:443 -servername kanerg.com </dev/null \
  | openssl x509 -noout -subject -dates
```

> **注意**：本机使用代理（127.0.0.1:7890），测试时加 `--noproxy '*'` 才能拿到真实响应。