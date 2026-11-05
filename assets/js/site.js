/* ==========================================================================
   site.js — 官网主页交互
   全部为原生 JS，无依赖。
   模块：导航 / 滚动状态 / 滚动导航高亮 / 移动端菜单 / 进场动画 /
         数字滚动 / 分页轮播 / 表单占位校验 / 返回顶部
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
     5. 分页轮播（Paged Carousel）
     底层用 CSS scroll-snap 实现滚动与吸附，JS 只负责：
       · 左右按钮翻页
       · 边界时禁用按钮
       · 键盘左右方向键切换
     吸附点由 CSS 决定：桌面端吸附在「页」上，移动端吸附在「卡片」上，
     JS 通过读取 scroll-snap-align 自动识别当前生效的吸附点。
     ------------------------------------------------------------------ */
  function initCarousel() {
    $$("[data-carousel]").forEach(function (root) {
      var viewport = $("[data-carousel-viewport]", root);
      var prevBtn = $("[data-carousel-prev]", root);
      var nextBtn = $("[data-carousel-next]", root);
      if (!viewport) return;

      var index = 0;

      /* 当前生效的吸附点：取 scroll-snap-align 不为 none 的元素 */
      function snapTargets() {
        return $$(".carousel__page, .carousel__page .biz", viewport).filter(function (el) {
          return getComputedStyle(el).scrollSnapAlign !== "none";
        });
      }

      /* 元素在滚动内容坐标系中的横坐标（与 scrollLeft 同尺度，可直接比较） */
      function leftOf(el) {
        return (
          el.getBoundingClientRect().left -
          viewport.getBoundingClientRect().left +
          viewport.scrollLeft -
          viewport.clientLeft
        );
      }

      /* 该吸附点使用的对齐方式 */
      function alignOf(el) {
        var a = getComputedStyle(el).scrollSnapAlign;
        return a === "center" || a === "end" ? a : "start";
      }

      /* 把吸附点滚动到视口当前对齐位置所需的 scrollLeft */
      function targetFor(el) {
        var cs = getComputedStyle(viewport);
        var pl = parseFloat(cs.paddingLeft) || 0;
        var pr = parseFloat(cs.paddingRight) || 0;
        var contentW = viewport.clientWidth - pl - pr;
        var x = leftOf(el) - pl;                       // 元素在内容坐标系中的起点
        var w = el.getBoundingClientRect().width;
        var align = alignOf(el);

        if (align === "center") return x - (w - contentW) / 2;
        if (align === "end") return x - (w - contentW);
        return x;
      }

      function currentIndex(targets) {
        var best = 0;
        var bestDist = Infinity;
        var pos = viewport.scrollLeft;
        targets.forEach(function (el, i) {
          var d = Math.abs(targetFor(el) - pos);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        return best;
      }

      function goTo(i) {
        var targets = snapTargets();
        if (!targets.length) return;
        index = Math.max(0, Math.min(targets.length - 1, i));
        viewport.scrollTo({ left: targetFor(targets[index]), behavior: "smooth" });
        syncButtons();
      }

      function syncButtons() {
        var targets = snapTargets();
        if (prevBtn) prevBtn.disabled = index <= 0;
        if (nextBtn) nextBtn.disabled = index >= targets.length - 1;
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo(index - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo(index + 1);
        });
      }

      // 手动滑动后同步当前位置
      var scrollTimer = null;
      viewport.addEventListener(
        "scroll",
        function () {
          if (scrollTimer) clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function () {
            index = currentIndex(snapTargets());
            syncButtons();
          }, 80);
        },
        { passive: true }
      );

      // 键盘操作
      viewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(index - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(index + 1);
        }
      });

      // 窗口尺寸变化后吸附点位置失效，需重新对齐
      var resizeTimer = null;
      window.addEventListener(
        "resize",
        function () {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () {
            var targets = snapTargets();
            if (targets[index]) {
              viewport.scrollTo({ left: targetFor(targets[index]), behavior: "auto" });
            }
          }, 150);
        },
        { passive: true }
      );

      syncButtons();
    });
  }

  /* ------------------------------------------------------------------
     6. 联系表单（占位：仅前端校验，不发请求）
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
     7. 返回顶部
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
    initCarousel();
    initContactForm();
    initBackTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();