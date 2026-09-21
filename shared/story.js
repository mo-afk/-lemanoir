/* ==========================================================================
   LE MANOIR — CARTE STORY 9:16 partagée (Instagram / WhatsApp)
   --------------------------------------------------------------------------
   Génère une carte verticale 360x640 (exportée en 1080x1920 via html2canvas)
   avec la charte Le Manoir, puis :
     • Appareil mobile avec Web Share API (fichiers) : partage natif direct
       (Instagram Stories / WhatsApp / etc.) via File.
     • Repli gracieux (desktop ou sans partage de fichiers natif) : modale avec
       bouton "TÉLÉCHARGER LA CARTE" pour sauvegarder le PNG.
   API : window.LM_STORY.show(cfg) / .close() / .share() / .download()
   cfg : objet ou fonction (re-traduite au changement de langue).
   i18n : les libellés de l'UI de la carte suivent window.LM_I18N (FR / EN).
   ========================================================================== */
(function () {
    'use strict';

    var CARD_W = 360, CARD_H = 640, EXPORT_SCALE = 3; /* -> 1080 x 1920 */

    var overlay, scaleWrap, fitBox, card, els, closeBtn, shareBtn, dlBtn;
    var currentCfg = null, currentStoryDir = 'ltr', busy = false;
    var activeTrigger = null, originalTriggerHtml = '';

    function I() { return window.LM_I18N; }
    function t(key, params) { return I() ? I().t(key, params) : key; }

    function el(tag, className, html) {
        var n = document.createElement(tag);
        if (className) n.className = className;
        if (html != null) n.innerHTML = html;
        return n;
    }

    /* Détection mobile & Web Share API supportant les fichiers */
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

    function supportsNativeFileShare() {
        return isMobileDevice() && canShareFiles();
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

        var actions = el('div', 'lm-story-actions');
        shareBtn = el('button', 'lm-story-btn', '<i class="fas fa-camera"></i><span></span>');
        shareBtn.id = 'lm-story-share';
        shareBtn.addEventListener('click', share);

        dlBtn = el('button', 'lm-story-btn', '<i class="fas fa-download"></i><span></span>');
        dlBtn.id = 'lm-story-download';
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
            if (overlay.classList.contains('open') && !busy) render();
        });

        refreshStaticTexts();
    }

    function refreshStaticTexts() {
        if (closeBtn) closeBtn.setAttribute('aria-label', t('aria.close'));
        if (els && els.logoSub) els.logoSub.textContent = t('story.logo-sub');
        if (dlBtn) dlBtn.querySelector('span').textContent = t('story.download');
        if (shareBtn && !busy) shareBtn.querySelector('span').textContent = t('story.share');
    }

    function fit() {
        if (!overlay) return;
        var availW = window.innerWidth - 32;
        var availH = window.innerHeight - 210; /* actions + marges */
        var s = Math.min(1, availW / CARD_W, availH / CARD_H);
        if (s < 0.4) s = 0.4;
        scaleWrap.style.transform = 'scale(' + s + ')';
        fitBox.style.width = (CARD_W * s) + 'px';
        fitBox.style.height = (CARD_H * s) + 'px';
    }

    function setTriggerBusy(b) {
        busy = b;
        if (b) {
            var active = document.activeElement;
            if (active && (active.id === 'act-share' || active.id === 'wp-share' || active.id === 'qz-share' ||
                active.classList.contains('result-btn') || active.classList.contains('spin-btn'))) {
                activeTrigger = active;
                originalTriggerHtml = active.innerHTML;
                active.disabled = true;
                active.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>' + t('story.generating') + '</span>';
            }
        } else {
            if (activeTrigger) {
                activeTrigger.disabled = false;
                activeTrigger.innerHTML = originalTriggerHtml;
                activeTrigger = null;
            }
        }
    }

    function setBusy(b, label) {
        busy = b;
        if (overlay) {
            var btns = overlay.querySelectorAll('.lm-story-btn');
            Array.prototype.forEach.call(btns, function (btnEl) {
                btnEl.disabled = b;
            });
            if (dlBtn && b && label) {
                dlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>' + label + '</span>';
            }
            if (!b && dlBtn) {
                dlBtn.innerHTML = '<i class="fas fa-download"></i><span>' + t('story.download') + '</span>';
            }
        }
        if (!b) setTriggerBusy(false);
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

        /* Dans la modale de repli, le bouton Télécharger est l'action principale */
        if (shareBtn) shareBtn.style.display = 'none';
        if (dlBtn) {
            dlBtn.style.display = 'inline-flex';
            dlBtn.className = 'lm-story-btn';
            dlBtn.innerHTML = '<i class="fas fa-download"></i><span>' + t('story.download') + '</span>';
        }

        overlay.classList.add('open');
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fit);
        else fit();
    }

    function show(cfg) {
        ensureDOM();
        currentCfg = cfg || {};
        render();

        if (supportsNativeFileShare()) {
            shareNative();
        } else {
            openModal();
        }
    }

    function close() {
        if (!overlay || busy) return;
        overlay.classList.remove('open');
    }

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

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'le-manoir-story.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    function download() {
        if (busy) return;
        setBusy(true, t('story.generating'));
        renderBlob().then(function (blob) {
            setBusy(false);
            downloadBlob(blob, 'le-manoir-story.png');
        }).catch(function () {
            setBusy(false);
            window.alert(t('story.alert-error'));
        });
    }

    function shareNative() {
        if (busy) return;
        setTriggerBusy(true);
        renderBlob().then(function (blob) {
            setTriggerBusy(false);
            var file;
            try {
                file = new File([blob], 'le-manoir-story.png', { type: 'image/png' });
            } catch (e) {
                openModal();
                return;
            }
            var cfg = resolveCfg();
            var text = (cfg.title ? cfg.title + ' — ' : '') + 'Le Manoir · ' + t('story.logo-sub');
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Le Manoir',
                    text: text
                }).catch(function (err) {
                    if (err && err.name === 'AbortError') return; /* Annulation utilisateur */
                    openModal();
                });
            } else {
                openModal();
            }
        }).catch(function () {
            setTriggerBusy(false);
            openModal();
        });
    }

    function share() {
        if (supportsNativeFileShare()) {
            shareNative();
        } else {
            download();
        }
    }

    window.LM_STORY = {
        show: show,
        close: close,
        share: share,
        download: download
    };
})();
