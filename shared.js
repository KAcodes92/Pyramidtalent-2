/* CELSIOR_ANALYTICS_TRACKING_BLOCK
 * GA4 + Microsoft Clarity tracking for production only.
 * Runs only on celsiortech.com / www.celsiortech.com to keep dev data clean.
 */
(function () {
  var allowedHosts = ["celsiortech.com", "www.celsiortech.com"];
  if (allowedHosts.indexOf(window.location.hostname) === -1) return;

  // Google Analytics 4
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-ERKH1G4MZT";
  document.head.appendChild(gaScript);

  gtag("js", new Date());
  gtag("config", "G-ERKH1G4MZT");

  // Microsoft Clarity
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "xc3270o91n");
})();


/**
 * shared.js — Celsior site-wide nav + footer injector
 * Include this script on EVERY page (load with `defer`). Active nav item
 * is auto-detected from the URL filename; you can override with
 * <body data-page="how">.
 *
 * Pages: home | solve | how | deliver | ai | industries | partners | about
 *
 * Homepage safety: the script auto-skips injection if the page already
 * ships its own <nav id="navbar"> or <footer id="siteFooterLight">, OR
 * if <body data-shared="off"> is set. So you can drop
 *   <script src="shared.js" defer></script>
 * into index.html without producing duplicate headers/footers.
 */
(function () {
  if (window.__celsiorSharedLoaded) return;
  window.__celsiorSharedLoaded = true;

  /* ─── 0a. SITE-WIDE CONFIG (edit IDs once they exist) ───────────────
     Leave any value as '' to disable that integration. See SETUP.md.
  ─────────────────────────────────────────────────────────────────── */
  const SITE_CONFIG = (window.SITE_CONFIG = Object.assign({
    favicon: '/favicon-20260708.png',
    siteName: 'Pyramid Consulting',
    defaultDescription: 'AI-first digital engineering partner for regulated industries — modernizing critical systems, operationalizing AI, and building resilience at scale.',
    defaultOgImage: '',           // optional absolute URL
    twitterHandle: '',            // e.g. '@pyramidci'
    ga4MeasurementId: '',         // e.g. 'G-XXXXXXX'
    gtmContainerId: '',           // e.g. 'GTM-XXXXXXX'
    gscVerificationCode: '',      // Search Console meta-tag content
    recaptchaSiteKey: '',         // reCAPTCHA v3 site key
    policiesBase: 'policies/',    // folder where the 7 PDFs live, relative to site root
  }, window.SITE_CONFIG || {}));

  /* ─── 0b. FAVICON + SEO META + GTM/GA + GSC ─────────────────────── */
  (function injectHead() {
    const head = document.head;
    const link = (rel, href, extra) => { const l = document.createElement('link'); l.rel = rel; l.href = href; if (extra) Object.assign(l, extra); return l; };
    const meta = (attr, val, content) => { const m = document.createElement('meta'); m.setAttribute(attr, val); m.content = content; return m; };

    if (SITE_CONFIG.favicon) {
      head.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]').forEach(n => n.remove());
      head.appendChild(link('icon', SITE_CONFIG.favicon, { type: 'image/png' }));
      head.appendChild(link('apple-touch-icon', SITE_CONFIG.favicon));
      head.appendChild(link('shortcut icon', SITE_CONFIG.favicon));
    }

    if (!document.querySelector('meta[name="viewport"]')) head.appendChild(meta('name', 'viewport', 'width=device-width, initial-scale=1, viewport-fit=cover'));
    if (!document.querySelector('meta[name="description"]')) head.appendChild(meta('name', 'description', SITE_CONFIG.defaultDescription));
    if (!document.querySelector('meta[name="theme-color"]')) head.appendChild(meta('name', 'theme-color', '#11224F'));
    if (!document.querySelector('meta[name="robots"]')) head.appendChild(meta('name', 'robots', 'noindex, nofollow, noarchive'));

    const titleText = (document.title && document.title.trim()) || SITE_CONFIG.siteName;
    if (!document.title) document.title = titleText;
    const descEl = document.querySelector('meta[name="description"]');
    const descText = (descEl && descEl.content) || SITE_CONFIG.defaultDescription;
    const pageUrl = location.origin + location.pathname;

    const og = [
      ['og:title', titleText], ['og:description', descText],
      ['og:type', 'website'], ['og:url', pageUrl], ['og:site_name', SITE_CONFIG.siteName],
    ];
    if (SITE_CONFIG.defaultOgImage) og.push(['og:image', SITE_CONFIG.defaultOgImage]);
    og.forEach(([p, c]) => { if (!document.querySelector('meta[property="' + p + '"]')) head.appendChild(meta('property', p, c)); });

    const tw = [
      ['twitter:card', SITE_CONFIG.defaultOgImage ? 'summary_large_image' : 'summary'],
      ['twitter:title', titleText], ['twitter:description', descText],
    ];
    if (SITE_CONFIG.twitterHandle) tw.push(['twitter:site', SITE_CONFIG.twitterHandle]);
    if (SITE_CONFIG.defaultOgImage) tw.push(['twitter:image', SITE_CONFIG.defaultOgImage]);
    tw.forEach(([n, c]) => { if (!document.querySelector('meta[name="' + n + '"]')) head.appendChild(meta('name', n, c)); });

    if (!document.querySelector('link[rel="canonical"]')) head.appendChild(link('canonical', pageUrl));

    if (SITE_CONFIG.gscVerificationCode && !document.querySelector('meta[name="google-site-verification"]')) {
      head.appendChild(meta('name', 'google-site-verification', SITE_CONFIG.gscVerificationCode));
    }

    if (!document.querySelector('script[data-ld="org"]')) {
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.setAttribute('data-ld', 'org');
      s.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Organization',
        name: 'Pyramid Consulting, Inc.', url: location.origin, logo: SITE_CONFIG.favicon
      });
      head.appendChild(s);
    }

    // Consent-gated loader; cookie banner calls this on Accept
    window.__loadAnalytics = function loadAnalytics() {
      if (window.__analyticsLoaded) return;
      window.__analyticsLoaded = true;
      if (SITE_CONFIG.gtmContainerId) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const gtm = document.createElement('script');
        gtm.async = true;
        gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + SITE_CONFIG.gtmContainerId;
        head.appendChild(gtm);
      }
      if (SITE_CONFIG.ga4MeasurementId) {
        const ga = document.createElement('script');
        ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + SITE_CONFIG.ga4MeasurementId;
        head.appendChild(ga);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        const ccpaOut = localStorage.getItem('ccpa_opt_out') === '1';
        window.gtag('config', SITE_CONFIG.ga4MeasurementId, {
          anonymize_ip: true,
          allow_ad_personalization_signals: !ccpaOut,
        });
      }
      if (SITE_CONFIG.recaptchaSiteKey && !window.grecaptcha) {
        const rc = document.createElement('script');
        rc.async = true; rc.defer = true;
        rc.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_CONFIG.recaptchaSiteKey;
        head.appendChild(rc);
      }
    };
  })();

  /* ─── 0c. SKIP-LINK for keyboard accessibility ─────────────────── */
  (function skipLink() {
    if (document.getElementById('skipToMain')) return;
    const a = document.createElement('a');
    a.id = 'skipToMain'; a.href = '#main'; a.textContent = 'Skip to main content';
    a.style.cssText = 'position:fixed;top:-100px;left:8px;z-index:99999;background:#0F172A;color:#fff;padding:10px 16px;border-radius:8px;font:600 14px/1 system-ui,sans-serif;transition:top .15s;';
    a.addEventListener('focus', () => { a.style.top = '8px'; });
    a.addEventListener('blur', () => { a.style.top = '-100px'; });
    document.addEventListener('DOMContentLoaded', () => document.body.prepend(a), { once: true });
  })();



  /* ─── 0.  LEGACY LINK NORMALIZER ────────────────────────────────────
     Some existing pages, especially index.html, ship their own header and
     may still contain old URLs. Normalize those links before any guard can
     skip injection, and intercept clicks as a second safety net.
  ─────────────────────────────────────────────────────────────────── */
  const LEGACY_LINK_MAP = {
    'what-we-solve.html': '/our-focus',
    'how-we-do-it.html': '/capabilities',
    'how-we-deliver.html': '/solutions',
    'our_focus.html': '/our-focus',
    'capabilties.html': '/capabilities',
    'capabilities.html': '/capabilities',
    'solutions.html': '/solutions',
  };

  function normalizeLegacyHref(rawHref) {
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return rawHref;
    try {
      const url = new URL(rawHref, window.location.href);
      if (url.origin !== window.location.origin && !/^(file:)$/.test(window.location.protocol)) return rawHref;
      const file = (url.pathname.split('/').pop() || '').toLowerCase();
      const replacement = LEGACY_LINK_MAP[file];
      if (!replacement) return rawHref;
      const folder = url.pathname.slice(0, Math.max(0, url.pathname.lastIndexOf('/') + 1));
      if (replacement.startsWith('/')) return `${replacement}${url.search}${url.hash}`;
      return `${folder}${replacement}${url.search}${url.hash}`;
    } catch (_) {
      const clean = rawHref.split('#')[0].split('?')[0].split('/').pop().toLowerCase();
      const replacement = LEGACY_LINK_MAP[clean];
      return replacement ? rawHref.replace(/[^/?#]+\.html/i, replacement) : rawHref;
    }
  }

  function rewriteLegacyLinks(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (link) {
      const fixedHref = normalizeLegacyHref(link.getAttribute('href'));
      if (fixedHref && fixedHref !== link.getAttribute('href')) link.setAttribute('href', fixedHref);
    });
  }

  function keepLegacyLinksNormalized() {
    rewriteLegacyLinks(document);
    document.addEventListener('DOMContentLoaded', function () { rewriteLegacyLinks(document); }, { once: true });
    window.addEventListener('load', function () { rewriteLegacyLinks(document); }, { once: true });
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.target && mutation.target.matches && mutation.target.matches('a[href]')) {
            rewriteLegacyLinks(mutation.target.parentNode || document);
          }
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) rewriteLegacyLinks(node);
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }
  }

  function installLegacyClickGuard() {
    document.addEventListener('click', function (event) {
      const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;
      const currentHref = link.getAttribute('href');
      const fixedHref = normalizeLegacyHref(currentHref);
      if (!fixedHref || fixedHref === currentHref) return;
      event.preventDefault();
      link.setAttribute('href', fixedHref);
      window.location.href = fixedHref;
    }, true);
  }

  /* ─── 1.  OPT-OUT / EXISTING ELEMENT DETECTION ─────────────────────
     Clean site-wide rule:
       • shared.js is the single source of truth for secondary-page nav/footer.
       • Existing complete homepage nav/footer are respected, so no duplicates.
       • Missing or empty placeholders are filled independently.
  ─────────────────────────────────────────────────────────────────── */
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', function () {
      keepLegacyLinksNormalized();
      installLegacyClickGuard();
      window.__celsiorSharedLoaded = false;
      const s = document.createElement('script');
      s.src = (document.currentScript && document.currentScript.src) || 'shared.js';
      s.defer = true;
      document.head.appendChild(s);
    }, { once: true });
    return;
  }
  keepLegacyLinksNormalized();
  installLegacyClickGuard();

  if (document.body.dataset.shared === 'off') {
    console.info('[shared.js] Skipped injection — body[data-shared="off"].');
    return;
  }

  function hasUsableNav() {
    const nav = document.getElementById('navbar');
    return !!(nav && nav.querySelector('a[href], button, .nav-link, .nav-logo'));
  }

  function hasUsableFooter() {
    const footer = document.getElementById('siteFooterLight') || document.querySelector('footer');
    return !!(footer && footer.querySelector('a[href], .fl-grid, .fl-brand, .fl-bottom'));
  }

  const shouldInjectNav = !hasUsableNav();
  const shouldInjectFooter = !hasUsableFooter();

  if (!shouldInjectNav && !shouldInjectFooter) {
    console.info('[shared.js] Existing complete nav and footer found — normalized links only.');
  }

  /* ─── 0.5. INJECT GLOBAL CARD STYLES ────────────────────────────── */
  (function injectGlobalCardStyles() {
    if (document.getElementById('celsior-global-cards')) return;
    const style = document.createElement('style');
    style.id = 'celsior-global-cards';
    style.textContent = `
/* ═══════════════════════ UNIFIED CARD HOVER EFFECT ═════════════════
   Applying gradient border and shadow on hover across all content cards
   ═══════════════════════════════════════════════════════════════════ */
.aw-card:hover, 
.fp-card:hover, 
.ops-cost-card:hover, 
.ops-cost-cards > div:not([style*="position:absolute"]):hover,
.insight-card:hover,
.drawer-mega-feature:hover,
.drawer-mega-card:hover,
.mz-feature-card:hover,
.mz-assess-card:hover {
  background:
    linear-gradient(#fff, #fff) padding-box,
    linear-gradient(135deg, #f3c969 0%, #5cc8ba 55%, #6aa9ff 100%) border-box !important;
  box-shadow: 0 18px 40px -28px rgba(11,79,143,0.25) !important;
  z-index: 2 !important;
  transform: translateY(-2px) !important;
  border-color: transparent !important;
  border-width: 1px !important;
  border-style: solid !important;
}


/* ═══════════════════════ IMAGE CARD BRIGHTNESS ═════════════════════════
   Reduces the black overlay on image cards to keep the top of the image bright
   ════════════════════════════════════════════════════════════════════════════ */
.solution-cards article::before,
.pr-card-overlay,
.oa-card-overlay,
.blog-card-overlay,
.ag-card-overlay,
#agent-team .ag-card-overlay {
  background: linear-gradient(180deg, transparent 0%, transparent 80%, rgba(6,10,20,0.98) 100%) !important;
}

/* "See the latest" blog cards often sit on light photos — darken their overlay site-wide
   so the white title/body stays readable (overrides the rule above for blog cards only) */
.blog-card-overlay {
  background: linear-gradient(180deg, rgba(9,12,24,0.50) 0%, rgba(9,12,24,0.72) 48%, rgba(9,12,24,0.96) 100%) !important;
}

.solution-cards img,
.pr-card-bg,
.oa-card-bg,
.blog-card-bg,
.ag-card-img,
#agent-team .ag-card-img {
  opacity: 1 !important;
  filter: none !important;
}
    `;
    document.head.appendChild(style);
  })();

  if (!shouldInjectNav && !shouldInjectFooter) {
    return;
  }

  /* ─── 1.  INJECT CSS ──────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
/* ═══════════════════════ SHARED TOKENS ════════════════════════════ */
:root {
  --white:#ffffff; --bg:#f5f6fa; --ink:#0d1127; --ink-mid:#3a4060;
  --muted:#7b82a0; --border:rgba(15,20,50,0.09); --border-md:rgba(15,20,50,0.15);
  --accent:#2254f4; --accent-lt:rgba(34,84,244,0.09); --nav-h:68px;
  --font-head:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  --font-body:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  --ease-expo:cubic-bezier(0.16,1,0.3,1); --btn-gradient:#11224F;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--white);color:var(--ink);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
body.menu-open{overflow:hidden;}
a{text-decoration:none;color:inherit;}ul{list-style:none;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#f0f0f5;}
::-webkit-scrollbar-thumb{background:var(--accent);border-radius:4px;}

/* ═══════════════════════ NAVBAR ════════════════════════════════════ */
#navbar{position:fixed;inset:0 0 auto 0;z-index:1000;height:var(--nav-h);display:flex;align-items:center;padding:0 52px;transition:background .45s ease,box-shadow .45s ease,border-color .45s ease;border-bottom:1px solid transparent;}
#navbar.scrolled{background:rgba(255,255,255,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 2px 28px rgba(15,20,80,.07);}
.nav-logo{display:flex;align-items:center;flex-shrink:0;margin-right:44px;}
.logo-img{height:28px;width:auto;display:block;filter:brightness(0) invert(1);transition:filter .4s ease;}
#navbar.scrolled .logo-img{filter:brightness(0);}
.nav-links{display:flex;align-items:center;gap:2px;flex:1;}
.nav-item{position:static;}
.nav-link{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;font-family:var(--font-body);font-size:.8rem;font-weight:600;letter-spacing:.01em;border-radius:6px;cursor:pointer;user-select:none;white-space:nowrap;color:rgba(255,255,255,.82);transition:color .2s,background .2s;}
.nav-link{cursor:pointer;}
.nav-link:hover{color:var(--white);background:rgba(255,255,255,.1);text-decoration:none;}
.nav-item.active>.nav-link{color:var(--white);background:rgba(255,255,255,.13);}
#navbar.scrolled .nav-link{color:var(--ink-mid);}
#navbar.scrolled .nav-link:hover{color:var(--accent);background:var(--accent-lt);}
#navbar.scrolled .nav-item.active>.nav-link{color:var(--accent);background:var(--accent-lt);}
.nav-item.nav-current>.nav-link{color:var(--white) !important;background:rgba(255,255,255,.15) !important;}
#navbar.scrolled .nav-item.nav-current>.nav-link{color:var(--accent) !important;background:var(--accent-lt) !important;}
/* Open mega-panel: give the (possibly transparent) navbar the light treatment so tab text stays visible on the near-white panel */
#navbar.menu-open{background:rgba(255,255,255,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 2px 28px rgba(15,20,80,.07);}
#navbar.menu-open .logo-img{filter:brightness(0);}
#navbar.menu-open .nav-link{color:var(--ink-mid);}
#navbar.menu-open .nav-link:hover{color:var(--accent);background:var(--accent-lt);}
#navbar.menu-open .nav-item.active>.nav-link{color:var(--accent);background:var(--accent-lt);}
#navbar.menu-open .nav-item.nav-current>.nav-link{color:var(--accent) !important;background:var(--accent-lt) !important;}
#navbar.menu-open .btn-nav-solid{background:var(--btn-gradient);color:var(--white);border-color:transparent;}
#navbar.menu-open .ham-line{background:var(--ink);}
a.nav-link{text-decoration:none;}
.chevron{width:11px;height:11px;opacity:.5;transition:transform .25s var(--ease-expo),opacity .2s;flex-shrink:0;}
.nav-item.active>.nav-link .chevron{transform:rotate(180deg);opacity:1;}
.nav-right{margin-left:auto;display:flex;align-items:center;gap:12px;flex-shrink:0;}
.btn-nav-solid{display:inline-flex;align-items:center;gap:8px;padding:9px 22px;font-family:var(--font-body);font-size:.8rem;font-weight:700;border-radius:6px;border:1.5px solid rgba(255,255,255,.5);cursor:pointer;background:transparent;color:var(--white);transition:background .2s,border-color .2s,color .2s,transform .22s var(--ease-expo),box-shadow .22s;}
.btn-nav-solid:hover{background:var(--white);color:var(--ink);border-color:var(--white);transform:translateY(-2px);}
#navbar.scrolled .btn-nav-solid{background:var(--btn-gradient);color:var(--white);border-color:transparent;}
#navbar.scrolled .btn-nav-solid:hover{background:#111;box-shadow:0 8px 28px rgba(0,0,0,.32);}
.nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;margin-left:auto;width:38px;height:38px;background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;transition:background .2s;}
.nav-hamburger:hover{background:rgba(255,255,255,.1);}
#navbar.scrolled .nav-hamburger:hover{background:var(--accent-lt);}
.ham-line{width:100%;height:2px;background:var(--white);border-radius:2px;transition:background .4s,transform .3s,opacity .3s;transform-origin:center;}
#navbar.scrolled .ham-line{background:var(--ink);}
.nav-hamburger.open .ham-line:nth-child(1){transform:translateY(7px) rotate(45deg);}
.nav-hamburger.open .ham-line:nth-child(2){opacity:0;transform:scaleX(0);}
.nav-hamburger.open .ham-line:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
@media(max-width:1280px){#navbar{padding:0 32px;}.nav-link{padding:7px 9px;font-size:.76rem;}.btn-nav-solid{padding:8px 16px;}.nav-logo{margin-right:28px;}}@media(max-width:1139px){.nav-links,.nav-right{display:none;}.nav-hamburger{display:flex;}#navbar{padding:0 24px;}}

/* ═══════════════════════ MOBILE DRAWER ════════════════════════════ */
.mobile-drawer{position:fixed;inset:0;z-index:999;display:flex;pointer-events:none;}
.drawer-backdrop{position:absolute;inset:0;background:rgba(7,9,20,.55);opacity:0;transition:opacity .35s ease;}
.drawer-panel{position:absolute;top:0;right:0;width:min(360px,88vw);height:100%;background:var(--white);box-shadow:-20px 0 60px rgba(15,20,80,.18);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .4s var(--ease-expo);overflow-y:auto;-webkit-overflow-scrolling:touch;}
.mobile-drawer.open{pointer-events:auto;z-index:1001;}
.mobile-drawer.open .drawer-backdrop{opacity:1;}
.mobile-drawer.open .drawer-panel{transform:translateX(0);}
.drawer-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border);flex-shrink:0;}
.drawer-logo{height:24px;width:auto;filter:brightness(0);}
.drawer-close{width:34px;height:34px;background:var(--bg);border:1px solid var(--border);border-radius:8px;display:grid;place-items:center;cursor:pointer;color:var(--ink-mid);transition:background .2s,color .2s;}
.drawer-close:hover{background:var(--accent-lt);color:var(--accent);}
.drawer-nav{flex:1;padding:12px 0;}
.drawer-item{border-bottom:1px solid var(--border);}
.drawer-link{display:flex;align-items:center;justify-content:space-between;padding:15px 24px;font-family:var(--font-body);font-size:.9rem;font-weight:600;color:var(--ink);cursor:pointer;transition:color .15s,background .15s;user-select:none;}
.drawer-link:hover{color:var(--accent);background:var(--accent-lt);}
.drawer-link.active{color:var(--accent);}
.drawer-chevron{width:16px;height:16px;color:var(--muted);transition:transform .25s var(--ease-expo),color .2s;flex-shrink:0;}
.drawer-link.active .drawer-chevron{transform:rotate(180deg);color:var(--accent);}
.drawer-sub{display:none;background:var(--bg);padding:8px 0;}
.drawer-sub.open{display:block;}
.drawer-sub-group{padding:10px 24px 4px;}
.drawer-sub-head{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;padding-left:10px;border-left:2px solid var(--accent);}
.drawer-sub a{display:block;padding:6px 24px 6px 34px;font-size:.8rem;font-weight:500;color:var(--ink-mid);transition:color .15s;}
.drawer-sub a:hover{color:var(--accent);}
.drawer-cta{padding:20px 24px;border-top:1px solid var(--border);flex-shrink:0;}
.drawer-cta-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:var(--btn-gradient);color:var(--white);font-family:var(--font-body);font-size:.875rem;font-weight:700;border-radius:8px;border:none;cursor:pointer;text-align:center;transition:opacity .2s,transform .2s;}
.drawer-cta-btn:hover{opacity:.88;transform:translateY(-1px);}

