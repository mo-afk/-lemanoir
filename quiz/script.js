/* ==========================================================================
   TEST DE PERSONNALITÉ — Le Manoir  (mini-jeu du hub)
   --------------------------------------------------------------------------
   5 questions -> 4 profils de mangeur. Les recommandations sont résolues
   en direct dans la carte partagée (shared/menu-data.js) : 100% des noms,
   prix et catégories proviennent du menu réel de Le Manoir.
   ========================================================================== */
(function () {
    'use strict';

    var Q = LM_MENU;

    /* ------------------------------------------------------------ Données --- */
    var QUESTIONS = [
        {
            text: 'Ton samedi matin idéal, ça commence par…',
            options: [
                { text: 'Un brunch copieux et un chocolat bien serré', profile: 'gourmet' },
                { text: 'Un cappuccino, comme d\'habitude', profile: 'classic' },
                { text: 'Un smoothie frais et des fruits', profile: 'light' },
                { text: 'Une brioche perdue au caramel, évidemment', profile: 'dessert' }
            ]
        },
        {
            text: 'On t\'offre un repas au Manoir, tu commandes…',
            options: [
                { text: 'Le Monstre, sans hésiter une seconde', profile: 'gourmet' },
                { text: 'Un sandwich signature et un jus frais', profile: 'classic' },
                { text: 'Le Green Détox, légèreté oblige', profile: 'light' },
                { text: 'D\'abord une Gaufre Pistacchio, ensuite on verra', profile: 'dessert' }
            ]
        },
        {
            text: 'Ta boisson signature ?',
            options: [
                { text: 'Un milkshake double chocolat', profile: 'gourmet' },
                { text: 'Un Café Le Manoir, intemporel', profile: 'classic' },
                { text: 'Un thé à la menthe, apaisant', profile: 'light' },
                { text: 'Un affogato, café et glace en un seul coup', profile: 'dessert' }
            ]
        },
        {
            text: 'Le dessert arrive avec le plat ?',
            options: [
                { text: 'Deux portions : une maintenant, une plus tard', profile: 'gourmet' },
                { text: 'Le dessert attend poliment son tour', profile: 'classic' },
                { text: 'Un fruit, et je passe aux choses sérieuses', profile: 'light' },
                { text: 'Le dessert, c\'est le plat principal', profile: 'dessert' }
            ]
        },
        {
            text: 'Ta façon de manger au Manoir ?',
            options: [
                { text: 'Je goûte à tout, y compris l\'assiette du voisin', profile: 'gourmet' },
                { text: 'Fidèle à ma formule préférée', profile: 'classic' },
                { text: 'Léger, rapide, toujours sain', profile: 'light' },
                { text: 'Je feuillète la carte des desserts en premier', profile: 'dessert' }
            ]
        }
    ];

    /* -------------------------------------------------------------------
       PROFILES + MAPPAGE STRICT VERS LA CARTE RÉELLE
       gourmet  -> burgers/sandwichs riches, plats copieux, milkshakes
       classic  -> sandwiches signatures, jus frais, café
       light    -> détox/frais, petit-déjeuner léger, thé  (jamais de salades lourdes)
       dessert  -> gaufres, crêpes, pâtisseries
       Chaque règle est résolue dans LM_MENU (noms + prix authentiques).
    ------------------------------------------------------------------- */
    var PROFILES = {
        gourmet: {
            name: 'Le Gourmet',
            emoji: '🍔',
            tagline: 'Grosse faim, grosse dose. Le Manoir, c\'est ta cour.',
            recs: [
                { labelKey: 'rec.gourmet.sandwich', rule: { section: 'sandwichs', words: ['boss', 'monstre', 'royal', 'urbain'], fallbackSection: 'sandwichs' } },
                { labelKey: 'rec.gourmet.main', rule: { kind: 'main', words: ['liège', 'continental', 'chaoui', 'sabah', 'boss'], fallbackSection: 'brunch' } },
                { labelKey: 'rec.gourmet.shake', rule: { section: 'milkshakes', words: ['bounty', 'lotus', 'paradise'], fallbackSection: 'milkshakes' } }
            ]
        },
        classic: {
            name: 'Le Classique',
            emoji: '☕',
            tagline: 'Les valeurs sûres, choisies à la perfection.',
            recs: [
                { labelKey: 'rec.classic.sandwich', rule: { section: 'sandwichs', words: ['boss', 'royal', 'urbain'], fallbackSection: 'sandwichs' } },
                { labelKey: 'rec.classic.juice', rule: { section: 'boissons-froides', words: ['jus'], fallbackSection: 'boissons-froides' } },
                { labelKey: 'rec.classic.coffee', rule: { section: 'boissons-chaudes', words: ['manoir', 'cappuccino', 'latte'], fallbackSection: 'boissons-chaudes' } }
            ]
        },
        light: {
            name: 'L\'Élégant Léger',
            emoji: '🥑',
            tagline: 'Fraîcheur et légèreté, zéro regret.',
            recs: [
                { labelKey: 'rec.light.drink', rule: { section: 'boissons-froides', words: ['green detox', 'avocat', 'citron'], fallbackSection: 'boissons-froides' } },
                { labelKey: 'rec.light.breakfast', rule: { section: 'petit-dejeuner', words: ['express', 'kids'], fallbackSection: 'petit-dejeuner' } },
                { labelKey: 'rec.light.tea', rule: { section: 'boissons-chaudes', words: ['the', 'matcha'], fallbackSection: 'boissons-chaudes' } }
            ]
        },
        dessert: {
            name: 'Le Chasseur de Desserts',
            emoji: '🍰',
            tagline: 'Le sucre n\'a pas d\'âge… et toi pas de limites.',
            recs: [
                { labelKey: 'rec.dessert.waffle', rule: { section: 'desserts', words: ['gaufre'], fallbackSection: 'desserts' } },
                { labelKey: 'rec.dessert.crepe', rule: { section: 'crepes', words: ['crepe', 'fettuccine', 'pistachio', 'choco'], fallbackSection: 'crepes' } },
                { labelKey: 'rec.dessert.pasty', rule: { section: 'desserts-maison', words: ['sebastian', 'brownie', 'tiramisu', 'brulee'], fallbackSection: 'desserts-maison' } }
            ]
        }
    };

    /* ---------------------------------------------- Résolution des recos --- */
    function t(key, params) { return window.LM_I18N ? window.LM_I18N.t(key, params) : key; }

    function buildRecs(profile) {
        return profile.recs.map(function (r) {
            var hit = Q.pickFrom(Object.assign({ count: 1, weighted: true }, r.rule));
            var item = hit.length ? hit[0] : null;
            return {
                labelKey: r.labelKey,
                item: item
            };
        }).filter(function (r) { return r.item; });
    }

    /* ------------------------------------------------------------- Flux --- */
    var currentQ = 0;
    var scores = {};
    var lastProfile = null;
    var lastRecs = null;

    var currentScreen = 'qz-intro';

    function $(id) { return document.getElementById(id); }

    function showScreen(id) {
        currentScreen = id;
        ['qz-intro', 'qz-question', 'qz-result'].forEach(function (s) {
            $(s).classList.toggle('hidden', s !== id);
        });
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function start() {
        currentQ = 0;
        scores = { gourmet: 0, classic: 0, light: 0, dessert: 0 };
        lastProfile = null;
        lastRecs = null;
        renderQuestion();
        showScreen('qz-question');
    }

    function renderQuestion() {
        var qKey = 'q' + (currentQ + 1);
        $('qz-progress-label').textContent = t('quiz.progress', { i: currentQ + 1, total: QUESTIONS.length });
        $('qz-bar').style.width = (currentQ / QUESTIONS.length * 100) + '%';
        $('qz-text').textContent = t(qKey + '.text');
        var box = $('qz-options');
        box.innerHTML = '';
        QUESTIONS[currentQ].options.forEach(function (opt, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'qz-option';
            var ico = document.createElement('i');
            ico.className = 'fas fa-' + ['1', '2', '3', '4'][i];
            var span = document.createElement('span');
            span.textContent = t(qKey + '.o' + i);
            btn.appendChild(ico);
            btn.appendChild(span);
            btn.addEventListener('click', function () {
                btn.classList.add('chosen');
                scores[opt.profile] = (scores[opt.profile] || 0) + 1;
                setTimeout(next, 260);
            });
            box.appendChild(btn);
        });
    }

    function next() {
        currentQ++;
        if (currentQ < QUESTIONS.length) {
            renderQuestion();
        } else {
            finish();
        }
    }

    function topProfile() {
        var best = null, bestScore = -1;
        Object.keys(scores).forEach(function (k) {
            if (scores[k] > bestScore) { bestScore = scores[k]; best = k; }
        });
        return PROFILES[best];
    }

    function profileKey() {
        if (!lastProfile) return null;
        return Object.keys(PROFILES).filter(function (k) { return PROFILES[k] === lastProfile; })[0];
    }

    function finish() {
        lastProfile = topProfile();
        lastRecs = buildRecs(lastProfile);
        renderResult();
        $('qz-bar').style.width = '100%';
        showScreen('qz-result');
    }

    function renderResult() {
        if (!lastProfile || !lastRecs) return;
        var key = profileKey();
        $('qz-emoji').textContent = lastProfile.emoji;
        $('qz-profile-name').textContent = t('profile.' + key + '.name');
        $('qz-tagline').textContent = t('profile.' + key + '.tag');

        var recsBox = $('qz-recs');
        recsBox.innerHTML = '';
        lastRecs.forEach(function (r) {
            var div = document.createElement('div');
            div.className = 'qz-rec';
            var left = document.createElement('div');
            left.innerHTML = '<span class="qz-rec-name"></span><span class="qz-rec-cat"></span>';
            left.querySelector('.qz-rec-name').textContent = LM_MENU.displayName(r.item);
            left.querySelector('.qz-rec-cat').textContent = t(r.labelKey) + ' · ' + LM_MENU.displaySectionName(r.item);
            var price = document.createElement('span');
            price.className = 'qz-rec-price';
            price.textContent = r.item.price + ' Dh';
            div.appendChild(left);
            div.appendChild(price);
            recsBox.appendChild(div);
        });
    }

    /* --------------------------------------------- Partage Story (9:16) --- */
    function shareStory() {
        if (!lastProfile || !lastRecs || !lastRecs.length) return;
        var key = profileKey();
        var recs = lastRecs;
        LM_STORY.show(function () {
            return {
                kicker: t('quiz.story.kicker'),
                emoji: lastProfile.emoji,
                title: t('profile.' + key + '.name'),
                sub: t('profile.' + key + '.tag'),
                rows: recs.map(function (r) {
                    return { label: LM_MENU.displayName(r.item), value: r.item.price + ' Dh' };
                }),
                foot: t('quiz.story.foot')
            };
        });
    }

    function restart() {
        start();
    }

    /* ------------------------------------------------------------ Init --- */
    function init() {
        $('qz-start').addEventListener('click', start);
        $('qz-share').addEventListener('click', shareStory);
        $('qz-restart').addEventListener('click', restart);

        /* Changement de langue : re-rendu de l'écran visible */
        document.addEventListener('languagechange', function () {
            if (currentScreen === 'qz-question') renderQuestion();
            else if (currentScreen === 'qz-result') renderResult();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* API de debug / tests */
    window.LeManoirQuiz = {
        start: start,
        topProfile: topProfile,
        buildRecs: buildRecs,
        share: shareStory,
        get questions() { return QUESTIONS; },
        get profiles() { return PROFILES; },
        get scores() { return Object.assign({}, scores); },
        get lastProfile() { return lastProfile; },
        get lastRecs() { return lastRecs; }
    };
})();
