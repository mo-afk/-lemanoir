/* ==========================================================================
   QUI PAYE ? — Le Manoir  (mini-jeu du hub)
   --------------------------------------------------------------------------
   Roue 2-8 joueurs : animation décélérée, tic sonore (WebAudio) + vibrations,
   résultat "X PAYS !" partageable en carte story 9:16 (hub partagé).
   ========================================================================== */
(function () {
    'use strict';

    var MIN_PLAYERS = 2;
    var MAX_PLAYERS = 8;
    var SPIN_MS = 3600;
    var SPIN_MS_REDUCED = 1100;
    var FULL_TURNS = 5;

    var JOKE_COUNT = 8; /* blagues traduites dans shared/i18n.js (who.joke0..7) */

    function t(key, params) { return window.LM_I18N ? window.LM_I18N.t(key, params) : key; }

    var players = [];
    var canvas, ctx, frame, hub, spinBtn, resultBox;
    var rotation = 0, spinning = false, radius = 0, winner = null, currentJoke = 0;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------- Audio --- */
    /* Sons (Web Audio) + vibrations délégués à shared/fx.js, qui gère le
       déblocage du contexte audio au premier geste utilisateur (mobile).
       Repli local (vibration seule) si fx.js n'est pas chargé. */
    function ensureAudio() {
        if (window.LM_FX) window.LM_FX.unlock();
    }

    function tickSound() {
        /* Tick de roue : son + vibration 15ms à chaque segment qui passe */
        if (window.LM_FX) { window.LM_FX.tick(); return; }
        if (navigator.vibrate && !reduced) navigator.vibrate(15);
    }

    function winSound() {
        /* Arrêt sur le segment gagnant : deux notes + [10, 30, 10] */
        if (window.LM_FX) { window.LM_FX.win(); return; }
        if (navigator.vibrate && !reduced) navigator.vibrate([10, 30, 10]);
    }

    function buzz(pattern) {
        if (window.LM_FX) { window.LM_FX.buzz(pattern); return; }
        if (navigator.vibrate && !reduced) navigator.vibrate(pattern);
    }

    /* ------------------------------------------------------------- Utils --- */
    function $(id) { return document.getElementById(id); }
    function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    /* ------------------------------------------------------- Joueurs --- */
    var input, chipsEl, countEl, clearBtn, startBtn, hintEl;

    function syncPlayers() {
        chipsEl.innerHTML = '';
        players.forEach(function (name, idx) {
            var li = document.createElement('li');
            li.className = 'wp-chip';
            var span = document.createElement('span');
            span.textContent = name;
            var rm = document.createElement('button');
            rm.type = 'button';
            rm.setAttribute('aria-label', t('who.remove', { name: name }));
            rm.innerHTML = '<i class="fas fa-times"></i>';
            rm.addEventListener('click', function () {
                players.splice(idx, 1);
                syncPlayers();
            });
            li.appendChild(span);
            li.appendChild(rm);
            chipsEl.appendChild(li);
        });
        countEl.textContent = t('who.count', { n: players.length });
        var ready = players.length >= MIN_PLAYERS;
        startBtn.disabled = !ready;
        var remaining = MIN_PLAYERS - players.length;
        hintEl.textContent = ready
            ? t('who.hint.ready')
            : (remaining === 1 ? t('who.hint.need1') : t('who.hint.need', { n: remaining }));
    }

    function addPlayer(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        var name = input.value.replace(/\s+/g, ' ').trim();
        if (!name) return;
        if (players.length >= MAX_PLAYERS) {
            hintEl.textContent = t('who.hint.max');
            return;
        }
        var dup = players.some(function (p) { return p.toLowerCase() === name.toLowerCase(); });
        if (dup) {
            hintEl.textContent = t('who.hint.dup');
            return;
        }
        players.push(name);
        input.value = '';
        input.focus();
        buzz(10);
        syncPlayers();
    }

    function clearPlayers() {
        players = [];
        syncPlayers();
    }

    /* ------------------------------------------------------------ Roue --- */
    function palette() {
        var cs = getComputedStyle(document.body);
        function v(n, fb) { var x = cs.getPropertyValue(n); return (x && x.trim()) || fb; }
        return {
            sliceA: v('--wheel-slice-a', '#F7F1E8'),
            sliceB: v('--wheel-slice-b', '#C8956C'),
            inkA: v('--wheel-ink-a', '#1A1A1A'),
            inkB: v('--wheel-ink-b', '#241708'),
            rim: v('--wheel-rim', '#1A1A1A'),
            accent: v('--accent', '#C8956C')
        };
    }

    function shortLabel(n) { return n.length > 20 ? n.slice(0, 18).trim() + '…' : n; }

    function wrapText(text, maxW, maxLines) {
        var words = String(text).split(' '), lines = [], line = '', overflow = false;
        for (var i = 0; i < words.length; i++) {
            var test = line ? line + ' ' + words[i] : words[i];
            if (!line || ctx.measureText(test).width <= maxW) { line = test; continue; }
            if (lines.length < maxLines - 1) { lines.push(line); line = words[i]; }
            else { line = line + ' ' + words.slice(i).join(' '); overflow = true; break; }
        }
        if (line) lines.push(line);
        var last = lines[lines.length - 1] || '';
        if (overflow || ctx.measureText(last).width > maxW) {
            var cut = last;
            while (cut.length > 1 && ctx.measureText(cut + '…').width > maxW) cut = cut.slice(0, -1).trim();
            lines[lines.length - 1] = cut + '…';
        }
        return lines;
    }

    function draw() {
        if (!ctx || !radius || !players.length) return;
        var c = palette(), R = radius, rIn = R * 0.9, n = players.length, step = (Math.PI * 2) / n;
        ctx.clearRect(0, 0, R * 2, R * 2);
        ctx.save();
        ctx.translate(R, R);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = c.rim; ctx.fill();
        var studs = Math.max(16, n * 2);
        for (var s = 0; s < studs; s++) {
            var a = (s / studs) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * R * 0.952, Math.sin(a) * R * 0.952, R * 0.012, 0, Math.PI * 2);
            ctx.fillStyle = s % 2 === 0 ? c.accent : 'rgba(255,255,255,0.55)';
            ctx.fill();
        }
        for (var i = 0; i < n; i++) {
            var a0 = -Math.PI / 2 + i * step, a1 = a0 + step, light = i % 2 === 0;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, rIn, a0, a1); ctx.closePath();
            ctx.fillStyle = light ? c.sliceA : c.sliceB; ctx.fill();
            ctx.lineWidth = Math.max(1, R * 0.006);
            ctx.strokeStyle = 'rgba(200,149,108,0.55)';
            ctx.stroke();
            var mid = a0 + step / 2, fs = Math.max(10, Math.min(R * 0.1, 17));
            ctx.save();
            ctx.rotate(mid);
            var flip = Math.cos(mid) < 0;
            if (flip) ctx.rotate(Math.PI);
            ctx.textAlign = flip ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            ctx.font = '700 ' + fs.toFixed(1) + 'px Lato, sans-serif';
            ctx.fillStyle = light ? c.inkA : c.inkB;
            var pad = R * 0.075, x = flip ? -(rIn - pad) : (rIn - pad);
            var lines = wrapText(shortLabel(players[i]), R * 0.48, 2);
            var lineH = fs * 1.18, y0 = -((lines.length - 1) * lineH) / 2;
            for (var l = 0; l < lines.length; l++) ctx.fillText(lines[l], x, y0 + l * lineH);
            ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, rIn, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, R * 0.014);
        ctx.strokeStyle = c.accent;
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, R * 0.19, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fill();
        ctx.restore();
    }

    function sliceIndexAtPointer() {
        if (!players.length) return -1;
        var step = 360 / players.length;
        var a = ((-rotation % 360) + 360) % 360;
        return Math.floor(a / step) % players.length;
    }

    function sizeCanvas() {
        if (!canvas || !frame) return;
        var css = frame.clientWidth;
        if (!css) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(css * dpr);
        canvas.height = Math.round(css * dpr);
        canvas.style.width = css + 'px';
        canvas.style.height = css + 'px';
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        radius = css / 2;
        draw();
    }

    /* ------------------------------------------------------------- Spin --- */
    function showWheelScreen() {
        $('wp-setup').classList.add('hidden');
        $('wp-wheel').classList.remove('hidden');
        $('wp-wheel-hint').textContent = t('who.wheel.hint', { n: players.length });
        sizeCanvas();
    }

    function showSetupScreen() {
        $('wp-wheel').classList.add('hidden');
        $('wp-setup').classList.remove('hidden');
        syncPlayers();
        input.focus();
    }

    function spin() {
        if (spinning || players.length < MIN_PLAYERS) return;
        ensureAudio();
        spinning = true;
        spinBtn.disabled = true;
        hub.disabled = true;

        var winIndex = Math.floor(Math.random() * players.length);
        var step = 360 / players.length;
        var jitter = (Math.random() * 0.6 - 0.3) * step;
        var target = -((winIndex + 0.5) * step) - jitter;
        var current = ((rotation % 360) + 360) % 360;
        var delta = (((target - current) % 360) + 360) % 360;
        animateTo(rotation + 360 * FULL_TURNS + delta, function () {
            finish(winIndex);
        });
    }

    function animateTo(target, onDone) {
        var from = rotation, distance = target - from;
        var duration = reduced ? SPIN_MS_REDUCED : SPIN_MS;
        var start = performance.now();
        var lastIdx = sliceIndexAtPointer();
        var pointer = document.querySelector('.wheel-pointer');

        function stepFn(now) {
            var p = Math.min(1, (now - start) / duration);
            var e = 1 - Math.pow(1 - p, 4);
            rotation = from + distance * e;
            draw();
            var idx = sliceIndexAtPointer();
            if (idx !== lastIdx) {
                lastIdx = idx;
                if (pointer) {
                    pointer.classList.remove('tick');
                    void pointer.offsetWidth;
                    pointer.classList.add('tick');
                }
                tickSound(); /* son + vibration 15ms (via shared/fx.js) */
            }
            if (p < 1) requestAnimationFrame(stepFn);
            else {
                rotation = target;
                draw();
                onDone();
            }
        }
        requestAnimationFrame(stepFn);
    }

    function finish(winIndex) {
        spinning = false;
        spinBtn.disabled = false;
        hub.disabled = false;
        winner = players[winIndex];
        winSound(); /* notes de victoire + vibration [10, 30, 10] */

        currentJoke = Math.floor(Math.random() * JOKE_COUNT);
        renderResult();
        resultBox.classList.add('open');
    }

    function renderResult() {
        if (!winner) return;
        var h2 = $('wp-result-name');
        h2.innerHTML = '';
        h2.textContent = winner;
        var span = document.createElement('span');
        span.className = 'pays';
        span.textContent = ' ' + t('who.result.pays');
        h2.appendChild(span);
        $('wp-result-joke').textContent = t('who.joke' + (currentJoke || 0));
    }

    function closeResult() {
        resultBox.classList.remove('open');
    }

    /* --------------------------------------------- Partage Story (9:16) --- */
    function shareStory() {
        if (!winner) return;
        var w = winner, joke = currentJoke;
        LM_STORY.show(function () {
            return {
                kicker: t('who.story.kicker'),
                emoji: '💸',
                title: w + ' ' + t('who.result.pays'),
                sub: t('who.joke' + joke),
                rows: [
                    { label: t('who.story.row'), value: w }
                ],
                foot: t('who.story.foot')
            };
        });
    }

    /* ------------------------------------------------------------ Init --- */
    function init() {
        canvas = $('wp-canvas');
        frame = document.querySelector('.wheel-frame');
        hub = $('wp-hub');
        spinBtn = $('wp-spin');
        resultBox = $('wp-result');
        input = $('wp-name-input');
        chipsEl = $('wp-chips');
        countEl = $('wp-count');
        clearBtn = $('wp-clear');
        startBtn = $('wp-start');
        hintEl = $('wp-hint');

        if (!canvas || !frame) return;
        ctx = canvas.getContext('2d');

        $('wp-add-form').addEventListener('submit', addPlayer);
        clearBtn.addEventListener('click', clearPlayers);
        startBtn.addEventListener('click', function () {
            if (players.length >= MIN_PLAYERS) showWheelScreen();
        });
        spinBtn.addEventListener('click', spin);
        hub.addEventListener('click', spin);
        $('wp-back-setup').addEventListener('click', function (e) {
            e.preventDefault();
            if (!spinning) showSetupScreen();
        });
        $('wp-respin').addEventListener('click', function () {
            closeResult();
            setTimeout(spin, 320);
        });
        $('wp-change').addEventListener('click', function () {
            closeResult();
            showSetupScreen();
        });
        $('wp-share').addEventListener('click', shareStory);

        window.LM_HUB_ON_DARK = function () { draw(); };

        window.addEventListener('resize', debounce(sizeCanvas, 180));
        if (typeof window.ResizeObserver === 'function') new ResizeObserver(debounce(sizeCanvas, 120)).observe(frame);
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(function () { draw(); }).catch(function () {});

        /* Changement de langue : textes dynamiques du jeu */
        document.addEventListener('languagechange', function () {
            syncPlayers();
            if (!$('wp-wheel').classList.contains('hidden')) {
                $('wp-wheel-hint').textContent = t('who.wheel.hint', { n: players.length });
            }
            if (resultBox.classList.contains('open')) renderResult();
            draw();
        });

        syncPlayers();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* API de debug / tests */
    window.LeManoirWhoPays = {
        add: addPlayer,
        clear: clearPlayers,
        spin: spin,
        get players() { return players.slice(); },
        get winner() { return winner; },
        get spinning() { return spinning; },
        share: shareStory
    };
})();