/* ═══════════════════════ MEGA BACKDROP + PANELS ════════════════════ */
#mega-backdrop{position:fixed;inset:0;z-index:800;background:transparent;pointer-events:none;transition:background .3s;}
#mega-backdrop.on{background:rgba(7,9,20,.45);pointer-events:auto;}
.mega-root{position:fixed;top:var(--nav-h);left:0;right:0;z-index:850;pointer-events:none;}
.mega-panel{position:absolute;inset:0 auto auto 0;width:100%;background:linear-gradient(118deg,#fbfcff 0%,#f3f8ff 46%,#e9f1ff 100%);border-bottom:1px solid rgba(34,84,244,.12);box-shadow:0 30px 80px rgba(15,20,80,.16);padding:46px 52px 50px;display:none;opacity:0;transform:translateY(-10px);pointer-events:none;overflow:hidden;}
.mega-panel.open{display:block;pointer-events:auto;}
.mega-inner{position:relative;z-index:2;max-width:1320px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1.16fr .92fr;gap:0;}
.mega-zone{padding:0 42px;border-right:1px solid var(--border);min-width:0;}
.mega-zone:first-child{padding-left:0;}
.mega-zone:last-child{padding-right:0;border-right:none;}

/* — left intro zone — */
.mz-label{font-family:var(--font-head);font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;display:flex;align-items:center;gap:12px;}
.mz-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border-md),transparent);}
.mz-title{font-family:var(--font-head);font-size:1.34rem;font-weight:700;line-height:1.18;color:var(--ink);margin-bottom:12px;letter-spacing:-.02em;}
.mz-desc{font-size:.82rem;line-height:1.6;color:var(--muted);margin-bottom:22px;max-width:300px;}
.mz-list{display:flex;flex-direction:column;gap:8px;}
.mz-group-title{font-size:.64rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:16px 0 8px;}
.mz-group-title:first-child{margin-top:0;}
.mz-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fff;border:1px solid var(--border);border-radius:10px;font-size:.84rem;font-weight:600;color:var(--ink);box-shadow:0 1px 2px rgba(15,20,80,.03);transition:border-color .3s var(--ease-expo),transform .3s var(--ease-expo),box-shadow .3s,color .2s;}
.mz-item:hover{border-color:var(--accent);color:var(--accent);transform:translateX(5px);box-shadow:0 10px 26px rgba(34,84,244,.13);}
.mz-item svg{width:14px;height:14px;color:var(--muted);transition:transform .3s var(--ease-expo),color .2s;flex-shrink:0;}
.mz-item:hover svg{color:var(--accent);transform:translateX(3px);}
.mz-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px;}
.partner-logo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;}
.partner-logo-grid .partner-logo-card:last-child:nth-child(odd){grid-column:1 / -1;}
.partner-logo-card{display:flex;align-items:center;justify-content:center;min-height:66px;padding:12px 16px;background:#fff;border:1px solid var(--border);border-radius:10px;text-decoration:none;transition:transform .18s,border-color .18s,box-shadow .18s;overflow:hidden;}
.partner-logo-card:hover{transform:translateY(-1px);border-color:rgba(32,86,255,.28);box-shadow:0 10px 24px rgba(20,30,70,.10);}
.partner-logo-img{max-width:100%;max-height:48px;width:auto;height:auto;object-fit:contain;display:block;}.partner-logo-img.mega-logo--gw-coe{max-width:150px;max-height:30px;width:auto;height:auto;object-fit:contain;margin:0 auto;}
.drawer-partner-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
.drawer-partner-card{display:flex;align-items:center;justify-content:center;min-height:58px;padding:11px 12px;background:#fff;border:1px solid var(--border);border-radius:9px;text-decoration:none;overflow:hidden;}
.drawer-partner-logo{max-width:100%;max-height:32px;width:auto;height:auto;object-fit:contain;display:block;}

.mz-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:8px;border:1px solid var(--border);font-size:.74rem;font-weight:600;color:var(--ink-mid);background:#fff;transition:border-color .2s,color .2s,transform .25s var(--ease-expo);}
.mz-pill:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px);}
.mz-pill .p-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}

