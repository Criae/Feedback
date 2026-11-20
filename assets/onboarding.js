/* Experiência de Onboarding · Criaê Marketing
 * Uso: CriaeOnboarding.open({ nome: "Ketellen", briefing: "https://...", origem: elementoClicado })
 */
(function(){
  var STAR = 'M50,2 59.2,27.8 83.9,16.1 72.2,40.8 98,50 72.2,59.2 83.9,83.9 59.2,72.2 50,98 40.8,72.2 16.1,83.9 27.8,59.2 2,50 27.8,40.8 16.1,16.1 40.8,27.8Z';
  var starSvg = function(cls){ return '<svg class="'+(cls||'')+'" viewBox="0 0 100 100" aria-hidden="true"><path d="'+STAR+'"/></svg>'; };
  var ARROW = '<svg viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6h19M15 1l5 5-5 5"/></svg>';
  var ARROW_L = '<svg viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 6H2M7 1 2 6l5 5"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  var COLORS = ['#FF3B14','#B6FF1A','#FFC400','#F4F1E8'];

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;

  function store(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
  var saved = store('criae-som');
  var soundOn = saved === null ? !touch : saved === '1';

  function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function anim(el, frames, opts){ if(!el || !el.animate) return null; return el.animate(frames, opts); }

  /* ---------- SOM (sintetizado, sem arquivos) ---------- */
  var ctx = null;
  function audio(){
    if(!soundOn) return null;
    try{
      if(!ctx){ var A = window.AudioContext || window.webkitAudioContext; if(!A) return null; ctx = new A(); }
      if(ctx.state === 'suspended') ctx.resume();
      return ctx;
    }catch(e){ return null; }
  }
  function tone(a, freq, start, dur, type, vol){
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(a.destination); o.start(start); o.stop(start + dur + 0.05);
  }
  function playBurst(){
    var a = audio(); if(!a) return;
    var t = a.currentTime + 0.02;
    // "whoosh": ruído filtrado subindo
    var len = Math.floor(a.sampleRate * 0.5), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    var n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    n.buffer = buf; f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.45);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    n.connect(f); f.connect(g); g.connect(a.destination); n.start(t);
    // acorde brilhante (Dó maior arpejado)
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function(fr, k){ tone(a, fr, t + 0.38 + k*0.07, 0.9, 'triangle', 0.12); });
    tone(a, 130.81, t + 0.38, 0.8, 'sine', 0.2);
  }
  function playTick(up){
    var a = audio(); if(!a) return;
    var t = a.currentTime + 0.01;
    tone(a, up ? 880 : 660, t, 0.18, 'sine', 0.08);
    tone(a, up ? 1320 : 990, t + 0.05, 0.2, 'sine', 0.05);
  }

  /* ---------- ESTRUTURA ---------- */
  var root, burst, rays, hello, steps, finalS, soundBtn, lastFocus, idx = 0, data, opts;

  function build(){
    root = document.createElement('div');
    root.className = 'ob'; root.hidden = true;
    root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-label','Boas-vindas à Criaê');
    root.innerHTML =
      '<svg class="ob-rays" viewBox="-100 -100 200 200" aria-hidden="true"></svg>' +
      '<div class="ob-burst" aria-hidden="true"></div>' +
      '<div class="ob-top"><span class="ob-brand">Criaê Marketing</span><div class="ob-ctrls">' +
        '<button type="button" class="ob-icon" data-act="som"></button>' +
        '<button type="button" class="ob-icon" data-act="fechar" aria-label="Fechar">'+ICON_X+'</button>' +
      '</div></div>' +
      '<div class="ob-stage">' +
        '<section class="ob-scene ob-hello"></section>' +
        '<section class="ob-scene ob-steps" hidden></section>' +
        '<section class="ob-scene ob-final" hidden></section>' +
      '</div>';
    document.body.appendChild(root);
    burst = root.querySelector('.ob-burst');
    rays = root.querySelector('.ob-rays');
    hello = root.querySelector('.ob-hello');
    steps = root.querySelector('.ob-steps');
    finalS = root.querySelector('.ob-final');
    soundBtn = root.querySelector('[data-act="som"]');

    var r = '';
    for(var i=0;i<36;i++){ var a = i/36*Math.PI*2; r += '<line x1="'+(Math.cos(a)*18).toFixed(1)+'" y1="'+(Math.sin(a)*18).toFixed(1)+'" x2="'+(Math.cos(a)*100).toFixed(1)+'" y2="'+(Math.sin(a)*100).toFixed(1)+'"/>'; }
    rays.innerHTML = r;

    root.addEventListener('click', function(e){
      var b = e.target.closest('[data-act]'); if(!b) return;
      var act = b.getAttribute('data-act');
      if(act === 'fechar') close();
      else if(act === 'som') toggleSound();
      else if(act === 'comecar') showSteps(0);
      else if(act === 'prox') go(idx + 1);
      else if(act === 'ant') go(idx - 1);
      else if(act === 'ir') go(+b.getAttribute('data-i'));
      else if(act === 'rever') showSteps(0);
    });
    document.addEventListener('keydown', function(e){
      if(root.hidden) return;
      if(e.key === 'Escape'){ e.preventDefault(); close(); }
      else if(!steps.hidden && e.key === 'ArrowRight'){ go(idx + 1); }
      else if(!steps.hidden && e.key === 'ArrowLeft'){ go(idx - 1); }
      else if(e.key === 'Tab'){ trap(e); }
    });
    paintSound();
  }

  function trap(e){
    var f = Array.prototype.filter.call(root.querySelectorAll('button, a[href]'), function(el){ return el.offsetParent !== null; });
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  function paintSound(){
    soundBtn.innerHTML = soundOn ? ICON_ON : ICON_OFF;
    soundBtn.setAttribute('aria-label', soundOn ? 'Desligar som' : 'Ligar som');
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  }
  function toggleSound(){ soundOn = !soundOn; store('criae-som', soundOn ? '1' : '0'); paintSound(); if(soundOn) playTick(true); }

  /* ---------- CENA 1: EXPLOSÃO + NOME ---------- */
  function letters(text, hl){
    return text.split(' ').map(function(w){
      return '<span class="w">' + Array.prototype.map.call(w, function(ch){ return '<span class="l'+(hl?' hl':'')+'">'+esc(ch)+'</span>'; }).join('') + '</span>';
    }).join(' ');
  }

  function showHello(){
    steps.hidden = true; finalS.hidden = true; hello.hidden = false;
    var nome = opts.nome;
    hello.innerHTML =
      '<span class="ob-kicker">'+(nome ? 'Bem-vindo(a) à Criaê' : 'Que bom ter você aqui')+'</span>' +
      '<h2 class="ob-name">' + (nome ? letters('Olá,') + ' ' + letters(nome + '!', true) : letters('Bem-vindo à') + ' ' + letters('Criaê!', true)) + '</h2>' +
      '<p>A partir de agora, a sua marca tem um time inteiro pensando nela. Em menos de 2 minutos, mostramos como a gente trabalha.</p>' +
      '<button type="button" class="ob-btn" data-act="comecar">Ver como funciona '+ARROW+'</button>';
    var btn = hello.querySelector('.ob-btn');

    if(reduce){ btn.focus(); return; }

    playBurst();

    // fundo surgindo a partir do ponto do clique
    var o = opts.ponto || {x: innerWidth/2, y: innerHeight/2};
    anim(root, [{clipPath:'circle(0px at '+o.x+'px '+o.y+'px)'},{clipPath:'circle(150vmax at '+o.x+'px '+o.y+'px)'}], {duration:650, easing:'cubic-bezier(.7,0,.2,1)'});

    // raios do sol girando
    anim(rays, [{opacity:0, transform:'translate(-50%,-50%) rotate(0deg) scale(.6)'},{opacity:1, transform:'translate(-50%,-50%) rotate(25deg) scale(1)'}], {duration:1400, delay:300, easing:'ease-out', fill:'forwards'});
    anim(rays, [{transform:'translate(-50%,-50%) rotate(25deg)'},{transform:'translate(-50%,-50%) rotate(385deg)'}], {duration:90000, delay:1700, iterations:Infinity});

    // estrela grande + explosão de estrelas
    burst.innerHTML = '';
    var big = document.createElement('div');
    big.innerHTML = starSvg(); big = big.firstChild;
    big.style.setProperty('--s','min(46vmin,420px)'); big.style.setProperty('--c','#FF3B14');
    burst.appendChild(big);
    anim(big, [
      {opacity:0, transform:'scale(0) rotate(-90deg)'},
      {opacity:1, transform:'scale(1) rotate(40deg)', offset:.45},
      {opacity:1, transform:'scale(1.15) rotate(70deg)', offset:.6},
      {opacity:0, transform:'scale(3.2) rotate(120deg)'}
    ], {duration:1100, delay:250, easing:'cubic-bezier(.3,.7,.2,1)', fill:'forwards'});

    var n = innerWidth < 640 ? 22 : 34;
    for(var i=0;i<n;i++){
      var w = document.createElement('div'); w.innerHTML = starSvg(); var s = w.firstChild;
      var size = 14 + Math.random()*58, ang = Math.random()*Math.PI*2, dist = 28 + Math.random()*46;
      s.style.setProperty('--s', size.toFixed(0)+'px'); s.style.setProperty('--c', COLORS[i % COLORS.length]);
      burst.appendChild(s);
      var dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist, rot = (Math.random()*540 - 270).toFixed(0);
      var rest = 0.55 + Math.random()*0.35;
      anim(s, [
        {opacity:0, transform:'translate(0,0) scale(.2) rotate(0deg)'},
        {opacity:1, transform:'translate('+(dx*rest).toFixed(1)+'vmin,'+(dy*rest).toFixed(1)+'vmin) scale(1) rotate('+rot+'deg)', offset:.55},
        {opacity:i % 3 === 0 ? .9 : 0, transform:'translate('+dx.toFixed(1)+'vmin,'+dy.toFixed(1)+'vmin) scale('+(i % 3 === 0 ? .8 : .4)+') rotate('+(rot*1.4).toFixed(0)+'deg)'}
      ], {duration:1500 + Math.random()*500, delay:620 + Math.random()*120, easing:'cubic-bezier(.15,.8,.25,1)', fill:'forwards'});
    }

    // letras do nome caindo uma a uma
    var ls = hello.querySelectorAll('.l');
    Array.prototype.forEach.call(ls, function(l, k){
      var r = (Math.random()*30 - 15).toFixed(0);
      anim(l, [
        {opacity:0, transform:'translateY(70%) rotate('+r+'deg) scale(.6)'},
        {opacity:1, transform:'translateY(-8%) rotate(0deg) scale(1.05)', offset:.7},
        {opacity:1, transform:'translateY(0) rotate(0deg) scale(1)'}
      ], {duration:520, delay:820 + k*45, easing:'cubic-bezier(.2,.9,.3,1.3)', fill:'backwards'});
    });
    var after = 820 + ls.length*45 + 250;
    anim(hello.querySelector('.ob-kicker'), [{opacity:0, transform:'translateY(-14px)'},{opacity:1, transform:'none'}], {duration:500, delay:700, easing:'ease-out', fill:'backwards'});
    anim(hello.querySelector('p'), [{opacity:0, transform:'translateY(16px)'},{opacity:1, transform:'none'}], {duration:600, delay:after, easing:'ease-out', fill:'backwards'});
    anim(btn, [{opacity:0, transform:'scale(.6)'},{opacity:1, transform:'scale(1.06)', offset:.7},{opacity:1, transform:'scale(1)'}], {duration:550, delay:after + 200, easing:'ease-out', fill:'backwards'});
    setTimeout(function(){ if(!root.hidden && !hello.hidden) btn.focus({preventScroll:true}); }, after + 400);
  }

  /* ---------- CENA 2: PASSO A PASSO ---------- */
  function showSteps(i){
    hello.hidden = true; finalS.hidden = true; steps.hidden = false;
    anim(burst, [{opacity:1},{opacity:.25}], {duration:500, fill:'forwards'});
    anim(rays, [{opacity:1},{opacity:.45}], {duration:500, fill:'forwards'});
    var dots = data.etapas.map(function(_, k){ return '<button type="button" data-act="ir" data-i="'+k+'" aria-label="Etapa '+(k+1)+'"></button>'; }).join('');
    steps.innerHTML = '<div class="ob-progress">'+dots+'</div><div class="ob-slide" aria-live="polite"></div>' +
      '<div class="ob-nav"><button type="button" class="ob-btn ghost" data-act="ant">'+ARROW_L+' Voltar</button>' +
      '<button type="button" class="ob-btn" data-act="prox">Próximo '+ARROW+'</button></div>';
    idx = -1; go(i || 0, true);
  }

  function go(i, first){
    var total = data.etapas.length;
    if(i < 0) return;
    if(i >= total){ playTick(true); return showFinal(); }
    var dir = i > idx ? 1 : -1; idx = i;
    var e = data.etapas[i];
    var slide = steps.querySelector('.ob-slide');
    var fill = function(){
      slide.innerHTML =
        '<div class="ob-num">'+starSvg()+'<span>'+String(i+1).padStart(2,'0')+'</span></div>' +
        '<div><span class="ob-step-k">Etapa '+(i+1)+' de '+total+'</span><h3>'+esc(e.titulo)+'</h3><p>'+esc(e.texto)+'</p>' +
        (e.dica ? '<div class="ob-tip"><b>Dica</b><span>'+esc(e.dica)+'</span></div>' : '') + '</div>';
      if(!reduce){
        anim(slide, [{opacity:0, transform:'translateX('+(40*dir)+'px)'},{opacity:1, transform:'none'}], {duration:380, easing:'cubic-bezier(.2,.8,.2,1)'});
        anim(slide.querySelector('.ob-num svg'), [{transform:'scale(.4) rotate(-120deg)'},{transform:'scale(1) rotate(0deg)'}], {duration:620, easing:'cubic-bezier(.2,.9,.3,1.3)'});
      }
    };
    if(first || reduce || !slide.firstChild){ fill(); }
    else {
      playTick(dir > 0);
      var out = anim(slide, [{opacity:1, transform:'none'},{opacity:0, transform:'translateX('+(-40*dir)+'px)'}], {duration:200, easing:'ease-in'});
      if(out){ out.onfinish = fill; } else { fill(); }
    }
    Array.prototype.forEach.call(steps.querySelectorAll('.ob-progress button'), function(b, k){
      b.className = k < i ? 'on' : (k === i ? 'now' : '');
      if(k === i) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current');
    });
    var prev = steps.querySelector('[data-act="ant"]');
    prev.style.visibility = i === 0 ? 'hidden' : 'visible';
    steps.querySelector('[data-act="prox"]').innerHTML = (i === total - 1 ? 'Combinados e equipe ' : 'Próximo ') + ARROW;
  }

  /* ---------- CENA 3: COMBINADOS + EQUIPE ---------- */
  function initials(n){ return String(n||'').trim().split(/\s+/).slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); }).join(''); }

  function showFinal(){
    hello.hidden = true; steps.hidden = true; finalS.hidden = false;
    var rules = (data.combinados || []).map(function(c){ return '<li>'+starSvg()+'<span>'+esc(c)+'</span></li>'; }).join('');
    var team = (data.equipe || []).map(function(p){
      var av = p.foto ? '<img src="'+esc(p.foto)+'" alt="">' : esc(initials(p.nome));
      return '<div class="ob-person"><span class="ob-avatar">'+av+'</span><div><b>'+esc(p.nome)+'</b><small>'+esc(p.funcao || '')+'</small></div></div>';
    }).join('');
    var brief = opts.briefing ? '<a class="ob-btn" href="'+esc(opts.briefing)+'" target="_blank" rel="noopener">Próximo passo: Briefing '+ARROW+'</a>' : '';
    finalS.innerHTML =
      '<h2>Tudo pronto para <em>começar</em></h2>' +
      '<div class="ob-cols">' +
        (rules ? '<div class="ob-box"><h4>Nossos combinados</h4><ul class="ob-rules">'+rules+'</ul></div>' : '') +
        (team ? '<div class="ob-box"><h4>Quem cuida de você</h4><div class="ob-team">'+team+'</div></div>' : '') +
      '</div>' +
      '<div class="ob-actions">' + brief +
        '<button type="button" class="ob-btn ghost" data-act="rever">Rever o passo a passo</button>' +
        '<button type="button" class="ob-btn ghost" data-act="fechar">Voltar ao portal</button>' +
      '</div>';
    if(!reduce){
      Array.prototype.forEach.call(finalS.children, function(el, k){
        anim(el, [{opacity:0, transform:'translateY(18px)'},{opacity:1, transform:'none'}], {duration:450, delay:k*120, easing:'ease-out', fill:'backwards'});
      });
    }
    var f = finalS.querySelector('.ob-btn'); if(f) f.focus({preventScroll:true});
    try{ store('criae-onboarding-visto', '1'); }catch(e){}
  }

  /* ---------- ABRIR / FECHAR ---------- */
  function open(o){
    data = window.CRIAE_ONBOARDING || {etapas:[]};
    opts = o || {};
    if(!root) build();
    lastFocus = opts.origem || document.activeElement;
    if(opts.origem && opts.origem.getBoundingClientRect){
      var r = opts.origem.getBoundingClientRect();
      opts.ponto = {x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)};
    }
    root.hidden = false; document.body.classList.add('ob-open');
    burst.style.opacity = '';
    if(root.getAnimations) root.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); });
    showHello();
  }

  function close(){
    if(!root || root.hidden) return;
    var done = function(){
      root.hidden = true; document.body.classList.remove('ob-open'); burst.innerHTML = '';
      if(root.getAnimations) root.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); });
      if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
    };
    if(reduce){ return done(); }
    var a = anim(root, [{opacity:1},{opacity:0}], {duration:250, easing:'ease-in'});
    if(a){ a.onfinish = done; } else { done(); }
  }

  window.CriaeOnboarding = { open: open, close: close };
})();
