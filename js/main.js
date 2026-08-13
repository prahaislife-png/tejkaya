(function () {
  "use strict";

  var NAV = [
    { href: "collection.html", label: "The Collection" },
    { href: "rituals.html", label: "Rituals" },
    { href: "ingredients.html", label: "Botanicals" },
    { href: "house.html", label: "The House" }
  ];

  function rootPrefix() {
    return document.body.getAttribute("data-root") === "nested" ? "../" : "";
  }

  function isActive(href) {
    var file = location.pathname.split("/").pop() || "index.html";
    if (file === href) return true;
    if (href === "collection.html" && file === "product.html") return true;
    return false;
  }

  function logoSvg() {
    return (
      '<svg class="mark" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="0.7"/>' +
      '<circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.55"/>' +
      '<path d="M24 33c-4.2-3.2-6-7.2-6-10.4 0-3.6 2.2-6.4 4.2-8.6.4 2.4 1.4 4 2 4.8.6-2.2 2.6-5.8 2.6-5.8 2.4 3.4 3.2 6.4 3.2 9.6 0 3.4-1.8 7.4-6 10.4z" fill="currentColor"/>' +
      "</svg>"
    );
  }

  function renderHeader() {
    var p = rootPrefix();
    var links = NAV.map(function (item) {
      return (
        '<a href="' +
        p +
        item.href +
        '"' +
        (isActive(item.href) ? ' class="is-active"' : "") +
        ">" +
        item.label +
        "</a>"
      );
    }).join("");

    return (
      '<div class="announcement"><span>The House of Tej Kaya  ·  Pre-launch  ·  Early access</span></div>' +
      '<header class="site-header" id="site-header">' +
      '<div class="header-inner">' +
      '<button class="menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>' +
      '<nav class="nav-left">' +
      links +
      "</nav>" +
      '<a class="brand" href="' +
      p +
      'index.html">' +
      logoSvg() +
      '<span class="brand-lockup"><span class="brand-word">Tej Kaya</span><span class="brand-devanagari">तेज काया</span></span>' +
      "</a>" +
      '<div class="nav-right">' +
      '<a class="btn btn-ghost" href="' +
      p +
      'account.html" data-account-cta>Account</a>' +
      "</div>" +
      "</div>" +
      '<div class="mobile-panel" id="mobile-panel">' +
      links +
      '<a href="' +
      p +
      'account.html" data-account-cta>Account</a>' +
      '<a href="' +
      p +
      'index.html#early-access">Early Access</a>' +
      "</div>" +
      "</header>"
    );
  }

  function renderFooter() {
    var p = rootPrefix();
    var products = (window.TEJ_KAYA && window.TEJ_KAYA.products) || [];
    var productLinks = products
      .map(function (item) {
        return (
          '<li><a href="' +
          p +
          "product.html?slug=" +
          item.slug +
          '">' +
          item.number +
          "  " +
          item.name +
          "</a></li>"
        );
      })
      .join("");

    return (
      '<footer class="site-footer">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' +
      '<img class="footer-plate" src="' +
      p +
      'assets/canva/logo.jpg" alt="Tej Kaya">' +
      "<p>Traditional Indian formulations, presented with the refinement of a modern luxury wellness house. Pre-launch. India.</p>" +
      "</div>" +
      '<div><p class="footer-label">The Collection</p><ul>' +
      productLinks +
      "</ul></div>" +
      '<div><p class="footer-label">The House</p><ul>' +
      '<li><a href="' +
      p +
      'house.html">Origin</a></li>' +
      '<li><a href="' +
      p +
      'rituals.html">Rituals</a></li>' +
      '<li><a href="' +
      p +
      'ingredients.html">Botanicals</a></li>' +
      '<li><a href="' +
      p +
      'collection.html">All vessels</a></li>' +
      "</ul></div>" +
      '<div><p class="footer-label">The Atelier</p><ul>' +
      '<li><a href="' +
      p +
      'ritual-finder.html">Ritual Finder</a></li>' +
      '<li><a href="' +
      p +
      'private.html">Private</a></li>' +
      '<li><a href="' +
      p +
      '21-days.html">21 Days</a></li>' +
      '<li><a href="' +
      p +
      'account.html">Account</a></li>' +
      "</ul></div>" +
      '<div><p class="footer-label">Correspondence</p><ul>' +
      "<li><a href=\"mailto:hello@tejkaya.com\">hello@tejkaya.com</a></li>" +
      '<li><a href="' +
      p +
      'index.html#early-access">Early access list</a></li>' +
      "<li>Mumbai · Atelier</li>" +
      "</ul></div>" +
      "</div>" +
      '<div class="footer-base">' +
      "<p>© " +
      new Date().getFullYear() +
      " Tej Kaya. All rights reserved.</p>" +
      "<p>Wellness language is editorial until formulations and approvals are confirmed. Not intended to diagnose, treat, cure or prevent any disease.</p>" +
      "</div>" +
      "</footer>"
    );
  }

  function bindChrome() {
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("menu-toggle");
    var panel = document.getElementById("mobile-panel");

    window.addEventListener("scroll", function () {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    });

    try {
      var session = JSON.parse(sessionStorage.getItem("tejKaya.session") || "null");
      if (session && session.firstName) {
        document.querySelectorAll("[data-account-cta]").forEach(function (node) {
          node.textContent = session.firstName;
        });
      }
    } catch (e) {
      /* ignore */
    }

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          document.body.classList.remove("menu-open");
        });
      });
    }
  }

  function observeReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px 15% 0px" }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function bindEarlyAccess() {
    document.querySelectorAll("[data-early-access]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]');
        var wrap = form.closest(".early-access") || form.parentElement;
        if (!email || !email.value) return;
        var list = JSON.parse(localStorage.getItem("tejKayaWaitlist") || "[]");
        list.push({ email: email.value, at: new Date().toISOString() });
        localStorage.setItem("tejKayaWaitlist", JSON.stringify(list));
        form.hidden = true;
        var thanks = wrap.querySelector("[data-thanks]");
        if (thanks) thanks.hidden = false;
      });
    });
  }

  function productHref(slug) {
    return rootPrefix() + "product.html?slug=" + slug;
  }

  function cardHtml(product) {
    return (
      '<a class="product-card" href="' +
      productHref(product.slug) +
      '">' +
      '<div class="product-card-media">' +
      '<img src="' +
      rootPrefix() +
      product.image +
      '" alt="' +
      product.name +
      '">' +
      "</div>" +
      '<div class="product-card-meta">' +
      '<span class="eyebrow">' +
      product.number +
      "  ·  " +
      product.category +
      "</span>" +
      "<h3>" +
      product.name +
      "</h3>" +
      '<p class="devanagari product-hindi">' +
      product.hindi +
      "</p>" +
      '<p class="product-tagline">' +
      product.tagline +
      "</p>" +
      '<span class="text-link">View the vessel</span>' +
      "</div>" +
      "</a>"
    );
  }

  window.TEJ_KAYA.renderProductGrid = function (selector, limit) {
    var el = document.querySelector(selector);
    if (!el) return;
    var items = window.TEJ_KAYA.products.slice(0, limit || 99);
    el.innerHTML = items.map(cardHtml).join("");
  };

  window.TEJ_KAYA.renderProductPage = function () {
    var params = new URLSearchParams(location.search);
    var product = window.TEJ_KAYA.getProduct(params.get("slug") || "");
    var root = document.getElementById("product-root");
    if (!root) return;

    if (!product) {
      root.innerHTML =
        '<section class="page-hero"><div class="container reveal is-visible"><p class="eyebrow">The Collection</p><h1>This vessel is not yet in the house.</h1><p><a class="text-link" href="collection.html">Return to the collection</a></p></div></section>';
      return;
    }

    document.title = product.name + " — Tej Kaya";
    var botanicals = product.botanicals
      .map(function (b) {
        return (
          "<li><strong>" +
          b.name +
          '</strong><span class="latin">' +
          b.latin +
          "</span><p>" +
          b.note +
          "</p></li>"
        );
      })
      .join("");

    var related = window.TEJ_KAYA.products
      .filter(function (p) {
        return p.slug !== product.slug;
      })
      .slice(0, 4)
      .map(cardHtml)
      .join("");

    var story = product.story
      .map(function (para) {
        return "<p>" + para + "</p>";
      })
      .join("");

    root.innerHTML =
      '<section class="product-hero">' +
      '<div class="product-hero-media reveal">' +
      '<img src="' +
      product.image +
      '" alt="' +
      product.name +
      '">' +
      "</div>" +
      '<div class="product-hero-copy reveal">' +
      '<p class="eyebrow">The Collection  ·  ' +
      product.number +
      "</p>" +
      "<h1>" +
      product.name +
      "</h1>" +
      '<p class="devanagari lead-dev">' +
      product.hindi +
      "</p>" +
      '<p class="lede">' +
      product.tagline +
      "</p>" +
      "<p>" +
      product.excerpt +
      "</p>" +
      '<dl class="spec">' +
      "<div><dt>Vessel</dt><dd>" +
      product.vessel +
      "</dd></div>" +
      "<div><dt>Contents</dt><dd>" +
      product.weight +
      "</dd></div>" +
      "<div><dt>Availability</dt><dd>Coming soon · Early access</dd></div>" +
      "<div><dt>Price</dt><dd>" +
      product.priceNote +
      "</dd></div>" +
      "</dl>" +
      '<div class="product-cta">' +
      '<a class="btn btn-solid" href="index.html#early-access">Request early access</a>' +
      '<p class="micro">Checkout will open with the first atelier release. No payment is taken now.</p>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="split">' +
      '<div class="split-copy reveal">' +
      '<p class="eyebrow">The composition</p>' +
      "<h2>A traditional category,<br>a contemporary object.</h2>" +
      story +
      '<p class="disclaimer">' +
      product.notes +
      " " +
      window.TEJ_KAYA.disclaimer +
      "</p>" +
      "</div>" +
      '<div class="split-aside reveal">' +
      '<p class="eyebrow">The ritual</p>' +
      "<blockquote>" +
      product.ritual +
      "</blockquote>" +
      "</div>" +
      "</section>" +
      '<section class="botanical-list">' +
      '<div class="container">' +
      '<p class="eyebrow reveal">Intended botanicals</p>' +
      '<h2 class="reveal">The garden inside the vessel</h2>' +
      '<p class="section-intro reveal">Named as a direction of travel. The locked formula may differ. Latin names and quantities will appear on pack.</p>' +
      '<ul class="botanical-grid">' +
      botanicals +
      "</ul>" +
      "</div>" +
      "</section>" +
      '<section class="related">' +
      '<div class="container">' +
      '<p class="eyebrow">Continue through the house</p>' +
      "<h2>Four other vessels</h2>" +
      '<div class="product-grid">' +
      related +
      "</div>" +
      "</div>" +
      "</section>";
  };

  document.addEventListener("DOMContentLoaded", function () {
    var mountHead = document.getElementById("site-chrome-header");
    var mountFoot = document.getElementById("site-chrome-footer");
    if (mountHead) mountHead.innerHTML = renderHeader();
    if (mountFoot) mountFoot.innerHTML = renderFooter();
    bindChrome();
    bindEarlyAccess();
    if (document.body.hasAttribute("data-collection")) {
      window.TEJ_KAYA.renderProductGrid("[data-product-grid]");
    }
    if (document.body.hasAttribute("data-home-products")) {
      window.TEJ_KAYA.renderProductGrid("[data-product-grid]");
    }
    if (document.getElementById("product-root")) {
      window.TEJ_KAYA.renderProductPage();
    }
    observeReveal();
  });
})();