/* — center feature zone — */
.mz-feature-card{display:block;border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:0 14px 38px rgba(15,20,80,.12);background:#0b1020;position:relative;aspect-ratio:16/8;}
.mz-feature-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);transition:transform .9s var(--ease-expo);}
.mz-feature-card:hover .mz-feature-img{transform:scale(1.12);}
.mz-feature-card::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(7,11,26,.82),rgba(7,11,26,.12) 62%,transparent);}
.mz-feature-cap{position:absolute;left:18px;right:18px;bottom:16px;z-index:2;color:#fff;font-family:var(--font-head);font-size:.94rem;font-weight:700;line-height:1.3;}
.mz-feature-cap em{color:#3ddc97;font-style:normal;}
.mz-feature-body{margin-top:18px;}
.mz-feat-pulse{animation:mzFeatPulse .32s ease;}
@keyframes mzFeatPulse{from{opacity:.25;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.mz-feature-title{font-family:var(--font-head);font-size:1.06rem;font-weight:700;color:var(--ink);margin-bottom:8px;}
.mz-feature-desc{font-size:.82rem;line-height:1.62;color:var(--muted);margin-bottom:18px;}
.mz-explore{display:inline-flex;align-items:center;gap:9px;padding:11px 22px;background:linear-gradient(120deg, #0A2540 0%, #1B6FB8 50%, #4A8FD4 100%);color:#fff;font-size:.8rem;font-weight:700;border-radius:8px;transition:transform .3s var(--ease-expo),box-shadow .3s,background .2s;}
.mz-explore svg{transition:transform .3s var(--ease-expo);}
.mz-explore:hover{background:linear-gradient(120deg, #07203a 0%, #14579a 50%, #3f7ec0 100%);transform:translateY(-2px);box-shadow:0 12px 28px rgba(27,111,184,.34);}
.mz-explore:hover svg{transform:translateX(4px);}

/* — right assessment zone — */
.mz-assess-label{font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;}
.mz-assess-cards{display:flex;flex-direction:column;gap:14px;}
.mz-assess-card{display:flex;gap:14px;padding:18px;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 2px rgba(15,20,80,.03);cursor:pointer;transition:border-color .3s var(--ease-expo),transform .3s var(--ease-expo),box-shadow .3s;}
.mz-assess-card:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 16px 36px rgba(34,84,244,.15);}
.mz-assess-icon{width:42px;height:42px;flex-shrink:0;border-radius:10px;background:var(--accent-lt);display:grid;place-items:center;color:var(--accent);transition:background .25s,color .25s;}
.mz-assess-card:hover .mz-assess-icon{background:var(--accent);color:#fff;}
.mz-assess-icon svg{width:20px;height:20px;}
.mz-assess-title{font-family:var(--font-head);font-size:.92rem;font-weight:700;color:var(--ink);margin-bottom:5px;line-height:1.25;}
.mz-assess-desc{font-size:.78rem;line-height:1.55;color:var(--muted);}

@media(max-width:1180px){.mega-inner{grid-template-columns:1fr 1fr;}.mega-zone{padding:0 30px;}.mega-zone:last-child{grid-column:1/-1;border-top:1px solid var(--border);border-right:none;margin-top:30px;padding:30px 0 0;}.mz-assess-cards{flex-direction:row;}.mz-assess-card{flex:1;}}
@media(max-width:1024px){.mega-panel{padding:32px;}}


/* ═══════════════════════ FOOTER ════════════════════════════════════ */
.site-footer-light{
  --cf-bg:#080b18;--cf-bg2:#0b0f20;--cf-ink:#e9edf6;--cf-mid:#aab3c9;
  --cf-soft:#828ca6;--cf-muted:#5c6580;--cf-border:rgba(255,255,255,0.08);
  --cf-border2:rgba(255,255,255,0.15);--cf-accent:#11224F;
  --cf-font:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  background:var(--cf-bg);color:var(--cf-ink);font-family:var(--cf-font);
  -webkit-font-smoothing:antialiased;position:relative;z-index:2;overflow:hidden;border-top:1px solid var(--cf-border);
}
.site-footer-light::before{content:'';position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:1100px;height:500px;background:radial-gradient(ellipse,rgba(59,111,255,.10) 0%,transparent 70%);pointer-events:none;z-index:0;}
.cf-wrap{position:relative;z-index:1;max-width:1340px;margin:0 auto;padding:0 56px;}
.cf-top{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:48px 28px;padding:66px 0 52px;}.cf-top .cf-brand{grid-row:1/3;}.cf-top .cf-col{border-left:1px solid var(--cf-border);padding-left:28px;}
.cf-brand{display:flex;flex-direction:column;}
.cf-logo{height:26px;width:auto;filter:brightness(0) invert(1);display:block;transition:opacity .25s;}
.cf-logo:hover{opacity:.7;}
.cf-tagline{font-size:.85rem;line-height:1.72;color:var(--cf-mid);margin-top:22px;max-width:300px;}
.cf-sub-head{font-size:.98rem;font-weight:700;color:var(--cf-ink);margin-top:30px;}
.cf-sub-desc{font-size:.78rem;line-height:1.6;color:var(--cf-soft);margin-top:9px;max-width:280px;}
.cf-subscribe{display:flex;margin-top:15px;max-width:300px;}
.cf-subscribe input{flex:1;min-width:0;background:rgba(255,255,255,.04);border:1px solid var(--cf-border2);border-right:none;border-radius:8px 0 0 8px;padding:11px 14px;font-family:inherit;font-size:.8rem;color:var(--cf-ink);outline:none;transition:border-color .2s,background .2s;}
.cf-subscribe input::placeholder{color:var(--cf-muted);}
.cf-subscribe input:focus{border-color:var(--cf-accent);background:rgba(255,255,255,.07);}
.cf-subscribe button{padding:0 20px;background:var(--cf-accent);border:none;border-radius:0 8px 8px 0;font-family:inherit;font-size:.8rem;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;transition:background .2s;}
.cf-subscribe button:hover{background:#1d3372;}
.cf-newsletter-hubspot-hidden{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;opacity:0!important;pointer-events:none!important;}
.cf-newsletter-status{margin:8px 0 0 0;font-size:.78rem;line-height:1.4;color:var(--cf-mid);min-height:1em;}

.cf-connect{font-size:.98rem;font-weight:700;color:var(--cf-ink);margin-top:32px;}
.cf-social{display:flex;gap:10px;margin-top:15px;}
.cf-social a{width:38px;height:38px;border-radius:9px;border:1px solid var(--cf-border2);background:rgba(255,255,255,.03);display:grid;place-items:center;color:var(--cf-mid);transition:background .22s,color .22s,transform .22s cubic-bezier(.16,1,.3,1),border-color .22s;}
.cf-social a:hover{background:var(--cf-accent);border-color:transparent;color:#fff;transform:translateY(-3px);}
.cf-social svg{width:16px;height:16px;}
.cf-col-head{font-size:.92rem;font-weight:700;color:var(--cf-ink);margin-bottom:18px;}
.cf-col-links{display:flex;flex-direction:column;gap:1px;}
.cf-col-link{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;font-size:.8rem;color:var(--cf-soft);transition:color .18s,padding-left .24s cubic-bezier(.16,1,.3,1);}
.cf-col-link span{flex:1;}
.cf-col-link svg{width:11px;height:11px;opacity:.35;transform:translateX(0);transition:opacity .2s,transform .24s cubic-bezier(.16,1,.3,1),color .2s;flex-shrink:0;color:var(--cf-soft);}
.cf-col-link:hover{color:var(--cf-ink);padding-left:6px;}
.cf-col-link:hover svg{opacity:1;transform:translateX(3px);color:var(--cf-accent);}
.cf-divider{position:relative;z-index:1;height:1px;background:var(--cf-border);max-width:1340px;margin:0 auto;}
.cf-mid{display:grid;grid-template-columns:repeat(4,1fr) 1.6fr;gap:36px 28px;padding:50px 0;align-items:start;}
.cf-contact-line{display:flex;gap:9px;font-size:.8rem;line-height:1.55;color:var(--cf-soft);margin-bottom:15px;align-items:flex-start;}
.cf-contact-line svg{width:14px;height:14px;flex-shrink:0;margin-top:2px;color:var(--cf-accent);}
.cf-contact-line a:hover{color:var(--cf-ink);}
.cf-cta{background:linear-gradient(135deg,rgba(59,111,255,.14),rgba(59,111,255,.02));border:1px solid var(--cf-border2);border-radius:16px;padding:30px;display:flex;align-items:center;gap:24px;}
.cf-cta-circle{width:64px;height:64px;flex-shrink:0;border-radius:50%;border:1px solid var(--cf-accent);display:grid;place-items:center;color:var(--cf-accent);transition:background .3s,color .3s,transform .35s cubic-bezier(.16,1,.3,1);}
.cf-cta:hover .cf-cta-circle{background:var(--cf-accent);color:#fff;transform:rotate(-12deg) scale(1.05);}
.cf-cta-circle svg{width:24px;height:24px;}
.cf-cta-title{font-size:1.14rem;font-weight:700;color:var(--cf-ink);line-height:1.25;}
.cf-cta-desc{font-size:.8rem;color:var(--cf-soft);margin:9px 0 13px;}
.cf-cta-link{display:inline-flex;align-items:center;gap:7px;font-size:.85rem;font-weight:700;color:var(--cf-accent);}
.cf-cta-link svg{width:14px;height:14px;transition:transform .24s cubic-bezier(.16,1,.3,1);}
.cf-cta-link:hover svg{transform:translateX(4px);}
.cf-bottom{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;max-width:1340px;margin:0 auto;padding:24px 56px 36px;border-top:1px solid var(--cf-border);}
.cf-copyright{font-size:.74rem;color:var(--cf-muted);line-height:1.5;}
.cf-legal{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;flex:1;justify-content:center;}
.cf-legal a{font-size:.74rem;color:var(--cf-soft);transition:color .15s;}
.cf-legal a:hover{color:var(--cf-ink);}
.cf-lang{display:flex;align-items:center;gap:8px;padding:9px 14px;border:1px solid var(--cf-border2);border-radius:8px;font-size:.78rem;color:var(--cf-mid);cursor:pointer;transition:border-color .2s,background .2s;}
.cf-lang:hover{border-color:var(--cf-accent);background:rgba(255,255,255,.03);}
.cf-lang svg{width:13px;height:13px;}
.cf-lang .cf-globe{color:var(--cf-accent);}
@media(max-width:1100px){.cf-top{grid-template-columns:repeat(3,1fr);}.cf-brand{grid-column:1/-1;grid-row:auto;}}
@media(max-width:680px){.cf-wrap{padding:0 24px;}.cf-top{grid-template-columns:1fr 1fr;padding:48px 0 40px;}.cf-top .cf-col{border-left:none;padding-left:0;}.cf-bottom{flex-direction:column;align-items:flex-start;padding:22px 24px 32px;}.cf-legal{justify-content:flex-start;}}

/* ═══════════════════════ MOBILE DRAWER — MEGA CARDS ════════════════
   Rich content (feature card + assessment cards) injected into each
   drawer-sub from MEGA_DATA so mobile users see the same depth as the
   desktop mega menu. Fully responsive across phones and tablets.
─────────────────────────────────────────────────────────────────── */
.drawer-mega{padding:14px 20px 18px;display:flex;flex-direction:column;gap:14px;}
.drawer-mega-feature{position:relative;display:block;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:#0b1020;aspect-ratio:16/9;box-shadow:0 10px 28px rgba(15,20,80,.14);}
.drawer-mega-feature img,.drawer-mega-feature video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.drawer-mega-feature::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(7,11,26,.85),rgba(7,11,26,.15) 60%,transparent);}
.drawer-mega-cap{position:absolute;left:14px;right:14px;bottom:12px;z-index:2;color:#fff;font-family:var(--font-head);font-size:.82rem;font-weight:700;line-height:1.3;}
.drawer-mega-cap em{color:#3ddc97;font-style:normal;}
.drawer-mega-explore{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;background:var(--accent);color:#fff;font-size:.78rem;font-weight:700;border-radius:8px;transition:background .2s,transform .2s;}
.drawer-mega-explore:hover{background:#1b46d8;transform:translateY(-1px);}
.drawer-mega-explore svg{width:12px;height:12px;}
.drawer-mega-assess-label{font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-top:4px;}
.drawer-mega-assess{display:flex;flex-direction:column;gap:10px;}
.drawer-mega-card{display:flex;gap:12px;padding:12px 14px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 1px 2px rgba(15,20,80,.04);transition:border-color .2s,transform .2s,box-shadow .2s;}
.drawer-mega-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 10px 22px rgba(34,84,244,.14);}
.drawer-mega-card .ic{width:34px;height:34px;flex-shrink:0;border-radius:8px;background:var(--accent-lt);display:grid;place-items:center;color:var(--accent);}
.drawer-mega-card .ic svg{width:16px;height:16px;}
.drawer-mega-card .bd{min-width:0;}
.drawer-mega-card .t{font-family:var(--font-head);font-size:.82rem;font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:3px;}
.drawer-mega-card .d{font-size:.72rem;line-height:1.5;color:var(--muted);}
.drawer-mega-pills{display:flex;flex-wrap:wrap;gap:6px;}
.drawer-mega-pills a{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:.7rem;font-weight:600;color:var(--ink-mid);background:#fff;}
.drawer-mega-pills a .p-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);}

/* Drawer link list tightening on narrow screens */
@media(max-width:480px){
  .drawer-panel{width:min(420px,100vw);}
  .drawer-header{padding:16px 18px;}
  .drawer-link{padding:14px 18px;font-size:.88rem;}
  .drawer-sub-group{padding:10px 18px 4px;}
  .drawer-sub a{padding:6px 18px 6px 30px;font-size:.78rem;}
  .drawer-cta{padding:16px 18px;}
  .drawer-mega{padding:12px 16px 16px;}
}
@media(max-width:360px){
  .drawer-panel{width:100vw;}
  .drawer-mega-feature{aspect-ratio:16/10;}
}

/* Make the rest of the page more bulletproof on small screens */
@media(max-width:1139px){
  body.menu-open{position:fixed;width:100%;}
}

/* Global button override to match brand color #11224F */
.cta-btn:not(.cta-band-btn-white), .cta-band-btn:not(.cta-band-btn-white) {
  background: #11224F !important;
}

/* ═══════════════════════ GLOBAL STATS STRIP HOVER ═════════════════
   Adds interactive pastel hover to every .stats-grid .stat-col
   across all pages. 5 colours cycle via nth-child.
   ═══════════════════════════════════════════════════════════════════ */
.stats-grid .stat-col {
  border-radius: 12px;
  transition: background .35s ease, transform .35s ease, box-shadow .35s ease;
}
.stats-grid .stat-col:hover { transform: translateY(-3px); }
.stats-grid .stat-col:nth-child(5n+1):hover {
  background: rgba(18, 186, 160, .12);
  box-shadow: 0 14px 30px -20px rgba(18, 186, 160, .4);
}
.stats-grid .stat-col:nth-child(5n+2):hover {
  background: rgba(34, 84, 244, .10);
  box-shadow: 0 14px 30px -20px rgba(34, 84, 244, .4);
}
.stats-grid .stat-col:nth-child(5n+3):hover {
  background: rgba(212, 160, 23, .14);
  box-shadow: 0 14px 30px -20px rgba(212, 160, 23, .4);
}
.stats-grid .stat-col:nth-child(5n+4):hover {
  background: rgba(124, 58, 237, .11);
  box-shadow: 0 14px 30px -20px rgba(124, 58, 237, .4);
}
.stats-grid .stat-col:nth-child(5n+5):hover {
  background: rgba(232, 131, 74, .13);
  box-shadow: 0 14px 30px -20px rgba(232, 131, 74, .4);
}

@media (max-width: 1139px) {
  .stats-grid .stat-col {
    align-items: center !important;
    text-align: center !important;
  }
}

}
`;
  document.head.appendChild(style);

  /* ─── 2.  DETERMINE ACTIVE PAGE ───────────────────────────────────── */
  // Priority: explicit body[data-page] override → auto-detect from URL filename.
  const PAGE_MAP = {
    'index.html': 'home',
    '': 'home',
    'our_focus.html': 'solve',
    'what-we-solve.html': 'solve',
    'capabilities.html': 'how',
    'how-we-do-it.html': 'how',
    'solutions.html': 'deliver',
    'how-we-deliver.html': 'deliver',
    'ai-innovation.html': 'ai',
    'industries.html': 'industries',
    'partner-ecosystem.html': 'partners',
    'about.html': 'about',
    'blogs.html': 'blog',
    'blog.html': 'blog',
  };
  let activePage = (document.body.dataset.page || '').toLowerCase();
  if (!activePage) {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    activePage = PAGE_MAP[file] || '';
  }

  /* ─── 3.  NAV HTML ───────────────────────────────────────────────── */
  const LOGO = '/assets/brand/PyramidTalent.svg';
  const CHEVRON_SVG = `<svg class="chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ARROW_SVG = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const navItems = [
    { type: 'mega', label: 'Talent Services', id: 'talent' },
    { type: 'mega', label: 'Workforce Solutions', id: 'workforce' },
    { type: 'mega', label: 'AI in HR', id: 'ai-hr' },
    { type: 'link', label: 'Talent Pool', href: 'https://aibuilders.hoonr.ai/', external: true },
    { type: 'mega', label: 'About', id: 'about' },
  ];

  const navLinksHTML = navItems.map(it => {
    if (it.type === 'link') {
      const ext = it.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<li class="nav-item"><a class="nav-link" href="${it.href}"${ext}>${it.label}</a></li>`;
    }
    return `
    <li class="nav-item" data-menu="${it.id}">
      <button class="nav-link" type="button" data-mega="${it.id}">
        ${it.label}
        <svg class="chevron" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </button>
    </li>
  `;
  }).join('');

  const drawerDivHTML = `
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-talent">
        Talent Services
        <svg class="drawer-chevron" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="drawer-sub" id="d-talent">
        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Staffing by Domain</div>
          <a href="/talent/services/it-staffing/">IT</a>
          <a href="/talent/services/non-it-staffing/">Non-IT</a>
          <a href="/talent/services/federal-staffing/">Federal</a>
          <a href="https://pyramidci.com/healthcare/" target="_blank" rel="noopener noreferrer">Healthcare</a>
        </div>
        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Engagement Models</div>
          <a href="/talent/services/staff-augmentation/">Staff Augmentation</a>
          <a href="/talent/services/contract-to-hire/">Contract-to-Hire</a>
          <a href="/talent/services/direct-hire/">Direct Hire</a>
          <a href="/talent/services/payrolling-eor/">Payrolling (EOR)</a>
          <a href="/talent/services/teams-as-a-service/">Teams as a Service (TaaS)</a>
        </div>
      </div>
    </div>

    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-workforce">
        Workforce Solutions
        <svg class="drawer-chevron" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="drawer-sub" id="d-workforce">
        <div class="drawer-sub-group">
          <a href="/talent/global-workforce/global-capability-centers/">Global Capability Centers (GCC)</a>
          <a href="/talent/global-workforce/build-operate-transfer/">Build-Operate-Transfer (BOT)</a>
          <a href="/talent/global-workforce/bestshoring/">Bestshoring &amp; Delivery Model</a>
        </div>
      </div>
    </div>

    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-ai-hr">
        AI in HR
        <svg class="drawer-chevron" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="drawer-sub" id="d-ai-hr">
        <div class="drawer-sub-group">
          <a href="https://hoonr.ai/" target="_blank" rel="noopener noreferrer">Hoonr&trade; Workforce Orchestration</a>
        </div>
      </div>
    </div>

    <div class="drawer-item">
      <a class="drawer-link" href="https://aibuilders.hoonr.ai/" target="_blank" rel="noopener noreferrer">Talent Pool</a>
    </div>

    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-about">
        About
        <svg class="drawer-chevron" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="drawer-sub" id="d-about">
        <div class="drawer-sub-group">
          <a href="/about/our-story/">Our Story</a>
          <a href="/about/our-story/our-philosophy/">HumanEx Philosophy</a>
          <a href="/about/our-story/diversity/">Diversity &amp; Certifications</a>
          <a href="/about/our-story/newsroom/">Newsroom</a>
          <a href="/about/our-story/resources/">Resources</a>
        </div>
      </div>
    </div>
  `;

  const FEATURE_IMG = 'https://res.cloudinary.com/dyhze7fmf/image/upload/f_auto,q_auto:good,w_1600/celsior-new-website/fd85d9f6b205b835d020b87cf50dfc5490c63510_ntepey.png';
  const ITEM_CHEV = `<svg viewBox="0 0 12 12" fill="none"><path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const IC_DOC = `<svg viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 16.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const IC_CHART = `<svg viewBox="0 0 24 24" fill="none"><path d="M5 4v15a1 1 0 0 0 1 1h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9 14l3-3 2.5 2.5L19 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ASSESS_ICONS = [IC_DOC, IC_CHART];
  /* Optional per-item overrides for the hover-preview feature card; unset items
     fall back to the panel's default d.feature.desc / d.feature.cap. */
  const FEATURE_DESCS = {};
  const FEATURE_CAPS = {};

  /* Data-driven mega panels. */
  const MEGA_DATA = [
    {
      id: 'talent',
      label: 'Talent Services',
      title: 'Talent Services',
      desc: 'Flexible talent solutions designed around business priorities, capability needs, and workforce outcomes.',
      explore: { label: 'Explore Talent Services', href: '/talent/services/' },
      groups: [
        {
          title: 'Staffing by Domain',
          items: [
            { label: 'IT', href: '/talent/services/it-staffing/' },
            { label: 'Non-IT', href: '/talent/services/non-it-staffing/' },
            { label: 'Federal', href: '/talent/services/federal-staffing/' },
            { label: 'Healthcare', href: 'https://pyramidci.com/healthcare/', external: true },
          ]
        },
        {
          title: 'Engagement Models',
          items: [
            { label: 'Staff Augmentation', href: '/talent/services/staff-augmentation/' },
            { label: 'Contract-to-Hire', href: '/talent/services/contract-to-hire/' },
            { label: 'Direct Hire', href: '/talent/services/direct-hire/' },
            { label: 'Payrolling (EOR)', href: '/talent/services/payrolling-eor/' },
            { label: 'Teams as a Service (TaaS)', href: '/talent/services/teams-as-a-service/' },
          ]
        },
      ],
      feature: {
        cap: 'Talent Services',
        title: 'Flexible talent, matched to how you hire',
        desc: 'From individual specialists to full engagement models — staffing built around the way your business actually works.'
      },
      assessTag: 'Explore',
      assess: [
        { title: 'Staffing by Domain', desc: 'IT, Non-IT, Federal, and Healthcare staffing built around your talent needs.', href: '/talent/services/' },
        { title: 'Engagement Models', desc: 'Staff augmentation, contract-to-hire, direct hire, payrolling, and TaaS.', href: '/talent/services/' },
      ]
    },
    {
      id: 'workforce',
      label: 'Workforce Solutions',
      title: 'Workforce Solutions',
      desc: 'Global delivery models that build a workforce capability your organization owns.',
      explore: { label: 'Explore Workforce Solutions', href: '/talent/global-workforce/' },
      items: [
        { label: 'Global Capability Centers (GCC)', href: '/talent/global-workforce/global-capability-centers/' },
        { label: 'Build-Operate-Transfer (BOT)', href: '/talent/global-workforce/build-operate-transfer/' },
        { label: 'Bestshoring &amp; Delivery Model', href: '/talent/global-workforce/bestshoring/' },
      ],
      feature: {
        cap: 'Workforce Solutions',
        title: 'Build a workforce capability you own',
        desc: 'Global Capability Centers and Build-Operate-Transfer models that convert a delivery engagement into a capability your organization controls.'
      },
      assessTag: 'Explore',
      assess: [
        { title: 'Global Capability Centers', desc: 'Stand up a dedicated, owned delivery center abroad.', href: '/talent/global-workforce/global-capability-centers/' },
        { title: 'Build-Operate-Transfer', desc: 'A managed engagement that transitions to a client-owned team.', href: '/talent/global-workforce/build-operate-transfer/' },
      ]
    },
    {
      id: 'ai-hr',
      label: 'AI in HR',
      title: 'AI in HR',
      desc: 'AI-powered workforce orchestration that moves talent decisions at the speed of the business.',
      explore: { label: 'Explore AI in HR', href: '/talent/ai-in-hr/' },
      items: [
        { label: 'Hoonr&trade; Workforce Orchestration', href: 'https://hoonr.ai/', external: true },
      ],
      feature: {
        cap: 'AI in HR',
        title: 'Hoonr&trade; — Workforce Orchestration',
        desc: 'AI-powered matching and workforce orchestration built to move talent decisions at the speed of the business.'
      },
      assessTag: 'Explore',
      assess: [
        { title: 'Hoonr&trade;', desc: 'See how AI-driven orchestration matches talent to need.', href: 'https://hoonr.ai/' },
        { title: 'Join AI Builders', desc: 'Join the community building the future of AI-enabled work.', href: 'https://aibuilders.hoonr.ai/' },
      ]
    },
    {
      id: 'about',
      label: 'About',
      title: 'About Pyramid Talent',
      desc: 'Learn more about our organisation, leadership, experience, and workforce perspective.',
      explore: { label: 'Our Story', href: '/about/our-story/' },
      items: [
        { label: 'Our Story', href: '/about/our-story/' },
        { label: 'HumanEx Philosophy', href: '/about/our-story/our-philosophy/' },
        { label: 'Diversity &amp; Certifications', href: '/about/our-story/diversity/' },
        { label: 'Newsroom', href: '/about/our-story/newsroom/' },
        { label: 'Resources', href: '/about/our-story/resources/' },
      ],
      feature: {
        cap: 'About',
        title: 'People-first, technology-enabled',
        desc: 'Discover the philosophy, leadership, and track record behind Pyramid Talent.'
      },
      assessTag: 'Learn More',
      assess: [
        { title: 'HumanEx Philosophy', desc: 'The people-first philosophy behind how we deliver.', href: '/about/our-story/our-philosophy/' },
        { title: 'Diversity &amp; Certifications', desc: 'Our certifications and commitment to supplier diversity.', href: '/about/our-story/diversity/' },
      ]
    }
  ];

  function buildMegaPanel(d) {
    const renderItem = it => {
      const fdesc = (FEATURE_DESCS[it.label] || d.feature.desc).replace(/"/g, '&quot;');
      const fcap = (FEATURE_CAPS[it.label] || d.feature.cap).replace(/"/g, '&quot;');
      const ext = it.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="mz-item" href="${it.href}"${ext} data-ftitle="${it.label}" data-fdesc="${fdesc}" data-fcap="${fcap}">${it.label} ${ITEM_CHEV}</a>`;
    };
    const itemsHTML = d.groups
      ? d.groups.map(g => `<div class="mz-group-title">${g.title}</div><div class="mz-list">${g.items.map(renderItem).join('')}</div>`).join('')
      : `<div class="mz-list">${d.items.map(renderItem).join('')}</div>`;
    const assess = d.assess.map((a, i) => `
        <a class="mz-assess-card" href="${a.href || d.explore.href}">
          <div class="mz-assess-icon">${ASSESS_ICONS[i % ASSESS_ICONS.length]}</div>
          <div><div class="mz-assess-title">${a.title}</div><div class="mz-assess-desc">${a.desc}</div></div>
        </a>`).join('');
    return `
  <div class="mega-panel" id="menu-${d.id}">
    <div class="mega-inner">
      <div class="mega-zone">
        <div class="mz-label">${d.label}</div>
        <h3 class="mz-title">${d.title}</h3>
        <p class="mz-desc">${d.desc}</p>
        ${itemsHTML}
      </div>
      <div class="mega-zone">
        <a class="mz-feature-card" href="${d.explore.href}">
          ${d.feature.video
        ? `<video class="mz-feature-img" autoplay muted loop playsinline preload="auto" poster="${FEATURE_IMG}"><source src="${d.feature.video}" type="video/mp4"></video>`
        : `<img class="mz-feature-img" src="${FEATURE_IMG}" alt="${d.feature.title}" loading="lazy"/>`}
          <div class="mz-feature-cap">${d.feature.cap}</div>
        </a>
        <div class="mz-feature-body">
          <div class="mz-feature-title">${d.feature.title}</div>
          <p class="mz-feature-desc">${d.feature.desc}</p>
          <a class="mz-explore" href="${d.explore.href}">${d.explore.label} ${ARROW_SVG}</a>
        </div>
      </div>
      <div class="mega-zone">
        <div class="mz-assess-label">${d.assessTag}</div>
        <div class="mz-assess-cards">${assess}</div>
      </div>
    </div>
  </div>`;
  }

  const megaPanelsHTML = MEGA_DATA.map(buildMegaPanel).join('\n');


  let backdropEl = document.getElementById('mega-backdrop');
  let navEl = document.getElementById('navbar');
  let drawerEl = document.getElementById('mobileDrawer');
  let megaRoot = document.getElementById('megaRoot');

  if (shouldInjectNav) {
    const oldNav = document.getElementById('navbar');
    if (oldNav) oldNav.remove();
    const oldBackdrop = document.getElementById('mega-backdrop');
    if (oldBackdrop) oldBackdrop.remove();
    const oldDrawer = document.getElementById('mobileDrawer');
    if (oldDrawer) oldDrawer.remove();
    const oldMegaRoot = document.getElementById('megaRoot');
    if (oldMegaRoot) oldMegaRoot.remove();

    // Inject backdrop + nav root
    backdropEl = document.createElement('div');
    backdropEl.id = 'mega-backdrop';
    document.body.insertBefore(backdropEl, document.body.firstChild);

    navEl = document.createElement('nav');
    navEl.id = 'navbar';
    navEl.innerHTML = `
      <a href="/" class="nav-logo">
        <img src="${LOGO}" alt="Pyramid Talent" class="logo-img"/>
      </a>
      <ul class="nav-links" id="navLinks">${navLinksHTML}</ul>
      <div class="nav-right">
        <a href="/talent/contact-us/" class="btn-nav-solid">Contact us ${ARROW_SVG}</a>
      </div>
      <button class="nav-hamburger" id="hamburger" aria-label="Open menu">
        <span class="ham-line"></span><span class="ham-line"></span><span class="ham-line"></span>
      </button>`;
    document.body.insertBefore(navEl, document.body.firstChild);

    /* Feature video fallback — if the video fails to load, show the image instead */
    navEl.querySelectorAll('video.mz-feature-img').forEach(v => {
      const toImage = () => {
        if (v.dataset.fbDone) return;
        v.dataset.fbDone = '1';
        const img = document.createElement('img');
        img.className = 'mz-feature-img';
        img.src = v.getAttribute('poster');
        img.alt = '';
        v.replaceWith(img);
      };
      v.addEventListener('error', toImage);
      const src = v.querySelector('source');
      if (src) src.addEventListener('error', toImage);
      /* also fall back only if literally nothing has loaded (quota/interstitial cases) */
      setTimeout(() => { if (v.readyState === 0 && v.networkState !== 2) toImage(); }, 15000);
      /* nudge playback when the menu opens (some browsers defer hidden-video autoplay) */
      const nudge = () => { if (v.paused && !v.dataset.fbDone) v.play().catch(() => { }); };
      const host = v.closest('.mega') || v.closest('[class*="mega"]') || navEl;
      host.addEventListener('mouseenter', nudge);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) nudge(); });
    });

    // Drawer
    drawerEl = document.createElement('div');
    drawerEl.className = 'mobile-drawer';
    drawerEl.id = 'mobileDrawer';
    drawerEl.innerHTML = `
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <div class="drawer-panel">
        <div class="drawer-header">
          <img src="${LOGO}" alt="Pyramid Talent" class="drawer-logo"/>
          <button class="drawer-close" id="drawerClose" aria-label="Close menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <nav class="drawer-nav">${drawerDivHTML}</nav>
        <div class="drawer-cta">
          <a href="/talent/contact-us/" class="drawer-cta-btn">Contact us ${ARROW_SVG}</a>
        </div>
      </div>`;
    document.body.insertBefore(drawerEl, navEl.nextSibling);

    // Mega root
    megaRoot = document.createElement('div');
    megaRoot.className = 'mega-root';
    megaRoot.id = 'megaRoot';
    megaRoot.innerHTML = megaPanelsHTML;
    document.body.insertBefore(megaRoot, drawerEl.nextSibling);

    /* ─── 3b.  AUGMENT MOBILE DRAWER WITH MEGA CARDS ────────────────
       Inject the rich content (feature card + assessment cards + pills)
       from MEGA_DATA into each .drawer-sub so the mobile experience
       mirrors the desktop mega menu. Original drawer link groups are
       preserved untouched. */
    const DRAWER_MEGA_MAP = {
      'd-talent': 'talent', 'd-workforce': 'workforce', 'd-ai-hr': 'ai-hr', 'd-about': 'about'
    };
    Object.keys(DRAWER_MEGA_MAP).forEach(function (subId) {
      const sub = drawerEl.querySelector('#' + subId);
      if (!sub) return;
      const data = MEGA_DATA.find(function (m) { return m.id === DRAWER_MEGA_MAP[subId]; });
      if (!data) return;
      const pillsHTML = data.partnerLogos
        ? `<div class="drawer-partner-grid">${data.partnerLogos.map(function (p) { return `<a class="drawer-partner-card" href="${p.href}" title="${p.label}"><img class="drawer-partner-logo" src="${p.src}" alt="${p.label}" loading="lazy"/></a>`; }).join('')}</div>`
        : (data.pills ? `<div class="drawer-mega-pills">${data.pills.map(function (p) { return `<a href="${data.items[0].href}"><span class="p-dot"></span>${p}</a>`; }).join('')}</div>` : '');
      const assessHTML = (data.assess || []).map(function (a, i) {
        return `<a class="drawer-mega-card" href="${data.explore.href}">
          <div class="ic">${ASSESS_ICONS[i % ASSESS_ICONS.length]}</div>
          <div class="bd"><div class="t">${a.title}</div><div class="d">${a.desc}</div></div>
        </a>`;
      }).join('');
      const mega = document.createElement('div');
      mega.className = 'drawer-mega';
      mega.innerHTML = `
        <a class="drawer-mega-feature" href="${data.explore.href}" aria-label="${data.feature.title}">
          ${data.feature.video
            ? `<video class="drawer-mega-feature-video" autoplay muted loop playsinline preload="auto" poster="${FEATURE_IMG}"><source src="${data.feature.video}" type="video/mp4"></video>`
            : `<img src="${FEATURE_IMG}" alt="${data.feature.title}" loading="lazy"/>`}
          <div class="drawer-mega-cap">${data.feature.cap}</div>
        </a>
        <a class="drawer-mega-explore" href="${data.explore.href}">${data.explore.label} ${ARROW_SVG}</a>
        ${pillsHTML}
        ${data.assessTag ? `<div class="drawer-mega-assess-label">${data.assessTag}</div>` : ''}
        <div class="drawer-mega-assess">${assessHTML}</div>
      `;
      sub.appendChild(mega);
    });

    /* Video fallback + nudge for mobile drawer videos */
    drawerEl.querySelectorAll('video.drawer-mega-feature-video').forEach(function (v) {
      var toImage = function () {
        if (v.dataset.fbDone) return;
        v.dataset.fbDone = '1';
        var img = document.createElement('img');
        img.src = v.getAttribute('poster');
        img.alt = '';
        v.replaceWith(img);
      };
      v.addEventListener('error', toImage);
      var src = v.querySelector('source');
      if (src) src.addEventListener('error', toImage);
      setTimeout(function () { if (v.readyState === 0 && v.networkState !== 2) toImage(); }, 15000);
    });

    /* Nudge drawer videos to play when their section expands */
    drawerEl.querySelectorAll('[data-drawer-toggle]').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var subId = toggle.getAttribute('data-drawer-toggle');
        var sub = drawerEl.querySelector('#' + subId);
        if (!sub) return;
        setTimeout(function () {
          sub.querySelectorAll('video.drawer-mega-feature-video').forEach(function (v) {
            if (v.paused && !v.dataset.fbDone) v.play().catch(function () {});
          });
        }, 100);
      });
    });
  }


  /* ─── 4.  FOOTER HTML ─────────────────────────────────────────────── */
  const footerEl = document.createElement('footer');
  footerEl.className = 'site-footer-light';
  footerEl.id = 'siteFooterLight';
  const CF_CHEV = `<svg viewBox="0 0 12 12" fill="none"><path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function cfCol(head, links) {
    return `<div class="cf-col"><p class="cf-col-head">${head}</p><nav class="cf-col-links">${links.map(l => `<a href="${l.href}" class="cf-col-link"><span>${l.label}</span>${CF_CHEV}</a>`).join('')
      }</nav></div>`;
  }

  footerEl.innerHTML = `
  <div class="cf-wrap">
    <div class="cf-top">
      <div class="cf-brand">
        <a href="/">
          <img src="${LOGO}" alt="Pyramid Talent" class="cf-logo"/>
        </a>

        <p class="cf-tagline">
          End-to-end workforce solutions connecting talent, technology,
          and business outcomes.
        </p>

        <p class="cf-sub-head">Pyramid Talent Website Preview</p>
        <p class="cf-sub-desc">
          This is a staging website currently under development.
        </p>

        <a class="cf-col-link" href="/contact-us/">
          <span>Contact Us</span>${CF_CHEV}
        </a>
      </div>

      ${cfCol('About', [
        { label: 'Who We Are', href: '/about/who-we-are/' },
        { label: 'Our Leadership', href: '/about-leadership/' },
        { label: 'Success Stories', href: '/success-stories/' },
        { label: 'Workforce Insights', href: '/blogs/' },
      ])}

      ${cfCol('Industries', [
        { label: 'Banking &amp; Financial Services', href: '/industries/banking-financial-services/' },
        { label: 'Insurance', href: '/industries/insurance/' },
        { label: 'Healthcare &amp; Life Sciences', href: '/industries/healthcare/' },
      ])}

      ${cfCol('Technology', [
        { label: 'AI &amp; Data', href: '/capabilities/ai-and-data/' },
        { label: 'Cloud Engineering', href: '/capabilities/cloud-and-infrastructure-engineering/' },
        { label: 'Security &amp; Governance', href: '/capabilities/security-and-governance/' },
        { label: 'ServiceNow', href: '/partners/servicenow/' },
      ])}
    </div>
  </div>

  <div class="cf-bottom">
    <p class="cf-copyright">
      &copy; 2026 Pyramid Consulting, Inc. All rights reserved.
    </p>

    <nav class="cf-legal" aria-label="Legal">
      <a href="/assets/legal/gdpr-v1-6-072024.pdf"
         target="_blank" rel="noopener">GDPR</a>
      <a href="/assets/legal/ccpa-cra-v1-3-072024.pdf"
         target="_blank" rel="noopener">CCPA/CPRA</a>
      <a href="/assets/legal/web-privacy-policy.pdf"
         target="_blank" rel="noopener">Privacy</a>
      <a href="/assets/legal/pci-072025-reasonable-accomodation-policy.pdf"
         target="_blank" rel="noopener">
         Reasonable Accommodation Policy
      </a>
    </nav>
  </div>`;


  if (shouldInjectFooter) {
    const oldFooter = document.getElementById('siteFooterLight');
    if (oldFooter) oldFooter.remove();
    document.body.appendChild(footerEl);
    // Footer entrance micro-interactions (GSAP if present, IntersectionObserver-triggered)
    (function animateFooter() {
      if (typeof IntersectionObserver === 'undefined') return;
      const targets = footerEl.querySelectorAll('.cf-brand,.cf-top .cf-col,.cf-mid .cf-col,.cf-cta');
      if (typeof gsap === 'undefined') return;
      gsap.set(targets, { opacity: 0, y: 26 });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            gsap.to(en.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' });
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      targets.forEach(t => io.observe(t));
    })();
  }

  if (!shouldInjectNav) return;

  /* ─── 5.  NAV JAVASCRIPT ──────────────────────────────────────────── */
  // Scroll state
  // Blog page: always show the "scrolled" (light) nav styling because the
  // page background is white from the top.
  const forceScrolled = activePage === 'blog';
  if (forceScrolled) {
    navEl.classList.add('scrolled', 'force-scrolled');
  }
  window.addEventListener('scroll', () => {
    if (forceScrolled) { navEl.classList.add('scrolled'); return; }
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  if (!forceScrolled) navEl.classList.toggle('scrolled', window.scrollY > 40);


  // Desktop mega menu
  const navItemEls = navEl.querySelectorAll('.nav-item[data-menu]');
  const bdEl = backdropEl;
  let active = null, timer = null, openTimer = null;
  // Hover-intent: cursor must dwell this long on a tab before its panel opens
  // (prevents the menu firing when the cursor merely brushes past). SP 21-Jun
  const HOVER_INTENT = 140;

  function openPanel(id) {
    clearTimeout(timer);
    clearTimeout(openTimer);
    if (active === id) return;
    if (active) killPanel(active, true);
    active = id;
    navItemEls.forEach(li => li.classList.toggle('active', li.dataset.menu === id));
    const panel = document.getElementById('menu-' + id);
    if (!panel) return;
    panel.classList.add('open');
    bdEl.classList.add('on');
    if (navEl) navEl.classList.add('menu-open');
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 1, y: 0, duration: 0.36, ease: 'power3.out' });
      gsap.from(panel.querySelectorAll('.mega-zone'), { opacity: 0, y: 10, duration: 0.34, stagger: 0.05, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.from(panel.querySelectorAll('.mz-item,.mz-assess-card,.mz-pill'), { opacity: 0, y: 8, duration: 0.3, stagger: 0.025, ease: 'power2.out', delay: 0.08, clearProps: 'opacity,transform' });
    } else {
      panel.style.opacity = '1'; panel.style.transform = 'translateY(0)';
    }
  }

  function killPanel(id, fast) {
    const panel = document.getElementById('menu-' + id);
    if (!panel) return;
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 0, y: -8, duration: fast ? 0.14 : 0.24, ease: 'power2.in', onComplete: () => panel.classList.remove('open') });
    } else {
      panel.classList.remove('open');
    }
    navItemEls.forEach(li => li.classList.remove('active'));
    bdEl.classList.remove('on');
    if (navEl) navEl.classList.remove('menu-open');
    active = null;
  }

  const sched = () => { timer = setTimeout(() => { if (active) killPanel(active); }, 150); };
  const cancel = () => { clearTimeout(timer); };

  navItemEls.forEach(li => {
    li.addEventListener('mouseenter', () => {
      clearTimeout(timer);      // cancel any pending close
      clearTimeout(openTimer);  // reset any pending open
      const id = li.dataset.menu;
      // A panel is already open → switch instantly. Otherwise require brief
      // hover intent so a passing cursor doesn't pop the menu.
      if (active) openPanel(id);
      else openTimer = setTimeout(() => openPanel(id), HOVER_INTENT);
    });
    li.addEventListener('mouseleave', () => { clearTimeout(openTimer); sched(); });
    /* Click opens the mega-menu only — tabs no longer navigate to a page (SP 12-Jun) */
    const trigger = li.querySelector('.nav-link');
    if (trigger) {
      const toggle = e => {
        e.preventDefault();
        clearTimeout(openTimer);  // click = explicit intent, open now
        if (active === li.dataset.menu) killPanel(li.dataset.menu);
        else openPanel(li.dataset.menu);
      };
      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') toggle(e);
      });
    }
  });
  megaRoot.addEventListener('mouseenter', cancel);
  megaRoot.addEventListener('mouseleave', sched);

  /* Hover-to-preview: middle feature card swaps title/desc/cap/CTA to the hovered left option (SP 12-Jun) */
  megaRoot.querySelectorAll('.mega-panel').forEach(panel => {
    const titleEl = panel.querySelector('.mz-feature-title');
    const descEl = panel.querySelector('.mz-feature-desc');
    const capEl = panel.querySelector('.mz-feature-cap');
    const cardEl = panel.querySelector('.mz-feature-card');
    const exploreEl = panel.querySelector('.mz-explore');
    const list = panel.querySelector('.mega-zone'); /* left column — boundary for revert (covers list + partner logos) */
    if (!titleEl || !descEl || !list) return;
    const def = {
      title: titleEl.textContent, desc: descEl.textContent,
      cap: capEl ? capEl.innerHTML : '',
      card: cardEl && cardEl.getAttribute('href'),
      explore: exploreEl && exploreEl.getAttribute('href'),
    };
    const swap = (t, ds, capHTML, href) => {
      titleEl.textContent = t; descEl.textContent = ds;
      if (capEl && capHTML) capEl.innerHTML = capHTML;
      if (cardEl && href) cardEl.setAttribute('href', href);
      if (exploreEl && href) exploreEl.setAttribute('href', href);
      titleEl.classList.remove('mz-feat-pulse'); void titleEl.offsetWidth; titleEl.classList.add('mz-feat-pulse');
      descEl.classList.remove('mz-feat-pulse'); void descEl.offsetWidth; descEl.classList.add('mz-feat-pulse');
      if (capEl) { capEl.classList.remove('mz-feat-pulse'); void capEl.offsetWidth; capEl.classList.add('mz-feat-pulse'); }
    };
    panel.querySelectorAll('.mz-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        swap(item.getAttribute('data-ftitle'), item.getAttribute('data-fdesc'), item.getAttribute('data-fcap'), item.getAttribute('href'));
      });
    });
    list.addEventListener('mouseleave', () => swap(def.title, def.desc, def.cap, def.card === undefined ? null : def.card));
  });

  bdEl.addEventListener('click', () => { if (active) killPanel(active); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) killPanel(active); });

  // Mobile drawer
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBack = document.getElementById('drawerBackdrop');

  function openDrawer() { mobileDrawer.classList.add('open'); hamburger.classList.add('open'); document.body.classList.add('menu-open'); }
  function closeDrawer() { mobileDrawer.classList.remove('open'); hamburger.classList.remove('open'); document.body.classList.remove('menu-open'); }

  hamburger.addEventListener('click', () => mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
  drawerClose.addEventListener('click', closeDrawer);
  drawerBack.addEventListener('click', closeDrawer);

  mobileDrawer.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.dataset.drawerToggle);
      const isOpen = sub.classList.contains('open');
      mobileDrawer.querySelectorAll('.drawer-sub.open').forEach(el => el.classList.remove('open'));
      mobileDrawer.querySelectorAll('.drawer-link.active').forEach(el => el.classList.remove('active'));
      if (!isOpen) { sub.classList.add('open'); btn.classList.add('active'); }
    });
  });
  mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ─── 6.  READY SIGNAL ───────────────────────────────────────────────
     Lets pages defer work (e.g. footer entrance animations) until after
     the nav + footer are safely in the DOM.
  ─────────────────────────────────────────────────────────────────── */
  window.__celsiorSharedDone = true;
  document.dispatchEvent(new CustomEvent('celsior:shared-ready'));

  /* ─── 7. COOKIE CONSENT ───────────────────────────────────────────
     Banner shows once per visitor (localStorage). Footer "Cookie
     Preferences" link reopens the modal. Analytics scripts only load
     after Accept.
  ─────────────────────────────────────────────────────────────────── */
  (function consent() {
    const CONSENT_KEY = 'cookie_consent_v1';
    const stored = localStorage.getItem(CONSENT_KEY);

    const css = document.createElement('style');
    css.textContent = `
      .ck-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:880px;margin:0 auto;background:rgba(8,11,24,0.96);color:#e9edf6;border:1px solid rgba(255,255,255,0.08);border-radius:14px;box-shadow:0 18px 50px -16px rgba(0,0,0,0.5);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:18px 20px;z-index:99998;display:flex;gap:16px;align-items:center;flex-wrap:wrap;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;}
      .ck-banner p{margin:0;flex:1;min-width:240px;color:#aab3c9;}
      .ck-banner strong{color:#ffffff;}
      .ck-banner a{color:#2254f4;text-decoration:underline;}
      .ck-btns{display:flex;gap:8px;flex-wrap:wrap;}
      .ck-btn{appearance:none;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);color:#e9edf6;padding:9px 16px;border-radius:8px;font:600 13px/1 inherit;cursor:pointer;transition:.15s;}
      .ck-btn:hover{border-color:#2254f4;color:#ffffff;background:rgba(255,255,255,0.08);}
      .ck-btn.primary{background:#2254f4;border-color:#2254f4;color:#fff;}
      .ck-btn.primary:hover{background:#1b46d8;border-color:#1b46d8;color:#fff;}
      .ck-modal{position:fixed;inset:0;background:rgba(5,7,16,0.8);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999;}
      .ck-modal-card{background:#0b0f20;border:1px solid rgba(255,255,255,0.08);border-radius:16px;max-width:520px;width:100%;padding:28px;font:14px/1.55 system-ui,sans-serif;color:#e9edf6;box-shadow:0 24px 60px rgba(0,0,0,0.65);}
      .ck-modal-card h3{margin:0 0 8px;font-size:1.15rem;color:#ffffff;font-weight:700;}
      .ck-modal-card p{margin:0 0 16px;color:#aab3c9;}
      .ck-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);}
      .ck-row:first-of-type{border-top:none;}
      .ck-row label{font-weight:600;}
      .ck-row small{display:block;font-weight:400;color:#828ca6;margin-top:2px;}
      .ck-switch {position:relative;display:inline-block;width:38px;height:22px;}
      .ck-switch input {opacity:0;width:0;height:0;}
      .ck-slider {position:absolute;cursor:pointer;inset:0;background-color:rgba(255,255,255,0.12);transition:.3s;border-radius:34px;border:1px solid rgba(255,255,255,0.08);}
      .ck-slider:before {position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background-color:#aab3c9;transition:.3s;border-radius:50%;}
      .ck-switch input:checked + .ck-slider {background-color:#2254f4;}
      .ck-switch input:checked + .ck-slider:before {transform:translateX(16px);background-color:#ffffff;}
      @media(max-width:520px){.ck-banner{padding:16px;border-radius:12px;}}
    `;
    document.head.appendChild(css);

    function buildBanner() {
      const b = document.createElement('div');
      b.className = 'ck-banner'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookie consent');
      b.innerHTML = `
        <p><strong>We value your privacy.</strong> We use cookies to enhance your experience, analyze traffic, and personalize content. See our <a href="/assets/legal/web-privacy-policy.pdf" target="_blank" rel="noopener">Privacy Policy</a>.</p>
        <div class="ck-btns">
          <button class="ck-btn" data-act="reject">Reject all</button>
          <button class="ck-btn" data-act="prefs">Preferences</button>
          <button class="ck-btn primary" data-act="accept">Accept all</button>
        </div>`;
      b.addEventListener('click', e => {
        const act = e.target.dataset && e.target.dataset.act;
        if (!act) return;
        if (act === 'accept') { setConsent('all'); b.remove(); }
        else if (act === 'reject') { setConsent('essential'); b.remove(); }
        else if (act === 'prefs') { b.remove(); openPrefs(); }
      });
      return b;
    }

    function setConsent(level) {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ level, ts: Date.now() }));
      if (level === 'all' || level === 'analytics') {
        if (typeof window.__loadAnalytics === 'function') window.__loadAnalytics();
      }
    }

    function openPrefs() {
      const cur = (() => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)) || {}; } catch (_) { return {}; } })().level || 'essential';
      const m = document.createElement('div'); m.className = 'ck-modal';
      m.innerHTML = `
        <div class="ck-modal-card" role="dialog" aria-modal="true" aria-label="Cookie preferences">
          <h3>Cookie preferences</h3>
          <p>Choose which categories of cookies we may use. You can change this at any time from the footer.</p>
          <div class="ck-row"><label>Essential <small>Required for the site to function.</small></label><span style="font-size:0.8rem;color:#3ddc97;font-weight:600;">Always active</span></div>
          <div class="ck-row">
            <label for="ck-an">Analytics <small>Helps us understand site usage.</small></label>
            <label class="ck-switch">
              <input id="ck-an" type="checkbox" ${cur === 'all' || cur === 'analytics' ? 'checked' : ''}>
              <span class="ck-slider"></span>
            </label>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
            <button class="ck-btn" data-act="cancel">Cancel</button>
            <button class="ck-btn primary" data-act="save">Save preferences</button>
          </div>
        </div>`;
      m.addEventListener('click', e => {
        if (e.target === m || (e.target.dataset && e.target.dataset.act === 'cancel')) m.remove();
        if (e.target.dataset && e.target.dataset.act === 'save') {
          const on = m.querySelector('#ck-an').checked;
          setConsent(on ? 'analytics' : 'essential');
          m.remove();
        }
      });
      document.body.appendChild(m);
    }

    // Show banner if no prior choice
    if (!stored) {
      document.body.appendChild(buildBanner());
    } else {
      try {
        const { level } = JSON.parse(stored);
        if (level === 'all' || level === 'analytics') {
          if (typeof window.__loadAnalytics === 'function') window.__loadAnalytics();
        }
      } catch (_) { }
    }

    // Wire footer "Cookie Preferences" link
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-action]');
      if (!t) return;
      if (t.dataset.action === 'cookie-prefs') { e.preventDefault(); openPrefs(); }
    });
  })();

  /* ─── HUBSPOT CTA MODAL SYSTEM ──────────────────────────────────────
     Restored from prior working shared.js.
     Keeps CTA/form behavior centralized while preserving current nav,
     footer, GDPR/cookie, and backend additions.
  ─────────────────────────────────────────────────────────────────── */
  function initCelsiorHubspotModals() {
    // Disabled for the Pyramid staging website.
    return;
    if (window.__celsiorHubspotModalReady) return;
    window.__celsiorHubspotModalReady = true;

    const FORM_SCRIPT_SRC = 'https://js.hsforms.net/forms/embed/developer/40221584.js';
    const PORTAL_ID = '40221584';
    const REGION = 'na1';

    const modalContent = {
      general: {
        title: 'Talk to a Celsior expert',
        helper: 'Share a few details and our team will get back to you shortly.',
        formId: '14603611-2306-41db-892b-61dd59e11a31'
      },
      assessment: {
        title: 'Request an assessment',
        helper: 'Tell us what you would like to evaluate, and we will help route the next step.',
        formId: 'f1c2bdcb-202d-49df-8698-b41c6abbb67d'
      },
      download: {
        title: 'Request the resource',
        helper: 'Submit your details and our team will share the relevant material.',
        formId: 'd01bacd7-cff8-4a16-a801-4c3c6aa0b9b8'
      },
      partner: {
        title: 'Start a partnership conversation',
        helper: 'Share your inquiry and the right team member will follow up.',
        formId: '982fe6de-6215-4904-916b-fd062836bddc'
      }
    };

    const ctaRules = [
      {
        type: 'assessment', phrases: [
          'assess your readiness',
          'request ai readiness assessment',
          'start ai readiness assessment',
          'start assessment',
          'modernization assessment',
          'request assessment'
        ]
      },
      {
        type: 'download', phrases: [
          'download capability brief',
          'download guide',
          'download the ai readiness framework',
          'download ai readiness framework',
          'access report',
          'view case study',
          'get the brief',
          'request resource'
        ]
      },
      {
        type: 'partner', phrases: [
          'partner with us',
          'explore partnership',
          'alliance inquiry',
          'vendor inquiry',
          'send inquiry'
        ]
      },
      {
        type: 'general', phrases: [
          'talk to an expert',
          'talk to a celsior expert',
          'talk to us',
          'talk to our practice lead',
          'speak to our team',
          'start the conversation',
          'book a discovery call',
          'schedule consultation',
          'schedule a consultation',
          'schedule a conversation',
          'get in touch',
          'get started',
          'start your transformation',
          'start your cloud journey',
          'submit request'
        ]
      }
    ];

    function normaliseText(text) {
      return (text || '')
        .replace(/\s+/g, ' ')
        .replace(/[→›»]/g, '')
        .trim()
        .toLowerCase();
    }

    function getModalTypeFromElement(el) {
      if (!el) return null;

      // Explicit override always wins.
      // HubSpot modal temporarily disabled site-wide.
      // To re-enable later, remove this return.
      return;
      // Usage: data-celsior-form="general|assessment|ai|resource"
      if (el.dataset && el.dataset.celsiorForm) return el.dataset.celsiorForm;

      const label = normaliseText(el.textContent || '');
      const href = normaliseText(el.getAttribute && el.getAttribute('href') || '');
      const cls = normaliseText(el.className || '');
      const page = normaliseText(window.location.pathname || '');
      const combined = `${label} ${href} ${cls} ${page}`;

      const ignoredClasses = [
        'blog-card',
        'insight-readlink',
        'acc-readmore',
        'explore__row-left',
        'explore__view-all',
        'faq__trigger',
        'gacc-btn',
        'ae-tab',
        'menu',
        'nav',
        'mz-item',
        'mz-pill',
        'partner-logo-card',
        'drawer-partner-card',
        'gw-engagement-toggle',
        'dc-engagement-toggle',
        /* Accordion / case-study rows are expand-toggles, not form CTAs — clicking them must
           never open the contact modal (SP 12-Jun "screen goes dark on click", common across pages) */
        'jh-acc-row',
        'jh-acc-header',
        'acc-row',
        'jh-acc-title',
        'ci-tab',
        'ci-tab-indicator',
        'aw-dot',
        'aw-arrow',
        'aw-dots',
        'ag-dot',
        'ks-dot',
        'ks-prev',
        'ks-next',
        'fem-dot',
        'fp-pill'
      ];

      if (ignoredClasses.some(c => cls.includes(c))) return null;
      if (cls.includes('-toggle') || cls.includes('_toggle') || cls.includes('-trigger') || cls.includes('_trigger')) return null;

      // Do not trigger forms for normal internal navigation unless it is a contact-style CTA.
      const isContactHref = href === '#contact' || href === '/#contact' || href.includes('index.html#contact');
      const isEmptyOrHashHref = href === '' || href === '#' || isContactHref;

      if (!isEmptyOrHashHref && href.startsWith('/')) {
        return null;
      }

      // Resource / gated content form.
      if (
        combined.includes('download') ||
        combined.includes('capabilities deck') ||
        combined.includes('capabilities overview') ||
        combined.includes('platform brief') ||
        combined.includes('brief') ||
        combined.includes('guide') ||
        combined.includes('report') ||
        combined.includes('resource') ||
        combined.includes('watch demo')
      ) {
        return 'resource';
      }

      // Assessment / diagnostic form.
      if (
        combined.includes('assessment') ||
        combined.includes('diagnostic') ||
        combined.includes('readiness') ||
        combined.includes('roi') ||
        combined.includes('data assessment') ||
        combined.includes('review your') ||
        combined.includes('review our') ||
        combined.includes('framework')
      ) {
        return 'assessment';
      }

      // AI / accelerator / demo form.
      if (
        combined.includes('ai-first') ||
        combined.includes('ai first') ||
        combined.includes('ai lab') ||
        combined.includes('synthetix') ||
        combined.includes('agentic') ||
        combined.includes('pilot') ||
        combined.includes('automation') ||
        combined.includes('request a demo') ||
        combined.includes('explore the platform') ||
        combined.includes('platform demo') ||
        page.includes('/ai-innovation') ||
        page.includes('/capabilities/ai-led-engineering') ||
        page.includes('/capabilities/ai-and-data')
      ) {
        if (
          label.includes('request a demo') ||
          label.includes('explore the platform') ||
          label.includes('start your transformation') ||
          label.includes('book a discovery call') ||
          label.includes('talk to') ||
          label.includes('speak to') ||
          label.includes('start the conversation')
        ) {
          return 'ai';
        }
      }

      // General contact / sales conversation form.
      if (
        isContactHref ||
        combined.includes('talk to') ||
        combined.includes('contact') ||
        combined.includes('get started') ||
        combined.includes('start the conversation') ||
        combined.includes('schedule') ||
        combined.includes('book') ||
        combined.includes('discovery call') ||
        combined.includes('consultation') ||
        combined.includes('speak to our team') ||
        combined.includes('speak to') ||
        combined.includes('connect with') ||
        combined.includes('get in touch')
      ) {
        return 'general';
      }

      // Fallback to older phrase rules from the restored system.
      for (const rule of ctaRules) {
        if (rule.phrases.some(phrase => label === phrase || label.includes(phrase))) {
          return rule.type;
        }
      }

      return null;
    }

    function ensureModalStyles() {
      if (document.getElementById('celsior-hs-modal-styles')) return;
      const style = document.createElement('style');
      style.id = 'celsior-hs-modal-styles';
      style.textContent = `
        .celsior-hs-modal-open{overflow:hidden;}
        .celsior-hs-modal{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:22px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
        .celsior-hs-modal.is-open{display:flex;}
        .celsior-hs-modal__overlay{position:absolute;inset:0;background:rgba(2,10,26,.80);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);}
        .celsior-hs-modal__dialog{position:relative;width:min(540px,100%);max-height:min(86vh,720px);overflow-y:auto;overflow-x:hidden;background:transparent!important;border:0!important;border-radius:18px!important;box-shadow:none!important;padding:0;color:#fff;scrollbar-width:thin;scrollbar-color:rgba(170,178,188,.55) rgba(255,255,255,.08);}
        .celsior-hs-modal__dialog::-webkit-scrollbar{width:4px;height:4px;}
        .celsior-hs-modal__dialog::-webkit-scrollbar-track{background:rgba(255,255,255,.06);border-radius:999px;}
        .celsior-hs-modal__dialog::-webkit-scrollbar-thumb{background:rgba(170,178,188,.58);border-radius:999px;}
        .celsior-hs-modal__dialog::-webkit-scrollbar-thumb:hover{background:rgba(200,206,214,.72);}
        .celsior-hs-modal__close{position:absolute;top:12px;right:12px;width:28px;height:28px;border:1px solid rgba(255,255,255,.34);border-radius:999px;background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;cursor:pointer;font-size:19px;line-height:1;z-index:2;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
        .celsior-hs-modal__close:hover{background:rgba(255,255,255,.16);}
        .celsior-hs-modal__form-panel{display:none;}
        .celsior-hs-modal__form-panel.is-active{display:block;background:rgba(5,16,32,.20);border:1px solid rgba(255,255,255,.22);border-radius:18px;padding:22px 28px 20px;box-shadow:0 24px 70px rgba(0,0,0,.28);}
        .celsior-hs-modal__head{padding:0 42px 11px 0;margin:0 0 14px;border-bottom:1px solid rgba(255,255,255,.20);}
        .celsior-hs-modal__title{margin:0;color:#fff;font-size:24px;line-height:1.12;font-weight:760;letter-spacing:-.025em;text-shadow:0 2px 18px rgba(0,0,0,.28);}
        .celsior-hs-modal__helper{margin:6px 0 0;color:rgba(255,255,255,.78);font-size:13.5px;line-height:1.35;}
        .celsior-hs-modal .hs-form-html,.celsior-hs-modal .hs-form{width:100%;background:transparent!important;}
        .celsior-hs-modal .hs-form fieldset{max-width:100%!important;background:transparent!important;margin-bottom:8px!important;}
        .celsior-hs-modal .hs-form .hs-form-field{background:transparent!important;margin-bottom:10px!important;}
        .celsior-hs-modal .hs-form label{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;color:rgba(255,255,255,.92)!important;font-size:12.5px!important;font-weight:650!important;line-height:1.25!important;margin-bottom:5px!important;text-shadow:0 1px 12px rgba(0,0,0,.28);}
        .celsior-hs-modal .hs-form input,.celsior-hs-modal .hs-form select,.celsior-hs-modal .hs-form textarea{min-height:38px!important;height:38px!important;padding:8px 10px!important;border-radius:7px!important;border:1px solid rgba(255,255,255,.45)!important;box-shadow:0 8px 22px rgba(0,0,0,.14)!important;background:rgba(255,255,255,.96)!important;color:#101820!important;font-size:14px!important;}
        .celsior-hs-modal .hs-form textarea{height:64px!important;min-height:64px!important;}
        .celsior-hs-modal .hs-form input:focus,.celsior-hs-modal .hs-form select:focus,.celsior-hs-modal .hs-form textarea:focus{outline:2px solid rgba(255,255,255,.48)!important;outline-offset:1px!important;}
        .celsior-hs-modal .hs-form .hs-submit{margin-top:8px!important;}
        .celsior-hs-modal .hs-form input[type="submit"],.celsior-hs-modal .hs-button{height:38px!important;min-height:38px!important;padding:8px 18px!important;background:#11224F!important;border-color:#11224F!important;border-radius:7px!important;font-weight:700!important;color:#fff!important;box-shadow:0 10px 24px rgba(17,34,79,.24)!important;}
        @media (max-height:760px){.celsior-hs-modal{align-items:center;padding:14px 18px;}.celsior-hs-modal__dialog{max-height:calc(100vh - 28px);width:min(500px,100%);}.celsior-hs-modal__form-panel.is-active{padding:18px 24px 16px;border-radius:16px;}.celsior-hs-modal__close{top:9px;right:9px;}.celsior-hs-modal__head{margin-bottom:12px;padding-bottom:10px;}.celsior-hs-modal__title{font-size:22px;}.celsior-hs-modal__helper{font-size:13px;}.celsior-hs-modal .hs-form .hs-form-field{margin-bottom:7px!important;}.celsior-hs-modal .hs-form input,.celsior-hs-modal .hs-form select,.celsior-hs-modal .hs-form textarea{height:34px!important;min-height:34px!important;padding:6px 10px!important;}.celsior-hs-modal .hs-form textarea{height:52px!important;min-height:52px!important;}.celsior-hs-modal .hs-form input[type="submit"],.celsior-hs-modal .hs-button{height:36px!important;min-height:36px!important;}}
        @media (max-width:640px){.celsior-hs-modal{align-items:flex-start;overflow:auto;padding:18px 16px;}.celsior-hs-modal__dialog{width:100%;max-height:calc(100vh - 36px);margin:4px 0;padding:0;}.celsior-hs-modal__form-panel.is-active{padding:18px 18px 16px;border-radius:16px;}.celsior-hs-modal__close{top:8px;right:8px;}.celsior-hs-modal__title{font-size:22px;}.celsior-hs-modal__helper{font-size:13px;}}
      `;
      document.head.appendChild(style);
    }

    function ensureModalMarkup() {
      let modal = document.getElementById('celsiorHsModal');
      if (modal) return modal;
      ensureModalStyles();
      modal = document.createElement('div');
      modal.id = 'celsiorHsModal';
      modal.className = 'celsior-hs-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="celsior-hs-modal__overlay" data-celsior-modal-close></div>
        <div class="celsior-hs-modal__dialog" role="dialog" aria-modal="true" aria-label="Celsior form">
          <button class="celsior-hs-modal__close" type="button" aria-label="Close form" data-celsior-modal-close>×</button>
          ${Object.keys(modalContent).map(type => `<div class="celsior-hs-modal__form-panel" data-celsior-form-panel="${type}"><div class="celsior-hs-modal__head"><h2 class="celsior-hs-modal__title">${modalContent[type].title}</h2><p class="celsior-hs-modal__helper">${modalContent[type].helper}</p></div><div class="hs-form-html" data-region="${REGION}" data-form-id="${modalContent[type].formId}" data-portal-id="${PORTAL_ID}"></div></div>`).join('')}
        </div>
      `;
      document.body.appendChild(modal);

      if (!document.querySelector(`script[src="${FORM_SCRIPT_SRC}"]`)) {
        const hsScript = document.createElement('script');
        hsScript.src = FORM_SCRIPT_SRC;
        hsScript.defer = true;
        document.body.appendChild(hsScript);
      }

      modal.addEventListener('click', (event) => {
        if (event.target.closest('[data-celsior-modal-close]')) closeModal();
      });

      return modal;
    }

    function openModal(type) {
      const content = modalContent[type] || modalContent.general;
      const modal = ensureModalMarkup();
      const dialog = modal.querySelector('.celsior-hs-modal__dialog');
      if (dialog) dialog.setAttribute('aria-label', content.title);
      modal.querySelectorAll('[data-celsior-form-panel]').forEach(panel => {
        panel.classList.toggle('is-active', panel.dataset.celsiorFormPanel === type);
      });
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('celsior-hs-modal-open');
      setTimeout(() => {
        const firstInput = modal.querySelector('.celsior-hs-modal__form-panel.is-active input, .celsior-hs-modal__form-panel.is-active select, .celsior-hs-modal__form-panel.is-active textarea, .celsior-hs-modal__close');
        if (firstInput) firstInput.focus({ preventScroll: true });
      }, 250);
    }

    function closeModal() {
      const modal = document.getElementById('celsiorHsModal');
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('celsior-hs-modal-open');
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('a,button,[role="button"]');
      if (!trigger) return;
      if (trigger.closest('#celsiorHsModal')) return;
      const type = getModalTypeFromElement(trigger);
      if (!type) return;
      event.preventDefault();
      openModal(type);
    });
  }

  initCelsiorHubspotModals();

  /* ─── FOOTER NEWSLETTER HUBSPOT FORM ─────────────────────────────────
   * Keeps the original compact footer design visible and submits directly to HubSpot.
   * Do not replace the visible footer form with HubSpot-rendered markup; that breaks the footer layout.
   */
  function initCelsiorFooterNewsletterForm() {
    // Disabled for the Pyramid staging website.
    return;
    const visibleForm = document.querySelector('.cf-newsletter-ui');
    const visibleEmail = document.querySelector('.cf-newsletter-email');
    const hubspotMeta = document.querySelector('.celsior-footer-newsletter-form');
    const status = document.querySelector('.cf-newsletter-status');

    if (!visibleForm || !visibleEmail || !hubspotMeta) return;

    const portalId = hubspotMeta.getAttribute('data-portal-id') || '40221584';
    const formId = hubspotMeta.getAttribute('data-form-id') || 'd01bacd7-cff8-4a16-a801-4c3c6aa0b9b8';
    const endpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/' + portalId + '/' + formId;

    visibleForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = visibleEmail.value.trim();
      if (!email) return;

      const submitButton = visibleForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      if (status) status.textContent = '';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: [
              {
                name: 'email',
                value: email
              }
            ],
            context: {
              pageUri: window.location.href,
              pageName: document.title || 'Celsior footer newsletter'
            }
          })
        });

        if (!response.ok) {
          throw new Error('HubSpot submission failed');
        }

        visibleEmail.value = '';
        if (status) status.textContent = 'Thank you for subscribing.';
      } catch (error) {
        if (status) status.textContent = 'Could not submit right now. Please try again.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText || 'Subscribe';
        }
      }
    });
  }

  initCelsiorFooterNewsletterForm();


  /* ─── AI-FIRST PAGE CTA FALLBACK ───────────────────────────────────── */
  function forceAiFirstExploreCtaRedirect() {
    const isAiFirstPage = window.location.pathname.replace(/\/$/, '') === '/our-focus/ai-first-digital-engineering';
    if (!isAiFirstPage) return;

    const targetUrl = '/capabilities/ai-led-engineering';

    Array.from(document.querySelectorAll('a, button')).forEach(function (el) {
      const label = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (label !== 'explore our approach') return;

      if (el.tagName.toLowerCase() === 'a') {
        el.setAttribute('href', targetUrl);
      }

      el.setAttribute('data-celsior-no-modal', 'true');

      el.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = targetUrl;
      }, true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceAiFirstExploreCtaRedirect);
  } else {
    forceAiFirstExploreCtaRedirect();
  }


})();
