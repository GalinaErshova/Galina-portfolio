// Direct variant URLs keep the same page content for palette-only A/B tests.
const palette = new URLSearchParams(window.location.search).get('palette');
if (['blue', 'green', 'navy'].includes(palette)) {
  document.body.dataset.palette = palette;
}
