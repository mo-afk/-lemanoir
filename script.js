document.addEventListener('DOMContentLoaded', () => {

    const loader = document.querySelector('.loader-overlay');
    let currentModalCard = null;

    /* ---------------------------------------------------------------
       Résolution des éléments de menu depuis shared/menu-data.js
       --------------------------------------------------------------- */
    function findItemForCard(card) {
        if (!card || typeof LM_MENU === 'undefined' || !LM_MENU.items) return null;
        const sec = card.closest('.menu-section');
        const secId = sec ? sec.id : null;
        const h3 = card.querySelector('h3');
        if (!h3) return null;

        if (!card.dataset.originalName) {
            card.dataset.originalName = h3.textContent.trim();
        }
        const searchName = card.dataset.originalName;

        // 1. Recherche exacte par section + nom
        if (secId) {
            const match = LM_MENU.findBy(secId, searchName);
            if (match) return match;
        }

        // 2. Recherche tolérante (insensible à la casse) dans la section
        const norm = (s) => (s || '').trim().toLowerCase();
        const target = norm(searchName);
        for (let i = 0; i < LM_MENU.items.length; i++) {
            const it = LM_MENU.items[i];
            if (secId && it.sectionId === secId) {
                if (norm(it.name) === target || norm(it.nameEn) === target) return it;
            }
        }

        // 3. Recherche globale sur tous les items
        for (let i = 0; i < LM_MENU.items.length; i++) {
            const it = LM_MENU.items[i];
            if (norm(it.name) === target || norm(it.nameEn) === target) return it;
        }

        return null;
    }

    /* ---------------------------------------------------------------
       Rendu & Injection des Médias (Vidéos / Posters) depuis menu-data.js
       Restaure l'affichage visuel complet de toutes les cartes du menu.
       --------------------------------------------------------------- */
    function renderCards() {
        if (typeof LM_MENU === 'undefined') return;

        // Toutes les cartes du menu (suggestions populaires et grille complète)
        const allCards = document.querySelectorAll('.popular-card, .menu-card, .menu-item-card');

        allCards.forEach((card) => {
            const item = findItemForCard(card);
            if (!item) return;

            // 1. Mise à jour des textes localisés
            const h3 = card.querySelector('h3');
            if (h3) h3.textContent = LM_MENU.displayName(item);

            const p = card.querySelector('p');
            if (p) {
                const d = LM_MENU.displayDesc(item);
                if (d) p.textContent = d;
            }

            const detail = LM_MENU.displayDetail(item);
            if (detail) {
                card.dataset.description = detail;
            }

            // 2. Injection et synchronisation des médias (vidéo & poster)
            const isMediaCard = card.classList.contains('popular-card') || card.classList.contains('menu-card') || card.querySelector('video');

            if (isMediaCard && (item.video || item.poster)) {
                let video = card.querySelector('video');

                if (!video) {
                    video = document.createElement('video');
                    video.className = 'lazy-video';
                    video.muted = true;
                    video.loop = true;
                    video.setAttribute('playsinline', '');
                    video.playsInline = true;

                    const cardContent = card.querySelector('.card-content');
                    if (cardContent) {
                        card.insertBefore(video, cardContent);
                    } else {
                        card.insertBefore(video, card.firstChild);
                    }
                }

                // Configuration du poster (affichage instantané)
                if (item.poster) {
                    video.poster = item.poster;
                    video.setAttribute('poster', item.poster);
                }

                video.preload = 'metadata';
                video.classList.add('loaded');

                // Configuration de la source vidéo
                if (item.video) {
                    let source = video.querySelector('source');
                    if (!source) {
                        source = document.createElement('source');
                        source.type = 'video/webm';
                        video.appendChild(source);
                    }
                    source.src = item.video;
                    source.dataset.src = item.video;
                    if (!video.src || video.src !== item.video) {
                        video.src = item.video;
                    }
                }
            }
        });

        // Mise à jour de la modale si actuellement ouverte
        if (currentModalCard && modal && modal.classList.contains('active')) {
            const item = findItemForCard(currentModalCard);
            if (item) {
                if (modalTitle) modalTitle.textContent = LM_MENU.displayName(item);
                if (modalDescription) modalDescription.textContent = LM_MENU.displayDetail(item) || currentModalCard.dataset.description || '';
            }
        }
    }

    // Exposition globale pour tests et intégrations
    window.renderCards = renderCards;

    // Rendu initial des cartes et médias
    renderCards();

    // Traduction de la page au chargement
    if (window.LM_I18N && typeof window.LM_I18N.translatePage === 'function') {
        window.LM_I18N.translatePage();
    }

    // Réactualisation au changement de langue
    document.addEventListener('languagechange', () => {
        renderCards();
        const tooltip = document.getElementById('fab-tooltip');
        if (tooltip && window.LM_I18N && typeof window.LM_I18N.t === 'function') {
            tooltip.textContent = window.LM_I18N.t('fab.tooltip');
        }
    });

    /* ---------------------------------------------------------------
       Écran de chargement fluide sans délai artificiel
       Le FAB (+ sa bulle) reste caché pendant le chargement et n'apparaît
       qu'une fois le fade-out du loader terminé (body.fab-ready).
       --------------------------------------------------------------- */
    function revealFab() {
        document.body.classList.add('fab-ready');
    }

    function dismissLoader() {
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
                revealFab();
            }, 600);
        } else {
            /* Loader absent ou déjà masqué : pas d'attente supplémentaire */
            revealFab();
        }
    }

    if (document.readyState === 'complete') {
        dismissLoader();
    } else {
        window.addEventListener('load', dismissLoader, { once: true });
    }
    setTimeout(dismissLoader, 3000);

    /* Retour depuis le cache navigateur (bfcache) : s'assurer que le FAB est visible */
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) dismissLoader();
    });

    /* ---------------------------------------------------------------
       Animations AOS
       --------------------------------------------------------------- */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }

    /* ---------------------------------------------------------------
       Mode Sombre
       --------------------------------------------------------------- */
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

    /* ---------------------------------------------------------------
       Navigation par Catégorie
       --------------------------------------------------------------- */
    function centerActiveLink(activeLink) {
        const navContainer = document.querySelector('.nav-container');
        if (!activeLink || !navContainer) return;
        const containerWidth = navContainer.offsetWidth;
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.offsetWidth;
        const scrollPosition = linkLeft - (containerWidth / 2) + (linkWidth / 2);
        navContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.menu-section');

    const sectionObserver = new IntersectionObserver((entries) => {
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

    sections.forEach(section => sectionObserver.observe(section));

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

    /* ---------------------------------------------------------------
       Modal détail produit
       --------------------------------------------------------------- */
    const popularCards = document.querySelectorAll('.popular-card');
    const modal = document.getElementById('item-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal(card) {
        currentModalCard = card;
        const item = findItemForCard(card);
        const vidEl = card.querySelector('video');
        const sourceEl = card.querySelector('source');
        const title = (item ? LM_MENU.displayName(item) : '') || card.querySelector('h3')?.textContent?.trim() || '';
        const description = (item ? LM_MENU.displayDetail(item) : '') || card.dataset.description || '';

        const videoSrc =
            (item && item.video) ||
            (vidEl && (vidEl.currentSrc || vidEl.src)) ||
            (sourceEl && (sourceEl.currentSrc || sourceEl.src || sourceEl.dataset.src)) ||
            '';

        const posterSrc =
            (item && item.poster) ||
            (vidEl && (vidEl.poster || vidEl.getAttribute('poster'))) ||
            '';

        if (modal && modalVideo && title) {
            if (videoSrc) {
                modalVideo.src = videoSrc;
                if (posterSrc) modalVideo.poster = posterSrc;
                modalVideo.load();
                modalVideo.play().catch(() => {});
            }
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        currentModalCard = null;
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

    /* ---------------------------------------------------------------
       Contrôle fluide de la lecture vidéo au scroll
       Joue la vidéo lorsqu'elle entre dans le champ et la met en pause hors écran.
       --------------------------------------------------------------- */
    const cardVideos = document.querySelectorAll('.popular-card video, .menu-card video');

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    const source = video.querySelector('source');
                    if (source && source.dataset.src && (!source.src || source.src !== source.dataset.src)) {
                        source.src = source.dataset.src;
                        video.src = source.dataset.src;
                        if (typeof video.load === 'function') video.load();
                    }
                    if (typeof video.play === 'function') {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {});
                        }
                    }
                } else {
                    if (typeof video.pause === 'function' && !video.paused) {
                        video.pause();
                    }
                }
            });
        }, {
            rootMargin: '150px 0px',
            threshold: 0.1
        });

        cardVideos.forEach(v => videoObserver.observe(v));
    } else {
        cardVideos.forEach(video => {
            const source = video.querySelector('source');
            if (source && source.dataset.src) {
                source.src = source.dataset.src;
                video.src = source.dataset.src;
            }
            if (typeof video.play === 'function') {
                video.play().catch(() => {});
            }
        });
    }

    /* ---------------------------------------------------------------
       Scroll Handler Throttled via requestAnimationFrame
       --------------------------------------------------------------- */
    const backToTop = document.querySelector('.back-to-top');
    const nav = document.querySelector('.category-nav');
    let isNavStuck = false;
    let isScrolledPast500 = false;
    let scrollTicking = false;

    function handleScroll() {
        const y = window.scrollY || window.pageYOffset;
        const over500 = y > 500;

        /* La barre est "collée" dès qu'elle atteint le haut du viewport */
        if (nav) {
            const stuck = nav.getBoundingClientRect().top <= 0.5;
            if (stuck !== isNavStuck) {
                isNavStuck = stuck;
                nav.classList.toggle('scrolled', stuck);
            }
        }

        if (over500 !== isScrolledPast500) {
            isScrolledPast500 = over500;
            if (backToTop) {
                backToTop.classList.toggle('visible', over500);
            }
        }

        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------------------------------------------------------------
       Redirection FAB Tooltip vers le Combo Idéal
       --------------------------------------------------------------- */
    const fabTooltip = document.getElementById('fab-tooltip');
    if (fabTooltip) {
        fabTooltip.addEventListener('click', () => {
            window.location.href = 'combo-ideal/index.html';
        });
        fabTooltip.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'combo-ideal/index.html';
            }
        });
    }

});
