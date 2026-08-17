(function () {
  "use strict";
  window.NARUTO_V23_DATA = window.NARUTO_V23_DATA || {};

  function appendRuntimeVisuals() {
    if (document.querySelector('script[data-r34-runtime-visuals]')) return;
    var script = document.createElement("script");
    script.src = "r34-runtime-visuals.js?v=r34";
    script.async = false;
    script.dataset.r34RuntimeVisuals = "1";
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.write('<script src="asset-resolver.js?v=r34"></script>');
    window.addEventListener("DOMContentLoaded", appendRuntimeVisuals, { once: true });
  } else {
    var resolverScript = document.createElement("script");
    resolverScript.src = "asset-resolver.js?v=r34";
    resolverScript.async = false;
    resolverScript.addEventListener("load", appendRuntimeVisuals, { once: true });
    document.head.appendChild(resolverScript);
  }
})();
