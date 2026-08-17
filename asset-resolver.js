(function () {
  "use strict";

  var VERSION = "R34";
  var GENERIC_ICON_RE = /(?:^|\/)static\/img\/icon\.png(?:[?#].*)?$/i;
  var GENERIC_HINT_RE = /(?:placeholder|default|generic|silhouette|missing[-_ ]?image|no[-_ ]?image)/i;
  var IMAGE_FIELDS = ["icon", "image", "portrait", "avatar", "src"];
  var NAME_FIELDS = ["name", "title", "label", "npc", "character", "jutsu", "skill", "originalName", "slug"];

  var report = {
    rosterCharacters: 0,
    rosterSkills: 0,
    genericBefore: 0,
    fixedPreApp: 0,
    unresolvedPreApp: 0,
    domReplacements: 0,
    domUnresolved: 0,
    brokenImages: 0,
    unresolvedLabels: {},
    semanticAliases: 0
  };

  function normalize(value) {
    var text = value == null ? "" : String(value);
    try { text = text.normalize("NFD"); } catch (_) {}
    return text
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’'`´]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isDataSvg(src) {
    return /^data:image\/svg\+xml(?:;charset=[^,]+)?,/i.test(String(src || ""));
  }

  function isGeneric(src) {
    if (!src) return true;
    var value = String(src).trim();
    if (!value) return true;
    if (isDataSvg(value)) return false;
    if (GENERIC_ICON_RE.test(value)) return true;
    return GENERIC_HINT_RE.test(value);
  }

  function placeholder(label) {
    var safe = escapeHtml(label || "Conteúdo sem arte validada");
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1a1a1d"/><stop offset="1" stop-color="#34343b"/></linearGradient></defs>',
      '<rect width="512" height="512" rx="32" fill="url(#g)"/>',
      '<path d="M116 332l78-91 58 63 43-46 101 119H116z" fill="#6b6b75" opacity=".55"/>',
      '<circle cx="185" cy="175" r="42" fill="#777781" opacity=".55"/>',
      '<rect x="74" y="58" width="364" height="396" rx="28" fill="none" stroke="#8b8b96" stroke-width="4" opacity=".55"/>',
      '<text x="256" y="407" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#f1f1f3">ARTE NÃO CADASTRADA</text>',
      '<text x="256" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#c7c7ce">' + safe + '</text>',
      '</svg>'
    ].join("");
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  var entityAliases = Object.create(null);
  var skillAliases = Object.create(null);
  var unresolvedKnown = Object.create(null);

  function register(map, names, src) {
    names.forEach(function (name) { map[normalize(name)] = { src: src, label: name }; });
  }

  register(entityAliases, ["Iruka", "Iruka Umino"], "static/img/ninja/iruka-umino/icon.jpg");
  register(entityAliases, ["Gamabunta"], "static/img/ninja/jiraiya/MajorSummoningGamabunta.jpg");
  register(entityAliases, ["Enma"], "static/img/ninja/hiruzen-sarutobi/MajorSummoningEnma.jpg");
  register(entityAliases, ["Fukasaku", "Shima", "Fukasaku and Shima"], "static/img/ninja/fukasaku-and-shima-(s)/icon.jpg");
  register(entityAliases, ["Gyuki", "Gyūki", "Eight Tails", "Oito Caudas"], "static/img/bijuu-events/gyuki-boss-icon-v229.jpg");
  register(entityAliases, ["Chomei", "Chōmei", "Seven Tails", "Sete Caudas"], "static/img/bijuu-events/r23/chomei.jpg");
  register(entityAliases, ["Shukaku"], "static/img/ninja/shukaku-gaara/iconsandtransformation.jpg");
  register(entityAliases, ["Matatabi"], "static/img/ninja/yugito-nii-(s)/icontwotailedtransformation.jpg");
  register(entityAliases, ["Kurama", "Kyuubi", "Kyūbi", "Nine Tails", "Nove Caudas"], "static/img/ninja/nine-tailed-naruto-(s)/iconninetailedtransformation.jpg");

  register(skillAliases, ["Kunai"], "static/img/ninja/mizuki/KunaiAssault.jpg");
  register(skillAliases, ["Shuriken"], "static/img/ninja/iruka-umino/ShurikenThrow.jpg");
  register(skillAliases, ["Rasengan"], "static/img/ninja/naruto-uzumaki/Rasengan.jpg");
  register(skillAliases, ["Raikiri", "Lightning Blade"], "static/img/ninja/kakashi-hatake/LightningBlade.jpg");
  register(skillAliases, ["Bunshin", "Shadow Clone", "Shadow Clones", "Kage Bunshin", "Kage Bunshin no Jutsu"], "static/img/ninja/naruto-uzumaki/ShadowClones.jpg");
  register(skillAliases, ["Kawarimi", "Substitution", "Substitution Technique", "Técnica de Substituição"], "static/img/ninja/sakura-haruno/SubstitutionTechnique.jpg");

  ["Akamaru", "Aoda", "Gamakichi", "Henge", "Transformation Technique", "Técnica de Transformação"].forEach(function (name) {
    unresolvedKnown[normalize(name)] = name;
  });

  report.semanticAliases = Object.keys(entityAliases).length + Object.keys(skillAliases).length;

  var characterIndex = Object.create(null);
  var skillIndex = Object.create(null);

  function imageFromObject(obj) {
    if (!obj || typeof obj !== "object") return null;
    var candidates = [obj.icon, obj.image, obj.portrait, obj.avatar, obj.src];
    for (var i = 0; i < candidates.length; i += 1) {
      if (candidates[i] && !isGeneric(candidates[i])) return String(candidates[i]);
    }
    return null;
  }

  function setPreferred(index, key, obj, src) {
    if (!key || !src) return;
    var current = index[key];
    if (!current || isGeneric(current.src)) index[key] = { src: src, source: obj };
  }

  function buildIndexes() {
    characterIndex = Object.create(null);
    skillIndex = Object.create(null);
    var roster = Array.isArray(window.NARUTO_ROSTER) ? window.NARUTO_ROSTER : [];
    report.rosterCharacters = roster.length;
    report.rosterSkills = 0;

    roster.forEach(function (character) {
      if (!character || typeof character !== "object") return;
      var charSrc = imageFromObject(character);
      [character.name, character.originalName, character.slug, character.id].forEach(function (name) {
        setPreferred(characterIndex, normalize(name), character, charSrc);
      });

      var skills = [];
      [character.skills, character.jutsus, character.techniques, character.abilities].forEach(function (collection) {
        if (Array.isArray(collection)) skills = skills.concat(collection);
      });
      report.rosterSkills += skills.length;
      skills.forEach(function (skill) {
        if (!skill || typeof skill !== "object") return;
        var skillSrc = imageFromObject(skill);
        [skill.name, skill.originalName, skill.slug, skill.id].forEach(function (name) {
          setPreferred(skillIndex, normalize(name), skill, skillSrc);
        });
      });
    });
  }

  function result(src, label, kind, resolved) {
    return src ? { src: src, label: label || "", kind: kind || "unknown", resolved: resolved !== false } : null;
  }

  function resolveEntity(name) {
    var key = normalize(name);
    if (!key) return null;
    if (entityAliases[key]) return result(entityAliases[key].src, name, "entity", true);
    if (characterIndex[key] && characterIndex[key].src) return result(characterIndex[key].src, name, "entity", true);
    return null;
  }

  function resolveSkill(name) {
    var key = normalize(name);
    if (!key) return null;
    if (skillAliases[key]) return result(skillAliases[key].src, name, "skill", true);
    if (skillIndex[key] && skillIndex[key].src) return result(skillIndex[key].src, name, "skill", true);
    return null;
  }

  function boundaryContains(haystack, needle) {
    if (!haystack || !needle) return false;
    return (" " + haystack + " ").indexOf(" " + needle + " ") !== -1;
  }

  var phraseAliases = [];
  function rebuildPhraseAliases() {
    phraseAliases = [];
    Object.keys(entityAliases).forEach(function (key) {
      if (key.length >= 4) phraseAliases.push({ key: key, src: entityAliases[key].src, kind: "entity" });
    });
    Object.keys(skillAliases).forEach(function (key) {
      if (key.length >= 4) phraseAliases.push({ key: key, src: skillAliases[key].src, kind: "skill" });
    });
    phraseAliases.sort(function (a, b) { return b.key.length - a.key.length; });
  }

  function resolveText(text, currentSrc) {
    if (currentSrc && !isGeneric(currentSrc)) return result(currentSrc, text, "existing", true);
    var key = normalize(text);
    if (!key) return null;
    var exactEntity = resolveEntity(key);
    if (exactEntity) return exactEntity;
    var exactSkill = resolveSkill(key);
    if (exactSkill) return exactSkill;
    for (var i = 0; i < phraseAliases.length; i += 1) {
      var alias = phraseAliases[i];
      if (boundaryContains(key, alias.key)) return result(alias.src, alias.key, alias.kind, true);
    }
    return null;
  }

  function labelFromContext(context) {
    if (!context || typeof context !== "object") return "";
    return context.name || context.label || context.entity || context.skill || context.npc || context.jutsu || context.title || context.text || "";
  }

  function countUnresolved(label) {
    var key = String(label || "Sem rótulo").trim() || "Sem rótulo";
    report.unresolvedLabels[key] = (report.unresolvedLabels[key] || 0) + 1;
  }

  function resolveImage(context) {
    if (typeof context === "string") context = { name: context };
    context = context || {};
    var currentSrc = context.src || context.image || context.icon || context.portrait || "";
    if (currentSrc && !isGeneric(currentSrc)) return result(currentSrc, labelFromContext(context), "existing", true);

    var label = labelFromContext(context);
    var kind = normalize(context.kind || "");
    var resolved = null;
    if (kind === "skill" || kind === "jutsu" || context.skill || context.jutsu) resolved = resolveSkill(context.skill || context.jutsu || label);
    if (!resolved && (kind === "entity" || kind === "npc" || kind === "character" || context.entity || context.npc)) resolved = resolveEntity(context.entity || context.npc || label);
    if (!resolved && label) resolved = resolveText(label, currentSrc);
    if (resolved) return resolved;

    var key = normalize(label);
    if (key && unresolvedKnown[key]) {
      countUnresolved(label);
      return result(placeholder(label), label, "missing", false);
    }
    if (label && (!currentSrc || isGeneric(currentSrc))) {
      countUnresolved(label);
      return result(placeholder(label), label, "missing", false);
    }
    return currentSrc ? result(currentSrc, label, "existing", !isGeneric(currentSrc)) : null;
  }

  function objectLabel(obj) {
    if (!obj || typeof obj !== "object") return "";
    for (var i = 0; i < NAME_FIELDS.length; i += 1) {
      var value = obj[NAME_FIELDS[i]];
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  }

  function patchObject(obj, depth, seen) {
    if (!obj || typeof obj !== "object" || depth > 8) return;
    if (seen && seen.has(obj)) return;
    if (seen) seen.add(obj);

    var label = objectLabel(obj);
    IMAGE_FIELDS.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(obj, field)) return;
      if (!obj[field] || isGeneric(obj[field])) {
        report.genericBefore += 1;
        var resolved = resolveImage({ name: label, src: obj[field], kind: obj.jutsu || obj.skill ? "skill" : "" });
        if (resolved && resolved.resolved && !isDataSvg(resolved.src)) {
          obj[field] = resolved.src;
          report.fixedPreApp += 1;
        } else {
          report.unresolvedPreApp += 1;
        }
      }
    });

    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (value && typeof value === "object") patchObject(value, depth + 1, seen);
    });
  }

  function patchRoster() {
    var roster = Array.isArray(window.NARUTO_ROSTER) ? window.NARUTO_ROSTER : [];
    roster.forEach(function (character) {
      if (!character || typeof character !== "object") return;
      var charLabel = character.name || character.originalName || character.slug || "";
      ["icon", "image", "portrait", "avatar"].forEach(function (field) {
        if (!Object.prototype.hasOwnProperty.call(character, field)) return;
        if (!character[field] || isGeneric(character[field])) {
          report.genericBefore += 1;
          var charResolved = resolveEntity(charLabel);
          if (charResolved && charResolved.src) {
            character[field] = charResolved.src;
            report.fixedPreApp += 1;
          } else {
            report.unresolvedPreApp += 1;
          }
        }
      });
      var skills = [];
      [character.skills, character.jutsus, character.techniques, character.abilities].forEach(function (collection) {
        if (Array.isArray(collection)) skills = skills.concat(collection);
      });
      skills.forEach(function (skill) {
        if (!skill || typeof skill !== "object") return;
        var skillLabel = skill.name || skill.originalName || skill.slug || "";
        ["icon", "image", "portrait"].forEach(function (field) {
          if (!Object.prototype.hasOwnProperty.call(skill, field)) return;
          if (!skill[field] || isGeneric(skill[field])) {
            report.genericBefore += 1;
            var skillResolved = resolveSkill(skillLabel);
            if (skillResolved && skillResolved.src) {
              skill[field] = skillResolved.src;
              report.fixedPreApp += 1;
            } else {
              report.unresolvedPreApp += 1;
            }
          }
        });
      });
    });
  }

  function patchGlobals() {
    buildIndexes();
    patchRoster();
    buildIndexes();
    var seen = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    ["NARUTO_STORY_DATA", "NARUTO_JUTSU_VARIANTS", "NARUTO_V23_DATA"].forEach(function (name) {
      if (window[name] && typeof window[name] === "object") patchObject(window[name], 0, seen);
    });
    return audit();
  }

  function audit() {
    var copy = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      rosterCharacters: report.rosterCharacters,
      rosterSkills: report.rosterSkills,
      genericBefore: report.genericBefore,
      fixedPreApp: report.fixedPreApp,
      unresolvedPreApp: report.unresolvedPreApp,
      domReplacements: report.domReplacements,
      domUnresolved: report.domUnresolved,
      brokenImages: report.brokenImages,
      unresolvedLabels: Object.assign({}, report.unresolvedLabels),
      semanticAliases: report.semanticAliases
    };
    return copy;
  }

  function downloadAudit() {
    try {
      var blob = new Blob([JSON.stringify(audit(), null, 2)], { type: "application/json;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "naruto-r34-asset-audit.json";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      return true;
    } catch (_) { return false; }
  }

  rebuildPhraseAliases();
  buildIndexes();

  window.NarutoAssetResolver = {
    version: VERSION,
    normalize: normalize,
    isGeneric: isGeneric,
    resolveEntity: resolveEntity,
    resolveSkill: resolveSkill,
    resolveText: resolveText,
    resolveImage: resolveImage,
    placeholder: placeholder,
    patchGlobals: patchGlobals,
    audit: audit,
    downloadAudit: downloadAudit,
    report: report
  };

  patchGlobals();
})();
