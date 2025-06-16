// main.js
import initFlow from './initFlow.js';
import setupFormSubmit from './formSubmit.js';
import { setupImageFix } from './imageFix.js';

// Start logica
setupImageFix();
initFlow();
setupFormSubmit();

// ✅ SwipePages patch → voorkom fout bij ongeldige href in URL() calls
(function () {
  const OriginalURL = window.URL;

  window.URL = function (url, base) {
    try {
      return new OriginalURL(url, base || window.location.origin);
    } catch (err) {
      console.warn("🔁 URL-fout opgevangen (Swipe Pages patch):", url);
      // Retourneer een tijdelijke geldige URL om verdere fouten te voorkomen
      return new OriginalURL('https://fallback.url');
    }
  };

  window.URL.prototype = OriginalURL.prototype;
})();

// ✅ Intercepteer clicks op <a href="#"> om redirect-bug te voorkomen
document.addEventListener('click', function (e) {
  const target = e.target.closest('a');
  if (target && target.getAttribute('href') === '#') {
    e.preventDefault();
    console.warn('⚠️ Click op <a href="#"> geblokkeerd om redirect-bug te voorkomen');
  }
});
