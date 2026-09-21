/* ==========================================================================
   LE MANOIR — FX PARTAGÉS : sons (Web Audio API) + vibrations haptiques
   --------------------------------------------------------------------------
   Utilisé par les mini-jeux (combo-ideal, who-pays, quiz) pour :
     • des ticks "tick-tick-tick" fiables pendant les spins de roue,
     • des vibrations réelles navigator.vibrate() à chaque tick / arrêt,
     • un déblocage automatique de l'AudioContext au 1er geste utilisateur
       (obligatoire sur iOS Safari / Android Chrome, sinon silence).
   API : window.LM_FX.unlock() / .tick() / .win() / .blip() / .buzz(pattern)
   Dégradation silencieuse : sans Web Audio ou sans navigator.vibrate,
   aucune erreur n'est levée.
   ========================================================================== */
(function () {
    'use strict';

    var ctx = null;
    var reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Crée (au besoin) le contexte audio et tente de le reprendre.
       Retourne le contexte ou null (Web Audio indisponible). */
    function ensureCtx() {
        if (!ctx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            try {
                ctx = new AC();
            } catch (e) {
                ctx = null;
                return null;
            }
            /* Certains navigateurs re-suspendent après un changement d'onglet */
            if (ctx.onstatechange !== undefined) {
                ctx.onstatechange = function () {
                    if (ctx.state === 'suspended' && ctx.resume) {
                        ctx.resume().catch(function () {});
                    }
                };
            }
        }
        if (ctx.state === 'suspended' && ctx.resume) {
            ctx.resume().catch(function () {});
        }
        return ctx;
    }

    /* À appeler dans un geste utilisateur (clic / tap) pour "débloquer"
       le son sur mobile. Les écouteurs globaux ci-dessous s'en chargent
       automatiquement dès la première interaction. */
    function unlock() {
        ensureCtx();
    }

    /* Déblocage automatique au premier geste (capture : avant les jeux) */
    var GESTURES = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
    GESTURES.forEach(function (evt) {
        document.addEventListener(evt, unlock, { capture: true, passive: true });
    });
    window.addEventListener('focus', unlock);

    /* ------------------------------------------------------- Synthèse --- */
    /* Blip court synthétisé (aucun fichier audio : 100% Web Audio API). */
    function blip(freq, ms, vol, type, delay) {
        var ac = ensureCtx();
        if (!ac) return false;
        /* Si le contexte est encore suspendu malgré le resume (1er tap iOS),
           on tente une dernière fois puis on abandonne silencieusement. */
        if (ac.state !== 'running') {
            if (ac.resume) ac.resume().catch(function () {});
            if (ac.state !== 'running') return false;
        }
        try {
            var t0 = ac.currentTime + (delay || 0);
            var o = ac.createOscillator();
            var g = ac.createGain();
            o.type = type || 'square';
            o.frequency.setValueAtTime(freq, t0);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
            o.connect(g);
            g.connect(ac.destination);
            o.start(t0);
            o.stop(t0 + ms / 1000 + 0.02);
            return true;
        } catch (e) {
            return false;
        }
    }

    /* ----------------------------------------------------- Vibrations --- */
    function buzz(pattern) {
        if (reduced) return; /* cohérence avec le reste du hub */
        if (navigator.vibrate) {
            try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
        }
    }

    /* ------------------------------------------------------ Préréglés --- */
    /* Tick de roue : son "tic" aigu + vibration réelle du device. */
    function tick() {
        blip(1900, 45, 0.06);
        buzz(15);
    }

    /* Arrêt / victoire : deux notes + vibration [10, 30, 10]. */
    function win() {
        blip(880, 140, 0.09, 'triangle');
        blip(1318, 260, 0.09, 'triangle', 0.15);
        buzz([10, 30, 10]);
    }

    window.LM_FX = {
        unlock: unlock,
        tick: tick,
        win: win,
        blip: blip,
        buzz: buzz
    };
})();
