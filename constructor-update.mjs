import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { refineProjects } from './constructor-projects.mjs';

const file = name => new URL(name, import.meta.url);
const old = readFileSync(file('constructor.html'), 'utf8');
const latest = readFileSync(file('media.html'), 'utf8');
const visualPattern = /<div class="hero-visual">[\s\S]*?<\/section>/;
let visual = old.match(visualPattern)?.[0];
if (!visual || !latest.match(visualPattern)) throw new Error('Hero visual missing');
const controls = visual.match(/<div class="scenarios"[\s\S]*?<\/div><p class="scenario-caption"[\s\S]*?<\/p>/)?.[0];
if (!controls) throw new Error('Scenario controls missing');
visual = visual.replace(controls, '').replace('<div class="hero-visual">', '<div class="hero-visual">' + controls);
if (!existsSync(file('constructor-before-erp-bi.html'))) {
  writeFileSync(file('constructor-before-erp-bi.html'), old);
}
const contentStyles = readFileSync(file('media.css'), 'utf8');
const start = contentStyles.indexOf('.media .hero-expertise');
if (start < 0) throw new Error('Content styles missing');
writeFileSync(file('constructor-content.css'), contentStyles.slice(start).replaceAll('.media', '.clay'));
let html = latest
  .replace('<body class="media">', '<body class="clay">')
  .replace('05 · MediaSphera Navy |', '03 · Конструктор полезных систем |')
  .replace('href="media.css"', 'href="constructor-content.css"')
  .replace('<script src="app.js" defer>', '<link rel="stylesheet" href="constructor-motion.css"><script src="constructor-motion.js" defer></script><script src="app.js" defer>')
  .replace('Написать в Telegram ↗', 'Написать в Telegram · @GalaErsh ↗')
  .replace('<a href="constructor.html">', '<a href="constructor.html" aria-current="page">')
  .replace('<a href="media.html" aria-current="page">', '<a href="media.html">')
  .replace('<a href="constructor.html">Сравнить с терракотовым вариантом ↗</a>', '<a href="media.html">Сравнить с вариантом Navy ↗</a>')
  .replace(visualPattern, visual);
html = refineProjects(html);
html = html.replace('<a href="#solutions">Решения</a>', '').replace('<a href="#approach">Как работаю</a>', '');
html = html.replace(/<section class="approach section wrap"[\s\S]*?<\/section>/, readFileSync(file('constructor-process.html'), 'utf8'));
html = html.replace('<link rel="stylesheet" href="constructor-motion.css">', '<link rel="stylesheet" href="constructor-motion.css"><link rel="stylesheet" href="constructor-process.css"><script src="constructor-process.js" defer></script>');
const wording = [
  ['Данные есть. Управленческой картины нет.', 'Данные есть, а управленческой картины нет'],
  ['Помогаю превратить эту картину в требования к работающей системе.', 'На этой основе формулирую требования к системе.'],
  ['Сначала задача.<br><span>Потом технология.</span>', 'Сначала задача<br><span>Потом технология</span>'],
  ['За разработкой — опыт в ERP и BI', 'Опыт в ERP и BI — основа разработки'],
  ['от исходной операции до показателя, на который опирается решение.', 'от учётной операции до показателей для принятия решений.'],
  ['Поиск по проверенным документам, саммари и материалы для обучения.', 'Поиск по проверенным документам, краткие обзоры и материалы для обучения.'],
  ['создаёт саммари, тесты и материалы для разного уровня подготовки.', 'создаёт краткие обзоры, тесты и материалы для разного уровня подготовки.'],
  ['На выходе: система для использования', 'На выходе: система, готовая к работе'],
];
for (const [before, after] of wording) html = html.replaceAll(before, after);
html = html.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/g, heading => heading.replaceAll('.', ''));
html = html.replace('<strong>ERP · BI · AI</strong>', '<strong class="domain-cycle"><span class="domain-word">ERP</span> · <span class="domain-word">BI</span> · <span class="domain-word">AI</span></strong>');
// Apply nonbreaking spaces only to visible HTML text, never to scripts or URLs.
html = html.replace(/(<script\b[\s\S]*?<\/script>)|>([^<]+)</g, (match, script, text) => {
  if (script) return script;
  return '>' + text.replace(/(^|[\s])([вксоуаиВКСОУАИЯя]) /g, '$1$2\u00a0').replace(/ — /g, '\u00a0— ') + '<';
});
writeFileSync(file('constructor.html'), html);
