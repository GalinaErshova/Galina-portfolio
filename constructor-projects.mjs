export function refineProjects(html) {
  html = html.replace('<link rel="stylesheet" href="constructor-motion.css">', '<link rel="stylesheet" href="constructor-motion.css"><link rel="stylesheet" href="constructor-projects.css">');
  html = html.replace(/(<div class="solution-list">)([\s\S]*?)(<\/div><\/section>)/, (_, open, rows, close) => open + rows
    .replace(/<a href="[^"]*">/g, '<article class="solution-row">')
    .replaceAll('</a>', '</article>')
    .replace(/<span class="row-arrow"[^>]*>[\s\S]*?<\/span>/g, '') + close);
  html = html.replace(/<a class="text-link"[^>]*>Опыт и роли в проектах ↗<\/a>/, '');
  html = html.replace(/(<section class="projects section"[\s\S]*?<div class="section-intro">)([\s\S]*?)(<div class="experience-context">[\s\S]*?<\/div>)(<\/div><div class="project-grid">)/,
    (_, open, title, context, end) => open + '<div class="projects-heading">' + title + '</div>' + context + end);
  html = html.replace(/(<article class="project project-bugflow">[\s\S]*?)<span class="flow-node">Тест<\/span>/,
    '$1<a class="flow-node demo-node" href="https://demo.bugflow.tools01.ru/" target="_blank" rel="noopener" aria-label="Тест — открыть демо BugFlow AI">Тест ↗</a>');
  html = html.replace(/(<button class="text-link" data-project="bugflow"[\s\S]*?<\/button>)/,
    '$1<a class="text-link project-demo" href="https://demo.bugflow.tools01.ru/" target="_blank" rel="noopener">Открыть демо ↗</a>');
  const projects = [
    {id:'recommendations', number:'04', type:'Рекомендательная система', status:'Разбор проекта', title:'Связанные материалы с понятным основанием', text:'Связи между документами, объяснение рекомендаций и граф для проверки экспертом. Для баз знаний и контентных архивов.', flow:['Документы','Связи','Рекомендации'], url:'https://galaershova.ru/projects/recommendations/', link:'Посмотреть проект'},
    {id:'proposal', number:'05', type:'Составление КП · Deal Copilot', status:'Локальный прототип', title:'От требований заказчика к расчёту и КП', text:'AI извлекает требования из документов. Система рассчитывает трудозатраты, себестоимость и маржу, а затем формирует коммерческое предложение на основе подтверждённых данных.', flow:['Требования','Расчёт','КП'], url:'mailto:galaershova@yandex.ru?subject=Демонстрация%20Deal%20Copilot', link:'Запросить демонстрацию'},
  ];
  const cards = projects.map(p => `<article class="project project-${p.id}"><div class="project-art art-${p.id}" aria-label="Схема проекта ${p.type}"><span class="art-caption">${p.type}</span><div class="project-flow">${p.flow.map(label => `<span class="flow-node">${label}</span>`).join('<span class="flow-arrow" aria-hidden="true">↗</span>')}</div><span class="art-number" aria-hidden="true">${p.number}</span></div><div class="project-copy"><div class="project-meta"><span>${p.type}</span><span>${p.status}</span></div><h3>${p.title}</h3><p>${p.text}</p><a class="text-link" href="${p.url}"${p.url.startsWith('https:') ? ' target="_blank" rel="noopener"' : ''}>${p.link} ↗</a></div></article>`).join('');
  html = html.replace(/(<\/div><\/div><\/section>\s*<section class="approach)/, cards + '$1');
  return html;
}
