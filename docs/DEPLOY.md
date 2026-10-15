# kanerg.com 域名绑定操作指引

> 状态：**GitHub 侧已全部就绪，只差阿里云 DNS 加一条记录。**
> 最后更新时间：2026-10-15

---

## 一、当前进度

| 环节 | 状态 | 说明 |
|---|---|---|
| zjw23 仓库转公开 | ✅ 已完成 | Pages 不支持私有仓库 |
| 添加 CNAME 文件 | ✅ 已完成 | 内容 `kanerg.com`，已推送到 main |
| 启用 GitHub Pages | ✅ 已完成 | main 分支 / 根目录，状态 built |
| 解绑 smalltools 域名 | ✅ 已完成 | 工具箱已回退 `dekanarv.github.io/smalltools/` |
| www.kanerg.com 的 A 记录 | ✅ 早已配好 | 指向185.199.108~111.153 |
| **kanerg.com裸域 A 记录** | ⏳ **待你操作** | **当前为空** |

---

## ⚠️ 重要：现在必须尽快加 DNS，否则官网无法访问

CNAME 文件生效后，GitHub 已把 `dekanarv.github.io/zjw23/` **301 重定向**到 `http://kanerg.com/`。

但裸域 `kanerg.com` 的 A 记录是空的，导致：

```
dekanarv.github.io/zjw23/  →301→  kanerg.com  →  DNS 解析失败  →  访问不了
```

**在 DNS 配好之前，官网的 github.io 地址也会跟着不可用。**
所以第2 节的 DNS 配置是**当前唯一的阻塞项**，请优先处理。

---

## 二、你需要做的（只需 1 步）

登录阿里云 DNS 控制台，为 **kanerg.com** 添加 **4 条 A 记录**。

**入口**：<https://dns.console.aliyun.com/> → 找到 kanerg.com → 点击「解析设置」

逐条添加（主机记录留空，解析线路「默认」）：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---|---|---|---|
|（留空） | A | `185.199.108.153` | 600 |
| （留空） | A | `185.199.109.153` | 600 |
| （留空） | A | `185.199.110.153` | 600 |
| （留空） | A | `185.199.111.153` | 600 |

> 这 4 个 IP 是 GitHub Pages 的官方固定地址。
> `www.kanerg.com` 的 4 条记录已经存在，**不用重复添加**。

**保存后等5~30 分钟生效**（一般几分钟），然后告诉我，我来完成证书绑定和最终验证。

---

## 三、之后的自动流程

DNS 生效后，GitHub 会自动完成：

1. 校验 DNS 指向正确
2. 自动签发 Let's Encrypt HTTPS 证书（通常 1~10 分钟）
3. `kanerg.com` 和 `www.kanerg.com` 自动跳转到 https

**无需再手动操作**，我会在验证后向你确认结果。

### 如果想先撤销重定向、恢复 github.io 访问

如果你暂时不想配 DNS、想让github.io 地址先能用，把仓库里的 CNAME 文件删掉即可回到默认地址：

```bash
git rm CNAME && git commit -m "chore: 移除 CNAME" && git push
```

代价是自定义域名设置会被 GitHub 清空，之后要重新绑定。

---

## 四、绑定完成后的地址

| 用途 | 地址 |
|---|---|
| **公司官网（主域名）** | https://kanerg.com |
| 官网备用 | https://www.kanerg.com |
| 官网 github.io 地址 | https://dekanarv.github.io/zjw23/ |
| 小工具箱（已让位） | https://dekanarv.github.io/smalltools/ |

---

## 五、常见问题

**Q：为什么不直接用 www.kanerg.com？**
已经配好了，但裸域才是公司官网的正规主域名。现在裸域也能用，两个地址都会指向官网。

**Q：工具箱还能用吗？**
能。它现在在 `dekanarv.github.io/smalltools/`，功能完全不受影响。
如果你希望它继续用自定义域名，可以之后单独给它加个子域（如 `tool.kanerg.com`）。

**Q：备案会影响上线吗？**
GitHub Pages 服务器在境外，**绑定域名不要求备案**，现在就能访问。
但国内访问速度可能不稳定，且不符合国内合规要求——
正式商用、面向国内客户时，建议后续改为国内服务器 + ICP 备案。

**Q：HTTPS 证书要收费吗？**
不需要。GitHub 用Let's Encrypt 免费自动签发和续期。

---

## 六、验证命令（绑定完成后可用）

```bash
# 检查 DNS
nslookup kanerg.com

# 检查访问
curl -I https://kanerg.com
```