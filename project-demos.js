const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const walk = document.querySelector('.walk-print');
const motionButton = walk.querySelector('.motion-switch');
const paths = Array.from(walk.querySelectorAll('img[data-animation]'));
const stills = paths.map(image => image.getAttribute('src'));
let animate = !motionPreference.matches;

function renderWalk() {
  const selected = walk.querySelector('#many-walks').checked ? 0 : 1;
  paths.forEach((image, index) => {
    const source = animate && index === selected ? image.dataset.animation : stills[index];
    if (image.getAttribute('src') !== source) image.src = source;
  });
  motionButton.textContent = animate ? 'Show still' : 'Animate paths';
}

motionButton.hidden = false;
motionButton.addEventListener('click', () => {
  animate = !animate;
  renderWalk();
});
walk.addEventListener('change', renderWalk);
motionPreference.addEventListener('change', () => {
  animate = !motionPreference.matches;
  renderWalk();
});
renderWalk();

const video = document.querySelector('.epigram-demos video');
const demoLinks = document.querySelectorAll('.demo-picker a');
let videoVisible = false;
let resumeOnReturn = true;

for (const link of demoLinks) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (video.src !== link.href) {
      for (const item of demoLinks) item.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      video.poster = link.href.replace(/\.mp4$/, '.webp');
      video.src = link.href;
      video.setAttribute('aria-label', 'Epigram walkthrough: ' + link.textContent);
    }
    video.play().catch(() => {}); // Native controls remain available when autoplay is blocked.
  });
}
function startPreview() {
  if (!motionPreference.matches && resumeOnReturn) video.play().catch(() => {});
}

motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) {
    video.pause();
  } else if (videoVisible) {
    startPreview();
  }
});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    if (visible === videoVisible) return;
    videoVisible = visible;
    if (visible) {
      startPreview();
    } else {
      resumeOnReturn = !video.paused;
      video.pause();
    }
  }, { threshold: [0, 0.25] }).observe(video);
} else {
  startPreview();
}

const tourDialog = document.querySelector('.tour-dialog');
if (tourDialog && typeof tourDialog.showModal === 'function') {
  const tourImage = tourDialog.querySelector('img');
  const tourTitle = tourDialog.querySelector('h2');
  const original = tourDialog.querySelector('.original-media');
  const mediaLinks = document.querySelectorAll('a[data-tour], #work figure a[href$=".webp"]');
  for (const link of mediaLinks) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const preview = link.closest('figure')?.querySelector('img');
      const projectTitle = link.closest('article')?.querySelector('h4')?.textContent;
      tourTitle.textContent = link.dataset.tour || projectTitle || 'Project figure';
      original.href = link.href;
      tourImage.src = link.href;
      tourImage.alt = link.dataset.tour || preview?.alt || tourTitle.textContent;
      tourDialog.showModal();
    });
  }
  tourDialog.addEventListener('close', () => { tourImage.removeAttribute('src'); });
}
