# 访问异常排查手册

> 用于日后快速判断「网站打不开 / 证书报错」是谁的问题
> 更新时间：2026-10-15 17:00

---

## 一、先记住一条铁律

**先确认访问的是哪个地址。** `kanerg.com` 和 `www.kanerg.com` 是两个不同的域名，
目前只配置了前者。

| 地址 | 状态 |
|---|---|
| `https://kanerg.com` | ✅ 正常 |
| `http://kanerg.com` | ✅ 正常（未强制跳转 HTTPS） |
| `https://www.kanerg.com` | ❌ **不存在（NXDOMAIN）** |
| `https://dekanarv.github.io/zjw23/` | ✅ 正常（会跳转到主域名） |

**浏览器地址栏容易自动补全 `www.`** —— 这是最常见的误入错误。
遇到任何异常，先确认地址栏里**没有 www**。

---

## 二、为什么不同设备表现不一致

### 核心机制

```
设备 → [代理分流] → [DNS 查询] → 目标服务器 → 返回证书
         ↑关键差异点
```

### 你电脑（挂 Clash 代理）

- 走境外节点，代理端用海外 DNS 查询
- 拿到 Cloudflare 新 IP（104.21.x.x）
- 返回正确证书 `CN=kanerg.com` ✅

### 国内手机（无代理）

- 直连，使用运营商/阿里 DNS（223.5.5.5 等）
- 这些 DNS 缓存尚未刷新，仍返回旧的 GitHub Pages IP
- 设备还缓存着当时拿到的 `*.github.io` 证书
- 浏览器判定证书与域名不匹配 ❌

### 实测数据（2026-10-15）

| DNS 服务器 | 返回 IP | 状态 |
|---|---|---|
| Google 8.8.8.8 | 104.21.77.60（Cloudflare） | 正常 |
| Cloudflare 1.1.1.1 | 104.21.77.60 | 正常 |
| 腾讯 119.29.29.29 | 104.21.77.60 | 正常 |
| **阿里 223.5.5.5** | **185.199.108.153（旧 GitHub IP）** | **过期** |

**结论：代理不是问题，反而帮你绕过了旧缓存。**
手机异常是因为直连 + 国内 DNS 缓存滞后，等它自然过期即可。

---

## 三、服务端已确认正常

两条可能路径返回**完全相同的证书**：

```
Cloudflare 边缘 (104.21.77.60)      → CN=kanerg.com ✅
GitHub Pages 源站 (185.199.108.153) → CN=kanerg.com ✅
证书有效期：2026-10-15 ~ 2027-01-13
```

**即使设备命中旧 IP，SNI 正确时也能拿到正确证书。**
所以「证书不匹配」几乎都是客户端缓存问题，不是服务端故障。

---

## 四、快速排查步骤

按顺序执行，90% 的问题在前两步就能定位。

### 第 1 步：确认地址

- 地址栏**必须**是 `kanerg.com`，不能有 `www.`
- 手动完整输入 `https://kanerg.com` 而非依赖历史补全

### 第 2 步：清缓存

手机：

```
开关一次飞行模式
或 Wi-Fi / 移动数据来回切换
或 浏览器设置 → 清除缓存
```

电脑（Chrome）：

```
Ctrl+Shift+R  强制刷新
或 F12 → Network → 勾选 Disable cache → 刷新
```

### 第 3 步：排查代理

电脑挂代理时如果异常，试试：

- 关闭代理直连一次，判断是否代理路径问题
- 换节点（部分节点对 Cloudflare 线路不佳）

### 第 4 步：命令行验证

```bash
# 看服务器是谁（应显示 cloudflare）
curl -sI https://kanerg.com | grep -i "server\|cf-ray"

# 看证书是否匹配（应显示 CN=kanerg.com）
openssl s_client -connect kanerg.com:443 -servername kanerg.com </dev/null \
  | openssl x509 -noout -subject

# 查真实 DNS（走 Cloudflare 的话用这个）
nslookup kanerg.com 1.1.1.1
```

---

## 五、当前已知限制

### HTTP 未强制跳转 HTTPS

`http://kanerg.com` 直接返回 200，不会跳到 https。
如需强制，在 Cloudflare 控制台开启：
**SSL/TLS → Edge Certificates → Always Use HTTPS**

### www 域名未配置

按你的选择暂时不配置。需要时在 Cloudflare 加：
`CNAME  www → dekanarv.github.io`（橙色云代理）

### 国内访问稳定性

Cloudflare 免费版无国内节点，国内访问质量取决于：
- DNS 缓存刷新进度
- 网络运营商与 Cloudflare 的互联情况

观察一段时间后若仍不稳定，可考虑加国内 CDN 或迁移到国内云厂商备案。

---

## 六、⚠️ 千万不要做的事

| 操作 | 后果 |
|---|---|
| 在 GitHub 开启 Enforce HTTPS | 与 Cloudflare 冲突，造成跳转死循环 |
| 删掉 CNAME 文件 | 自定义域名解绑，需重新配置 |
| 在 Cloudflare 把代理改成灰云 | 失去 HTTPS 与防护，且证书可能再出问题 |