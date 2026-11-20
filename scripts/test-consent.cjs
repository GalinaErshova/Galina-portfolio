const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/site-consent.js'), 'utf8');
const key = 'galaershova-consent';

function session(saved, blocked = false) {
  const listeners = {};
  const nodes = new Map();
  const requests = [];
  const cookies = [];
  const records = new Map(saved === undefined ? [] : [[key, saved]]);
  let reloaded = 0;
  const document = {
    referrer: 'https://example.org/', scripts: [],
    createElement: tag => element(tag),
    querySelector: selector => element(selector),
    getElementsByTagName: () => [{ parentNode: { insertBefore: tag => requests.push(tag.src) } }],
    body: { append() {} }
  };
  function element(name) {
    if (nodes.has(name)) return nodes.get(name);
    const el = {
      name, checked: false, disabled: false, hidden: name.includes('panel'), isConnected: true,
      attrs: {}, handlers: {},
      children: [], classList: { add() {} },
      append(child) { this.children.push(child); },
      setAttribute(k, v) { this.attrs[k] = v; },
      addEventListener(k, fn) { this.handlers[k] = fn; },
      querySelector: element,
      contains: item => item && item !== nodes.get('.gala-consent__settings'),
      focus() { document.activeElement = this; },
      emit(type, event = {}) { this.handlers[type]?.(event); }
    };
    nodes.set(name, el);
    return el;
  }
  Object.defineProperty(document, 'cookie', {
    get: () => '_ym_uid=123; _ym_d=456; other=keep',
    set: value => cookies.push(value)
  });
  const context = vm.createContext({
    document, location: { hostname: 'galaershova.ru', pathname: '/projects/test/', href: 'https://galaershova.ru/projects/test/', reload: () => reloaded++ },
    localStorage: {
      getItem: k => { if (blocked) throw Error('Storage unavailable'); return records.get(k) ?? null; },
      setItem: (k, v) => { if (blocked) throw Error('Storage unavailable'); records.set(k, v); }
    },
    window: { addEventListener: (k, fn) => { listeners[k] = fn; } }
  });
  vm.runInContext(source, context);
  return { context, nodes, requests, cookies, records, listeners, element, get reloads() { return reloaded; } };
}
const record = analytics => JSON.stringify({ version: 2, analytics, personalData: analytics, savedAt: Date.now() });
const click = (s, selector) => s.element(selector).emit('click');
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }

