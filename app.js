const examples={knowledge:{input:'Документы<br>компании',output:'Ответ<br>и источники',note:'Можно проверить каждый вывод',caption:'Найти нужное в документах и проверить источник ответа.',index:'01 / 03'},documents:{input:'Банковская<br>выписка',output:'Разобранные<br>операции',note:'Неоднозначное проверяет человек',caption:'Разобрать операции и передать спорные случаи на проверку.',index:'02 / 03'},analytics:{input:'Данные<br>сайта',output:'Понятная<br>аналитика',note:'Объяснения на основе показателей',caption:'Увидеть изменения показателей и разобраться в причинах.',index:'03 / 03'}};
const scene=document.querySelector('.scene');
const sceneButtons=[...document.querySelectorAll('[data-scene]')];
let scenarioIndex=0;
let scenarioTimer;
let scenarioVisible=false;
const scenarioMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function selectScenario(index, automatic=false){
 scenarioIndex=index;
 const button=sceneButtons[index];
 const item=examples[button.dataset.scene];
 sceneButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('.input-title').innerHTML=item.input;
 document.querySelector('.output-title').innerHTML=document.body.classList.contains('clay')?item.output.replace('<br>',' '):item.output;
 const note=document.querySelector('.output-note'); if(note)note.textContent=item.note;
 const caption=document.querySelector('.scenario-caption');
 caption.setAttribute('aria-live',automatic?'off':'polite');
 caption.textContent=item.caption;
 document.querySelector('.scene-number').textContent=item.index;
 if(!scenarioMotion.matches){
  document.querySelector('.assembly')?.getAnimations({subtree:true}).forEach(animation=>{animation.currentTime=0;});
 }
}
function scheduleScenario(){
 clearTimeout(scenarioTimer);
 if(!scenarioVisible||document.hidden||scenarioMotion.matches||sceneButtons.length<2)return;
 scenarioTimer=setTimeout(()=>{selectScenario((scenarioIndex+1)%sceneButtons.length,true);scheduleScenario();},7000);
}
sceneButtons.forEach((button,index)=>button.addEventListener('click',()=>{selectScenario(index);scheduleScenario();}));
new IntersectionObserver(entries=>{scenarioVisible=entries[0].isIntersecting;scheduleScenario();},{threshold:0.25}).observe(document.querySelector('.hero-visual'));
document.addEventListener('visibilitychange',scheduleScenario);
scenarioMotion.addEventListener('change',scheduleScenario);
const visibility=new IntersectionObserver(entries=>{scene.classList.toggle('offscreen',!entries[0].isIntersecting);},{threshold:0});visibility.observe(scene);
const projects=JSON.parse(document.querySelector('#project-data').textContent);
const dialog=document.querySelector('.project-dialog');let opener;
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{const p=projects.find(x=>x.id===button.dataset.project);opener=button;dialog.querySelector('h2').textContent=p.type;dialog.querySelector('.dialog-description').textContent=p.detail;dialog.querySelector('.dialog-note').textContent=p.id==='bugflow'?'На странице проекта есть материалы жюри, презентация и описание ограничений демо.':'Подробная страница на действующем сайте пока готовится. Демонстрацию можно обсудить напрямую с Галиной.';const link=dialog.querySelector('.dialog-link');link.href=p.id==='bugflow'?p.url:'https://t.me/GalaErsh';link.textContent=p.id==='bugflow'?'Открыть страницу проекта ↗':'Обсудить демонстрацию ↗';dialog.showModal();}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>opener?.focus());
