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
   LA ROULETTE LE MANOIR  —  Wheel of Fortune / Random Dish Spinner
   ==========================================================================
   • Lit la carte directement depuis le DOM déjà présent dans index.html
     (sections .menu-section > .popular-card / .menu-item-card) : aucune donnée
     n'est dupliquée, la roue suit automatiquement la carte et ses vidéos.
   • Classe chaque article : plat / à-côté / dessert / boisson  +  salé / sucré.
   • Ne fait gagner qu'un VRAI plat principal, cohérent avec le service choisi
     (jamais un jus, une frite, une boule de glace ou un accompagnement seul).
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------------------------------------------- Configuration --- */

    var SLICE_COUNT     = 8;     // tranches affichées sur la roue
    var MIN_MAIN_PRICE  = 30;    // en dessous de 30 Dh dans une carte salée = à-côté
    var SPIN_MS         = 4200;
    var SPIN_MS_REDUCED = 1200;
    var FULL_TURNS      = 6;

    var PERIODS = {
        breakfast: { label: 'Petit-déjeuner', short: 'petit-déjeuner', time: '07h — 11h' },
        lunch:     { label: 'Déjeuner',       short: 'déjeuner',       time: '12h — 16h' },
        dinner:    { label: 'Dîner',          short: 'dîner',          time: '19h — 00h' }
    };

    /* Sections déjà présentes dans index.html : quels services elles couvrent
       et ce qu'elles contiennent. Les boissons/desserts servent uniquement aux
       suggestions d'accompagnement — jamais au tirage du plat principal.      */
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

    /* Filets de sécurité pour les futures sections : on devine d'après le titre */
    var DRINK_HINTS   = ['boisson', 'coffee', 'cafe', 'milkshake', 'smoothie', 'mocktail', 'mojito', 'the', 'jus', 'soda'];
    var DESSERT_HINTS = ['dessert', 'glace', 'tartufo', 'patisserie', 'gaufre', 'pancake', 'choux'];

    /* Ce qui n'est PAS un plat principal */
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
        return String(str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9 ]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function hasAny(haystack, words) {
        for (var i = 0; i < words.length; i++) {
            if (haystack.indexOf(words[i]) !== -1) return true;
        }
        return false;
    }

    function parsePrice(text) {
        var m = String(text || '').match(/(\d+(?:[.,]\d+)?)\s*(?:dh|mad|dhs)/i);
        return m ? parseFloat(m[1].replace(',', '.')) : null;
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function pickWeighted(list) {
        var total = 0, i;
        for (i = 0; i < list.length; i++) total += weightOf(list[i]);
        var r = Math.random() * total;
        for (i = 0; i < list.length; i++) {
            r -= weightOf(list[i]);
            if (r <= 0) return list[i];
        }
        return list[list.length - 1];
    }

    /* Léger bonus aux plats qui ont une vidéo : le résultat est plus beau. */
    function weightOf(item) {
        return item.video ? 2 : 1;
    }

    /* --------------------------------------------------- Lecture du DOM --- */

    function sectionMeta(section) {
        var id = section.id || '';
        if (SECTION_META[id]) return SECTION_META[id];

        var title = normalize((section.querySelector('.section-header h2') || {}).textContent);
        var kind = hasAny(title, DRINK_HINTS) ? 'drink'
                 : hasAny(title, DESSERT_HINTS) ? 'dessert'
                 : null;
        return { label: (section.querySelector('.section-header h2') || {}).textContent || 'La carte',
                 kind: kind,
                 meals: kind ? [] : ['breakfast', 'lunch', 'dinner'] };
    }

    function readMedia(card) {
        var video  = card.querySelector('video');
        var source = card.querySelector('source');
        var src = (source && (source.getAttribute('data-src') || source.getAttribute('src'))) ||
                  (video && video.getAttribute('src')) || '';
        return {
            video:  src || null,
            poster: (video && video.getAttribute('poster')) || null
        };
    }

    function buildMenuItem(card, section) {
        var h3 = card.querySelector('h3');
        if (!h3) return null;

        var name  = h3.textContent.trim();
        var pEl   = card.querySelector('p');
        var pText = pEl ? pEl.textContent.trim() : '';
        /* Dans les cartes compactes, le <p> contient juste le prix ("50 Dh") */
        var priceOnly = /^\s*\d+(?:[.,]\d+)?\s*dh\s*$/i.test(pText);

        var price = parsePrice((card.querySelector('.price') || {}).textContent) ||
                    (priceOnly ? parsePrice(pText) : null);

        var media = readMedia(card);

        return {
            id:          name + '|' + section.id,
            name:        name,
            price:       price,
            description: priceOnly ? '' : pText,
            badge:       (card.querySelector('.card-badge') || {}).textContent || '',
            sectionId:   section.id,
            el:          card,
            video:       media.video,
            poster:      media.poster
        };
    }

    function buildPopularItem(card, section) {
        var base = buildMenuItem(card, section);
        if (!base) return null;
        var desc = card.getAttribute('data-description');
        if (desc) base.description = desc.trim();
        var badge = card.querySelector('.card-badge');
        base.badge = badge ? badge.textContent.trim() : '';
        return base;
    }

    function classify(item, meta) {
        var n = normalize(item.name);

        if (meta.kind === 'drink')   return 'drink';
        if (meta.kind === 'dessert') return 'dessert';
        if (hasAny(n, SIDE_WORDS))   return 'side';

        /* Filet de sécurité : un article très bon marché d'une carte salée
           est un accompagnement, pas un plat. */
        if (item.price !== null && item.price < MIN_MAIN_PRICE) return 'side';

        return 'main';
    }

    function flavor(item) {
        var n = normalize(item.name);
        if (hasAny(n, SAVORY_WORDS)) return 'savory';
        if (hasAny(n, SWEET_WORDS))  return 'sweet';
        return 'neutral';
    }

    function collectMenu() {
        var items = [];
        var sections = document.querySelectorAll('main .menu-section');

        Array.prototype.forEach.call(sections, function (section) {
            if (section.id === 'roulette') return;

            var meta = sectionMeta(section);
            var meals = meta.meals || [];

            Array.prototype.forEach.call(section.querySelectorAll('.popular-card'), function (card) {
                var item = buildPopularItem(card, section);
                if (!item) return;
                finishItem(item, meta, meals);
                items.push(item);
            });

            Array.prototype.forEach.call(section.querySelectorAll('.menu-item-card'), function (card) {
                var item = buildMenuItem(card, section);
                if (!item) return;
                finishItem(item, meta, meals);
                items.push(item);
            });
        });

        return items;
    }

    function finishItem(item, meta, meals) {
        item.kind        = classify(item, meta);
        item.flavor      = flavor(item);
        item.sectionName = meta.label;
        item.meals       = item.kind === 'main' ? meals : (meta.meals || []);
    }

    /* -------------------------------------------------- Filtrage du tirage --- */

    function candidatesFor(period) {
        return MENU.filter(function (item) {
            if (item.kind !== 'main') return false;              // ni jus, ni dessert
            if (item.meals.indexOf(period) === -1) return false; // bon service
            /* À midi on reste sur du salé : pas de brioche perdue au caramel
               comme plat principal. Le dîner, lui, accepte la touche sucrée. */
            if (period === 'lunch' && item.flavor === 'sweet') return false;
            return true;
        });
    }

    function drinkFor(period) {
        var drinks = MENU.filter(function (item) {
            return item.kind === 'drink' && item.meals.indexOf(period) !== -1;
        });
        return drinks.length ? drinks[Math.floor(Math.random() * drinks.length)] : null;
    }

    /* ---------------------------------------------------------------- DOM --- */

    var MENU = [];
    var canvas, ctx, frame, hub, spinBtn, hintEl;
    var chips, reel, reelText, resultCard;
    var resultTitle, resultPrice, resultOrigin, resultDesc, resultKicker, resultPairing;
    var resultMedia, resultVideo, resultMediaLabel, locateBtn, respinBtn;

    var currentPeriod = 'lunch';
    var pool = [];
    var slices = [];
    var winner = null;
    var rotation = 0;
    var spinning = false;
    var radius = 0;
    var reelTimer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(id) { return document.getElementById(id); }

    function init() {
        canvas   = $('wheel-canvas');
        frame    = document.querySelector('.wheel-frame');
        hub      = $('wheel-hub');
        spinBtn  = $('spin-btn');
        hintEl   = $('roulette-hint');
        chips    = document.querySelectorAll('.period-chip');
        reel     = $('result-reel');
        reelText = $('result-reel-text');
        resultCard = $('result-card');

        resultTitle   = $('result-title');
        resultPrice   = $('result-price');
        resultOrigin  = $('result-origin');
        resultDesc    = $('result-desc');
        resultKicker  = $('result-kicker');
        resultPairing = $('result-pairing');
        resultMedia   = $('result-media');
        resultVideo   = $('result-video');
        resultMediaLabel = $('result-media-label');
        locateBtn     = $('result-locate');
        respinBtn     = $('result-respin');

        if (!canvas || !spinBtn) return;          // section absente : on ne fait rien
        ctx = canvas.getContext('2d');

        MENU = collectMenu();

        /* Service sélectionné d'après l'heure du visiteur */
        var h = new Date().getHours();
        currentPeriod = h < 11 ? 'breakfast' : (h < 17 ? 'lunch' : 'dinner');

        bindEvents();
        setPeriod(currentPeriod, true);
        sizeCanvas();

        window.addEventListener('resize', debounce(sizeCanvas, 180));

        /* Redessin au changement de thème (les couleurs viennent du CSS).
           Enregistré AVANT le ResizeObserver : rien ne doit pouvoir l'empêcher. */
        if (typeof MutationObserver === 'function') {
            new MutationObserver(function () { draw(); })
                .observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        if (typeof window.ResizeObserver === 'function') {
            new ResizeObserver(debounce(sizeCanvas, 120)).observe(frame);
        }

        /* Une fois la webfont Lato chargée, on redessine pour des libellés nets */
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
            document.fonts.ready.then(function () { draw(); }).catch(function () {});
        }
    }

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, ms);
        };
    }

    function bindEvents() {
        Array.prototype.forEach.call(chips, function (chip) {
            chip.addEventListener('click', function () {
                if (spinning) return;
                setPeriod(chip.getAttribute('data-period'));
            });
        });

        spinBtn.addEventListener('click', spin);
        hub.addEventListener('click', spin);
        respinBtn.addEventListener('click', spin);
        locateBtn.addEventListener('click', locateInMenu);

        resultVideo.addEventListener('error', function () {
            resultMedia.classList.remove('has-video');
        });
    }

    function setPeriod(period, initial) {
        if (!PERIODS[period]) return;
        currentPeriod = period;

        Array.prototype.forEach.call(chips, function (chip) {
            chip.classList.toggle('active', chip.getAttribute('data-period') === period);
            chip.setAttribute('aria-pressed', chip.getAttribute('data-period') === period ? 'true' : 'false');
        });

        pool = candidatesFor(period);
        slices = buildSlices();

        hintEl.textContent = pool.length + ' plats en jeu · Service : ' + PERIODS[period].label;

        if (!initial) {
            hideResult();
            reelText.textContent = pool.length + ' plats en jeu';
        }
        rotation = 0;
        draw();
    }

    /* ------------------------------------------------- Construction roue --- */

    /* La roue affiche un échantillon lisible de la carte. Le gagnant est tiré
       sur TOUTE la sélection, puis placé parmi les tranches : la roue et le
       résultat tombent donc toujours d'accord, et chaque lancer est différent. */
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

        canvas.width  = Math.round(css * dpr);
        canvas.height = Math.round(css * dpr);
        canvas.style.width  = css + 'px';
        canvas.style.height = css + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        radius = css / 2;
        draw();
    }

    function palette() {
        var cs = getComputedStyle(document.body);
        function v(name, fallback) {
            var val = cs.getPropertyValue(name);
            return (val && val.trim()) || fallback;
        }
        return {
            sliceA: v('--wheel-slice-a', '#F7F1E8'),
            sliceB: v('--wheel-slice-b', '#C8956C'),
            inkA:   v('--wheel-ink-a', '#1A1A1A'),
            inkB:   v('--wheel-ink-b', '#241708'),
            rim:    v('--wheel-rim', '#1A1A1A'),
            accent: v('--accent', '#C8956C')
        };
    }

    function shortLabel(name) {
        return name.length > 24 ? name.slice(0, 22).trim() + '…' : name;
    }

    function wrapText(text, maxWidth, maxLines) {
        var words = String(text).split(' ');
        var lines = [];
        var line = '';
        var overflow = false;

        for (var i = 0; i < words.length; i++) {
            var test = line ? line + ' ' + words[i] : words[i];
            if (!line || ctx.measureText(test).width <= maxWidth) {
                line = test;
                continue;
            }
            if (lines.length < maxLines - 1) {
                lines.push(line);
                line = words[i];
            } else {
                /* plus de place : on empile la fin, elle sera tronquée */
                line = line + ' ' + words.slice(i).join(' ');
                overflow = true;
                break;
            }
        }
        if (line) lines.push(line);

        var lastIdx = lines.length - 1;
        var last = lines[lastIdx] || '';
        if (overflow || ctx.measureText(last).width > maxWidth) {
            var cut = last;
            while (cut.length > 1 && ctx.measureText(cut + '…').width > maxWidth) {
                cut = cut.slice(0, -1).trim();
            }
            lines[lastIdx] = cut + '…';
        }
        return lines;
    }

    function draw() {
        if (!ctx || !radius || !slices.length) return;

        var c   = palette();
        var R   = radius;
        var rIn = R * 0.9;
        var n   = slices.length;
        var step = (Math.PI * 2) / n;

        ctx.clearRect(0, 0, R * 2, R * 2);
        ctx.save();
        ctx.translate(R, R);
        ctx.rotate(rotation * Math.PI / 180);

        /* Jante extérieure */
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = c.rim;
        ctx.fill();

        /* Clous dorés sur la jante */
        var studs = Math.max(16, n * 2);
        for (var s = 0; s < studs; s++) {
            var a = (s / studs) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * R * 0.952, Math.sin(a) * R * 0.952, R * 0.012, 0, Math.PI * 2);
            ctx.fillStyle = s % 2 === 0 ? c.accent : 'rgba(255,255,255,0.55)';
            ctx.fill();
        }

        /* Tranches */
        for (var i = 0; i < n; i++) {
            var a0 = -Math.PI / 2 + i * step;
            var a1 = a0 + step;
            var light = i % 2 === 0;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, rIn, a0, a1);
            ctx.closePath();
            ctx.fillStyle = light ? c.sliceA : c.sliceB;
            ctx.fill();
            ctx.lineWidth = Math.max(1, R * 0.006);
            ctx.strokeStyle = 'rgba(200,149,108,0.55)';
            ctx.stroke();

            /* Libellé */
            var mid = a0 + step / 2;
            var fs  = Math.max(9, Math.min(R * 0.088, 15));
            ctx.save();
            ctx.rotate(mid);
            var flip = Math.cos(mid) < 0;
            if (flip) ctx.rotate(Math.PI);
            ctx.textAlign = flip ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            ctx.font = '700 ' + fs.toFixed(1) + 'px Lato, sans-serif';
            ctx.fillStyle = light ? c.inkA : c.inkB;

            var pad = R * 0.075;
            var x = flip ? -(rIn - pad) : (rIn - pad);
            /* largeur bornée pour ne pas glisser sous le moyeu central */
            var lines = wrapText(shortLabel(slices[i].name), R * 0.5, 3);
            var lineH = fs * 1.18;
            var y0 = -((lines.length - 1) * lineH) / 2;
            for (var l = 0; l < lines.length; l++) {
                ctx.fillText(lines[l], x, y0 + l * lineH);
            }
            ctx.restore();
        }

        /* Liseré intérieur + ombre sous le moyeu */
        ctx.beginPath();
        ctx.arc(0, 0, rIn, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, R * 0.014);
        ctx.strokeStyle = c.accent;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, R * 0.19, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fill();

        ctx.restore();
    }

    function sliceIndexAtPointer() {
        if (!slices.length) return -1;
        var step = 360 / slices.length;
        var a = ((-rotation % 360) + 360) % 360;
        return Math.floor(a / step) % slices.length;
    }

    /* -------------------------------------------------------------- Spin --- */

    function spin() {
        if (spinning) return;
        if (!pool.length) {
            hintEl.textContent = 'Aucun plat disponible pour ce service.';
            return;
        }

        spinning = true;
        spinBtn.disabled = true;
        resultCard.classList.remove('visible');
        reel.classList.remove('hidden');
        reelText.textContent = '…';
        startReel();

        winner = pickWeighted(pool);
        slices = buildSlices(winner);
        var winIndex = slices.indexOf(winner);
        draw();

        var step   = 360 / slices.length;
        var jitter = (Math.random() * 0.6 - 0.3) * step;
        var target = -((winIndex + 0.5) * step) - jitter;

        var current = ((rotation % 360) + 360) % 360;
        var delta   = (((target - current) % 360) + 360) % 360;
        var total   = 360 * FULL_TURNS + delta;

        animateTo(rotation + total);
    }

    function animateTo(target) {
        var from     = rotation;
        var distance = target - from;
        var duration = reduced ? SPIN_MS_REDUCED : SPIN_MS;
        var start    = performance.now();
        var lastIdx  = sliceIndexAtPointer();
        var pointer  = document.querySelector('.wheel-pointer');

        function frameStep(now) {
            var p = Math.min(1, (now - start) / duration);
            var e = 1 - Math.pow(1 - p, 4);          // easeOutQuart
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
                if (navigator.vibrate && !reduced) navigator.vibrate(6);
            }

            if (p < 1) {
                requestAnimationFrame(frameStep);
            } else {
                rotation = target;
                draw();
                finishSpin();
            }
        }
        requestAnimationFrame(frameStep);
    }

    function startReel() {
        stopReel();
        if (reduced) return;
        var i = 0;
        reelTimer = setInterval(function () {
            var item = pool[Math.floor(Math.random() * pool.length)];
            reelText.textContent = item.name;
            reelText.classList.remove('rolling');
            void reelText.offsetWidth;
            reelText.classList.add('rolling');
            i++;
        }, 95);
    }

    function stopReel() {
        if (reelTimer) {
            clearInterval(reelTimer);
            reelTimer = null;
        }
    }

    function finishSpin() {
        stopReel();
        spinning = false;
        spinBtn.disabled = false;
        if (!winner) return;

        reel.classList.add('hidden');
        showResult(winner);
        if (navigator.vibrate && !reduced) navigator.vibrate([18, 60, 24]);
    }

    function hideResult() {
        resultCard.classList.remove('visible');
        reel.classList.remove('hidden');
        reelText.textContent = 'Prêt à tourner la roue';
        if (resultVideo) {
            resultVideo.pause();
            resultVideo.removeAttribute('src');
            resultVideo.load();
        }
        resultMedia.classList.remove('has-video');
    }

    function showResult(item) {
        var period = PERIODS[currentPeriod];

        resultKicker.textContent  = 'Votre ' + period.short + ' : le hasard a choisi';
        resultTitle.textContent   = item.name;
        resultPrice.textContent   = item.price !== null ? item.price + ' Dh' : '';
        resultOrigin.textContent  = item.sectionName;
        /* Certains plats de la carte n'ont pas de description : on retombe
           toujours sur une phrase utile plutôt que sur un bloc vide. */
        resultDesc.textContent    = item.description || (item.badge
            ? 'Incontournable de la carte — ' + item.badge + '.'
            : 'À retrouver dans notre carte ' + item.sectionName + '.');
        resultMediaLabel.textContent = item.sectionName;

        if (item.video) {
            resultMedia.classList.add('has-video');
            if (item.poster) resultVideo.poster = item.poster;
            resultVideo.src = item.video;
            resultVideo.load();
            var p = resultVideo.play();
            if (p && p.catch) p.catch(function () { /* lecture bloquée : l'affiche suffit */ });
        } else {
            resultMedia.classList.remove('has-video');
            resultVideo.pause();
            resultVideo.removeAttribute('src');
            resultVideo.load();
        }

        var drink = drinkFor(currentPeriod);
        resultPairing.textContent = drink
            ? 'Pour accompagner : ' + drink.name + (drink.price !== null ? ' — ' + drink.price + ' Dh' : '')
            : '';

        /* Remontage de l'animation d'apparition */
        resultCard.classList.remove('visible');
        void resultCard.offsetWidth;
        resultCard.classList.add('visible');
    }

    function locateInMenu() {
        if (!winner || !winner.el) return;
        winner.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        winner.el.classList.remove('roulette-flash');
        void winner.el.offsetWidth;
        winner.el.classList.add('roulette-flash');
        setTimeout(function () {
            if (winner && winner.el) winner.el.classList.remove('roulette-flash');
        }, 2600);
    }

    /* ------------------------------------------------------------- Démarrage */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Exposé pour les tests / la console (non utilisé par la page) */
    window.LeManoirRoulette = {
        get menu()        { return MENU; },
        get pool()        { return pool; },
        get slices()      { return slices; },
        get period()      { return currentPeriod; },
        get winner()      { return winner; },
        get rotation()    { return rotation; },
        get spinning()    { return spinning; },
        pointerIndex:  sliceIndexAtPointer,
        candidatesFor: candidatesFor,
        setPeriod:     setPeriod,
        spin:          spin
    };
})();