test('No tracker before explicit Allow, no checkboxes or hints', () => {
  const s = session();
  assert.equal(s.requests.length, 0);
  assert.equal(s.element('.gala-consent__panel').hidden, false);
  assert.equal(s.element('.gala-consent__accept').disabled, false);
  assert.ok(!source.includes('type="checkbox"'));
  assert.ok(!source.includes('Можно принять'));
  click(s, '.gala-consent__accept');
  assert.deepEqual(s.requests, ['https://mc.yandex.ru/metrika/tag.js?id=114414864']);
  const args = s.context.window.ym.a[0];
  assert.equal(args[0], 114414864);
  assert.equal(args[1], 'init');
  assert.equal(args[2].webvisor, true);
  assert.equal(args[2].ecommerce, 'dataLayer');
  assert.equal(s.element('.gala-consent__panel').hidden, true);
  click(s, '.gala-consent__accept');
  assert.equal(s.requests.length, 1);
});
test('Consent persists on another page', () => {
  const s = session(record(true));
  assert.equal(s.requests.length, 1);
  assert.equal(s.element('.gala-consent__panel').hidden, true);
});
test('Explicit refusal persists without tracker', () => {
  const s = session();
  click(s, '.gala-consent__decline');
  assert.equal(JSON.parse(s.records.get(key)).analytics, false);
  assert.equal(s.requests.length, 0);
  const next = session(s.records.get(key));
  assert.equal(next.requests.length, 0);
  assert.equal(next.element('.gala-consent__panel').hidden, true);
});
test('Close means continue without analytics', () => {
  const s = session();
  click(s, '.gala-consent__close');
  assert.equal(JSON.parse(s.records.get(key)).analytics, false);
  assert.equal(s.requests.length, 0);
});
test('Escape dismisses without analytics', () => {
  const s = session();
  s.element('.gala-consent__panel').emit('keydown', { key: 'Escape', preventDefault() {}, stopPropagation() {} });
  assert.equal(JSON.parse(s.records.get(key)).analytics, false);
});
test('Settings permit later acceptance', () => {
  const s = session(record(false));
  click(s, '.gala-consent__settings');
  assert.equal(s.element('.gala-consent__panel').hidden, false);
  click(s, '.gala-consent__accept');
  assert.equal(s.requests.length, 1);
});
test('Settings are attached to the footer', () => {
  const s = session(record(false));
  assert.ok(s.element('footer').children.includes(s.element('.gala-consent__settings')));
});
test('Old consent version asks again without starting analytics', () => {
  const s = session(JSON.stringify({version:1,analytics:true,personalData:true,savedAt:Date.now()}));
  assert.equal(s.requests.length, 0);
  assert.equal(s.element('.gala-consent__panel').hidden, false);
});
test('Closing reopened consent revokes existing permission', () => {
  const s = session(record(true));
  click(s, '.gala-consent__settings');
  click(s, '.gala-consent__close');
  assert.equal(JSON.parse(s.records.get(key)).analytics, false);
  assert.equal(s.reloads, 1);
});
test('Revoke destroys tracker, clears only analytics cookies and reloads', () => {
  const s = session(record(true));
  s.context.window.galaConsent.revoke();
  assert.equal(JSON.parse(s.records.get(key)).analytics, false);
  assert.equal(s.context.window.ym.a[1][1], 'destruct');
  assert.equal(s.reloads, 1);
  assert.ok(s.cookies.some(c => c.startsWith('_ym_uid=')));
  assert.ok(s.cookies.every(c => !c.startsWith('other=')));
});
test('Cross-tab revocation stops running tracker', () => {
  const s = session(record(true));
  s.records.set(key, record(false));
  s.listeners.storage({ key });
  assert.equal(s.reloads, 1);
});
test('Unavailable storage fails closed', () => {
  const s = session(undefined, true);
  assert.equal(s.requests.length, 0);
  click(s, '.gala-consent__decline');
  assert.equal(s.requests.length, 0);
});
test('Malformed, expired, future and inconsistent consent fails closed', () => {
  for (const saved of ['{oops', 'null', JSON.stringify({ version: 2, analytics: true, personalData: true, savedAt: 1 }), JSON.stringify({ version: 2, analytics: true, personalData: true, savedAt: Date.now() + 86400000 }), JSON.stringify({ version: 2, analytics: true, personalData: false, savedAt: Date.now() })]) {
    const s = session(saved);
    assert.equal(s.requests.length, 0);
    assert.equal(s.element('.gala-consent__panel').hidden, false);
  }
});
test('Duplicate inclusion does not create duplicate UI or tracker', () => {
  const s = session(record(true));
  vm.runInContext(source, s.context);
  assert.equal(s.requests.length, 1);
});
test('Policy link and no unconditional tracking pixel', () => {
  assert.ok(source.includes('href="/policy"'));
  assert.ok(!/mc\.yandex\.ru\/watch\//.test(source));
});

let pages = 0;
function checkFiles(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(item.name)) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { checkFiles(file); continue; }
    if (!/\.(css|html)$/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/i.test(text), 'Google Fonts dependency: ' + file);
    assert.ok(!/mc\.yandex\.(ru|com)\/(watch|metrika)/i.test(text), 'Unconditional counter: ' + file);
    if (file.endsWith('.html') && /<html\b/i.test(text)) {
      pages++;
      assert.equal((text.match(/src="\/assets\/site-consent\.js\?/g) || []).length, 1, file);
      assert.equal((text.match(/href="\/assets\/site-consent\.css\?/g) || []).length, 1, file);
      assert.ok(text.indexOf('/assets/site-consent.js?') < text.indexOf('</head>'), file);
    }
  }
}
test('All full HTML pages include the gate; no remote Google Fonts or counter bypass', () => checkFiles(path.join(__dirname, '..')));
console.log(checks + ' checks passed across ' + pages + ' pages.');
