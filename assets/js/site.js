/* ==========================================================================
   site.js — 官网主页交互
   占位实现，全部为原生 JS，无依赖。
   模块：导航 / 滚动状态 / 滚动导航高亮 / 移动端菜单 / 进场动画 /
         数字滚动 / 表单占位校验 / 返回顶部
   ========================================================================== */

(function () {
  "use strict";

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------------
     1. 导航：滚动时加阴影 + 滚动联动高亮
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = $("#header");
    if (!header) return;

    var navLinks = $$(".nav__link");
    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    function onScroll() {
      // 头部阴影
      header.classList.toggle("is-stuck", window.scrollY > 8);

      // 导航高亮：取视口内最靠上的区块
      var activeId = "";
      var probe = window.scrollY + window.innerHeight * 0.3;

      sections.forEach(function (sec) {
        if (sec.offsetTop <= probe) activeId = "#" + sec.id;
      });

      // 滚到底部时强制高亮最后一节
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        var last = sections[sections.length - 1];
        if (last) activeId = "#" + last.id;
      }

      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === activeId);
      });
    }

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );

    onScroll();
  }

  /* ------------------------------------------------------------------
     2. 移动端菜单
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var nav = $("#nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    // 点击导航项后收起
    $$(".nav__link", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // 视口放大回桌面尺寸时重置状态
    window.addEventListener("resize", function () {
      if (window.innerWidth > 940) {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
     3. 进场动画（IntersectionObserver）
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     4. 数字滚动
     ------------------------------------------------------------------ */
  function animateNumber(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var duration = 1200;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;

    if (!("IntersectionObserver" in window)) {
      nums.forEach(function (el) {
        el.textContent = el.getAttribute("data-count");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateNumber(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    nums.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     5. 联系表单（占位：仅前端校验，不发请求）
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = $("#contactForm");
    var msg = $("#formMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var topic = form.topic.value;

      function say(text, isError) {
        msg.textContent = text;
        msg.hidden = false;
        msg.classList.toggle("is-error", !!isError);
      }

      if (!name) return say("请填写您的姓名。", true);
      if (!/^1[3-9]\d{9}$/.test(phone.replace(/\s|-/g, "")))
        return say("请填写正确的 11 位手机号。", true);
      if (!topic) return say("请选择咨询类型。", true);

      // TODO: 接入真实后端接口，替换下方提示
      say("表单校验通过。当前为占位模板，尚未接入后端接口。");
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     6. 返回顶部
     ------------------------------------------------------------------ */
  function initBackTop() {
    var btn = $("#backTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("is-show", window.scrollY > 480);
      },
      { passive: true }
    );

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  function init() {
    initHeader();
    initMobileNav();
    initReveal();
    initCounters();
    initContactForm();
    initBackTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();