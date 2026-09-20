/* ==========================================================================
   LE MANOIR — HUB PARTAGÉ
   Mode sombre synchronisé (même clé localStorage que la page principale),
   surbrillance du jeu actif dans la nav, hook de redraw pour les canvas.
   ========================================================================== */
(function () {
    'use strict';

    function isDark() { return document.body.classList.contains('dark-mode'); }

    function init() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        var toggle = document.querySelector('.hub-dark-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', isDark());
                if (navigator.vibrate) navigator.vibrate(15);
                if (typeof window.LM_HUB_ON_DARK === 'function') window.LM_HUB_ON_DARK(isDark());
            });
        }

        var game = document.body.getAttribute('data-game');
        if (game) {
            Array.prototype.forEach.call(document.querySelectorAll('.hub-link'), function (a) {
                a.classList.toggle('active', a.getAttribute('data-game') === game);
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
