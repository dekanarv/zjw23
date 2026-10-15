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

> 更新：2026-10-15 15:20 — **裸域已配好，官网已上线（HTTP 200）**

---

## 一、当前进度

| 环节 | 状态 | 说明 |
|---|---|---|
| zjw23 仓库转公开 | ✅ 已完成 | Pages 不支持私有仓库 |
| 添加 CNAME 文件 | ✅ 已完成 | 内容 `kanerg.com`，已推送到 main |
| 启用 GitHub Pages | ✅ 已完成 | main 分支 / 根目录，状态 built |
| 解绑 smalltools 域名 | ✅ 已完成 | 工具箱已回退 `dekanarv.github.io/smalltools/` |
| **kanerg.com 裸域 A 记录** | ✅ **已配好** | 4 条，指向185.199.108~111.153 |
| **官网可访问** | ✅ **HTTP 200** | `http://kanerg.com/` 返回「公司官网 \| 占位模板」 |
| www.kanerg.com 的 A 记录 | ⏳ 待补 | 原记录被改成了裸域，需重新添加 |
| HTTPS 证书 | ⏳ 签发中 | GitHub 自动签发，完成后开启强制跳转 |

---

## 二、你需要做的（补www 记录）

`http://kanerg.com/` **已经可以正常打开了**，目前只剩两个尾巴：

1. `www.kanerg.com` 访问不了（DNS 没记录）
2. HTTPS 证书还没签发，所以浏览器提示「不安全」

第2 项是 GitHub 自动完成的，不用管。你只需要补第 1 项。

### 操作步骤

**入口**：<https://dns.console.aliyun.com/> → kanerg.com → 解析设置 →添加记录

现有 4 条主机记录是 `@`（只管裸域）。**再添加 4 条主机记录为 `www` 的**：

| 主机记录 | 记录类型 | 解析线路 | 记录值 | TTL |
|---|---|---|---|---|
| `www` | A | 默认 | `185.199.108.153` | 10 分钟 |
| `www` | A | 默认 | `185.199.109.153` | 10 分钟 |
| `www` | A | 默认 | `185.199.110.153` | 10 分钟 |
| `www` | A | 默认 | `185.199.111.153` | 10 分钟 |

**注意**：不要删除或修改现有的 `@` 那4 条，裸域靠它们。

配置后总共8 条（`@` 四条 + `www` 四条），两个地址都能访问。
TTL 10 分钟一般几分钟生效，之后告诉我，我做最终验证。

---

## 三、之后的自动流程

www 记录生效后，GitHub 会为两个域名一起签发 Let's Encrypt 证书：

1. 校验 DNS 指向
2. 自动签发证书（通常 1~10 分钟，最长可能 1 小时）
3. 开启 HTTPS 强制跳转

**无需手动操作**，我会在验证后确认结果。

### 如果不想等证书

现在 `http://kanerg.com/` 已经可用了，可以先用着。证书签发是自动的，
刷新几次 https://kanerg.com 就能看到绿锁。

### 备用方案：撤销自定义域名

若想回到github.io 默认地址，删掉 CNAME 即可：

```bash
git rm CNAME && git commit -m "chore: 移除 CNAME" && git push
```

代价是自定义域名设置会被 GitHub 清空，之后要重新绑定。

---

## 四、绑定完成后的地址

| 用途 | 地址 | 状态 |
|---|---|---|
| **公司官网（主域名）** | http://kanerg.com | ✅ 可用 |
| **公司官网（HTTPS）** | https://kanerg.com | ⏳ 证书签发中 |
| 官网 www 入口 | https://www.kanerg.com | ⏳ 待补 DNS 记录 |
| 官网 github.io 地址 | https://dekanarv.github.io/zjw23/ | 已301 跳转到主域名 |
| 小工具箱 | https://dekanarv.github.io/smalltools/ | ✅ 可用 |

后台管理页：http://kanerg.com/admin/index.html

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