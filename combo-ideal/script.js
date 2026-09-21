/* ==========================================================================
   COMBO IDÉAL — Le Manoir  (mini-jeu du hub)
   --------------------------------------------------------------------------
   Roue "Combo Idéal" : plat principal + boisson qui va avec.
   La carte provient des données partagées (shared/menu-data.js),
   la navigation et la carte story 9:16 proviennent du hub partagé.
   ========================================================================== */
(function () {
    'use strict';

    var SLICE_COUNT     = 8;
    var SPIN_MS         = 3600;
    var SPIN_MS_REDUCED = 1100;
    var FULL_TURNS      = 5;

    function t(key, params) { return window.LM_I18N ? window.LM_I18N.t(key, params) : key; }

    var PERIODS = {
        breakfast: 'breakfast',
        lunch:     'lunch',
        dinner:    'dinner'
    };
    function periodLabel(p) { return t('combo.period.' + p + '.name'); }

    /* Carte : données partagées (shared/menu-data.js) */
    var MENU = LM_MENU.items;
    var normalize = LM_MENU.normalize;
    var hasAny = LM_MENU.hasAny;
    var shuffle = LM_MENU.shuffle;
    var pick = LM_MENU.pick;
    var pickWeighted = LM_MENU.pickWeighted;
    var isMoroccan = LM_MENU.isMoroccan;

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
    var period='lunch';
    var canvas, ctx, frame, hub, wheelShell;
    var spinBtn, hintEl, reel, reelText;
    var comboCard, comboVideo, comboMedia, comboMediaLabel;
    var comboDish, comboDishPrice, comboDrink, comboDrinkPrice, comboTotal, comboKicker;
    var actRespin, actLocate, actShare;

    var pool=[], slices=[], winner=null, lastDish=null, lastDrink=null;
    var rotation=0, spinning=false, radius=0, reelTimer=null;
    var reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(id){ return document.getElementById(id); }

    function init(){
        canvas=$('wheel-canvas'); frame=document.querySelector('.wheel-frame'); hub=$('wheel-hub');
        wheelShell=$('wheel-shell'); spinBtn=$('spin-btn'); hintEl=$('roulette-hint');
        reel=$('result-reel'); reelText=$('result-reel-text');
        comboCard=$('combo-card'); comboVideo=$('combo-video'); comboMedia=$('combo-media'); comboMediaLabel=$('combo-media-label');
        comboDish=$('combo-dish'); comboDishPrice=$('combo-dish-price'); comboDrink=$('combo-drink');
        comboDrinkPrice=$('combo-drink-price'); comboTotal=$('combo-total'); comboKicker=$('combo-kicker');
        actRespin=$('act-respin'); actLocate=$('act-locate');
 actShare=$('act-share');

        if(!canvas||!frame) return;
        ctx=canvas.getContext('2d');

        var h=new Date().getHours();
        period = h<11?'breakfast':(h<17?'lunch':'dinner');

        window.LM_HUB_ON_DARK = function(){ draw(); };
        bind();
        syncChips();
        previewWheel();
        sizeCanvas();

        window.addEventListener('resize', debounce(sizeCanvas,180));
        if (typeof window.ResizeObserver==='function') new ResizeObserver(debounce(sizeCanvas,120)).observe(frame);
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(function(){draw();}).catch(function(){});

        /* Changement de langue : textes dynamiques du combo */
        document.addEventListener('languagechange', function(){
            syncChips();
            if (lastDish && lastDrink && comboKicker) {
                comboKicker.textContent = t('combo.kicker.period', { label: periodLabel(period) });
                comboDish.textContent = LM_MENU.displayName(lastDish);
                comboDrink.innerHTML = '<i class="fas fa-mug-hot"></i>' + LM_MENU.displayName(lastDrink);
                comboMediaLabel.textContent = LM_MENU.displaySectionName(lastDish);
            }
            draw();
        });
    }

    function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms);};}

    function bind(){
        spinBtn.addEventListener('click', function(){ spinCombo(false); });
        hub.addEventListener('click', function(){ spinCombo(false); });
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function(c){
            c.addEventListener('click', function(){ if(!spinning) setPeriod(c.getAttribute('data-period')); });
        });
        actRespin.addEventListener('click', function(){ spinCombo(true); });
        actLocate.addEventListener('click', locate);
        actShare.addEventListener('click', shareStory);
        comboVideo.addEventListener('error', function(){ comboMedia.classList.remove('has-video'); });
    }

    function setPeriod(p){
        if(!PERIODS[p]) return;
        period=p; syncChips();
        if (!spinning) previewWheel();
    }

    function syncChips(){
        Array.prototype.forEach.call(document.querySelectorAll('.period-chip'), function(c){
            c.classList.toggle('active', c.getAttribute('data-period')===period);
        });
        if(hintEl) hintEl.textContent=t('combo.hint',{n:candidatesFor(period).length,label:periodLabel(period)});
    }

    /* ------------------------------------------------------------- Roue --- */
    function buildSlices(win){
        if(!pool.length) return [];
        var n=Math.min(SLICE_COUNT,pool.length);
        if(!win) return shuffle(pool).slice(0,n);
        var rest=shuffle(pool.filter(function(x){return x!==win;})).slice(0,n-1);
        return shuffle([win].concat(rest));
    }

    /* Aperçu de la roue avant le premier spin (la page est dédiée à la roue) */
    function previewWheel(){
        pool=candidatesFor(period);
        if(!pool.length){ slices=[]; draw(); return; }
        slices=buildSlices(pickWeighted(pool));
        draw();
    }

    function sizeCanvas(){
        if(!canvas||!frame) return;
        var css=frame.clientWidth; if(!css) return;
        var dpr=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.round(css*dpr); canvas.height=Math.round(css*dpr);
        canvas.style.width=css+'px'; canvas.style.height=css+'px';
        if(!ctx) return;
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
            var lines=wrapText(shortLabel(LM_MENU.displayName(slices[i])),R*0.5,3);
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
            reelText.textContent=LM_MENU.displayName(it);
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

        comboKicker.textContent=t('combo.kicker.period',{label:periodLabel(period)});
        comboDish.textContent=LM_MENU.displayName(dish);
        comboDishPrice.textContent=dish.price!==null?dish.price+' Dh':'';
        comboDrink.innerHTML='<i class="fas fa-mug-hot"></i>'+ (lastDrink?LM_MENU.displayName(lastDrink):'');
        comboDrinkPrice.textContent=lastDrink&&lastDrink.price!==null?lastDrink.price+' Dh':'';

        var total=(dish.price||0)+(lastDrink&&lastDrink.price!==null?lastDrink.price:0);
        comboTotal.textContent=total+' Dh';
        comboMediaLabel.textContent=LM_MENU.displaySectionName(dish);

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

    /* "Voir dans le menu" : retour sur la page principale, ancré sur la
       section concernée (le défilement est géré par la page d'accueil). */
    /* -------------------------------------- Partage Story (9:16) --- */
    function shareStory(){
        if(!lastDish||!lastDrink) return;
        var dish=lastDish, drink=lastDrink, periodKey=period;
        var total=(dish.price||0)+(drink.price!==null?drink.price:0);
        LM_STORY.show(function(){
            return {
                kicker: t('combo.kicker.period',{label:periodLabel(periodKey)}),
                emoji: '🎰',
                title: LM_MENU.displayName(dish),
                sub: LM_MENU.displaySectionName(dish),
                rows: [
                    { label: t('combo.story.dish') + ' — ' + LM_MENU.displayName(dish), value: dish.price!==null ? dish.price + ' Dh' : '' },
                    { label: t('combo.story.drink') + ' — ' + LM_MENU.displayName(drink), value: drink.price!==null ? drink.price + ' Dh' : '' },
                    { label: t('combo.total').toUpperCase(), value: total + ' Dh', total: true }
                ],
                foot: t('combo.story.foot')
            };
        });
    }

    function locate(){
        if(!lastDish||!lastDish.sectionId) return;
        window.location.href='../index.html#'+lastDish.sectionId;
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* API de debug / tests */
    window.LeManoirCombo={
        get menu(){return MENU;},
        get pool(){return pool;},
        get slices(){return slices;},
        get winner(){return winner;},
        get rotation(){return rotation;},
        get spinning(){return spinning;},
        get period(){return period;},
        get lastDish(){return lastDish;},
        get lastDrink(){return lastDrink;},
        pointerIndex:sliceIndexAtPointer,
        candidatesFor:candidatesFor,
        suggestDrink:suggestDrink,
        setPeriod:setPeriod,
        spin:spinCombo, share:shareStory,
        locate:locate
    };
})();
