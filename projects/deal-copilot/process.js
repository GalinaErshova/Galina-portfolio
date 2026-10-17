const processList = document.querySelector('.process-list');
const processSteps = [...processList.querySelectorAll('article')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentStep = 0;
let visible = false;
let timer;

function scheduleStep() {
  clearTimeout(timer);
  if (!visible || document.hidden || reducedMotion.matches || processList.matches(':hover')) return;
  timer = setTimeout(() => {
    processSteps[currentStep].classList.remove('is-active');
    currentStep = (currentStep + 1) % processSteps.length;
    processSteps[currentStep].classList.add('is-active');
    scheduleStep();
  }, 6000);
}

new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  scheduleStep();
}, {threshold: .25}).observe(processList);
document.addEventListener('visibilitychange', scheduleStep);
reducedMotion.addEventListener('change', scheduleStep);
processList.addEventListener('pointerenter', scheduleStep);
processList.addEventListener('pointerleave', scheduleStep);
