// Выбор решения, описание и автоперебор используют одно состояние.
(() => {
  const section = document.querySelector('#solutions');
  if (!section) return;
  const list = section.querySelector('.solution-list');
  const rows = [...list.querySelectorAll('.solution-row')];
  const detail = section.querySelector('.solution-detail');
  const pause = section.querySelector('.solution-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions = [
    ['ПРОЦЕССЫ И СИСТЕМЫ', 'Убрать ручную передачу данных', 'Разбираю, как информация проходит между учётной системой, таблицами и сервисами: где её вводят повторно, что теряется и какие действия задерживают работу. На этой основе определяем, какие обмены и операции стоит автоматизировать.', 'выберем один процесс и опишем путь данных, участников и точки проверки.'],
    ['ДАННЫЕ И АНАЛИТИКА', 'Собрать понятную картину бизнеса', 'Выясняю, на какие вопросы должна отвечать отчётность и какие данные для этого доступны. Согласуем смысл показателей, проверим источники и свяжем цифры с процессами, чтобы видеть отклонения и разбираться в их причинах.', 'возьмём один управленческий вопрос и определим нужные показатели и источники.'],
    ['ДОКУМЕНТЫ И ЗНАНИЯ', 'Находить ответы и проверять источники', 'Разбираю, где хранятся материалы, как сотрудники ищут информацию и что приходится обрабатывать вручную. Подбираем подход: поиск по базе знаний, извлечение данных из документов или AI-помощник с ответами, которые можно сверить с источником.', 'выберем типовой вопрос или документ и проверим подход на ваших примерах.'],
    ['РАБОЧИЙ ИНСТРУМЕНТ', 'Собрать сервис под ваш процесс', 'Когда готовые продукты не закрывают задачу, проектирую отдельный инструмент: с нужными действиями, правилами расчёта и связями с существующими системами. AI добавляем там, где его пользу можно проверить на конкретном сценарии.', 'опишем основной рабочий сценарий и проверим его в небольшом прототипе.'],
  ];
  let active = 0;
  let paused = false;
  let visible = false;
  let timer;
  const interval = Number(list.dataset.interval);
  function select(index) {
    active = index;
    rows.forEach((row, i) => {
      row.classList.toggle('is-active', i === index);
      row.setAttribute('aria-pressed', String(i === index));
    });
    const [label, title, text, result] = descriptions[index];
    detail.querySelector('.solution-detail-label').textContent = `${String(index + 1).padStart(2, '0')} / ${label}`;
    detail.querySelector('h3').textContent = title;
    detail.querySelector('.solution-detail-text').textContent = text;
    detail.querySelector('.solution-detail-result').replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = 'С чего начнём: ';
    detail.querySelector('.solution-detail-result').append(strong, result);
  }
  function schedule() {
    clearTimeout(timer);
    if (paused || reduced.matches || document.hidden || !visible) return;
    timer = setTimeout(() => {
      select((active + 1) % rows.length);
      schedule();
    }, interval);
  }
  rows.forEach((row, index) => {
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.setAttribute('aria-controls', 'solution-detail');
    row.addEventListener('click', () => { select(index); schedule(); });
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        row.click();
      }
    });
  });
  pause.hidden = false;
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Продолжить смену' : 'Приостановить смену';
    schedule();
  });
  function syncMotion() {
    pause.hidden = reduced.matches;
    schedule();
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.15 }).observe(section);
  section.classList.add('solutions-interactive');
  select(0);
  syncMotion();
})();
