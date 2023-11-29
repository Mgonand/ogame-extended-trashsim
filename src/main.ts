function init() {
  const src = chrome.runtime.getURL('./content/index.js');
  const s = document.createElement('script');
  s.type = 'module';
  s.src = src;
  s.onload = function () {
    s.parentNode?.removeChild(s);
  };
  try {
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {
    console.log(e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('DOMContentLoaded', init);
