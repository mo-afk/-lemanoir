document.addEventListener('DOMContentLoaded', () => {

    const loader = document.querySelector('.loader-overlay');

    window.addEventListener('load', () => {
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 2200);
            setTimeout(() => {
                loader.style.display = 'none';
            }, 2800);
        }
    });

    setTimeout(() => {
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            setTimeout(() => { loader.style.display = 'none'; }, 600);
        }
    }, 5000);

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }

    const darkModeToggle = document.querySelector('.dark-mode-toggle');

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);

            if (navigator.vibrate) {
                navigator.vibrate(15);
            }
        });
    }

    function centerActiveLink(activeLink) {
        const navContainer = document.querySelector('.nav-container');
        if (!activeLink || !navContainer) return;
        const containerWidth = navContainer.offsetWidth;
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.offsetWidth;
        const scrollPosition = linkLeft - (containerWidth / 2) + (linkWidth / 2);
        navContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    const sliderVideos = document.querySelectorAll('.hero-slider video');
    let currentVideoIndex = 0;

    if (sliderVideos.length > 1) {
        setInterval(() => {
            sliderVideos[currentVideoIndex].classList.remove('active');
            currentVideoIndex = (currentVideoIndex + 1) % sliderVideos.length;
            sliderVideos[currentVideoIndex].classList.add('active');
        }, 6000);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.menu-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                navLinks.forEach(link => link.classList.remove('active'));
                if (activeLink) {
                    activeLink.classList.add('active');
                    centerActiveLink(activeLink);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const popularCards = document.querySelectorAll('.popular-card');
    const modal = document.getElementById('item-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal(card) {
        const vidEl = card.querySelector('video');
        const sourceEl = card.querySelector('source');
        const title = card.querySelector('h3')?.innerText || '';
        const description = card.dataset.description || '';

        const videoSrc =
            (vidEl && (vidEl.currentSrc || vidEl.src)) ||
            (sourceEl && (sourceEl.currentSrc || sourceEl.dataset.src)) ||
            '';

        if (modal && modalVideo && videoSrc && title) {
            modalVideo.src = videoSrc;
            modalVideo.load();
            modalTitle.innerText = title;
            modalDescription.innerText = description;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            modalVideo.play().catch(e => console.log("Video play prevented:", e));
        }
    }

    function closeModal() {
        if (!modal || !modalVideo) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalVideo.pause();
        modalVideo.src = '';
    }

    if (modal && modalVideo && modalTitle && modalDescription) {
        popularCards.forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    const backToTop = document.querySelector('.back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const allCardVideos = document.querySelectorAll('.popular-card video');

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.25
        });

        allCardVideos.forEach(video => videoObserver.observe(video));
    }

    const nav = document.querySelector('.category-nav');

    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            } else {
                nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
            }
        }, { passive: true });
    }

});


