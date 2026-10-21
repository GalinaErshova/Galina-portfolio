const processRoot = document.querySelector('.project-process');
const processData = [
  ['01 / РАЗОБРАТЬСЯ','Определяем, какую задачу решать','Разбираю процесс, пользователей, данные и ограничения. Вместе фиксируем, по каким признакам решение будет полезным. Отделяем реальную потребность от симптомов и определяем точку, где AI действительно поможет.','Карта задачи и критерии проверки'],
  ['02 / ПРОВЕРИТЬ','Проверяем идею на практике','Собираю прототип или аналитический контур и испытываю ключевые сценарии на доступных данных. Так проверяем идею до дорогой разработки и видим, чего не хватает для следующего шага.','Рабочая проверка и выводы по гипотезе'],
  ['03 / ВСТРОИТЬ','Соединяем решение с работой команды','Продумываю интеграции, роли, обработку ошибок и понятный путь пользователя. Решение встраивается в рабочий процесс, а не существует отдельно от команды. Сразу закладываю возможность измерять результат.','Система в контексте процесса'],
  ['04 / ПОДТВЕРДИТЬ','Фиксируем качество и ограничения','Проверяем поведение на реальных примерах, документируем границы решения и согласуем запуск. Фиксируем, где система работает уверенно, а где нужен человек или дополнительная проверка.','Результаты проверки и решение о запуске'],
  ['05 / СОПРОВОЖДАТЬ','Делаем тестирование великим опять','Наблюдаем за работой решения, разбираем ошибки и обратную связь. Приоритеты изменений определяем по пользе для команды. Поддерживаю и развиваю продукт вместе с изменением потребностей бизнеса.','План улучшений и обновлённое решение']
];
const processText = text => text.replace(/(^|\s)([вксоуаиВКСОУАИЯя]) /g, '$1$2\u00a0');
let processIndex = 0;
function selectProcessStep(index, automatic = false) {
  processIndex = index;
  processRoot.querySelector('.pm-detail').setAttribute('aria-live', automatic ? 'off' : 'polite');
  const data = processData[index];
  processRoot.querySelectorAll('.pm-step').forEach((step,i) => {
    step.classList.toggle('is-active',i === index);
    step.setAttribute('aria-pressed',String(i === index));
  });
  processRoot.querySelector('.pm-route-progress').style.width = `${index / 4 * 100}%`;
  processRoot.style.setProperty('--process-progress', `${index / 4 * 100}%`);
  ['.pm-detail-index','.pm-detail h3','.pm-detail p','.pm-output strong'].forEach((selector,i) => {
    processRoot.querySelector(selector).textContent = processText(data[i]);
  });
}
const processMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let processTimer;
let processVisible = false;
let processIdleUntil = 0;
function scheduleProcess() {
  clearTimeout(processTimer);
  if (!processVisible || document.hidden || processMotion.matches || document.body.classList.contains('motion-paused')) return;
  processTimer = setTimeout(() => {
    selectProcessStep((processIndex + 1) % processData.length, true);
    scheduleProcess();
  }, Math.max(6000, processIdleUntil - Date.now()));
}
function delayProcess() {
  processIdleUntil = Date.now() + 12000;
  scheduleProcess();
}
processRoot.querySelectorAll('.pm-step').forEach(button => button.addEventListener('click', () => {
  selectProcessStep(Number(button.dataset.processStep));
  delayProcess();
}));
processRoot.addEventListener('pointerdown', delayProcess);
processRoot.addEventListener('keydown', delayProcess);
new IntersectionObserver(entries => {
  processVisible = entries[0].isIntersecting;
  scheduleProcess();
}, {threshold:0.25}).observe(processRoot);
document.addEventListener('visibilitychange', scheduleProcess);
processMotion.addEventListener('change', scheduleProcess);
new MutationObserver(scheduleProcess).observe(document.body, {attributes:true,attributeFilter:['class']});
