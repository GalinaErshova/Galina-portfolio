const motionScene = document.querySelector('.scene');
const experience = document.querySelector('.experience');
const syncDomainPause = () => {
  const paused = motionScene.classList.contains('paused');
  experience.classList.toggle('domains-paused', paused);
  document.body.classList.toggle('motion-paused', paused);
};
new MutationObserver(syncDomainPause).observe(motionScene, {attributes:true, attributeFilter:['class']});
syncDomainPause();
