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