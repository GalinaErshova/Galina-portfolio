/* Yandex Metrika 114414864 is loaded only after explicit consent. */
(() => {
  'use strict';
  if (window.galaConsent) return;

  const COUNTER = 114414864;
  const KEY = 'galaershova-consent';
  const VERSION = 2;
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  let current = null;
  let started = false;
  let previousFocus = null;

  function valid(record) {
    return record && record.version === VERSION &&
      typeof record.analytics === 'boolean' && typeof record.personalData === 'boolean' &&
      Number.isFinite(record.savedAt) && record.savedAt <= Date.now() &&
      Date.now() - record.savedAt < MAX_AGE &&
      (!record.analytics || record.personalData);
  }

  function read() {
    try {
      const record = JSON.parse(localStorage.getItem(KEY));
      return valid(record) ? record : null;
    } catch (_) { return null; }
  }

  function clearAnalyticsCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host];
    const labels = host.split('.');
    while (labels.length > 2) { labels.shift(); domains.push('.' + labels.join('.')); }
    const paths = ['/'];
    let path = '';
    for (const segment of location.pathname.split('/').filter(Boolean)) {
      path += '/' + segment;
      paths.push(path, path + '/');
    }
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ym_/.test(name)) continue;
      for (const domain of domains) for (const cookiePath of paths) {
        document.cookie = name + '=; Max-Age=0; path=' + cookiePath +
          (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      }
    }
  }

  function stopAnalytics() {
    if (started && typeof window.ym === 'function') window.ym(COUNTER, 'destruct');
    clearAnalyticsCookies();
    // Reload removes the tracker, Webvisor and event handlers from this document.
    if (started) location.reload();
  }

  function startAnalytics() {
    if (started || !current || !current.analytics || !current.personalData) return;
    started = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = true; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=114414864', 'ym');
    window.ym(COUNTER, 'init', {
      ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer',
      referrer: document.referrer, url: location.href,
      accurateTrackBounce: true, trackLinks: true
    });
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'gala-consent';
  wrapper.innerHTML = `
    <button class="gala-consent__settings" type="button" aria-controls="gala-consent-panel" aria-expanded="false">Настройки аналитики</button>
    <section class="gala-consent__panel" id="gala-consent-panel" role="dialog" aria-labelledby="gala-consent-title" aria-describedby="gala-consent-description" hidden>
      <button class="gala-consent__close" type="button" aria-label="Закрыть без аналитики">×</button>
      <h2 id="gala-consent-title">Аналитика сайта</h2>
      <p id="gala-consent-description">Яндекс Метрика собирает статистику посещений и записывает действия на страницах. Вы можете пользоваться сайтом без аналитики.</p>
      <p class="gala-consent__terms">Нажимая «Разрешить аналитику», вы соглашаетесь на аналитические cookie и обработку данных для этих целей. <a href="/policy" target="_blank" rel="noopener">Политика обработки данных</a></p>
      <div class="gala-consent__actions"><button class="gala-consent__accept" type="button">Разрешить аналитику</button><button class="gala-consent__decline" type="button">Продолжить без аналитики</button></div>
    </section>`;
  document.body.append(wrapper);
  const panel = wrapper.querySelector('.gala-consent__panel');
  const settings = wrapper.querySelector('.gala-consent__settings');
  const accept = wrapper.querySelector('.gala-consent__accept');
  const decline = wrapper.querySelector('.gala-consent__decline');
  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.append(footer);
  }
  footer.classList.add('gala-consent-footer');
  footer.append(settings);

  function show(manual = true) {
    previousFocus = manual ? document.activeElement : null;
    decline.textContent = current && current.analytics ? 'Отключить аналитику' : 'Продолжить без аналитики';
    panel.hidden = false;
    settings.setAttribute('aria-expanded', 'true');
    if (manual) wrapper.querySelector('.gala-consent__close').focus();
  }

  function hide() {
    panel.hidden = true;
    settings.setAttribute('aria-expanded', 'false');
    if (panel.contains(document.activeElement)) {
      (previousFocus && previousFocus.isConnected ? previousFocus : settings).focus({ preventScroll: true });
    }
  }

  function save(allowed) {
    current = { version: VERSION, analytics: allowed, personalData: allowed, savedAt: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (_) { /* Safe: ask again on the next page. */ }
    hide();
    if (allowed) startAnalytics(); else stopAnalytics();
  }

  settings.addEventListener('click', () => show());
  accept.addEventListener('click', () => save(true));
  decline.addEventListener('click', () => save(false));
  const dismiss = () => save(false);
  wrapper.querySelector('.gala-consent__close').addEventListener('click', dismiss);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss(); }
  });
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    current = read();
    if (current && current.analytics) startAnalytics(); else stopAnalytics();
    if (current) hide(); else show(false);
  });

  window.galaConsent = Object.freeze({ open: () => show(), revoke: () => save(false) });
  current = read();
  if (current && current.analytics) startAnalytics();
  else clearAnalyticsCookies();
  if (!current) show(false);
})();
