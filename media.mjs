import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
let html = source
  .replace('<title>01 · От задачи к решению | Галина Ершова</title>', '<title>05 · MediaSphera Navy | Галина Ершова</title>')
  .replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="media.css">')
  .replace('<body class="blue">', '<body class="media">')
  .replace('<a href="index.html" aria-current="page">01 · Синий</a><a href="constructor.html" >03 · Терракотовый</a>', '<a href="index.html">01 · Синий</a><a href="constructor.html">03 · Терракотовый</a><a href="green.html">04 · Зелёный</a><a href="media.html" aria-current="page">05 · Navy</a>');

const updates = [
  ['Разрабатываю сервисы, автоматизацию и аналитику с AI для малого и среднего бизнеса.', 'Разрабатываю IT-решения для малого и среднего бизнеса: автоматизацию, аналитику и сервисы с AI.</p><p class="hero-expertise">Опираюсь на опыт работы с ERP и BI, финансовыми данными и сложными бизнес-процессами.'],
  ['<div class="experience wrap"><p>Бизнес-процессы, данные<br>и разработка в одной практике</p><div><strong>15+</strong><span>лет в IT</span></div><div><strong>3+</strong><span>года в AI/ML</span></div><div><strong>5+</strong><span>проектов с AI</span></div></div>', '<div class="experience wrap"><div class="experience-years"><strong>15+</strong><span>лет в IT</span></div><div class="experience-projects"><strong>20+</strong><span>IT-проектов с моим участием<small>В том числе 5+ с AI-составляющей</small></span></div><div class="experience-domains"><strong>ERP · BI · AI</strong><span>Учёт, аналитика и автоматизация</span></div></div>'],
  ['Хорошее решение начинается с понятной задачи.<br>Вот с чем я могу помочь.', 'Разбираюсь в том, как связаны процессы, финансы и данные. Помогаю превратить эту картину в требования к работающей системе.'],
  ['Знания разбросаны по документам</h3><p>Поиск, ответы с источниками и помощники для сотрудников.', 'Процессы и системы не связаны</h3><p>Интеграции, автоматизация обмена данными и сокращение ручных операций.'],
  ['Рутина отнимает время команды</h3><p>Обработка документов и автоматизация повторяющихся операций.', 'Данные есть. Управленческой картины нет.</h3><p>BI-аналитика, финансовые и операционные показатели, понятная отчётность.'],
  ['Данные есть. Ясной картины нет.</h3><p>Показатели, BI-интерфейсы и объяснения на основе данных.', 'Документы и знания трудно использовать</h3><p>Поиск, обработка информации и AI-помощники с проверяемыми ответами.'],
  ['Сервис под ваш процесс, с интеграциями и нужными AI-функциями.', 'Разработка сервиса с нужной бизнес-логикой, интеграциями и AI-функциями.'],
  ['Собственные проекты и демонстрационные решения.</p>', 'Собственные проекты и демонстрационные решения.</p><div class="experience-context"><h3>За разработкой — опыт в ERP и BI</h3><p>Работа с учётными системами, финансовыми данными и аналитикой помогает мне видеть процесс целиком: от исходной операции до показателя, на который опирается решение.</p><a class="text-link" href="https://galaershova.ru/resume/" target="_blank" rel="noopener">Опыт и роли в проектах ↗</a></div>'],
  ['Лично разбираюсь в процессе, проектирую решение и проверяю его на рабочих сценариях.', 'Опыт ERP и BI помогает мне связать требования бизнеса, логику учёта и данные. Лично проектирую решение и проверяю его на рабочих сценариях.'],
  ['Определяем задачу, данные и ограничения. Выбираем, какой результат будет полезен.', 'Разбираем процесс, финансовую логику, данные и связи между системами. Определяем задачу, ограничения и критерии полезного результата.'],
];
for (const [before, after] of updates) {
  if (!html.includes(before)) throw new Error(`Missing content: ${before}`);
  html = html.replace(before, after);
}
writeFileSync(new URL('./media.html', import.meta.url), html);
