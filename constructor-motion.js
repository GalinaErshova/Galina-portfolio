// Replay assembly on scenario selection, preserving the user's pause choice.
document.querySelectorAll('[data-scene]').forEach(button => {
  button.addEventListener('click', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelector('.assembly').getAnimations({subtree:true}).forEach(animation => {
      animation.currentTime = 0;
    });
  });
});
const motionScene = document.querySelector('.scene');
const experience = document.querySelector('.experience');
const syncDomainPause = () => {
  const paused = motionScene.classList.contains('paused');
  experience.classList.toggle('domains-paused', paused);
  document.body.classList.toggle('motion-paused', paused);
};
new MutationObserver(syncDomainPause).observe(motionScene, {attributes:true, attributeFilter:['class']});
syncDomainPause();
