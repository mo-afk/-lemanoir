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
   LA ROULETTE LE MANOIR  —  Générateur de Combo Idéal  [v3 simplifié]
   ==========================================================================
   • Une seule personne : la roue choisit un plat principal adapté au service,
     puis un code d'accord suggère une boisson qui va avec (atay / café / jus…).
   • Affiche le combo (plat + boisson + total en Dh), Re-spin et
     « Voir dans le menu ».
   • Lit la carte depuis le DOM (rien n'est dupliqué).
   ========================================================================== */
(function () {
    'use strict';

    var SLICE_COUNT     = 8;
    var MIN_MAIN_PRICE  = 30;
    var SPIN_MS         = 3600;
    var SPIN_MS_REDUCED = 1100;
    var FULL_TURNS      = 5;

    var PERIODS = {
        breakfast: { label: 'Petit-déjeuner' },
        lunch:     { label: 'Déjeuner' },
        dinner:    { label: 'Dîner' }
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
    /* Plats marocains -> atay / thé à la menthe */
    var MOROCCAN_WORDS = ['terroir', 'sabah', 'chaoui', 'fes', 'maroc', 'khlii', 'amlou', 'harcha', 'msemen', 'nordique'];

    /* ------------------------------------------------------------- Utils --- */
    function normalize(s) { return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
    function hasAny(h, w) { for (var i=0;i<w.length;i++) if (h.indexOf(w[i])!==-1) return true; return false; }
    function parsePrice(t) { var m=String(t||'').match(/(\d+(?:[.,]\d+)?)\s*(?:dh|mad|dhs)/i); return m?parseFloat(m[1].replace(',','.')):null; }
    function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
    function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
    function weightOf(it){ return it.video?2:1; }
    function pickWeighted(list){ var t=0,i; for(i=0;i<list.length;i++)t+=weightOf(list[i]); var r=Math.random()*t; for(i=0;i<list.length;i++){r-=weightOf(list[i]); if(r<=0)return list[i];} return list[list.length-1]; }

    /* --------------------------------------------------- Lecture du DOM --- */
    function sectionMeta(section){
        var id=section.id||'';
        if (SECTION_META[id]) return SECTION_META[id];
        var title=normalize((section.querySelector('.section-header h2')||{}).textContent);
        var kind=hasAny(title,DRINK_HINTS)?'drink':hasAny(title,DESSERT_HINTS)?'dessert':null;
        return { label:(section.querySelector('.section-header h2')||{}).textContent||'La carte', kind:kind, meals:kind?[]:['breakfast','lunch','dinner'] };
    }
    function readMedia(card){
        var video=card.querySelector('video'), source=card.querySelector('source');
        var src=(source&&(source.getAttribute('data-src')||source.getAttribute('src')))||(video&&video.getAttribute('src'))||'';
        return { video:src||null, poster:(video&&video.getAttribute('poster'))||null };
    }
    function buildMenuItem(card, section){
        var h3=card.querySelector('h3'); if(!h3) return null;
        var name=h3.textContent.trim();
        var pEl=card.querySelector('p'); var pText=pEl?pEl.textContent.trim():'';
        var priceOnly=/^\s*\d+(?:[.,]\d+)?\s*dh\s*$/i.test(pText);
        var price=parsePrice((card.querySelector('.price')||{}).textContent)||(priceOnly?parsePrice(pText):null);
        var media=readMedia(card);
        return { id:name+'|'+section.id, name:name, price:price, description:priceOnly?'':pText,
                 badge:(card.querySelector('.card-badge')||{}).textContent||'', sectionId:section.id,
                 el:card, video:media.video, poster:media.poster };
    }
    function classify(item, meta){
        var n=normalize(item.name);
        if (meta.kind==='drink') return 'drink';
        if (meta.kind==='dessert') return 'dessert';
        if (hasAny(n,SIDE_WORDS)) return 'side';
        if (item.price!==null && item.price<MIN_MAIN_PRICE) return 'side';
        return 'main';
    }
    function flavor(item){
        var n=normalize(item.name);
        if (hasAny(n,SAVORY_WORDS)) return 'savory';
        if (hasAny(n,SWEET_WORDS)) return 'sweet';
        return 'neutral';
    }
    function isMoroccan(item){ return hasAny(normalize(item.name), MOROCCAN_WORDS); }
    function collectMenu(){
        var items=[];
        Array.prototype.forEach.call(document.querySelectorAll('main .menu-section'), function(section){
            var meta=sectionMeta(section), meals=meta.meals||[];
            Array.prototype.forEach.call(section.querySelectorAll('.popular-card'), function(card){
                var item=buildMenuItem(card, section); if(!item) return;
                var d=card.getAttribute('data-description'); if(d) item.description=d.trim();
                var b=card.querySelector('.card-badge'); item.badge=b?b.textContent.trim():'';
                item.kind=classify(item,meta); item.flavor=flavor(item); item.sectionName=meta.label;
                item.meals=item.kind==='main'?meals:(meta.meals||[]);
                items.push(item);
            });
            Array.prototype.forEach.call(section.querySelectorAll('.menu-item-card'), function(card){
                var item=buildMenuItem(card, section); if(!item) return;
                item.kind=classify(item,meta); item.flavor=flavor(item); item.sectionName=meta.label;
                item.meals=item.kind==='main'?meals:(meta.meals||[]);
                items.push(item);
            });
        });
        return items;
    }
    function candidatesFor(period){
        return MENU.filter(function(it){
            if (it.kind!=='main') return false;
            if (it.meals.indexOf(period)===-1) return false;
            if (period==='lunch' && it.flavor==='sweet') return false;
            return true;
        });
    }

    /* --------------------------------------------- Accord plat / boisson --- */
    function drinksOf(sections){ return MENU.filter(function(i){ return i.kind==='drink' && sections.indexOf(i.sectionId)!==-1; }); }
    function prefer(pool, words){
        var m=pool.filter(function(i){ return hasAny(normalize(i.name), words); });
        return m.length ? pick(m) : null;
    }

    function suggestDrink(dish, period){
        var hot  = drinksOf(['boissons-chaudes']);
        var cold = drinksOf(['boissons-froides','ice-coffee','milkshakes']);
        var mock = drinksOf(['mocktails']);
        var sweet = dish.flavor==='sweet';
        var moroccan = isMoroccan(dish);

        if (period==='breakfast') {
            if (moroccan) return prefer(hot,['the','menthe']) || pick(hot);
            if (sweet)    return prefer(hot,['cafe','espresso','cappuccino','latte','chocolat']) || pick(hot);
            return pick(hot.concat(cold));
        }
        /* déjeuner / dîner */
        if (sweet) return prefer(hot,['cafe','espresso','cappuccino','latte']) || pick(hot);
        if (period==='dinner' && mock.length && Math.random()<0.35) return pick(mock);
        return prefer(cold,['jus orange','orange','soda']) || pick(cold) || pick(mock);
    }

    /* ---------------------------------------------------------------- DOM --- */
    var MENU=[];
    var period='lunch';
    var canvas, ctx, frame, hub, wheelShell, modal, fab, closeBtn;
    var spinBtn, hintEl, reel, reelText;
    var comboCard, comboVideo, comboMedia, comboMediaLabel;
    var comboDish, comboDishPrice, comboDrink, comboDrinkPrice, comboTotal, comboKicker;
    var actRespin, actLocate;

    var pool=[], slices=[], winner=null, lastDish=null, lastDrink=null;
    var rotation=0, spinning=false, radius=0, reelTimer=null;
    var reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(id){ return document.getElementById(id); }

    function init(){
        canvas=$('wheel-canvas'); frame=document.querySelector('.wheel-frame'); hub=$('wheel-hub');
        wheelShell=$('wheel-shell'); modal=$('roulette-modal'); fab=$('roulette-fab'); closeBtn=$('rm-close');
        spinBtn=$('spin-btn'); hintEl=$('roulette-hint'); reel=$('result-reel'); reelText=$('result-reel-text');
        comboCard=$('combo-card'); comboVideo=$('combo-video'); comboMedia=$('combo-media'); comboMediaLabel=$('combo-media-label');
        comboDish=$('combo-dish'); comboDishPrice=$('combo-dish-price'); comboDrink=$('combo-drink');
        comboDrinkPrice=$('combo-drink-price'); comboTotal=$('combo-total'); comboKicker=$('combo-kicker');
        actRespin=$('act-respin'); actLocate=$('act-locate');

        if(!canvas||!modal||!fab) return;
        ctx=canvas.getContext('2d');
        MENU=collectMenu();

        var h=new Date().getHours();
        period = h<11?'breakfast':(h<17?'lunch':'dinner');

        bind();
        syncChips();

        window.addEventListener('resize', debounce(sizeCanvas,180));
        if (typeof window.ResizeObserver==='function') new ResizeObserver(debounce(sizeCanvas,120)).observe(frame);
        if (typeof MutationObserver==='function') new MutationObserver(function(){draw();}).observe(document.body,{attributes:true,attributeFilter:['class']});
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(function(){draw();}).catch(function(){});
    }

    function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms);};}

    function bind(){
        fab.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
        document.addEventListener('keydown', function(e){ if(e.key==='Escape'&&modal.classList.contains('open')) close(); });
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function(c){
            c.addEventListener('click', function(){ if(!spinning) setPeriod(c.getAttribute('data-period')); });
        });
        spinBtn.addEventListener('click', function(){ spinCombo(false); });
        hub.addEventListener('click', function(){ spinCombo(false); });
        actRespin.addEventListener('click', function(){ spinCombo(true); });
        actLocate.addEventListener('click', locate);
        comboVideo.addEventListener('error', function(){ comboMedia.classList.remove('has-video'); });
    }

    function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; setTimeout(sizeCanvas,60); }
    function close(){ modal.classList.remove('open'); document.body.style.overflow=''; if(comboVideo) comboVideo.pause(); }

    function setPeriod(p){ if(!PERIODS[p]) return; period=p; syncChips(); }
    function syncChips(){
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function(c){
            c.classList.toggle('active', c.getAttribute('data-period')===period);
        });
        if(hintEl) hintEl.textContent=candidatesFor(period).length+' plats en jeu · '+PERIODS[period].label;
    }

    /* ------------------------------------------------------------- Roue --- */
    function buildSlices(win){
        if(!pool.length) return [];
        var n=Math.min(SLICE_COUNT,pool.length);
        if(!win) return shuffle(pool).slice(0,n);
        var rest=shuffle(pool.filter(function(x){return x!==win;})).slice(0,n-1);
        return shuffle([win].concat(rest));
    }
    function sizeCanvas(){
        if(!canvas||!frame) return;
        var css=frame.clientWidth; if(!css) return;
        var dpr=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.round(css*dpr); canvas.height=Math.round(css*dpr);
        canvas.style.width=css+'px'; canvas.style.height=css+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0); radius=css/2; draw();
    }
    function palette(){
        var cs=getComputedStyle(document.body);
        function v(n,fb){var x=cs.getPropertyValue(n);return (x&&x.trim())||fb;}
        return { sliceA:v('--wheel-slice-a','#F7F1E8'), sliceB:v('--wheel-slice-b','#C8956C'),
                 inkA:v('--wheel-ink-a','#1A1A1A'), inkB:v('--wheel-ink-b','#241708'),
                 rim:v('--wheel-rim','#1A1A1A'), accent:v('--accent','#C8956C') };
    }
    function shortLabel(n){ return n.length>24?n.slice(0,22).trim()+'…':n; }
    function wrapText(text,maxW,maxLines){
        var words=String(text).split(' '), lines=[], line='', overflow=false;
        for(var i=0;i<words.length;i++){
            var test=line?line+' '+words[i]:words[i];
            if(!line||ctx.measureText(test).width<=maxW){line=test;continue;}
            if(lines.length<maxLines-1){lines.push(line);line=words[i];}
            else{line=line+' '+words.slice(i).join(' ');overflow=true;break;}
        }
        if(line)lines.push(line);
        var last=lines[lines.length-1]||'';
        if(overflow||ctx.measureText(last).width>maxW){
            var cut=last;
            while(cut.length>1&&ctx.measureText(cut+'…').width>maxW)cut=cut.slice(0,-1).trim();
            lines[lines.length-1]=cut+'…';
        }
        return lines;
    }
    function draw(){
        if(!ctx||!radius||!slices.length) return;
        var c=palette(), R=radius, rIn=R*0.9, n=slices.length, step=(Math.PI*2)/n;
        ctx.clearRect(0,0,R*2,R*2);
        ctx.save(); ctx.translate(R,R); ctx.rotate(rotation*Math.PI/180);
        ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.fillStyle=c.rim; ctx.fill();
        var studs=Math.max(16,n*2);
        for(var s=0;s<studs;s++){var a=(s/studs)*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*R*0.952,Math.sin(a)*R*0.952,R*0.012,0,Math.PI*2);ctx.fillStyle=s%2===0?c.accent:'rgba(255,255,255,0.55)';ctx.fill();}
        for(var i=0;i<n;i++){
            var a0=-Math.PI/2+i*step, a1=a0+step, light=i%2===0;
            ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rIn,a0,a1);ctx.closePath();
            ctx.fillStyle=light?c.sliceA:c.sliceB;ctx.fill();
            ctx.lineWidth=Math.max(1,R*0.006);ctx.strokeStyle='rgba(200,149,108,0.55)';ctx.stroke();
            var mid=a0+step/2, fs=Math.max(9,Math.min(R*0.088,15));
            ctx.save();ctx.rotate(mid);
            var flip=Math.cos(mid)<0; if(flip)ctx.rotate(Math.PI);
            ctx.textAlign=flip?'left':'right'; ctx.textBaseline='middle';
            ctx.font='700 '+fs.toFixed(1)+'px Lato, sans-serif';
            ctx.fillStyle=light?c.inkA:c.inkB;
            var pad=R*0.075, x=flip?-(rIn-pad):(rIn-pad);
            var lines=wrapText(shortLabel(slices[i].name),R*0.5,3);
            var lineH=fs*1.18, y0=-((lines.length-1)*lineH)/2;
            for(var l=0;l<lines.length;l++)ctx.fillText(lines[l],x,y0+l*lineH);
            ctx.restore();
        }
        ctx.beginPath();ctx.arc(0,0,rIn,0,Math.PI*2);ctx.lineWidth=Math.max(2,R*0.014);ctx.strokeStyle=c.accent;ctx.stroke();
        ctx.beginPath();ctx.arc(0,0,R*0.19,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fill();
        ctx.restore();
    }
    function sliceIndexAtPointer(){
        if(!slices.length) return -1;
        var step=360/slices.length, a=((-rotation%360)+360)%360;
        return Math.floor(a/step)%slices.length;
    }

    /* ------------------------------------------------------------- Spin --- */
    function spinCombo(isRespin){
        if(spinning) return;
        var list=candidatesFor(period);
        if(isRespin && lastDish) list=list.filter(function(i){return i.id!==lastDish.id;});
        if(list.length<2) list=candidatesFor(period);
        beginSpin(list);
    }

    function beginSpin(list){
        if(spinning||!list.length) return;
        spinning=true; spinBtn.disabled=true;
        comboCard.classList.remove('visible');
        reel.classList.remove('hidden'); startReel(list);
        winner=pickWeighted(list);
        pool=list; slices=buildSlices(winner); draw();
        var step=360/slices.length, jitter=(Math.random()*0.6-0.3)*step;
        var winIndex=slices.indexOf(winner);
        var target=-((winIndex+0.5)*step)-jitter;
        var current=((rotation%360)+360)%360;
        var delta=(((target-current)%360)+360)%360;
        animateTo(rotation+360*FULL_TURNS+delta);
    }

    function animateTo(target){
        var from=rotation, distance=target-from;
        var duration=reduced?SPIN_MS_REDUCED:SPIN_MS;
        var start=performance.now();
        var lastIdx=sliceIndexAtPointer();
        var pointer=document.querySelector('.wheel-pointer');
        function step(now){
            var p=Math.min(1,(now-start)/duration);
            var e=1-Math.pow(1-p,4);
            rotation=from+distance*e; draw();
            var idx=sliceIndexAtPointer();
            if(idx!==lastIdx){lastIdx=idx;
                if(pointer){pointer.classList.remove('tick');void pointer.offsetWidth;pointer.classList.add('tick');}
                if(navigator.vibrate&&!reduced)navigator.vibrate(6);}
            if(p<1)requestAnimationFrame(step);
            else{rotation=target;draw();finish();}
        }
        requestAnimationFrame(step);
    }

    function startReel(list){
        stopReel(); if(reduced) return;
        reelTimer=setInterval(function(){
            var it=list[Math.floor(Math.random()*list.length)];
            reelText.textContent=it.name;
            reelText.classList.remove('rolling');void reelText.offsetWidth;reelText.classList.add('rolling');
        },95);
    }
    function stopReel(){ if(reelTimer){clearInterval(reelTimer);reelTimer=null;} }

    function finish(){
        stopReel(); spinning=false; spinBtn.disabled=false;
        reel.classList.add('hidden');
        showCombo(winner);
        if(navigator.vibrate&&!reduced)navigator.vibrate([18,60,24]);
    }

    /* ----------------------------------------------------------- Combo --- */
    function showCombo(dish){
        lastDish=dish;
        lastDrink=suggestDrink(dish, period);

        comboKicker.textContent='Ton combo idéal · '+PERIODS[period].label;
        comboDish.textContent=dish.name;
        comboDishPrice.textContent=dish.price!==null?dish.price+' Dh':'';
        comboDrink.innerHTML='<i class="fas fa-mug-hot"></i>'+ (lastDrink?lastDrink.name:'');
        comboDrinkPrice.textContent=lastDrink&&lastDrink.price!==null?lastDrink.price+' Dh':'';

        var total=(dish.price||0)+(lastDrink&&lastDrink.price!==null?lastDrink.price:0);
        comboTotal.textContent=total+' Dh';
        comboMediaLabel.textContent=dish.sectionName;

        if(dish.video){
            comboMedia.classList.add('has-video');
            if(dish.poster)comboVideo.poster=dish.poster;
            comboVideo.src=dish.video; comboVideo.load();
            var p=comboVideo.play(); if(p&&p.catch)p.catch(function(){});
        }else{
            comboMedia.classList.remove('has-video');
            comboVideo.pause(); comboVideo.removeAttribute('src'); comboVideo.load();
        }

        comboCard.classList.remove('visible'); void comboCard.offsetWidth; comboCard.classList.add('visible');
    }

    function locate(){
        if(!lastDish||!lastDish.el) return;
        close();
        lastDish.el.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
        lastDish.el.classList.remove('roulette-flash'); void lastDish.el.offsetWidth; lastDish.el.classList.add('roulette-flash');
        setTimeout(function(){ if(lastDish&&lastDish.el)lastDish.el.classList.remove('roulette-flash'); },2600);
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.LeManoirRoulette={
        get menu(){return MENU;},
        get pool(){return pool;},
        get slices(){return slices;},
        get winner(){return winner;},
        get rotation(){return rotation;},
        get spinning(){return spinning;},
        get period(){return period;},
        get lastDrink(){return lastDrink;},
        pointerIndex:sliceIndexAtPointer,
        candidatesFor:candidatesFor,
        suggestDrink:suggestDrink,
        open:open, close:close, setPeriod:setPeriod, spin:spinCombo
    };
})();
