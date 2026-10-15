/* ==========================================================================
   admin.js — 后台管理交互（占位脚手架）
   原生 JS，无依赖。模块：
   hash 路由 / 侧边栏 / 列表渲染 / 弹窗 / Toast / 时钟 / 时间范围切换
   数据均为本地 mock，后续替换为接口调用。
   ========================================================================== */

(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };

  /* ------------------------------------------------------------------
     Mock 数据
     ------------------------------------------------------------------ */
  var MOCK = {
    recent: [
      { title: "首页主视觉改版说明", type: "页面", status: "已发布", user: "管理员", time: "2026-10-15 09:12" },
      { title: "2026 年度合作案例集", type: "案例", status: "待审核", user: "内容编辑", time: "2026-10-14 17:40" },
      { title: "业务板块介绍页", type: "页面", status: "草稿", user: "运营专员", time: "2026-10-12 11:03" },
      { title: "公司资质荣誉整理", type: "新闻", status: "已发布", user: "管理员", time: "2026-10-10 15:28" },
      { title: "产品服务清单 v2", type: "产品", status: "已发布", user: "内容编辑", time: "2026-10-08 09:45" }
    ],
    lists: {
      posts: {
        title: "文章管理",
        desc: "维护官网新闻、公告与行业洞察类内容。",
        items: [
          ["2026 年度合作伙伴招募", "新闻动态", "已发布", "管理员", "2026-10-15 09:12"],
          ["行业趋势解读（占位）", "行业洞察", "已发布", "内容编辑", "2026-10-12 14:20"],
          ["公司半年度总结", "公司公告", "草稿", "运营专员", "2026-10-09 10:05"],
          ["展会报名通知", "公司公告", "待审核", "内容编辑", "2026-10-06 16:33"],
          ["技术团队扩招", "新闻动态", "已发布", "管理员", "2026-10-02 09:00"]
        ]
      },
      cases: {
        title: "案例管理",
        desc: "项目案例的展示内容与排序。",
        items: [
          ["某生产线部署项目", "制造业", "已发布", "运营专员", "2026-10-11 11:20"],
          ["厂区管网改造工程", "能源化工", "已发布", "管理员", "2026-10-05 15:40"],
          ["智能仓储升级", "物流", "草稿", "内容编辑", "2026-09-28 09:12"],
          ["办公楼智能化改造", "建筑", "待审核", "管理员", "2026-09-20 14:50"]
        ]
      },
      products: {
        title: "产品/服务",
        desc: "对外展示的服务项目与解决方案。",
        items: [
          ["设备安装调试", "核心业务", "已发布", "管理员", "2026-10-13 10:30"],
          ["防爆工程", "核心业务", "已发布", "技术负责人", "2026-10-07 09:20"],
          ["桥架布线", "核心业务", "已发布", "技术负责人", "2026-09-30 16:00"],
          ["运维服务", "延伸服务", "草稿", "运营专员", "2026-09-22 13:45"]
        ]
      },
      categories: {
        title: "分类与标签",
        desc: "内容分类体系维护。",
        items: [
          ["新闻动态", "内容分类", "启用", "管理员", "2026-09-15 09:00"],
          ["项目案例", "内容分类", "启用", "管理员", "2026-09-15 09:00"],
          ["行业洞察", "内容分类", "启用", "内容编辑", "2026-09-18 14:20"],
          ["热门标签 A", "标签", "启用", "运营专员", "2026-10-01 11:00"]
        ]
      },
      leads: {
        title: "咨询留言",
        desc: "官网表单提交的咨询线索，需及时跟进。",
        items: [
          ["张先生 · 138****8899", "产品咨询", "待处理", "—", "2026-10-15 09:48"],
          ["李女士 · 139****2210", "方案报价", "待处理", "—", "2026-10-15 09:20"],
          ["王工 · 137****6655", "售后服务", "已回复", "管理员", "2026-10-14 16:30"],
          ["某公司 · 136****3321", "商务合作", "待处理", "—", "2026-10-14 11:05"]
        ]
      },
      customers: {
        title: "客户列表",
        desc: "客户档案与合作状态。",
        items: [
          ["某某制造集团", "制造业", "合作中", "运营专员", "2026-10-10 09:00"],
          ["某某能源公司", "能源化工", "合作中", "管理员", "2026-09-26 14:20"],
          ["某某物流公司", "物流", "洽谈中", "运营专员", "2026-09-18 10:40"],
          ["某某建筑公司", "建筑", "已结束", "管理员", "2026-08-30 16:15"]
        ]
      },
      users: {
        title: "用户与权限",
        desc: "后台账号与角色权限分配。",
        items: [
          ["管理员 admin", "超级管理员", "正常", "—", "2026-10-15 09:12"],
          ["内容编辑 editor", "编辑", "正常", "—", "2026-10-14 17:40"],
          ["运营专员 ops", "运营", "已锁定", "—", "2026-09-28 11:05"],
          ["技术负责人 tech", "技术", "正常", "—", "2026-10-09 15:22"]
        ]
      }
    }
  };

  var STATUS_CLASS = {
    "已发布": "badge--success",
    "正常": "badge--success",
    "合作中": "badge--success",
    "启用": "badge--success",
    "草稿": "badge",
    "已回复": "badge--info",
    "洽谈中": "badge--info",
    "待审核": "badge--warning",
    "已锁定": "badge--danger",
    "已结束": "",
    "待处理": "badge--danger"
  };

  /* ------------------------------------------------------------------
     Toast 提示
     ------------------------------------------------------------------ */
  var toastTimer;
  function toast(text) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.hidden = true;
    }, 2200);
  }

  /* ------------------------------------------------------------------
     弹窗
     ------------------------------------------------------------------ */
  function openModal(title) {
    var modal = $("#modal");
    if (!modal) return;
    $("#modalTitle").textContent = title || "新建";
    $("#modalInput").value = "";
    modal.hidden = false;
    setTimeout(function () {
      $("#modalInput").focus();
    }, 30);
  }

  function closeModal() {
    var modal = $("#modal");
    if (modal) modal.hidden = true;
  }

  function initModal() {
    var modal = $("#modal");
    if (!modal) return;

    $$("[data-close]", modal).forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    $("#modalOk").addEventListener("click", function () {
      var val = $("#modalInput").value.trim();
      if (!val) {
        toast("请填写名称");
        return;
      }
      closeModal();
      // TODO: 替换为真实创建接口
      toast("占位：已创建「" + val + "」");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  /* ------------------------------------------------------------------
     侧边栏（移动端）
     ------------------------------------------------------------------ */
  function initSidebar() {
    var sidebar = $("#sidebar");
    var mask = $("#sidebarMask");
    var burger = $("#burger");
    if (!sidebar || !burger) return;

    function toggle(open) {
      sidebar.classList.toggle("is-open", open);
      if (mask) mask.classList.toggle("is-show", open);
    }

    burger.addEventListener("click", function () {
      toggle(!sidebar.classList.contains("is-open"));
    });

    if (mask) mask.addEventListener("click", function () { toggle(false); });

    // 路由切换后自动收起
    window.addEventListener("hashchange", function () { toggle(false); });
  }

  /* ------------------------------------------------------------------
     路由
     视图分三类：dashboard / list / form / settings
     ------------------------------------------------------------------ */
  var ROUTE_META = {
    dashboard: { crumb: "仪表盘", view: "dashboard" },
    posts: { crumb: "文章管理", view: "list" },
    cases: { crumb: "案例管理", view: "list" },
    products: { crumb: "产品/服务", view: "list" },
    categories: { crumb: "分类与标签", view: "list" },
    leads: { crumb: "咨询留言", view: "list" },
    customers: { crumb: "客户列表", view: "list" },
    users: { crumb: "用户与权限", view: "list" },
    settings: { crumb: "系统设置", view: "settings" },
    editor: { crumb: "内容编辑", view: "form" }
  };

  function currentRoute() {
    var raw = location.hash.replace(/^#\/?/, "");
    return ROUTE_META[raw] ? raw : "dashboard";
  }

  function renderRoute() {
    var route = currentRoute();
    var meta = ROUTE_META[route];

    // 面包屑
    var crumb = $("#crumb");
    if (crumb) crumb.textContent = meta.crumb;

    // 侧边栏高亮（editor 不在侧边栏中）
    $$(".sidebar__link").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-route") === route);
    });

    // 视图切换
    $$(".view").forEach(function (v) {
      v.hidden = v.getAttribute("data-view") !== meta.view;
    });

    // 渲染对应内容
    if (meta.view === "dashboard") renderRecent();
    if (meta.view === "list") renderList(route);

    window.scrollTo({ top: 0 });
  }

  /* ------------------------------------------------------------------
     仪表盘：最近更新表格
     ------------------------------------------------------------------ */
  function renderRecent() {
    var tbody = $("#recentRows");
    if (!tbody) return;

    tbody.innerHTML = MOCK.recent
      .map(function (r) {
        var cls = STATUS_CLASS[r.status] || "";
        return (
          "<tr>" +
          "<td><b>" + r.title + "</b></td>" +
          "<td><small>" + r.type + "</small></td>" +
          '<td><span class="badge ' + cls + '">' + r.status + "</span></td>" +
          "<td>" + r.user + "</td>" +
          "<td><small>" + r.time + "</small></td>" +
          '<td class="ta-right">' +
          '<button class="link-btn" data-go="editor">编辑</button>' +
          '<button class="link-btn link-btn--danger">删除</button>' +
          "</td></tr>"
        );
      })
      .join("");
  }

  /* ------------------------------------------------------------------
     列表页
     ------------------------------------------------------------------ */
  function renderList(route) {
    var conf = MOCK.lists[route];
    if (!conf) return;

    $("#listTitle").textContent = conf.title;
    $("#listDesc").textContent = conf.desc;
    $("#btnCreate").textContent = "+ 新建" + conf.title.replace(/管理|列表/g, "");

    var tbody = $("#listRows");
    tbody.innerHTML = conf.items
      .map(function (row) {
        var cls = STATUS_CLASS[row[2]] || "";
        return (
          "<tr>" +
          '<td><input type="checkbox" aria-label="选择"></td>' +
          "<td><b>" + row[0] + "</b></td>" +
          "<td><small>" + row[1] + "</small></td>" +
          '<td><span class="badge ' + cls + '">' + row[2] + "</span></td>" +
          "<td>" + row[3] + "</td>" +
          "<td><small>" + row[4] + "</small></td>" +
          '<td class="ta-right">' +
          '<button class="link-btn" data-go="editor">编辑</button>' +
          '<button class="link-btn link-btn--danger">删除</button>' +
          "</td></tr>"
        );
      })
      .join("");
  }

  /* ------------------------------------------------------------------
     事件委托
     ------------------------------------------------------------------ */
  function initDelegates() {
    // 行内「编辑」→ 跳转到表单视图
    document.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (go) {
        location.hash = "#/" + go.getAttribute("data-go");
        return;
      }

      var del = e.target.closest(".link-btn--danger");
      if (del) {
        // TODO: 替换为真实删除接口
        toast("占位：删除操作未接入接口");
      }
    });

    // 新建按钮
    var create = $("#btnCreate");
    if (create) {
      create.addEventListener("click", function () {
        openModal("新建条目");
      });
    }

    // 表单提交（占位）
    var editorForm = $("#editorForm");
    if (editorForm) {
      editorForm.addEventListener("submit", function (e) {
        e.preventDefault();
        toast("占位：数据未提交，请接入后端接口");
      });
    }

    // 时间范围切换
    $$(".segmented button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".segmented button").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });

    // 搜索框过滤当前列表
    var search = $("#listSearch");
    if (search) {
      search.addEventListener("input", function () {
        var route = currentRoute();
        var conf = MOCK.lists[route];
        if (!conf) return;

        var kw = search.value.trim().toLowerCase();
        var filtered = kw
          ? conf.items.filter(function (r) {
              return r.join(" ").toLowerCase().indexOf(kw) > -1;
            })
          : conf.items;

        var tbody = $("#listRows");
        tbody.innerHTML = filtered.length
          ? filtered.map(function (row) {
              var cls = STATUS_CLASS[row[2]] || "";
              return (
                "<tr>" +
                '<td><input type="checkbox" aria-label="选择"></td>' +
                "<td><b>" + row[0] + "</b></td>" +
                "<td><small>" + row[1] + "</small></td>" +
                '<td><span class="badge ' + cls + '">' + row[2] + "</span></td>" +
                "<td>" + row[3] + "</td>" +
                "<td><small>" + row[4] + "</small></td>" +
                '<td class="ta-right">' +
                '<button class="link-btn" data-go="editor">编辑</button>' +
                '<button class="link-btn link-btn--danger">删除</button>' +
                "</td></tr>"
              );
            }).join("")
          : '<tr><td colspan="7"><div class="empty">' +
            '<div class="empty__icon">🔍</div><p>没有匹配的记录</p></div></td></tr>';
      });
    }
  }

  /* ------------------------------------------------------------------
     页脚时钟
     ------------------------------------------------------------------ */
  function initClock() {
    var el = $("#clock");
    if (!el) return;

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function tick() {
      var d = new Date();
      el.textContent =
        d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
        " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  function init() {
    initSidebar();
    initModal();
    initDelegates();
    initClock();

    window.addEventListener("hashchange", renderRoute);
    renderRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();