/* ==========================================================================
   LA ROULETTE LE MANOIR  —  Floating Widget (FAB + Modal)
   ==========================================================================
   • Lit la carte depuis le DOM déjà présent dans index.html (rien n'est dupliqué).
   • Modes Solo / Groupe, tirage tour par tour, pas de doublon à la même table.
   • Résumé de la table (addition) + mini-jeu "Qui paye l'addition ?".
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------------------------------------------- Configuration --- */

    var SLICE_COUNT     = 8;
    var MIN_MAIN_PRICE  = 30;
    var SPIN_MS         = 3600;
    var SPIN_MS_REDUCED = 1100;
    var FULL_TURNS      = 5;
    var MIN_GROUP       = 2;
    var MAX_GROUP       = 8;

    var PERIODS = {
        breakfast: { label: 'Petit-déjeuner', short: 'petit-déjeuner' },
        lunch:     { label: 'Déjeuner',       short: 'déjeuner' },
        dinner:    { label: 'Dîner',          short: 'dîner' }
    };

    var SECTION_META = {
        'petit-dejeuner':   { label: 'Petit Déjeuner',   meals: ['breakfast'] },
        'brunch':           { label: 'Brunch',           meals: ['breakfast', 'lunch'] },
        'sandwichs':        { label: 'Sandwichs',        meals: ['lunch', 'dinner'] },
        'specialites':      { label: 'Spécialités',      meals: ['breakfast', 'lunch', 'dinner'] },
        'crepes':           { label: 'Crêpes',           meals: ['lunch', 'dinner'] },
        'desserts':         { label: 'Desserts',         kind: 'dessert' },
        'desserts-maison':  { label: 'Desserts Maison',  kind: 'dessert' },
        'glaces':           { label: 'Glaces & Tartufo', kind: 'dessert' },
        'boissons-chaudes': { label: 'Boissons Chaudes', kind: 'drink', meals: ['breakfast'] },
        'boissons-froides': { label: 'Boissons Froides', kind: 'drink', meals: ['lunch', 'dinner'] },
        'ice-coffee':       { label: 'Ice Coffee',       kind: 'drink', meals: ['lunch', 'dinner'] },
        'milkshakes':       { label: 'Milkshakes',       kind: 'drink', meals: ['lunch', 'dinner'] },
        'mocktails':        { label: 'Mocktails',        kind: 'drink', meals: ['lunch', 'dinner'] }
    };

    var DRINK_HINTS   = ['boisson', 'coffee', 'cafe', 'milkshake', 'smoothie', 'mocktail', 'mojito', 'the', 'jus', 'soda'];
    var DESSERT_HINTS = ['dessert', 'glace', 'tartufo', 'patisserie', 'gaufre', 'pancake', 'choux'];

    var SIDE_WORDS = ['frites', 'fry', 'fries', 'onion rings', 'nuggets', 'mozzarella sticks',
                      'jalapeno', 'cheesy', 'potatoes', 'supplement', 'boule', 'tranche',
                      'topping', 'crouton'];

    var SAVORY_WORDS = ['poulet', 'jambon', 'fromage', 'steak', 'marisco', 'de mer', 'salee',
                        'champignon', 'oeuf', 'khlii', 'omelette', 'saumon', 'thon', 'croque',
                        'merguez', 'crispy', 'bagel'];

    var SWEET_WORDS = ['chocolat', 'choco', 'oreo', 'speculoos', 'lotus', 'pistache', 'pistachio',
                       'pistacchio', 'banane', 'caramel', 'fruits', 'tiramisu', 'nutella', 'amlou',
                       'kuna', 'kunafa', 'pancake', 'gaufre', 'choux', 'maracuja', 'sucree'];

    /* ------------------------------------------------------------- Utils --- */

    function normalize(str) {
        return String(str || '').toLowerCase().normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ')
            .replace(/\s+/g, ' ').trim();
    }
    function hasAny(h, words) { for (var i = 0; i < words.length; i++) if (h.indexOf(words[i]) !== -1) return true; return false; }
    function parsePrice(t) { var m = String(t || '').match(/(\d+(?:[.,]\d+)?)\s*(?:dh|mad|dhs)/i); return m ? parseFloat(m[1].replace(',', '.')) : null; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function weightOf(it) { return it.video ? 2 : 1; }
    function pickWeighted(list) {
        var total = 0, i;
        for (i = 0; i < list.length; i++) total += weightOf(list[i]);
        var r = Math.random() * total;
        for (i = 0; i < list.length; i++) { r -= weightOf(list[i]); if (r <= 0) return list[i]; }
        return list[list.length - 1];
    }

    /* --------------------------------------------------- Lecture du DOM --- */

    function sectionMeta(section) {
        var id = section.id || '';
        if (SECTION_META[id]) return SECTION_META[id];
        var title = normalize((section.querySelector('.section-header h2') || {}).textContent);
        var kind = hasAny(title, DRINK_HINTS) ? 'drink' : hasAny(title, DESSERT_HINTS) ? 'dessert' : null;
        return { label: (section.querySelector('.section-header h2') || {}).textContent || 'La carte', kind: kind, meals: kind ? [] : ['breakfast', 'lunch', 'dinner'] };
    }

    function readMedia(card) {
        var video = card.querySelector('video');
        var source = card.querySelector('source');
        var src = (source && (source.getAttribute('data-src') || source.getAttribute('src'))) || (video && video.getAttribute('src')) || '';
        return { video: src || null, poster: (video && video.getAttribute('poster')) || null };
    }

    function buildMenuItem(card, section) {
        var h3 = card.querySelector('h3');
        if (!h3) return null;
        var name = h3.textContent.trim();
        var pEl = card.querySelector('p');
        var pText = pEl ? pEl.textContent.trim() : '';
        var priceOnly = /^\s*\d+(?:[.,]\d+)?\s*dh\s*$/i.test(pText);
        var price = parsePrice((card.querySelector('.price') || {}).textContent) || (priceOnly ? parsePrice(pText) : null);
        var media = readMedia(card);
        return { id: name + '|' + section.id, name: name, price: price, description: priceOnly ? '' : pText,
                 badge: (card.querySelector('.card-badge') || {}).textContent || '', sectionId: section.id,
                 el: card, video: media.video, poster: media.poster };
    }

    function classify(item, meta) {
        var n = normalize(item.name);
        if (meta.kind === 'drink') return 'drink';
        if (meta.kind === 'dessert') return 'dessert';
        if (hasAny(n, SIDE_WORDS)) return 'side';
        if (item.price !== null && item.price < MIN_MAIN_PRICE) return 'side';
        return 'main';
    }
    function flavor(item) {
        var n = normalize(item.name);
        if (hasAny(n, SAVORY_WORDS)) return 'savory';
        if (hasAny(n, SWEET_WORDS)) return 'sweet';
        return 'neutral';
    }
    function finishItem(item, meta, meals) {
        item.kind = classify(item, meta);
        item.flavor = flavor(item);
        item.sectionName = meta.label;
        item.meals = item.kind === 'main' ? meals : (meta.meals || []);
    }
    function collectMenu() {
        var items = [];
        Array.prototype.forEach.call(document.querySelectorAll('main .menu-section'), function (section) {
            var meta = sectionMeta(section);
            var meals = meta.meals || [];
            Array.prototype.forEach.call(section.querySelectorAll('.popular-card'), function (card) {
                var item = buildMenuItem(card, section);
                if (!item) return;
                var desc = card.getAttribute('data-description'); if (desc) item.description = desc.trim();
                var badge = card.querySelector('.card-badge'); item.badge = badge ? badge.textContent.trim() : '';
                finishItem(item, meta, meals); items.push(item);
            });
            Array.prototype.forEach.call(section.querySelectorAll('.menu-item-card'), function (card) {
                var item = buildMenuItem(card, section);
                if (!item) return;
                finishItem(item, meta, meals); items.push(item);
            });
        });
        return items;
    }
    function candidatesFor(period) {
        return MENU.filter(function (it) {
            if (it.kind !== 'main') return false;
            if (it.meals.indexOf(period) === -1) return false;
            if (period === 'lunch' && it.flavor === 'sweet') return false;
            return true;
        });
    }

    /* ---------------------------------------------------------------- DOM --- */

    var MENU = [];
    var state = {
        mode: null,               // 'solo' | 'group'
        period: 'lunch',
        groupSize: 2,
        players: [],              // [{name, dish, confirmed}]
        current: 0,
        takenIds: [],             // plats déjà validés à la table
        payersNeeded: 1,
        payers: [],
        screen: 'mode'
    };

    var canvas, ctx, frame, hub, wheelShell;
    var modal, fab, closeBtn;
    var spinBtn, paySpinBtn, hintEl, turnInfo;
    var reel, reelText, resultCard;
    var resultTitle, resultPrice, resultOrigin, resultDesc, resultKicker;
    var resultMedia, resultVideo, resultMediaLabel;
    var actRespin, actValidate;
    var gsMinus, gsPlus, gsValue, gsStart;
    var sumList, sumTotal, sumPay, sumRestart;
    var payNames, payCount, payResult;

    var pool = [];
    var slices = [];
    var winner = null;
    var rotation = 0;
    var spinning = false;
    var radius = 0;
    var reelTimer = null;
    var onEnd = null;
    var wheelKind = 'dish';
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(id) { return document.getElementById(id); }

    function init() {
        canvas = $('wheel-canvas');
        frame = document.querySelector('.wheel-frame');
        hub = $('wheel-hub');
        wheelShell = $('wheel-shell');
        modal = $('roulette-modal');
        fab = $('roulette-fab');
        closeBtn = $('rm-close');
        spinBtn = $('spin-btn');
        paySpinBtn = $('pay-spin');
        hintEl = $('roulette-hint');
        turnInfo = $('rm-turn-info');
        reel = $('result-reel');
        reelText = $('result-reel-text');
        resultCard = $('result-card');
        resultTitle = $('result-title');
        resultPrice = $('result-price');
        resultOrigin = $('result-origin');
        resultDesc = $('result-desc');
        resultKicker = $('result-kicker');
        resultMedia = $('result-media');
        resultVideo = $('result-video');
        resultMediaLabel = $('result-media-label');
        actRespin = $('act-respin');
        actValidate = $('act-validate');
        gsMinus = $('gs-minus');
        gsPlus = $('gs-plus');
        gsValue = $('gs-value');
        gsStart = $('gs-start');
        sumList = $('sum-list');
        sumTotal = $('sum-total');
        sumPay = $('sum-pay');
        sumRestart = $('sum-restart');
        payNames = $('pay-names');
        payCount = $('pay-count');
        payResult = $('pay-result');

        if (!canvas || !modal || !fab) return;
        ctx = canvas.getContext('2d');
        MENU = collectMenu();

        var h = new Date().getHours();
        state.period = h < 11 ? 'breakfast' : (h < 17 ? 'lunch' : 'dinner');

        bindEvents();
        syncPeriodChips();

        window.addEventListener('resize', debounce(sizeCanvas, 180));
        if (typeof window.ResizeObserver === 'function') {
            new ResizeObserver(debounce(sizeCanvas, 120)).observe(frame);
        }
        if (typeof MutationObserver === 'function') {
            new MutationObserver(function () { draw(); })
                .observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
            document.fonts.ready.then(function () { draw(); }).catch(function () {});
        }
    }

    function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

    /* --------------------------------------------------------- Événements --- */

    function bindEvents() {
        fab.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

        Array.prototype.forEach.call(document.querySelectorAll('.mode-btn'), function (b) {
            b.addEventListener('click', function () { chooseMode(b.getAttribute('data-mode')); });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function (c) {
            c.addEventListener('click', function () { if (!spinning) setPeriod(c.getAttribute('data-period')); });
        });

        gsMinus.addEventListener('click', function () { setGroupSize(state.groupSize - 1); });
        gsPlus.addEventListener('click', function () { setGroupSize(state.groupSize + 1); });
        gsStart.addEventListener('click', startGroup);

        spinBtn.addEventListener('click', function () { spinDish(false); });
        hub.addEventListener('click', function () { spinDish(false); });
        actRespin.addEventListener('click', function () { spinDish(true); });
        actValidate.addEventListener('click', validateCurrent);

        sumPay.addEventListener('click', openPay);
        sumRestart.addEventListener('click', function () { resetTable(); showScreen('mode'); });

        Array.prototype.forEach.call(payCount.querySelectorAll('.paycount-btn'), function (b) {
            b.addEventListener('click', function () {
                state.payersNeeded = parseInt(b.getAttribute('data-count'), 10) || 1;
                Array.prototype.forEach.call(payCount.querySelectorAll('.paycount-btn'), function (x) {
                    x.classList.toggle('is-active', x === b);
                });
            });
        });
        paySpinBtn.addEventListener('click', spinPay);

        resultVideo.addEventListener('error', function () { resultMedia.classList.remove('has-video'); });
    }

    /* ------------------------------------------------------ Ouverture modal --- */

    function openModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        showScreen(state.mode ? state.screen : 'mode');
        setTimeout(sizeCanvas, 60);
    }
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (resultVideo) { resultVideo.pause(); }
    }

    function showScreen(name) {
        state.screen = name;
        Array.prototype.forEach.call(document.querySelectorAll('.rm-screen'), function (s) {
            s.classList.toggle('is-active', s.getAttribute('data-screen') === name);
        });
        var showWheel = (name === 'play' || name === 'pay');
        wheelShell.classList.toggle('show', showWheel);
        if (showWheel) setTimeout(sizeCanvas, 40);
        if (name !== 'play') { hideResult(); }
    }

    function chooseMode(mode) {
        state.mode = mode;
        if (mode === 'solo') {
            startSolo();
        } else {
            showScreen('groupsize');
        }
    }

    function setGroupSize(n) {
        state.groupSize = Math.max(MIN_GROUP, Math.min(MAX_GROUP, n));
        gsValue.textContent = state.groupSize;
    }

    function startSolo() {
        resetTable();
        state.mode = 'solo';
        state.players = [{ name: 'Vous', dish: null, confirmed: false }];
        state.current = 0;
        enterPlay();
    }

    function startGroup() {
        resetTable();
        state.mode = 'group';
        state.players = [];
        for (var i = 0; i < state.groupSize; i++) {
            state.players.push({ name: 'Joueur ' + (i + 1), dish: null, confirmed: false });
        }
        state.current = 0;
        enterPlay();
    }

    function resetTable() {
        state.players = [];
        state.current = 0;
        state.takenIds = [];
        state.payers = [];
    }

    function enterPlay() {
        hideResult();
        showScreen('play');
        updateTurnInfo();
    }

    function updateTurnInfo() {
        if (state.mode === 'solo') {
            turnInfo.innerHTML = 'À vous de jouer&nbsp;!';
        } else {
            var p = state.players[state.current];
            turnInfo.innerHTML = 'Tour de <strong>' + esc(p.name) + '</strong> · ' + (state.current + 1) + '/' + state.players.length;
        }
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ------------------------------------------------------ Période / pool --- */

    function setPeriod(p) {
        if (!PERIODS[p]) return;
        state.period = p;
        syncPeriodChips();
        updateHint();
    }
    function syncPeriodChips() {
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function (c) {
            c.classList.toggle('active', c.getAttribute('data-period') === state.period);
        });
        updateHint();
    }
    function updateHint() {
        if (hintEl) hintEl.textContent = candidatesFor(state.period).length + ' plats en jeu · ' + PERIODS[state.period].label;
    }

    function availableDishes(excludeCurrent) {
        var base = candidatesFor(state.period).filter(function (it) {
            return state.takenIds.indexOf(it.id) === -1;
        });
        if (excludeCurrent && winner && winner.kind === 'main') {
            base = base.filter(function (it) { return it.id !== winner.id; });
        }
        /* Si la table a presque tout pris, on ré-ouvre la carte pour ne pas bloquer */
        return base.length >= 2 ? base : candidatesFor(state.period);
    }

    /* ------------------------------------------------------------- La roue --- */

    function buildSlices(win) {
        if (!pool.length) return [];
        var n = Math.min(SLICE_COUNT, pool.length);
        if (!win) return shuffle(pool).slice(0, n);
        var rest = shuffle(pool.filter(function (x) { return x !== win; })).slice(0, n - 1);
        return shuffle([win].concat(rest));
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
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        radius = css / 2;
        draw();
    }

    function palette() {
        var cs = getComputedStyle(document.body);
        function v(name, fb) { var val = cs.getPropertyValue(name); return (val && val.trim()) || fb; }
        return { sliceA: v('--wheel-slice-a', '#F7F1E8'), sliceB: v('--wheel-slice-b', '#C8956C'),
                 inkA: v('--wheel-ink-a', '#1A1A1A'), inkB: v('--wheel-ink-b', '#241708'),
                 rim: v('--wheel-rim', '#1A1A1A'), accent: v('--accent', '#C8956C') };
    }
    function shortLabel(n) { return n.length > 24 ? n.slice(0, 22).trim() + '…' : n; }

    function wrapText(text, maxWidth, maxLines) {
        var words = String(text).split(' ');
        var lines = []; var line = ''; var overflow = false;
        for (var i = 0; i < words.length; i++) {
            var test = line ? line + ' ' + words[i] : words[i];
            if (!line || ctx.measureText(test).width <= maxWidth) { line = test; continue; }
            if (lines.length < maxLines - 1) { lines.push(line); line = words[i]; }
            else { line = line + ' ' + words.slice(i).join(' '); overflow = true; break; }
        }
        if (line) lines.push(line);
        var lastIdx = lines.length - 1;
        var last = lines[lastIdx] || '';
        if (overflow || ctx.measureText(last).width > maxWidth) {
            var cut = last;
            while (cut.length > 1 && ctx.measureText(cut + '…').width > maxWidth) cut = cut.slice(0, -1).trim();
            lines[lastIdx] = cut + '…';
        }
        return lines;
    }

    function draw() {
        if (!ctx || !radius || !slices.length) return;
        var c = palette();
        var R = radius, rIn = R * 0.9, n = slices.length, step = (Math.PI * 2) / n;
        ctx.clearRect(0, 0, R * 2, R * 2);
        ctx.save(); ctx.translate(R, R); ctx.rotate(rotation * Math.PI / 180);

        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = c.rim; ctx.fill();
        var studs = Math.max(16, n * 2);
        for (var s = 0; s < studs; s++) {
            var a = (s / studs) * Math.PI * 2;
            ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.952, Math.sin(a) * R * 0.952, R * 0.012, 0, Math.PI * 2);
            ctx.fillStyle = s % 2 === 0 ? c.accent : 'rgba(255,255,255,0.55)'; ctx.fill();
        }
        for (var i = 0; i < n; i++) {
            var a0 = -Math.PI / 2 + i * step, a1 = a0 + step, light = i % 2 === 0;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, rIn, a0, a1); ctx.closePath();
            ctx.fillStyle = light ? c.sliceA : c.sliceB; ctx.fill();
            ctx.lineWidth = Math.max(1, R * 0.006); ctx.strokeStyle = 'rgba(200,149,108,0.55)'; ctx.stroke();

            var mid = a0 + step / 2, fs = Math.max(9, Math.min(R * 0.088, 15));
            ctx.save(); ctx.rotate(mid);
            var flip = Math.cos(mid) < 0;
            if (flip) ctx.rotate(Math.PI);
            ctx.textAlign = flip ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            ctx.font = '700 ' + fs.toFixed(1) + 'px Lato, sans-serif';
            ctx.fillStyle = light ? c.inkA : c.inkB;
            var pad = R * 0.075, x = flip ? -(rIn - pad) : (rIn - pad);
            var lines = wrapText(shortLabel(slices[i].name), R * 0.5, 3);
            var lineH = fs * 1.18, y0 = -((lines.length - 1) * lineH) / 2;
            for (var l = 0; l < lines.length; l++) ctx.fillText(lines[l], x, y0 + l * lineH);
            ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, rIn, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, R * 0.014); ctx.strokeStyle = c.accent; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, R * 0.19, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
        ctx.restore();
    }

    function sliceIndexAtPointer() {
        if (!slices.length) return -1;
        var step = 360 / slices.length;
        var a = ((-rotation % 360) + 360) % 360;
        return Math.floor(a / step) % slices.length;
    }

    function setSpinDisabled(dis) {
        if (spinBtn) spinBtn.disabled = dis;
        if (paySpinBtn) paySpinBtn.disabled = dis;
    }

    function beginSpin(list, kind, endFn) {
        if (spinning || !list.length) return;
        spinning = true;
        setSpinDisabled(true);
        wheelKind = kind;
        onEnd = endFn;
        pool = list;
        resultCard.classList.remove('visible');

        if (kind === 'dish') { reel.classList.remove('hidden'); startReel(list); }
        else { reel.classList.add('hidden'); }

        winner = pickWeighted(list);
        slices = buildSlices(winner);
        draw();

        var step = 360 / slices.length;
        var jitter = (Math.random() * 0.6 - 0.3) * step;
        var winIndex = slices.indexOf(winner);
        var target = -((winIndex + 0.5) * step) - jitter;
        var current = ((rotation % 360) + 360) % 360;
        var delta = (((target - current) % 360) + 360) % 360;
        animateTo(rotation + 360 * FULL_TURNS + delta);
    }

    function animateTo(target) {
        var from = rotation, distance = target - from;
        var duration = reduced ? SPIN_MS_REDUCED : SPIN_MS;
        var start = performance.now();
        var lastIdx = sliceIndexAtPointer();
        var pointer = document.querySelector('.wheel-pointer');
        function step(now) {
            var p = Math.min(1, (now - start) / duration);
            var e = 1 - Math.pow(1 - p, 4);
            rotation = from + distance * e;
            draw();
            var idx = sliceIndexAtPointer();
            if (idx !== lastIdx) {
                lastIdx = idx;
                if (pointer) { pointer.classList.remove('tick'); void pointer.offsetWidth; pointer.classList.add('tick'); }
                if (navigator.vibrate && !reduced) navigator.vibrate(6);
            }
            if (p < 1) requestAnimationFrame(step);
            else { rotation = target; draw(); finishSpin(); }
        }
        requestAnimationFrame(step);
    }

    function startReel(list) {
        stopReel();
        if (reduced) return;
        reelTimer = setInterval(function () {
            var it = list[Math.floor(Math.random() * list.length)];
            reelText.textContent = it.name;
            reelText.classList.remove('rolling'); void reelText.offsetWidth; reelText.classList.add('rolling');
        }, 95);
    }
    function stopReel() { if (reelTimer) { clearInterval(reelTimer); reelTimer = null; } }

    function finishSpin() {
        stopReel();
        spinning = false;
        setSpinDisabled(false);
        if (onEnd) onEnd(winner);
    }

    /* ------------------------------------------------------- Spin des plats --- */

    function spinDish(isRespin) {
        if (state.screen !== 'play') return;
        var list = availableDishes(isRespin);
        beginSpin(list, 'dish', onDishLand);
    }

    function onDishLand(item) {
        reel.classList.add('hidden');
        showDishResult(item);
        if (navigator.vibrate && !reduced) navigator.vibrate([18, 60, 24]);
    }

    function hideResult() {
        resultCard.classList.remove('visible');
        reel.classList.remove('hidden');
        reelText.textContent = 'Prêt à tourner la roue';
        if (resultVideo) { resultVideo.pause(); resultVideo.removeAttribute('src'); resultVideo.load(); }
        resultMedia.classList.remove('has-video');
    }

    function showDishResult(item) {
        resultKicker.textContent = 'Le hasard a choisi';
        resultTitle.textContent = item.name;
        resultPrice.textContent = item.price !== null ? item.price + ' Dh' : '';
        resultOrigin.textContent = item.sectionName;
        resultDesc.textContent = item.description || (item.badge
            ? 'Incontournable de la carte — ' + item.badge + '.'
            : 'À retrouver dans notre carte ' + item.sectionName + '.');
        resultMediaLabel.textContent = item.sectionName;

        if (item.video) {
            resultMedia.classList.add('has-video');
            if (item.poster) resultVideo.poster = item.poster;
            resultVideo.src = item.video;
            resultVideo.load();
            var p = resultVideo.play();
            if (p && p.catch) p.catch(function () {});
        } else {
            resultMedia.classList.remove('has-video');
            resultVideo.pause(); resultVideo.removeAttribute('src'); resultVideo.load();
        }

        actValidate.innerHTML = state.mode === 'group'
            ? '<i class="fas fa-check"></i> Valider &amp; Suivant'
            : '<i class="fas fa-check"></i> C\'est choisi !';

        resultCard.classList.remove('visible'); void resultCard.offsetWidth; resultCard.classList.add('visible');
    }

    function validateCurrent() {
        if (!winner || winner.kind !== 'main') return;
        if (state.mode === 'solo') { closeModal(); return; }

        var player = state.players[state.current];
        player.dish = winner;
        player.confirmed = true;
        if (state.takenIds.indexOf(winner.id) === -1) state.takenIds.push(winner.id);
        state.current++;

        if (state.current < state.players.length) {
            hideResult();
            updateTurnInfo();
        } else {
            buildSummary();
            showScreen('summary');
        }
    }

    /* ---------------------------------------------------------- Résumé table --- */

    function tableTotal() {
        var t = 0;
        state.players.forEach(function (p) { if (p.dish && p.dish.price !== null) t += p.dish.price; });
        return t;
    }

    function buildSummary() {
        sumList.innerHTML = '';
        state.players.forEach(function (p, i) {
            var li = document.createElement('li');
            li.style.animationDelay = (i * 0.08) + 's';
            var price = p.dish && p.dish.price !== null ? p.dish.price + ' Dh' : '—';
            li.innerHTML = '<span class="sum-player">' + esc(p.name) + '</span>' +
                           '<span class="sum-dish">' + esc(p.dish ? p.dish.name : '—') + '</span>' +
                           '<span class="sum-price">' + price + '</span>';
            sumList.appendChild(li);
        });
        sumTotal.textContent = tableTotal() + ' Dh';
    }

    /* ------------------------------------------------------------- Qui paye --- */

    function openPay() {
        state.payers = [];
        payResult.innerHTML = '';
        buildPayNames();
        showScreen('pay');
    }

    function buildPayNames() {
        payNames.innerHTML = '';
        state.players.forEach(function (p) {
            var input = document.createElement('input');
            input.type = 'text';
            input.value = p.name;
            input.setAttribute('data-player', p.name);
            input.setAttribute('aria-label', 'Nom du participant');
            payNames.appendChild(input);
        });
    }

    function currentNames() {
        var names = [];
        Array.prototype.forEach.call(payNames.querySelectorAll('input'), function (inp, i) {
            var v = inp.value.trim() || ('Joueur ' + (i + 1));
            names.push({ name: v, video: null });
        });
        return names;
    }

    function spinPay() {
        if (state.screen !== 'pay') return;
        var remaining = currentNames().filter(function (n) { return state.payers.indexOf(n.name) === -1; });
        if (!remaining.length) return;
        payResult.innerHTML = '<span>La roue tourne…</span>';
        beginSpin(remaining, 'names', onNameLand);
    }

    function onNameLand(item) {
        state.payers.push(item.name);
        var need = Math.min(state.payersNeeded, currentNames().length);

        if (state.payers.length < need) {
            payResult.innerHTML = '<span class="win">' + esc(item.name) + '</span> paye… encore un tour&nbsp;!';
            return;
        }

        var total = tableTotal();
        var share = need > 0 ? Math.round(total / need) : total;
        var msg = state.payers.length === 1
            ? '<span class="win">' + esc(state.payers[0]) + '</span> paye l\'addition&nbsp;!'
            : '<span class="win">' + esc(state.payers.join(' & ')) + '</span> se partagent l\'addition&nbsp;!';
        payResult.innerHTML = msg + '<br><small>' + share + ' Dh / personne</small>';
        confetti();
        if (navigator.vibrate && !reduced) navigator.vibrate([30, 60, 30, 60, 60]);
    }

    function confetti() {
        var host = payResult;
        var colors = ['#C8956C', '#F7F1E8', '#2ECC71', '#E67E22', '#FFFFFF'];
        for (var i = 0; i < 40; i++) {
            var piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.background = colors[i % colors.length];
            piece.style.animationDuration = (1 + Math.random() * 1.4) + 's';
            piece.style.animationDelay = (Math.random() * 0.3) + 's';
            host.appendChild(piece);
            (function (el) { setTimeout(function () { el.remove(); }, 3200); })(piece);
        }
    }

    /* ------------------------------------------------------------- Démarrage --- */

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* Exposé pour les tests / la console */
    window.LeManoirRoulette = {
        get menu()     { return MENU; },
        get state()    { return state; },
        get pool()     { return pool; },
        get slices()   { return slices; },
        get winner()   { return winner; },
        get rotation() { return rotation; },
        get spinning() { return spinning; },
        pointerIndex:  sliceIndexAtPointer,
        candidatesFor: candidatesFor,
        open:          openModal,
        close:         closeModal,
        chooseMode:    chooseMode,
        setGroupSize:  setGroupSize,
        startGroup:    startGroup,
        spinDish:      spinDish,
        validate:      validateCurrent,
        openPay:       openPay,
        spinPay:       spinPay,
        setPeriod:     setPeriod
    };
})();
