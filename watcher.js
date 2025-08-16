(() => {
  const root = document.querySelector('#song-pattern');
  if (!root) { console.warn('No #song-pattern'); return; }

  const BRIDGE_PRESS = 'http://127.0.0.1:17643/press';
  const BRIDGE_CHORD = 'http://127.0.0.1:17643/chord';
  const HOLD_MS = 160, DEDUP_MS = 40;

  const lastAt = new Map();
  const dedup = (k, ms=DEDUP_MS) => { const t=performance.now(), p=lastAt.get(k)||0; lastAt.set(k,t); return (t-p)<ms; };

  const toKeyObj = ch => {
    const isLetter=/^[a-z]$/i.test(ch);
    const isUpper = isLetter && ch===ch.toUpperCase();
    return { key: isLetter? ch.toLowerCase(): ch, shift: isUpper };
  };

  const sendKey   = k    => fetch(BRIDGE_PRESS, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...k, hold: HOLD_MS/1000 })}).catch(()=>{});
  const sendChord = keys => fetch(BRIDGE_CHORD, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ keys, hold: HOLD_MS/1000 })}).catch(()=>{});

  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type!=='attributes' || m.attributeName!=='class') continue;
      const el = m.target;
      if (!(el instanceof HTMLElement) || el.tagName!=='SPAN') continue;
      if (el.classList.contains('pause')) continue;
      if (!el.classList.contains('active')) continue;
      if (dedup(el)) continue;

      const txt = el.textContent.trim(); if (!txt) continue;

      if (el.classList.contains('chord')) {
        const keys = [...txt].map(toKeyObj);
        console.log('[CHORD]', txt, '→', keys);
        sendChord(keys);
      } else {
        const k = toKeyObj(txt);
        console.log('[NOTE]', txt, '→', k);
        sendKey(k);
      }
    }
  });

  obs.observe(root, { attributes:true, subtree:true, attributeFilter:['class'] });

  // ===== Idle popup auto-closer =====
  function closeIdlePopup(ctx = document) {
    const pop = ctx.querySelector?.('#idlePop');
    if (!pop) return false;

    const btn = pop.querySelector?.('#closeIdle, button');
    try { btn?.click(); } catch {}

    pop.style.setProperty('display', 'none', 'important');
    pop.style.setProperty('pointer-events', 'none', 'important');
    pop.remove?.();

    // make sure page regains focus
    (document.activeElement || document.body)?.blur?.();
    window.focus();
    (document.body || document.documentElement).click?.();

    console.log('[idlePop] auto-closed');
    return true;
  }

  // close immediately if already present
  closeIdlePopup();

  // watch for future insertions
  const idleMO = new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && (node.id === 'idlePop' || node.querySelector?.('#idlePop'))) {
          closeIdlePopup(document);
        }
      }
    }
  });
  idleMO.observe(document.body, { childList:true, subtree:true });

  // periodic sweep (belt & suspenders)
  const idleSweep = setInterval(closeIdlePopup, 1000);

  // expose a stopper
  window.stopIdleGuard = () => { idleMO.disconnect(); clearInterval(idleSweep); console.log('[idlePop] guard stopped'); };

  console.log('🎹 Watching #song-pattern with .chord support via /chord (idle popup auto-closer active)');
})();
