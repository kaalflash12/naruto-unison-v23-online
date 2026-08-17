(function () {
  "use strict";

  var resolver = window.NarutoAssetResolver;
  if (!resolver || !document || !document.documentElement) return;

  var STYLE_ID = "r34-runtime-visuals-style";
  var OVERLAY_ID = "r34-training-overlay";
  var STORAGE_KEY = "naruto:r34:minigames";
  var repaired = typeof WeakSet !== "undefined" ? new WeakSet() : null;
  var observer = null;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".r34-train-btn{border:1px solid rgba(255,255,255,.25);background:#7b1d20;color:#fff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)}",
      ".r34-train-fixed{position:fixed;right:18px;bottom:18px;z-index:8998}",
      "#"+OVERLAY_ID+"{position:fixed;inset:0;z-index:99999;background:rgba(7,7,10,.86);display:flex;align-items:center;justify-content:center;padding:18px}",
      "#"+OVERLAY_ID+"[hidden]{display:none}",
      ".r34-training-panel{width:min(820px,96vw);max-height:92vh;overflow:auto;background:#17171c;color:#f4f4f6;border:1px solid #555561;border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.55);padding:22px;font-family:Arial,sans-serif}",
      ".r34-training-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between}.r34-training-head h2{margin:0 0 6px}.r34-training-head p{margin:0;color:#c9c9d1}",
      ".r34-close{font-size:26px;line-height:1;width:42px;height:42px;border-radius:50%;border:1px solid #666;background:#292930;color:#fff;cursor:pointer}",
      ".r34-game-tabs{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.r34-game-tabs button,.r34-game button{background:#74191b;color:#fff;border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}",
      ".r34-game-tabs button[aria-selected=true]{outline:3px solid #f0be58}",
      ".r34-game{background:#222229;border:1px solid #474750;border-radius:14px;padding:18px;min-height:250px}.r34-game h3{margin-top:0}",
      ".r34-meter{position:relative;height:54px;border-radius:14px;background:linear-gradient(90deg,#32323b,#202026);overflow:hidden;border:1px solid #555;margin:28px 0}",
      ".r34-zone{position:absolute;top:0;bottom:0;background:rgba(92,190,105,.58);border-left:2px solid #86ee91;border-right:2px solid #86ee91}",
      ".r34-marker{position:absolute;top:-2px;bottom:-2px;width:5px;background:#fff;box-shadow:0 0 9px #fff;transform:translateX(-50%)}",
      ".r34-result{font-size:19px;font-weight:800;min-height:30px}.r34-help{color:#c9c9d1}.r34-best{margin-top:10px;color:#f0be58;font-weight:700}",
      ".r34-shuriken-field{position:relative;height:min(48vh,360px);min-height:280px;border:1px solid #555;border-radius:14px;overflow:hidden;background:radial-gradient(circle at center,#3b2b25 0 16%,#d5d0bf 16% 25%,#7b1d20 25% 35%,#d5d0bf 35% 45%,#2c2c32 45% 100%);cursor:crosshair;user-select:none}",
      ".r34-target{position:absolute;width:68px;height:68px;border-radius:50%;border:5px solid #fff;background:radial-gradient(circle,#77191c 0 22%,#fff 23% 43%,#77191c 44% 63%,#fff 64%);box-shadow:0 4px 18px rgba(0,0,0,.45);transform:translate(-50%,-50%)}",
      ".r34-scoreline{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0;font-weight:800}",
      "@media(max-width:600px){.r34-training-panel{padding:15px}.r34-shuriken-field{min-height:240px}.r34-train-fixed{right:10px;bottom:10px}}"
    ].join("");
    document.head.appendChild(style);
  }

  function textOf(el) {
    var parts = [];
    if (!el) return "";
    ["alt", "title", "data-name", "data-label", "data-entity", "data-skill", "data-npc", "data-jutsu"].forEach(function (attr) {
      var value = el.getAttribute && el.getAttribute(attr);
      if (value) parts.push(value);
    });
    if (el.dataset) {
      ["name", "label", "entity", "skill", "npc", "jutsu", "character"].forEach(function (key) {
        if (el.dataset[key]) parts.push(el.dataset[key]);
      });
    }
    var parent = el.closest && el.closest("article,section,li,.card,.character,.char,.npc,.jutsu,.skill,.dialog,.modal,button");
    if (parent && parent.textContent) parts.push(parent.textContent.slice(0, 180));
    return parts.join(" | ").trim();
  }

  function applyResolved(img, resolved, broken) {
    if (!resolved || !resolved.src) return false;
    if (img.src === resolved.src || img.getAttribute("src") === resolved.src) return false;
    img.dataset.r34Repairing = "1";
    img.setAttribute("src", resolved.src);
    img.dataset.r34Repaired = resolved.resolved ? "semantic" : "missing";
    if (resolved.resolved) resolver.report.domReplacements += 1;
    else resolver.report.domUnresolved += 1;
    if (broken) resolver.report.brokenImages += 1;
    setTimeout(function () { delete img.dataset.r34Repairing; }, 0);
    return true;
  }

  function repairImage(img, broken) {
    if (!img || img.nodeType !== 1 || img.tagName !== "IMG") return;
    if (img.dataset && img.dataset.r34Repairing === "1") return;
    if (img.closest && img.closest(".authBrand,.gameLogoBlock")) return;
    if (resolver.normalize(img.getAttribute("alt") || "") === "naruto unison pt br") return;
    var rawSrc = img.getAttribute("src") || "";
    if (!broken && rawSrc && !resolver.isGeneric(rawSrc)) {
      if (repaired) repaired.add(img);
      return;
    }
    var text = textOf(img);
    var semantic = resolver.resolveText(text, rawSrc);
    var resolved = semantic || resolver.resolveImage({ text: text, name: text, src: rawSrc });
    if (!resolved && text) resolved = { src: resolver.placeholder(text.slice(0, 60)), resolved: false };
    if (applyResolved(img, resolved, broken) && repaired) repaired.add(img);
  }

  function scan(root) {
    if (!root) return;
    if (root.tagName === "IMG") repairImage(root, false);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll("img"), function (img) { repairImage(img, false); });
  }

  function observeImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") repairImage(target, true);
    }, true);
    if (typeof MutationObserver === "undefined") return;
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (node && node.nodeType === 1) scan(node);
        });
        if (mutation.type === "attributes" && mutation.target && mutation.target.tagName === "IMG") repairImage(mutation.target, false);
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "alt", "title"] });
  }

  function readBest() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}; } catch (_) { return {}; }
  }

  function saveBest(game, score, grade) {
    var best = readBest();
    if (!best[game] || Number(score) > Number(best[game].score || 0)) {
      best[game] = { score: Math.round(score), grade: grade, at: new Date().toISOString() };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(best)); } catch (_) {}
    }
    return best;
  }

  function grade(score) {
    if (score >= 95) return "S";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 50) return "C";
    return "D";
  }

  function announceComplete(game, score, resultGrade) {
    saveBest(game, score, resultGrade);
    try {
      window.dispatchEvent(new CustomEvent("naruto:minigame:complete", { detail: { game: game, score: Math.round(score), grade: resultGrade } }));
    } catch (_) {}
  }

  function chakraGame(container) {
    container.innerHTML = '<h3>Controle de Chakra</h3><p class="r34-help">Pare o marcador o mais perto possível do centro da zona verde. Clique no medidor ou pressione ESPAÇO.</p><div class="r34-meter" tabindex="0" role="button" aria-label="Parar marcador"><div class="r34-zone"></div><div class="r34-marker"></div></div><div class="r34-result">Preparando...</div><button class="r34-replay">RECOMEÇAR</button><div class="r34-best"></div>';
    var meter = container.querySelector(".r34-meter");
    var zone = container.querySelector(".r34-zone");
    var marker = container.querySelector(".r34-marker");
    var result = container.querySelector(".r34-result");
    var bestText = container.querySelector(".r34-best");
    var running = false;
    var raf = 0;
    var start = 0;
    var target = 35 + Math.random() * 30;
    var zoneWidth = 18;
    zone.style.left = (target - zoneWidth / 2) + "%";
    zone.style.width = zoneWidth + "%";

    function showBest() {
      var best = readBest().chakra;
      bestText.textContent = best ? "Melhor: " + best.score + " • Grau " + best.grade : "Melhor: ainda não registrado";
    }

    function frame(ts) {
      if (!running) return;
      if (!start) start = ts;
      var t = (ts - start) / 1150;
      var position = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) * 50;
      marker.style.left = position + "%";
      marker.dataset.position = String(position);
      raf = requestAnimationFrame(frame);
    }

    function restart() {
      cancelAnimationFrame(raf);
      target = 35 + Math.random() * 30;
      zone.style.left = (target - zoneWidth / 2) + "%";
      result.textContent = "Valendo...";
      start = 0;
      running = true;
      raf = requestAnimationFrame(frame);
      meter.focus();
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      var position = Number(marker.dataset.position || 0);
      var distance = Math.abs(position - target);
      var score = Math.max(0, 100 - distance * 4.5);
      var g = grade(score);
      result.textContent = "Pontuação: " + Math.round(score) + " • Grau " + g;
      announceComplete("chakra", score, g);
      showBest();
    }

    meter.addEventListener("click", stop);
    meter.addEventListener("keydown", function (event) {
      if (event.code === "Space" || event.key === " ") { event.preventDefault(); stop(); }
    });
    container.querySelector(".r34-replay").addEventListener("click", restart);
    showBest();
    restart();
    return function cleanup() { running = false; cancelAnimationFrame(raf); };
  }

  function shurikenGame(container) {
    container.innerHTML = '<h3>Treino de Shuriken</h3><p class="r34-help">Acerte o alvo móvel. São 10 lançamentos; rapidez e precisão aumentam a pontuação.</p><div class="r34-scoreline"><span class="r34-throws">Lançamentos: 0/10</span><span class="r34-hits">Acertos: 0</span><span class="r34-points">Pontos: 0</span></div><div class="r34-shuriken-field" tabindex="0"><button class="r34-target" aria-label="Alvo"></button></div><div class="r34-result"></div><button class="r34-replay">RECOMEÇAR</button><div class="r34-best"></div>';
    var field = container.querySelector(".r34-shuriken-field");
    var target = container.querySelector(".r34-target");
    var throwsText = container.querySelector(".r34-throws");
    var hitsText = container.querySelector(".r34-hits");
    var pointsText = container.querySelector(".r34-points");
    var result = container.querySelector(".r34-result");
    var bestText = container.querySelector(".r34-best");
    var throwsCount = 0;
    var hits = 0;
    var points = 0;
    var active = false;
    var lastMoveAt = 0;

    function showBest() {
      var best = readBest().shuriken;
      bestText.textContent = best ? "Melhor: " + best.score + " • Grau " + best.grade : "Melhor: ainda não registrado";
    }

    function moveTarget() {
      var x = 10 + Math.random() * 80;
      var y = 14 + Math.random() * 72;
      target.style.left = x + "%";
      target.style.top = y + "%";
      lastMoveAt = performance.now();
    }

    function update() {
      throwsText.textContent = "Lançamentos: " + throwsCount + "/10";
      hitsText.textContent = "Acertos: " + hits;
      pointsText.textContent = "Pontos: " + Math.round(points);
    }

    function finish() {
      active = false;
      target.hidden = true;
      var normalized = Math.min(100, points / 10);
      var g = grade(normalized);
      result.textContent = "Treino concluído: " + Math.round(normalized) + " • Grau " + g;
      announceComplete("shuriken", normalized, g);
      showBest();
    }

    function throwAt(hit) {
      if (!active) return;
      throwsCount += 1;
      if (hit) {
        hits += 1;
        var reaction = Math.max(0, performance.now() - lastMoveAt);
        points += Math.max(45, 110 - reaction / 18);
      }
      update();
      if (throwsCount >= 10) finish(); else moveTarget();
    }

    target.addEventListener("click", function (event) { event.stopPropagation(); throwAt(true); });
    field.addEventListener("click", function () { throwAt(false); });

    function restart() {
      throwsCount = 0; hits = 0; points = 0; active = true; target.hidden = false; result.textContent = "Valendo..."; update(); moveTarget(); field.focus();
    }
    container.querySelector(".r34-replay").addEventListener("click", restart);
    showBest();
    restart();
    return function cleanup() { active = false; };
  }

  var cleanupGame = null;
  var lastFocus = null;

  function createOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "r34-training-title");
    overlay.innerHTML = '<div class="r34-training-panel"><div class="r34-training-head"><div><h2 id="r34-training-title">Treino Ninja</h2><p>Minigames de prática. Eles não alteram PV, Chakra, dano, inventário nem outras regras TERION.</p></div><button class="r34-close" aria-label="Fechar">×</button></div><div class="r34-game-tabs" role="tablist"><button data-game="chakra" role="tab" aria-selected="true">CONTROLE DE CHAKRA</button><button data-game="shuriken" role="tab" aria-selected="false">SHURIKEN</button></div><div class="r34-game" id="r34-game-host"></div></div>';
    document.body.appendChild(overlay);

    function selectGame(game) {
      if (cleanupGame) cleanupGame();
      Array.prototype.forEach.call(overlay.querySelectorAll("[data-game]"), function (button) {
        button.setAttribute("aria-selected", button.dataset.game === game ? "true" : "false");
      });
      var host = overlay.querySelector("#r34-game-host");
      cleanupGame = game === "shuriken" ? shurikenGame(host) : chakraGame(host);
    }

    function close() {
      overlay.hidden = true;
      if (cleanupGame) { cleanupGame(); cleanupGame = null; }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    overlay.querySelector(".r34-close").addEventListener("click", close);
    overlay.addEventListener("click", function (event) { if (event.target === overlay) close(); });
    overlay.querySelector(".r34-game-tabs").addEventListener("click", function (event) {
      var button = event.target.closest("[data-game]");
      if (button) selectGame(button.dataset.game);
    });
    document.addEventListener("keydown", function (event) { if (!overlay.hidden && event.key === "Escape") close(); });
    overlay._r34SelectGame = selectGame;
    overlay._r34Close = close;
    return overlay;
  }

  function openTraining() {
    lastFocus = document.activeElement;
    var overlay = createOverlay();
    overlay.hidden = false;
    overlay._r34SelectGame("chakra");
    var close = overlay.querySelector(".r34-close");
    if (close) close.focus();
  }

  function installTrainingButton() {
    if (document.getElementById("r34-training-button")) return;
    var button = document.createElement("button");
    button.id = "r34-training-button";
    button.type = "button";
    button.className = "r34-train-btn";
    button.textContent = "TREINO";
    button.addEventListener("click", openTraining);
    var host = document.querySelector(".topbar-actions");
    if (host) host.appendChild(button);
    else { button.className += " r34-train-fixed"; document.body.appendChild(button); }
  }

  function boot() {
    injectStyle();
    scan(document);
    observeImages();
    installTrainingButton();
    window.NarutoR34Visuals = {
      version: "R34",
      rescan: function () { scan(document); return resolver.audit(); },
      openTraining: openTraining,
      getBestScores: readBest,
      disconnectObserver: function () { if (observer) observer.disconnect(); }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
