(function() {
    // iconttv 플래그 검사
    const iconttv = window.__iconttv;
  
    window.postMessage({ type: 'iconttv', variable: iconttv }, '*');
  })();