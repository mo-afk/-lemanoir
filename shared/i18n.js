/* ==========================================================================
   LE MANOIR — I18N (Français / English)
   --------------------------------------------------------------------------
   • Dictionnaire partagé + moteur de traduction (window.LM_I18N)
   • Persistance : localStorage['lemanoir_lang'] (défaut : FR)
   • Bascule de langue dynamique à côté du toggle mode sombre
   • Convention DOM : data-i18n (texte) · data-i18n-ph (placeholder)
     data-i18n-title (title + aria-label)
   • Événement "languagechange" pour les contenus dynamiques (jeux)
   ========================================================================== */
(function () {
    'use strict';

    var STORAGE_KEY = 'lemanoir_lang';
    var DEFAULT_LANG = 'fr';

    var FLAGS = { fr: '🇫🇷', en: '🇬🇧' };
    var ORDER = ['fr', 'en'];

    /* ------------------------------------------------------- Dictionnaire --- */
    var DICT = {
        fr: {
            'hero.subtitle': 'Menu Digital',
            'meta.title': 'Le Manoir - Menu Digital',
            'meta.title.combo': 'Combo Idéal - Le Manoir',
            'meta.title.who': 'Qui Paye ? - Le Manoir',
            'meta.title.quiz': 'Test de Personnalité - Le Manoir',
            'nav.petit-dejeuner': 'Petit Déjeuner',
            'nav.brunch': 'Brunch',
            'nav.sandwichs': 'Sandwichs',
            'nav.specialites': 'Spécialités',
            'nav.crepes': 'Crêpes',
            'nav.desserts': 'Desserts',
            'nav.desserts-maison': 'Desserts Maison',
            'nav.glaces': 'Glaces & Tartufo',
            'nav.boissons-chaudes': 'Boissons Chaudes',
            'nav.boissons-froides': 'Boissons Froides',
            'nav.ice-coffee': 'Ice Coffee',
            'nav.milkshakes': 'Milkshakes',
            'nav.mocktails': 'Mocktails',
            'sec.petit-dejeuner': 'Petit Déjeuner',
            'sec.brunch': 'Brunch',
            'sec.sandwichs': 'Sandwichs & Accompagnements',
            'sec.specialites': 'Spécialités & Pain Perdu',
            'sec.crepes': 'Les Crêpes',
            'sec.desserts': 'Desserts: Choux, Gaufres & Pancakes',
            'sec.desserts-maison': 'Desserts Maison',
            'sec.glaces': 'Glaces & Tartufo',
            'sec.boissons-chaudes': 'Boissons Chaudes',
            'sec.boissons-froides': 'Boissons Froides',
            'sec.ice-coffee': 'Ice Coffee & Frappuccinos',
            'sec.milkshakes': 'Milkshakes & Smoothies',
            'sec.mocktails': 'Mocktails & Mojitos',
            'sub.suggestions': 'Nos Suggestions',
            'sub.full-menu': 'Toute la Carte',
            'badge.populaire': 'Populaire',
            'badge.bestseller': 'Best-seller',
            'badge.nouveau': 'Nouveau',
            'badge.signature': 'Signature',
            'footer.tagline': 'Une expérience culinaire unique',
            'footer.games': 'Nos jeux',
            'footer.hours': '7j/7 — 7h à 00h',
            'footer.view-full-menu': 'Voir le menu complet de',
            'footer.location': 'Localisation',
            'aria.fab': 'Ouvrir le Combo Idéal',
            'aria.hub.nav': 'Navigation des jeux',
            'aria.hub.back': 'Retour au menu principal',
            'combo.aria.periods': 'Choisir le service',
            'combo.aria.hub': 'Proposer un combo',
            'who.aria.hub': 'Lancer la roue',
            'who.aria.input': 'Nom du joueur',
            'aria.dark': 'Toggle dark mode',
            'aria.back-to-top': 'Retour en haut',
            'aria.close': 'Fermer',
            'fab.label': 'Combo Idéal',
            'fab.tooltip': 'Joue & découvre ton combo !',
            'hub.back': 'Retour au Menu',
            'hub.combo': 'Combo Idéal',
            'hub.combo.short': 'Combo',
            'hub.who': 'Qui Paye ?',
            'hub.who.short': 'Qui Paye',
            'hub.quiz': 'Test de Personnalité',
            'hub.quiz.short': 'Quiz',
            'combo.title': 'Combo Idéal',
            'combo.tagline': 'Un plat + une boisson qui va avec, choisis pour toi.',
            'combo.period.breakfast.name': 'Petit Déj',
            'combo.period.breakfast.time': '07h — 11h',
            'combo.period.lunch.name': 'Déjeuner',
            'combo.period.lunch.time': '12h — 16h',
            'combo.period.dinner.name': 'Dîner',
            'combo.period.dinner.time': '19h — 00h',
            'combo.hub.label': 'SPIN',
            'combo.hub.sub': 'Combo',
            'combo.spin': 'Spin / Proposer',
            'combo.hint': '{n} plats en jeu · {label}',
            'combo.reel': 'Choisis ton service puis lance la roue',
            'combo.kicker': 'Ton combo idéal',
            'combo.kicker.period': 'Ton combo idéal · {label}',
            'combo.total': 'Total',
            'combo.respin': 'Re-spin',
            'combo.locate': 'Voir dans le menu',
            'combo.story.dish': 'Plat',
            'combo.story.drink': 'Boisson',
            'combo.story.foot': 'La formule parfaite, choisie par la roue',
            'who.title': 'Qui Paye ?',
            'who.tagline': 'Ajoutez 2 à 8 joueurs. La roue tranchera, sans appel.',
            'who.input-ph': 'Nom du joueur',
            'who.add': 'Ajouter le joueur',
            'who.count': '{n} / 8 joueurs',
            'who.empty': 'Les joueurs apparaîtront ici…',
            'who.clear': 'Tout effacer',
            'who.start': 'Lancer la roue',
            'who.hint.need2': 'Ajoutez au moins 2 joueurs',
            'who.hint.need': 'Ajoutez encore {n} joueurs (min. 2)',
            'who.hint.need1': 'Ajoutez encore 1 joueur (min. 2)',
            'who.hint.ready': 'Prêt ! La roue va trancher',
            'who.hint.max': 'Maximum 8 joueurs !',
            'who.hint.dup': 'Ce joueur est déjà dans la roue',
            'who.remove': 'Retirer {name}',
            'who.wheel.title': 'La roue du compte',
            'who.wheel.hint': '{n} joueurs dans la roue',
            'who.wheel.go': 'GO',
            'who.wheel.gosub': 'Paye !',
            'who.spin': 'Lancer',
            'who.change': 'Changer les joueurs',
            'who.result.pays': 'PAYS !',
            'who.joke0': "La roue n'a pas menti. Le chef a regardé…",
            'who.joke1': 'Même pas eu le temps de commander…',
            'who.joke2': 'Le dessert est offert, évidemment.',
            'who.joke3': "C'était écrit dans les astres (et sur la roue).",
            'who.joke4': 'Tire ta bourse : c\'est pour ça qu\'elle a des cordes.',
            'who.joke5': 'Les dés sont jetés, le compte est parti.',
            'who.joke6': "Personne n'est à l'abri, même pas toi.",
            'who.joke7': 'Le Manoir t\'appelle. Le compte aussi.',
            'who.result.respin': 'Rejouer',
            'who.story.kicker': "Qui paye aujourd'hui ?",
            'who.story.row': 'Le chef a tranché…',
            'who.story.foot': "Au Manoir, l'addition s'envole",
            'quiz.title': 'Test de Personnalité',
            'quiz.tagline': '5 questions. Ton profil au Manoir… et les plats qui vont avec.',
            'quiz.start': 'Commencer le test',
            'quiz.progress': 'Question {i}/{total}',
            'quiz.rec.title': 'Ta sélection au Manoir',
            'quiz.restart': 'Recommencer le test',
            'quiz.story.kicker': 'Test de personnalité',
            'quiz.story.foot': 'Ma sélection Le Manoir',
            'q1.text': 'Ton samedi matin idéal, ça commence par…',
            'q1.o0': 'Un brunch copieux et un chocolat bien serré',
            'q1.o1': "Un cappuccino, comme d'habitude",
            'q1.o2': 'Un smoothie frais et des fruits',
            'q1.o3': "Une brioche perdue au caramel, évidemment",
            'q2.text': "On t'offre un repas au Manoir, tu commandes…",
            'q2.o0': 'Le Monstre, sans hésiter une seconde',
            'q2.o1': 'Un sandwich signature et un jus frais',
            'q2.o2': 'Le Green Détox, légèreté oblige',
            'q2.o3': "D'abord une Gaufre Pistacchio, ensuite on verra",
            'q3.text': 'Ta boisson signature ?',
            'q3.o0': 'Un milkshake double chocolat',
            'q3.o1': 'Un Café Le Manoir, intemporel',
            'q3.o2': 'Un thé à la menthe, apaisant',
            'q3.o3': 'Un affogato, café et glace en un seul coup',
            'q4.text': 'Le dessert arrive avec le plat ?',
            'q4.o0': 'Deux portions : une maintenant, une plus tard',
            'q4.o1': 'Le dessert attend poliment son tour',
            'q4.o2': 'Un fruit, et je passe aux choses sérieuses',
            'q4.o3': "Le dessert, c'est le plat principal",
            'q5.text': 'Ta façon de manger au Manoir ?',
            'q5.o0': "Je goûte à tout, y compris l'assiette du voisin",
            'q5.o1': 'Fidèle à ma formule préférée',
            'q5.o2': 'Léger, rapide, toujours sain',
            'q5.o3': 'Je feuillète la carte des desserts en premier',
            'profile.gourmet.name': 'Le Gourmet',
            'profile.gourmet.tag': "Grosse faim, grosse dose. Le Manoir, c'est ta cour.",
            'profile.classic.name': 'Le Classique',
            'profile.classic.tag': 'Les valeurs sûres, choisies à la perfection.',
            'profile.light.name': "L'Élégant Léger",
            'profile.light.tag': 'Fraîcheur et légèreté, zéro regret.',
            'profile.dessert.name': 'Le Chasseur de Desserts',
            'profile.dessert.tag': "Le sucre n'a pas d'âge… et toi pas de limites.",
            'rec.gourmet.sandwich': 'Ton burger signature',
            'rec.gourmet.main': 'Ton plat copieux',
            'rec.gourmet.shake': 'Ton milkshake',
            'rec.classic.sandwich': 'Ton sandwich signature',
            'rec.classic.juice': 'Ton jus frais',
            'rec.classic.coffee': 'Ton café',
            'rec.light.drink': 'Ta boisson fraîche',
            'rec.light.breakfast': 'Ton petit-déjeuner léger',
            'rec.light.tea': 'Ton thé',
            'rec.dessert.waffle': 'Ta gaufre',
            'rec.dessert.crepe': 'Ta crêpe',
            'rec.dessert.pasty': 'Ta pâtisserie',
            'story.logo-sub': 'Menu Digital',
            'story.share': 'Partager en Story',
            'story.share.action': 'Partager la Story',
            'story.download': 'Télécharger la carte',
            'story.download.action': 'Télécharger',
            'story.downloaded': 'Téléchargé !',
            'story.generating': 'Génération…',
            'story.default-foot': 'Une expérience culinaire unique',
            'story.alert-error': 'Impossible de générer la carte. Vérifie ta connexion et réessaie.',
            'story.alert-downloaded': 'Carte téléchargée !\nPartage-la depuis ta galerie en story Instagram / WhatsApp. 📸',
            'aria.lang': 'Changer de langue'
        },

        en: {
            'hero.subtitle': 'Digital Menu',
            'meta.title': 'Le Manoir - Digital Menu',
            'meta.title.combo': 'Ideal Combo - Le Manoir',
            'meta.title.who': 'Who Pays? - Le Manoir',
            'meta.title.quiz': 'Personality Quiz - Le Manoir',
            'nav.petit-dejeuner': 'Breakfast',
            'nav.brunch': 'Brunch',
            'nav.sandwichs': 'Sandwiches',
            'nav.specialites': 'Specialties',
            'nav.crepes': 'Crêpes',
            'nav.desserts': 'Desserts',
            'nav.desserts-maison': 'Homemade Desserts',
            'nav.glaces': 'Ice Cream & Tartufo',
            'nav.boissons-chaudes': 'Hot Drinks',
            'nav.boissons-froides': 'Cold Drinks',
            'nav.ice-coffee': 'Ice Coffee',
            'nav.milkshakes': 'Milkshakes',
            'nav.mocktails': 'Mocktails',
            'sec.petit-dejeuner': 'Breakfast',
            'sec.brunch': 'Brunch',
            'sec.sandwichs': 'Sandwiches & Sides',
            'sec.specialites': 'Specialties & Pain Perdu',
            'sec.crepes': 'The Crêpes',
            'sec.desserts': 'Desserts: Choux, Waffles & Pancakes',
            'sec.desserts-maison': 'Homemade Desserts',
            'sec.glaces': 'Ice Cream & Tartufo',
            'sec.boissons-chaudes': 'Hot Drinks',
            'sec.boissons-froides': 'Cold Drinks',
            'sec.ice-coffee': 'Ice Coffee & Frappuccinos',
            'sec.milkshakes': 'Milkshakes & Smoothies',
            'sec.mocktails': 'Mocktails & Mojitos',
            'sub.suggestions': 'Our Suggestions',
            'sub.full-menu': 'Full Menu',
            'badge.populaire': 'Popular',
            'badge.bestseller': 'Best-seller',
            'badge.nouveau': 'New',
            'badge.signature': 'Signature',
            'footer.tagline': 'A unique culinary experience',
            'footer.games': 'Our Games',
            'footer.hours': '7 days a week — 7am to midnight',
            'footer.view-full-menu': 'See the full menu of',
            'footer.location': 'Location',
            'aria.fab': 'Open the Ideal Combo',
            'aria.hub.nav': 'Game navigation',
            'aria.hub.back': 'Back to the main menu',
            'combo.aria.periods': 'Choose your service',
            'combo.aria.hub': 'Suggest a combo',
            'who.aria.hub': 'Spin the wheel',
            'who.aria.input': 'Player name',
            'aria.dark': 'Toggle dark mode',
            'aria.back-to-top': 'Back to top',
            'aria.close': 'Close',
            'fab.label': 'Ideal Combo',
            'fab.tooltip': 'Play & find your combo !',
            'hub.back': 'Back to Menu',
            'hub.combo': 'Ideal Combo',
            'hub.combo.short': 'Combo',
            'hub.who': 'Who Pays?',
            'hub.who.short': 'Who Pays',
            'hub.quiz': 'Personality Quiz',
            'hub.quiz.short': 'Quiz',
            'combo.title': 'Ideal Combo',
            'combo.tagline': 'A dish + a matching drink, picked for you.',
            'combo.period.breakfast.name': 'Breakfast',
            'combo.period.breakfast.time': '7am — 11am',
            'combo.period.lunch.name': 'Lunch',
            'combo.period.lunch.time': '12pm — 4pm',
            'combo.period.dinner.name': 'Dinner',
            'combo.period.dinner.time': '7pm — midnight',
            'combo.hub.label': 'SPIN',
            'combo.hub.sub': 'Combo',
            'combo.spin': 'Spin / Suggest',
            'combo.hint': 'Dishes in play: {n} · {label}',
            'combo.reel': 'Pick your service, then spin the wheel',
            'combo.kicker': 'Your ideal combo',
            'combo.kicker.period': 'Your ideal combo · {label}',
            'combo.total': 'Total',
            'combo.respin': 'Re-spin',
            'combo.locate': 'See it in the menu',
            'combo.story.dish': 'Dish',
            'combo.story.drink': 'Drink',
            'combo.story.foot': 'The perfect formula, chosen by the wheel',
            'who.title': 'Who Pays?',
            'who.tagline': 'Add 2 to 8 players. The wheel decides — no appeal.',
            'who.input-ph': 'Player name',
            'who.add': 'Add the player',
            'who.count': '{n} / 8 players',
            'who.empty': 'Players will appear here…',
            'who.clear': 'Clear all',
            'who.start': 'Spin the wheel',
            'who.hint.need2': 'Add at least 2 players',
            'who.hint.need': 'Add {n} more players (min. 2)',
            'who.hint.need1': 'Add 1 more player (min. 2)',
            'who.hint.ready': 'Ready! The wheel will decide',
            'who.hint.max': 'Maximum 8 players!',
            'who.hint.dup': 'This player is already on the wheel',
            'who.remove': 'Remove {name}',
            'who.wheel.title': 'The bill wheel',
            'who.wheel.hint': '{n} players on the wheel',
            'who.wheel.go': 'GO',
            'who.wheel.gosub': 'Pay up!',
            'who.spin': 'Spin',
            'who.change': 'Change players',
            'who.result.pays': 'PAYS!',
            'who.joke0': 'The wheel does not lie. The chef is watching…',
            'who.joke1': "You didn't even get to order…",
            'who.joke2': 'Dessert is on us, obviously.',
            'who.joke3': 'It was written in the stars (and on the wheel).',
            'who.joke4': 'Break out your wallet — that\'s what the strings are for.',
            'who.joke5': 'The dice are cast, the bill is on its way.',
            'who.joke6': "Nobody is safe, not even you.",
            'who.joke7': 'Le Manoir is calling. So is the bill.',
            'who.result.respin': 'Play again',
            'who.story.kicker': "Who pays today?",
            'who.story.row': 'The chef has decided…',
            'who.story.foot': 'At Le Manoir, the bill takes flight',
            'quiz.title': 'Personality Quiz',
            'quiz.tagline': '5 questions. Your profile at Le Manoir… and the dishes that match.',
            'quiz.start': 'Start the quiz',
            'quiz.progress': 'Question {i}/{total}',
            'quiz.rec.title': 'Your Le Manoir picks',
            'quiz.restart': 'Restart the quiz',
            'quiz.story.kicker': 'Personality quiz',
            'quiz.story.foot': 'My Le Manoir picks',
            'q1.text': 'Your ideal Saturday morning starts with…',
            'q1.o0': 'A hearty brunch and a strong hot chocolate',
            'q1.o1': "A cappuccino, as always",
            'q1.o2': 'A fresh smoothie and fruit',
            'q1.o3': 'A caramel pain perdu, obviously',
            'q2.text': 'Le Manoir treats you to a meal, you order…',
            'q2.o0': 'The Monster, without a second thought',
            'q2.o1': 'A signature sandwich and a fresh juice',
            'q2.o2': 'The Green Detox — lightness is a must',
            'q2.o3': 'A Pistachio Waffle first, then we\'ll see',
            'q3.text': 'Your signature drink?',
            'q3.o0': 'A double-chocolate milkshake',
            'q3.o1': 'A Le Manoir coffee, timeless',
            'q3.o2': 'Mint tea, soothing',
            'q3.o3': 'An affogato — coffee and ice cream in one',
            'q4.text': 'Dessert arrives with the main dish?',
            'q4.o0': 'Two servings: one now, one later',
            'q4.o1': 'Dessert politely waits its turn',
            'q4.o2': 'A piece of fruit, and I get to serious things',
            'q4.o3': 'Dessert IS the main dish',
            'q5.text': 'How do you eat at Le Manoir?',
            'q5.o0': 'I taste everything, including the neighbor\'s plate',
            'q5.o1': 'Loyal to my favorite set',
            'q5.o2': 'Light, fast, always healthy',
            'q5.o3': 'I flip through the dessert menu first',
            'profile.gourmet.name': 'The Gourmet',
            'profile.gourmet.tag': 'Big hunger, big portions. Le Manoir is your court.',
            'profile.classic.name': 'The Classic',
            'profile.classic.tag': 'The safe values, chosen to perfection.',
            'profile.light.name': 'The Elegant Light',
            'profile.light.tag': 'Freshness and lightness, zero regret.',
            'profile.dessert.name': 'The Dessert Hunter',
            'profile.dessert.tag': "Sugar doesn't age… and you have no limits.",
            'rec.gourmet.sandwich': 'Your signature burger',
            'rec.gourmet.main': 'Your hearty main',
            'rec.gourmet.shake': 'Your milkshake',
            'rec.classic.sandwich': 'Your signature sandwich',
            'rec.classic.juice': 'Your fresh juice',
            'rec.classic.coffee': 'Your coffee',
            'rec.light.drink': 'Your fresh drink',
            'rec.light.breakfast': 'Your light breakfast',
            'rec.light.tea': 'Your tea',
            'rec.dessert.waffle': 'Your waffle',
            'rec.dessert.crepe': 'Your crêpe',
            'rec.dessert.pasty': 'Your pastry',
            'story.logo-sub': 'Digital Menu',
            'story.share': 'Share to Story',
            'story.share.action': 'Share the Story',
            'story.download': 'Download the card',
            'story.download.action': 'Download',
            'story.downloaded': 'Downloaded!',
            'story.generating': 'Generating…',
            'story.default-foot': 'A unique culinary experience',
            'story.alert-error': 'Could not generate the card. Check your connection and try again.',
            'story.alert-downloaded': 'Card downloaded!\nShare it from your gallery as an Instagram / WhatsApp story. 📸',
            'aria.lang': 'Change language'
        }
    };

    var currentLang = DEFAULT_LANG;

    /* -------------------------------------------------------------- Core --- */
    function t(key, params) {
        var table = DICT[currentLang] || DICT[DEFAULT_LANG];
        var str = table[key];
        if (str == null) str = (DICT[DEFAULT_LANG] || {})[key];
        if (str == null) str = key;
        if (params) {
            Object.keys(params).forEach(function (k) {
                str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
            });
        }
        return str;
    }

    function getLang() { return currentLang; }

    function stored() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function persist(code) {
        try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* stockage indisponible */ }
    }

    /* Remplace le texte d'un élément en préservant ses enfants (icônes…) */
    function setText(el, str) {
        if (!el) return;
        if (!el.childNodes) { el.textContent = str; return; }
        var hasElementChild = false;
        for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 1) { hasElementChild = true; break; }
        }
        if (!hasElementChild) {
            el.textContent = str;
            return;
        }
        var textNode = null;
        for (var j = el.childNodes.length - 1; j >= 0; j--) {
            if (el.childNodes[j].nodeType === 3 && el.childNodes[j].textContent.replace(/\s/g, '').length) {
                textNode = el.childNodes[j];
                break;
            }
        }
        if (textNode) {
            var leading = textNode.textContent.match(/^\s*/)[0];
            textNode.textContent = leading + str;
        }
    }

    function translatePage(root) {
        var base = root || document;
        var nodes = base.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) setText(nodes[i], t(nodes[i].getAttribute('data-i18n')));
        var phs = base.querySelectorAll('[data-i18n-ph]');
        for (var j = 0; j < phs.length; j++) phs[j].setAttribute('placeholder', t(phs[j].getAttribute('data-i18n-ph')));
        var titles = base.querySelectorAll('[data-i18n-title]');
        for (var k = 0; k < titles.length; k++) {
            var key = titles[k].getAttribute('data-i18n-title');
            titles[k].setAttribute('title', t(key));
            titles[k].setAttribute('aria-label', t(key));
        }
    }

    var applyDom = translatePage;

    function setLang(code, opts) {
        opts = opts || {};
        if (!DICT[code]) code = DEFAULT_LANG;
        currentLang = code;
        if (opts.persist !== false) persist(code);
        document.documentElement.setAttribute('lang', code);
        document.documentElement.setAttribute('dir', 'ltr');
        translatePage();
        if (switcher) updateSwitcher();
        if (typeof CustomEvent === 'function') {
            document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: code } }));
        }
    }

    /* ------------------------------------------------------- Bascule UI --- */
    var switcher = null;
    var btn = null;
    var currentFlag = null;
    var currentCode = null;

    function injectCss() {
        if (document.getElementById('lm-i18n-css')) return;
        var st = document.createElement('style');
        st.id = 'lm-i18n-css';
        st.textContent =
            '.lang-switch{position:relative;display:inline-flex;align-items:center;flex-shrink:0;}' +
            '.lang-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:40px;padding:0 10px;' +
            'border:2px solid var(--border-color,#EAEAEA);border-radius:50px;background:var(--surface,#fff);' +
            'color:var(--primary-text,#1A1A1A);font-family:var(--font-body,"Lato"),sans-serif;font-weight:700;' +
            'font-size:0.78rem;letter-spacing:0.5px;cursor:pointer;box-shadow:var(--shadow,0 2px 8px rgba(0,0,0,0.05));' +
            'transition:all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);white-space:nowrap;user-select:none;-webkit-user-select:none;}' +
            '.lang-btn:hover{border-color:var(--accent,#C8956C);color:var(--accent,#C8956C);transform:translateY(-1px);}' +
            '.lang-btn:active{transform:scale(0.96);}' +
            '.lang-btn .lang-flag{font-size:0.95rem;line-height:1;}' +
            '.lang-btn .lang-code{font-size:0.75rem;font-weight:700;letter-spacing:0.5px;}' +
            'body.dark-mode .lang-btn{border-color:var(--border-color,#332F2A);background:var(--surface,#24201C);color:var(--primary-text,#F5F5F0);}' +
            'body.dark-mode .lang-btn:hover{border-color:var(--accent,#C8956C);color:var(--accent,#C8956C);}';
        document.head.appendChild(st);
    }

    function toggleLang() {
        setLang(currentLang === 'fr' ? 'en' : 'fr');
    }

    function buildSwitcher() {
        var anchor = document.querySelector('.hub-dark-toggle') || document.querySelector('.dark-mode-toggle');
        if (!anchor) return;

        injectCss();

        switcher = document.createElement('div');
        switcher.className = 'lang-switch';

        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-btn';
        btn.setAttribute('data-i18n-title', 'aria.lang');
        btn.innerHTML = '<span class="lang-flag"></span><span class="lang-code"></span>';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleLang();
        });

        switcher.appendChild(btn);
        anchor.parentNode.insertBefore(switcher, anchor);

        updateSwitcher();
    }

    function updateSwitcher() {
        if (!btn) return;
        currentFlag = btn.querySelector('.lang-flag');
        currentCode = btn.querySelector('.lang-code');
        if (currentFlag) currentFlag.textContent = FLAGS[currentLang] || '';
        if (currentCode) currentCode.textContent = (currentLang || '').toUpperCase();
        var label = currentLang === 'fr' ? 'Passer en anglais (Switch to English)' : 'Passer en français (Switch to French)';
        btn.setAttribute('title', label);
        btn.setAttribute('aria-label', label);
    }

    /* ------------------------------------------------------------ Init --- */
    function init() {
        var saved = stored();
        /* défaut : FR (aucune autodétection navigateur) ; la préférence est
           toujours persistée pour être lue sur les sous-pages / au rechargement */
        setLang(saved && (saved === 'fr' || saved === 'en') ? saved : DEFAULT_LANG);
        buildSwitcher();
        translatePage();
    }

    window.LM_I18N = {
        t: t,
        getLang: getLang,
        setLang: setLang,
        toggleLang: toggleLang,
        applyDom: translatePage,
        translatePage: translatePage,
        languages: ORDER.slice()
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
