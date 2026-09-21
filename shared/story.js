/* ==========================================================================
   LE MANOIR — CARTE STORY 9:16 partagée (Instagram / WhatsApp)
   --------------------------------------------------------------------------
   Génère une carte verticale 360x640 (exportée en 1080x1920 via html2canvas)
   avec la charte Le Manoir, puis ouvre toujours une MODALE D'APERÇU avec
   DEUX actions principales :
     1. "PARTAGER LA STORY" : navigator.share() avec le PNG en File
        -> feuille de partage native (Instagram Stories / WhatsApp / etc.).
        Le PNG est pré-généré à l'ouverture de la modale afin que l'appel à
        navigator.share() reste DANS le geste utilisateur (obligatoire sur
        iOS Safari pour que la feuille de partage s'ouvre sans blocage).
     2. "TÉLÉCHARGER" : enregistre le PNG (galerie / téléchargements).
   Repli gracieux : sans Web Share API fichiers -> partage texte/url,
   sinon téléchargement direct.
   API : window.LM_STORY.show(cfg) / .close() / .share() / .download()
   cfg : objet ou fonction (re-traduite au changement de langue).
   i18n : les libellés de l'UI de la carte suivent window.LM_I18N (FR / EN).
   ========================================================================== */
(function () {
    'use strict';

    var CARD_W = 360, CARD_H = 640, EXPORT_SCALE = 3; /* -> 1080 x 1920 */
    var FILENAME = 'le-manoir-story.png';

    var overlay, scaleWrap, fitBox, card, els, closeBtn, shareBtn, dlBtn;
    var currentCfg = null, currentStoryDir = 'ltr', busy = false;
    /* PNG pré-généré en arrière-plan dès l'ouverture de la modale :
       permet d'appeler navigator.share() instantanément dans le geste. */
    var pendingBlob = null, pendingRender = null;

    function I() { return window.LM_I18N; }
    function t(key, params) { return I() ? I().t(key, params) : key; }

    function el(tag, className, html) {
        var n = document.createElement(tag);
        if (className) n.className = className;
        if (html != null) n.innerHTML = html;
        return n;
    }

    /* Détection mobile (informatif uniquement : la modale s'affiche partout) */
    function isMobileDevice() {
        var ua = navigator.userAgent || '';
        var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        return isMobileUA || (isTouch && window.innerWidth <= 1024);
    }

    function canShareFiles() {
        if (!navigator.share || !navigator.canShare) return false;
        try {
            var testFile = new File(['x'], 'test.png', { type: 'image/png' });
            return navigator.canShare({ files: [testFile] });
        } catch (e) {
            return false;
        }
    }

    function ensureDOM() {
        if (overlay) return;

        overlay = el('div', 'lm-story-overlay');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Carte story Le Manoir');

        closeBtn = el('button', 'lm-story-close', '<i class="fas fa-times"></i>');
        closeBtn.addEventListener('click', close);

        fitBox = el('div', 'lm-story-fit');
        scaleWrap = el('div', 'lm-story-scale');

        card = el('div', 'lm-story-card');
        card.setAttribute('dir', 'ltr');
        card.appendChild(el('div', 'lm-sc-bar'));

        var top = el('div', 'lm-sc-top');
        top.appendChild(el('div', 'lm-sc-logo', 'Le Manoir'));
        top.appendChild(el('div', 'lm-sc-logo-sub'));
        top.appendChild(el('div', 'lm-sc-divider'));
        card.appendChild(top);

        els = {
            logoSub: top.children[1],
            kicker: el('div', 'lm-sc-kicker'),
            emoji: el('div', 'lm-sc-emoji'),
            title: el('div', 'lm-sc-title'),
            sub: el('p', 'lm-sc-sub'),
            rows: el('div', 'lm-sc-rows'),
            foot: el('div', 'lm-sc-foot')
        };
        card.appendChild(els.kicker);
        card.appendChild(els.emoji);
        card.appendChild(els.title);
        card.appendChild(els.sub);
        card.appendChild(els.rows);
        card.appendChild(els.foot);

        scaleWrap.appendChild(card);
        fitBox.appendChild(scaleWrap);

        /* ---------- DEUX actions principales sous l'aperçu ---------- */
        var actions = el('div', 'lm-story-actions');

        /* 1. PARTAGER LA STORY -> navigator.share() avec le PNG en File */
        shareBtn = el('button', 'lm-story-btn primary', '<i class="fas fa-paper-plane"></i><span></span>');
        shareBtn.id = 'lm-story-share';
        shareBtn.setAttribute('aria-label', t('story.share.action'));
        shareBtn.addEventListener('click', share);

        /* 2. TÉLÉCHARGER -> enregistre le PNG (galerie / téléchargements) */
        dlBtn = el('button', 'lm-story-btn ghost', '<i class="fas fa-download"></i><span></span>');
        dlBtn.id = 'lm-story-download';
        dlBtn.setAttribute('aria-label', t('story.download.action'));
        dlBtn.addEventListener('click', download);

        actions.appendChild(shareBtn);
        actions.appendChild(dlBtn);

        overlay.appendChild(closeBtn);
        overlay.appendChild(fitBox);
        overlay.appendChild(actions);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) close();
        });
        var resizeRaf = null;
        function onResize() {
            if (!overlay || !overlay.classList.contains('open')) return;
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(fit);
        }
        window.addEventListener('resize', onResize, { passive: true });

        /* Synchronisation avec le changement de langue */
        document.addEventListener('languagechange', function () {
            refreshStaticTexts();
            if (overlay.classList.contains('open') && !busy) {
                render();
                prewarm();
            }
        });

        refreshStaticTexts();
    }

    function refreshStaticTexts() {
        if (closeBtn) closeBtn.setAttribute('aria-label', t('aria.close'));
        if (els && els.logoSub) els.logoSub.textContent = t('story.logo-sub');
        if (dlBtn && !busy) dlBtn.innerHTML = '<i class="fas fa-download"></i><span>' + t('story.download.action') + '</span>';
        if (shareBtn && !busy) shareBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>' + t('story.share.action') + '</span>';
    }

    function fit() {
        if (!overlay) return;
        var availW = window.innerWidth - 32;
        var availH = window.innerHeight - 220; /* actions + marges */
        var s = Math.min(1, availW / CARD_W, availH / CARD_H);
        if (s < 0.4) s = 0.4;
        scaleWrap.style.transform = 'scale(' + s + ')';
        fitBox.style.width = (CARD_W * s) + 'px';
        fitBox.style.height = (CARD_H * s) + 'px';
    }

    function setBusy(b, which, label) {
        busy = b;
        if (overlay) {
            var btns = overlay.querySelectorAll('.lm-story-btn');
            Array.prototype.forEach.call(btns, function (btnEl) { btnEl.disabled = b; });
            var target = which === 'share' ? shareBtn : which === 'download' ? dlBtn : null;
            if (target) {
                if (b) {
                    target.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>' + (label || t('story.generating')) + '</span>';
                } else {
                    refreshStaticTexts();
                }
            }
        }
    }

    /* Remplit la carte avec la config du jeu (objet ou fonction) */
    function resolveCfg() {
        if (typeof currentCfg === 'function') return currentCfg() || {};
        return currentCfg || {};
    }

    function render() {
        var cfg = resolveCfg();
        els.kicker.textContent = cfg.kicker || 'LE MANOIR';
        els.emoji.textContent = cfg.emoji || '✨';
        els.title.textContent = cfg.title || '';
        els.sub.textContent = cfg.sub || '';
        els.sub.style.display = cfg.sub ? '' : 'none';
        els.rows.innerHTML = '';
        (cfg.rows || []).forEach(function (r) {
            var row = el('div', 'lm-sc-row' + (r.total ? ' total' : ''));
            row.appendChild(el('span', 'lbl', r.label || ''));
            row.appendChild(el('span', 'val', r.value || ''));
            els.rows.appendChild(row);
        });
        els.foot.innerHTML = (cfg.foot || t('story.default-foot')) +
            '<br><span class="lm-sc-ig">@cafelemanoir · Oujda</span>';
        currentStoryDir = 'ltr';
        card.setAttribute('dir', 'ltr');
    }

    function openModal() {
        ensureDOM();
        render();
        setBusy(false);
        refreshStaticTexts();

        overlay.classList.add('open');
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fit);
        else fit();

        /* Pré-génération du PNG dès l'ouverture : le partage natif pourra
           être déclenché instantanément dans le geste utilisateur. */
        prewarm();
    }

    function show(cfg) {
        ensureDOM();
        currentCfg = cfg || {};
        pendingBlob = null;
        pendingRender = null;
        openModal();
    }

    function close() {
        if (!overlay || busy) return;
        overlay.classList.remove('open');
    }

    /* ------------------------------------------------- Rendu PNG (blob) --- */
    function renderCanvas() {
        return new Promise(function (resolve, reject) {
            if (typeof window.html2canvas !== 'function') {
                return reject(new Error('html2canvas indisponible'));
            }
            var clone = card.cloneNode(true);
            clone.setAttribute('dir', 'ltr');
            var holder = document.createElement('div');
            holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + CARD_W + 'px;height:' + CARD_H + 'px;';
            holder.appendChild(clone);
            document.body.appendChild(holder);
            window.html2canvas(clone, {
                width: CARD_W,
                height: CARD_H,
                scale: EXPORT_SCALE,
                backgroundColor: '#F7F1E8',
                useCORS: true,
                logging: false
            }).then(function (canvas) {
                holder.remove();
                resolve(canvas);
            }).catch(function (err) {
                holder.remove();
                reject(err);
            });
        });
    }

    function renderBlob() {
        return renderCanvas().then(function (canvas) {
            return new Promise(function (resolve, reject) {
                if (canvas.toBlob) {
                    canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('toBlob nul')); }, 'image/png');
                } else {
                    reject(new Error('toBlob non supporté'));
                }
            });
        });
    }

    /* Génère le PNG une seule fois par ouverture (et le met en cache).
       resolve(false) si la génération échoue. */
    function prewarm() {
        if (pendingBlob || pendingRender) return;
        pendingRender = renderBlob().then(function (blob) {
            pendingBlob = blob;
            pendingRender = null;
        }).catch(function () {
            pendingRender = null;
        });
    }

    function getReadyBlob() {
        if (pendingBlob) return Promise.resolve(pendingBlob);
        prewarm();
        return pendingRender ? pendingRender.then(function () {
            return pendingBlob;
        }) : Promise.resolve(null);
    }

    /* -------------------------------------------------- Téléchargement --- */
    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || FILENAME;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    function download() {
        if (busy) return;
        setBusy(true, 'download', t('story.generating'));
        getReadyBlob().then(function (blob) {
            if (!blob) throw new Error('no blob');
            setBusy(false);
            downloadBlob(blob, FILENAME);
            /* Feedback non bloquant sur le bouton */
            if (dlBtn) {
                dlBtn.innerHTML = '<i class="fas fa-check"></i><span>' + t('story.downloaded') + '</span>';
                setTimeout(refreshStaticTexts, 2200);
            }
        }).catch(function () {
            setBusy(false);
            window.alert(t('story.alert-error'));
        });
    }

    /* ------------------------------------------------ Partage natif --- */
    function shareTextOnlyFallback() {
        if (!navigator.share) return Promise.reject(new Error('no share'));
        var cfg = resolveCfg();
        var text = (cfg.title ? cfg.title + ' — ' : '') + 'Le Manoir · ' + t('story.logo-sub');
        return navigator.share({ title: 'Le Manoir', text: text, url: window.location.href });
    }

    function shareBlob(blob) {
        var file = null;
        try {
            file = new File([blob], FILENAME, { type: 'image/png' });
        } catch (e) { file = null; }

        var cfg = resolveCfg();
        var text = (cfg.title ? cfg.title + ' — ' : '') + 'Le Manoir · ' + t('story.logo-sub');

        /* 1. Partage natif du fichier PNG (Instagram Stories, WhatsApp, …).
              Appel fait dans le geste utilisateur : blob déjà prêt (pré-généré). */
        if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            return navigator.share({ files: [file], title: 'Le Manoir', text: text });
        }
        /* 2. Web Share sans fichiers (desktop / ancien mobile) */
        if (navigator.share && isMobileDevice()) {
            return shareTextOnlyFallback();
        }
        /* 3. Repli : téléchargement direct du PNG */
        downloadBlob(blob, FILENAME);
        return Promise.resolve();
    }

    function share() {
        if (busy) return;
        /* PNG déjà pré-généré : navigator.share() est appelé de manière
           synchrone dans le handler du clic (requis par iOS Safari). */
        if (pendingBlob) {
            shareBlob(pendingBlob).catch(function (err) {
                if (err && err.name === 'AbortError') return; /* annulation utilisateur */
                /* Échec du partage (ex. permission) : on propose le PNG en téléchargement */
                downloadBlob(pendingBlob, FILENAME);
            });
            return;
        }
        /* Sinon : courte génération puis partage */
        setBusy(true, 'share', t('story.generating'));
        getReadyBlob().then(function (blob) {
            setBusy(false);
            if (!blob) throw new Error('no blob');
            return shareBlob(blob);
        }).catch(function (err) {
            setBusy(false);
            if (err && err.name === 'AbortError') return;
            window.alert(t('story.alert-error'));
        });
    }

    window.LM_STORY = {
        show: show,
        close: close,
        share: share,
        download: download
    };
})();
