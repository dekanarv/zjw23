# 移动端证书不匹配问题排查

> 状态：**服务端正常，属客户端 DNS/证书缓存问题，会自愈**
> 更新时间：2026-10-15 16:45

---

## 一、问题现象

手机等移动设备访问 <https://kanerg.com> 时提示：
**"不安全 / 证书与 URL 不匹配，来自 github.io"**

而电脑端访问正常。

---

## 二、排查结论：客户端缓存，非服务端故障

### 服务端已完全正常

实测两条可能路径，**返回的是完全相同的证书**（MD5 一致）：

```
Cloudflare 边缘 (104.21.77.60)  → CN=kanerg.com  ✅
GitHub Pages 源站(185.199.108.153) → CN=kanerg.com  ✅
证书有效期: 2026-10-15 ~ 2027-01-13
```

**关键**：GitHub Pages 早已为 kanerg.com 签发了正确证书，
即使设备命中旧 IP，只要 SNI 正确也能拿到匹配证书。

### 真正原因：DNS 缓存不一致

用多家 DoH 交叉验证：

| DNS 服务器 | 返回结果 | 状态 |
|---|---|---|
| Google (8.8.8.8) | 104.21.77.60（Cloudflare） | ✅ 正常 |
| Cloudflare (1.1.1.1) | 104.21.77.60（Cloudflare） | ✅ 正常 |
| 腾讯 (119.29.29.29) | 104.21.77.60（Cloudflare） | ✅ 正常 |
| **阿里 (223.5.5.5)** | **185.199.108.153（GitHub 旧 IP）** | ❌ **过期** |

**国内手机常用阿里 DNS / 114 DNS**，因此命中了切Cloudflare 之前的旧记录。
浏览器/系统还缓存着当时拿到的 `*.github.io` 证书，于是报不匹配。

阿里 DNS 连续查询 3 次均返回旧 IP —— 该DNS 服务器的缓存尚未刷新。

### 权威 NS 已确认切换

```
kanerg.com NS → randy.ns.cloudflare.com / arely.ns.cloudflare.com✅
```

域名的 NS 委派本身是正确的，只是各家 DNS 的**缓存刷新进度不同**。

---

## 三、解决办法

### 手机端操作（任选一，立即生效）

| 方法 | 步骤 |
|---|---|
| **最简单** | 开关一次**飞行模式**，或连/断Wi-Fi 与移动数据 |
| 清浏览器缓存 | 浏览器设置 → 清除缓存与Cookie |
| 换网络 | Wi-Fi 切换到移动数据（或反向） |
| 重启设备 | 彻底清空 DNS 缓存 |

### 等待自然恢复

- 通常 **几分钟~ 几小时**内自行恢复
- 阿里 DNS 缓存过期后会返回正确的 Cloudflare IP

### 不建议做的事

- ❌ 不要在 GitHub 开启 Enforce HTTPS（会造成跳转死循环）
- ❌ 不需要改 Cloudflare 配置
- ❌ 不需要重新部署

---

## 四、如何确认已恢复

```bash
# 查看到达的服务器（应含 cloudflare 字样）
curl -sI https://kanerg.com | grep -i "server|cf-ray"

# 查证书（应为 CN=kanerg.com）
openssl s_client -connect kanerg.com:443 -servername kanerg.com </dev/null \
  | openssl x509 -noout -subject
```

---

## 五、长期建议

国内移动网络访问 Cloudflare 可能仍不稳定。若后续访问体验不佳，
可以考虑：

1. **等阿里 DNS 缓存完全刷新**（最省事，建议先观察几天）
2. **国内 CDN 加速**（阿里云 CDN / 腾讯云 CDN，回源到 Cloudflare）
3. **迁移到国内云厂商 + ICP 备案**（正式商用时的最终方案）

当前阶段无需改动，属于 DNS 传播过程中的正常现象。