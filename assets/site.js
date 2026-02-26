(function(){
  function setupInstituteDropdown(){
    var dd = document.querySelector('.menu-dd');
    if(!dd) return;

    var trigger = dd.querySelector('.dd-trigger');
    var menu = dd.querySelector('.dd-menu');
    if(!trigger || !menu) return;

    // Make trigger behave like a button for accessibility
    trigger.setAttribute('role','button');
    trigger.setAttribute('tabindex','0');

    function open(){
      dd.classList.add('open');
      trigger.setAttribute('aria-expanded','true');
    }
    function close(){
      dd.classList.remove('open');
      trigger.setAttribute('aria-expanded','false');
    }
    function toggle(e){
      // Allow navigation to instituto.html only when user uses ctrl/cmd click or middle click
      if(e) e.preventDefault();
      if(dd.classList.contains('open')) close(); else open();
    }

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        toggle(e);
      } else if(e.key === 'Escape'){
        close();
      }
    });

    document.addEventListener('click', function(e){
      if(!dd.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') close();
    });
  }
  function setupTopCarousel(){
    var root = document.querySelector('.top-carousel');
    if(!root) return;

    var track = root.querySelector('.tc-track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.tc-slide'));
    var dotsWrap = root.querySelector('.tc-dots');
    var prevBtn = root.querySelector('.tc-prev');
    var nextBtn = root.querySelector('.tc-next');
    var viewport = root.querySelector('.tc-viewport');

    if(!track || slides.length === 0 || !dotsWrap || !viewport) return;

    // Dots
    dotsWrap.innerHTML = '';
    var dots = slides.map(function(_, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tc-dot';
      b.setAttribute('aria-label', 'Ir para a imagem ' + (i+1));
      b.addEventListener('click', function(){ goTo(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    var index = 0;
    var timer = null;
    var intervalMs = 4200;
    var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clamp(i){
      var n = slides.length;
      return (i % n + n) % n;
    }

    function render(){
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function(d, i){
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      slides.forEach(function(s, i){
        s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
    }

    function goTo(i, userAction){
      index = clamp(i);
      render();
      if(userAction) restart();
    }

    function next(userAction){ goTo(index + 1, userAction); }
    function prev(userAction){ goTo(index - 1, userAction); }

    function start(){
      if(isReduced) return;
      stop();
      timer = window.setInterval(function(){ next(false); }, intervalMs);
    }
    function stop(){
      if(timer){ window.clearInterval(timer); timer = null; }
    }
    function restart(){
      stop();
      start();
    }

    if(prevBtn) prevBtn.addEventListener('click', function(){ prev(true); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ next(true); });

    // Keyboard
    viewport.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); prev(true); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); next(true); }
    });

    // Pause on hover/focus
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // Swipe (mobile)
    var startX = null;
    var startY = null;
    viewport.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, {passive:true});

    viewport.addEventListener('touchend', function(e){
      if(startX === null || startY === null) return;
      var t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if(!t) { startX = startY = null; return; }
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      startX = startY = null;

      if(Math.abs(dx) < 30) return;
      if(Math.abs(dx) < Math.abs(dy)) return;

      if(dx < 0) next(true);
      else prev(true);
    }, {passive:true});

    render();
    start();
  }



  function setupTestimonialsMarquee(){
    var marquee = document.querySelector('.ts-marquee');
    if(!marquee) return;

    // Em touch: pausa temporariamente para leitura
    var pauseTimer = null;
    function pause(ms){
      marquee.classList.add('is-paused');
      if(pauseTimer) window.clearTimeout(pauseTimer);
      pauseTimer = window.setTimeout(function(){ marquee.classList.remove('is-paused'); }, ms || 6000);
    }

    marquee.addEventListener('touchstart', function(){ pause(8000); }, {passive:true});
    marquee.addEventListener('mousedown', function(){ pause(8000); });
  }

  function initHeader(){
    setupInstituteDropdown();
    setupTopCarousel();
    setupTestimonialsMarquee();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();


(function(){
  var KEY = 'ich_cookies_accepted_v1';

  function hasConsent(){
    try { return localStorage.getItem(KEY) === '1'; } catch(e){ return true; }
  }
  function setConsent(){
    try { localStorage.setItem(KEY,'1'); } catch(e){}
  }

  function removeDuplicates(){
    var banners = document.querySelectorAll('#cookie-banner');
    if(!banners || banners.length <= 1) return;
    for(var i=1;i<banners.length;i++){
      if(banners[i] && banners[i].parentNode) banners[i].parentNode.removeChild(banners[i]);
    }
  }

  function closeBanner(banner){
    if(!banner) return;
    setConsent();
    if(banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function ensureBanner(){
    if(hasConsent()) return;
    removeDuplicates();
    if(document.getElementById('cookie-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-live','polite');

    banner.innerHTML =
      '<div class="cookie-inner">' +
        '<div class="cookie-text">' +
          'Utilizamos cookies essenciais e, quando aplicável, cookies de desempenho para melhorar sua experiência. ' +
          'Veja a <a href="politica-de-cookies.html">Política de Cookies</a> e a <a href="politica-de-privacidade.html">Política de Privacidade</a>.' +
        '</div>' +
        '<button type="button" class="cookie-btn">Aceitar</button>' +
      '</div>';

    document.body.appendChild(banner);

    var btn = banner.querySelector('.cookie-btn');
    if(!btn) return;

    // Click
    btn.addEventListener('click', function(){ closeBanner(banner); });

    // Pointer/touch (alguns browsers não disparam click de forma confiável)
    btn.addEventListener('pointerup', function(){ closeBanner(banner); });
    btn.addEventListener('touchend', function(){ closeBanner(banner); }, {passive:true});

    // Teclado
    btn.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        closeBanner(banner);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureBanner);
  } else {
    ensureBanner();
  }

  // Se algo injetar o banner depois, remove duplicatas
  window.addEventListener('load', removeDuplicates);
})();



(function(){
  function setupVipForm(){
    var form = document.getElementById('vipForm');
    if(!form) return;

    var hint = document.getElementById('vipHint');
    function setHint(msg){
      if(hint) hint.textContent = msg || '';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(form);
      var nome = (fd.get('nome') || '').toString().trim();
      var email = (fd.get('email') || '').toString().trim();
      var mensagem = (fd.get('mensagem') || '').toString().trim();

      if(!nome || !email || !mensagem){
        setHint('Preencha todos os campos.');
        return;
      }

      // Envio simples via mailto (site estático).
      var to = 'institutocompletudehumana@gmail.com';
      var subject = encodeURIComponent('[Lista VIP] ' + nome);
      var body = encodeURIComponent('Nome: ' + nome + '\nEmail: ' + email + '\n\nMensagem:\n' + mensagem);
      var url = 'mailto:' + to + '?subject=' + subject + '&body=' + body;

      setHint('Abrindo seu e-mail para enviar a mensagem…');
      window.location.href = url;
      form.reset();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setupVipForm);
  } else {
    setupVipForm();
  }
})();


/* AUTO_HERO_SCH: injeta capa do Blog SCH em todas as páginas que tenham <main> (evita duplicação). */
(function() {
  try {
    var main = document.querySelector('main');
    if (!main) return;
    if (main.querySelector('.blog-hero')) return;

    var hero = document.createElement('section');
    hero.className = 'blog-hero';
    hero.innerHTML = '<h1>BLOG SER HUMANO COMPLETO</h1>\n<h2>Biblioteca Viva da Espiritualidade na Vida Real</h2>\n<div class="gold-line"></div>';
    main.insertBefore(hero, main.firstChild);
  } catch(e) {}
})();

