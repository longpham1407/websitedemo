/**
 * main.js — I Group
 * Menu mobile, overlay header, nút "Về đầu trang", khóa scroll khi menu mở.
 */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const backToTop = document.querySelector(".js-back-to-top");

  const SCROLL_CLASS = "is-scrolled";
  const PILL_COMPACT_CLASS = "is-pill-compact";
  const MENU_OPEN_CLASS = "is-menu-open";
  const BODY_LOCK_CLASS = "nav-open";

  /** Accordion (bộ lọc / FAQ): mở từng mục */
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (root) {
      root.addEventListener("click", function (e) {
        const btn = e.target.closest(".accordion__trigger");
        if (!btn || !root.contains(btn)) return;
        const item = btn.closest(".accordion__item");
        if (!item) return;
        const open = !item.classList.contains("is-open");
        root.querySelectorAll(".accordion__item").forEach(function (it) {
          if (it !== item && root.dataset.accordionSingle === "true") {
            it.classList.remove("is-open");
            const b = it.querySelector(".accordion__trigger");
            if (b) b.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    document.querySelectorAll(".accordion__item.is-open .accordion__trigger").forEach(function (b) {
      b.setAttribute("aria-expanded", "true");
    });
    document.querySelectorAll(".accordion__item:not(.is-open) .accordion__trigger").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  /** Hero split carousel — trượt slide */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      const track = root.querySelector(".page-hero-split__slides");
      const slides = root.querySelectorAll(".page-hero-split__slide");
      const dots = root.querySelectorAll(".page-hero-split__dot");
      const prev = root.querySelector("[data-carousel-prev]");
      const next = root.querySelector("[data-carousel-next]");
      if (!track || slides.length === 0) return;

      let index = 0;

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = "translateX(-" + index * 100 + "%)";
        slides.forEach(function (s, j) {
          s.classList.toggle("is-active", j === index);
        });
        dots.forEach(function (d, j) {
          d.classList.toggle("is-active", j === index);
          d.setAttribute("aria-selected", j === index ? "true" : "false");
        });
      }

      if (prev) prev.addEventListener("click", function () {
        go(index - 1);
      });
      if (next) next.addEventListener("click", function () {
        go(index + 1);
      });
      dots.forEach(function (d, j) {
        d.addEventListener("click", function () {
          go(j);
        });
      });

      go(0);
    });
  }

  /** Scrollspy mục lục chính sách */
  function initScrollSpy() {
    const nav = document.querySelector("[data-scrollspy-nav]");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll("a[href^='#']"));
    const ids = links
      .map(function (a) {
        return a.getAttribute("href").slice(1);
      })
      .filter(Boolean);
    const sections = ids
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    if (sections.length === 0) return;

    const setActive = function (id) {
      links.forEach(function (a) {
        const on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            setActive(en.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (sec) {
      io.observe(sec);
    });
  }

  /** Nút mở/đóng bộ lọc trên mobile */
  function initFilterDrawer() {
    const btn = document.querySelector("[data-filter-drawer-toggle]");
    const panel = document.querySelector("[data-filter-drawer-panel]");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      const open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 901px)").matches) {
        panel.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /** Slider Công ty thành viên: Điều hướng bằng nút mượt mà kết hợp snap */
  function initSubsidiarySlider() {
    const track = document.querySelector(".js-slider-track");
    const prev = document.querySelector(".js-slider-prev");
    const next = document.querySelector(".js-slider-next");
    if (!track || !prev || !next) return;

    // Tính toán chiều rộng cuộn
    function getScrollAmount() {
      const slide = track.querySelector(".subsidiary-carousel__slide");
      if (!slide) return 300;
      // Trả về kích thước của slide + gap
      return slide.offsetWidth + parseFloat(window.getComputedStyle(track).gap || 0);
    }

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    });

    next.addEventListener("click", function () {
      track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    });
  }

  /** Đánh dấu trang hiện tại trong menu (theo data-nav trên <body>) */
  function highlightCurrentNav() {
    const current = document.body.dataset.nav;
    if (!current) return;
    document.querySelectorAll(".site-nav__link").forEach(function (link) {
      if (link.getAttribute("href") === current) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function isDesktopNav() {
    return window.matchMedia("(min-width: 901px)").matches;
  }

  /** Cập nhật aria-hidden: desktop luôn hiển thị nav; mobile khi đóng thì coi như ẩn khỏi luồng đọc */
  function syncNavAriaHidden() {
    if (!siteNav) return;
    if (isDesktopNav()) {
      siteNav.removeAttribute("aria-hidden");
    } else {
      const open = header && header.classList.contains(MENU_OPEN_CLASS);
      siteNav.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  /** Đóng menu mobile */
  function closeMobileMenu() {
    if (!header || !navToggle || !siteNav) return;
    header.classList.remove(MENU_OPEN_CLASS);
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove(BODY_LOCK_CLASS);
    syncNavAriaHidden();
  }

  /** Mở/đóng menu mobile */
  function toggleMobileMenu() {
    if (!header || !navToggle || !siteNav) return;
    const open = header.classList.toggle(MENU_OPEN_CLASS);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle(BODY_LOCK_CLASS, open);
    syncNavAriaHidden();
  }

  /** Shadow header + class html.is-pill-compact (thu biến CSS pill: lề & chiều cao thanh) */
  function onScroll() {
    const y = window.scrollY > 20;
    document.documentElement.classList.toggle(PILL_COMPACT_CLASS, y);
    if (!header) return;
    if (y) {
      header.classList.add(SCROLL_CLASS);
    } else {
      header.classList.remove(SCROLL_CLASS);
    }
  }

  /** Đóng menu khi resize lên desktop */
  function onResize() {
    if (window.matchMedia("(min-width: 901px)").matches) {
      closeMobileMenu();
    }
  }

  /** Đóng menu khi click link (mobile) */
  function onNavClick(e) {
    if (e.target.closest(".site-nav__link") && window.matchMedia("(max-width: 900px)").matches) {
      closeMobileMenu();
    }
  }

  function init() {
    highlightCurrentNav();

    if (navToggle && siteNav) {
      navToggle.setAttribute("aria-expanded", "false");
      syncNavAriaHidden();
      navToggle.addEventListener("click", toggleMobileMenu);
      siteNav.addEventListener("click", onNavClick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    window.addEventListener("resize", function () {
      onResize();
      syncNavAriaHidden();
    });

    if (backToTop) {
      backToTop.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    initSubsidiarySlider();
    initAccordions();
    initCarousels();
    initScrollSpy();
    initFilterDrawer();

    /* Phím Escape đóng menu */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      const filterPanel = document.querySelector("[data-filter-drawer-panel].is-open");
      const filterBtn = document.querySelector("[data-filter-drawer-toggle]");
      if (filterPanel && filterBtn && window.matchMedia("(max-width: 900px)").matches) {
        filterPanel.classList.remove("is-open");
        filterBtn.setAttribute("aria-expanded", "false");
      }
      if (header && header.classList.contains(MENU_OPEN_CLASS) && navToggle) {
        closeMobileMenu();
        navToggle.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
