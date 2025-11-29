(()=>{
  // год в футере
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  // ===== ЕДИНЫЕ КОНТАКТЫ ДЛЯ ВСЕХ СТРАНИЦ =====
  const CONTACT = {
    addrText: 'Rossbergstraße 40 · 72336 Balingen',
    mapsHref: 'https://maps.google.com/?q=Rossbergstraße%2040%2C%2072336%20Balingen',
    mail: 'info@abitherm.de',
    phoneHuman: '0179 / 9140436',
    phoneHref: 'tel:+491799140436'
  };

  // привести контакты в topbar
  const topbar = document.querySelector('.topbar .container');
  if(topbar){
    const links = topbar.querySelectorAll('a');
    if(links[0]){ links[0].href = CONTACT.mapsHref; links[0].childNodes[1] && (links[0].childNodes[1].textContent = ' ' + CONTACT.addrText); }
    if(links[1]){ links[1].href = `mailto:${CONTACT.mail}`; links[1].childNodes[1] && (links[1].childNodes[1].textContent = ' ' + CONTACT.mail); }
    if(links[3]){ links[3].href = CONTACT.phoneHref; links[3].childNodes[1] && (links[3].childNodes[1].textContent = ' ' + CONTACT.phoneHuman); }
  }

  // привести контакты в футере (если текстовые элементы есть)
  document.querySelectorAll('.site-footer').forEach(f=>{
    const html = f.innerHTML
      .replace(/info@[^<\s]+/g, CONTACT.mail)
      .replace(/(\+?49\s?1?7?9?.*?|\b0?179\s?\/?\s?9?140436\b|\b07433\s?\/?\s?123456\b)/g, CONTACT.phoneHuman)
      .replace(/Rossbergstraße.*?Balingen/g, 'Rossbergstraße 40, 72336 Balingen');
    f.innerHTML = html;
    const map = f.querySelector('iframe');
    if(map) map.src = 'https://maps.google.com/maps?q=Rossbergstraße%2040%2C%2072336%20Balingen&t=&z=12&ie=UTF8&iwloc=&output=embed';
  });

  // бургер
  const btn=document.querySelector('.nav-toggle'), menu=document.getElementById('nav-menu');
  if(btn&&menu){btn.addEventListener('click',()=>menu.classList.toggle('show'));}

  // активный пункт меню: НЕ подсвечаем на главной
  const path=location.pathname.split('/').pop() || 'index.html';
  if(path!=='index.html'){
    document.querySelectorAll('.nav-list a').forEach(a=>{
      if(a.getAttribute('href')===path){ a.classList.add('active'); }
    });
  }

  // появление секций
  const io=new IntersectionObserver((es)=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible'); io.unobserve(e.target)}
  }),{threshold:.15});
  document.querySelectorAll('.reveal, .img-reveal').forEach(el=>io.observe(el));

  // cookie-баннер
  const key='abitherm_cookie_v1';
  if(!localStorage.getItem(key)){
    const el=document.createElement('div');
    el.className='cookie-banner reveal visible';
    el.innerHTML=`<span>Wir verwenden Cookies. Nicht notwendige Cookies nur mit Zustimmung.</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn-primary" id="cb-accept">Zustimmen</button>
        <button class="btn" id="cb-decline">Ablehnen</button>
        <a class="btn" href="cookie-richtlinie.html">Details</a>
      </div>`;
    document.body.appendChild(el);
    document.getElementById('cb-accept').addEventListener('click',()=>{ localStorage.setItem(key,'accepted'); el.remove(); });
    document.getElementById('cb-decline').addEventListener('click',()=>{ localStorage.setItem(key,'declined'); el.remove(); });
  }

  // --- Плавный скролл по якорям внутри страницы ---
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id=a.getAttribute('href');
    if(id.length>1){
      const el=document.querySelector(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
        // закрыть мобильное меню после перехода
        const menu=document.getElementById('nav-menu');
        if(menu) menu.classList.remove('show');
      }
    }
  });
});

// --- Открытие подменю на мобильном ---
const navList=document.getElementById('nav-menu');
if(navList){
  navList.querySelectorAll('.has-sub > a').forEach(trigger=>{
    trigger.addEventListener('click', (ev)=>{
      if(window.innerWidth<=960){
        ev.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });
}




  // слайдер на главной
  const slides=[...document.querySelectorAll('.slide')];
  if(slides.length){
    let i=0; slides[0].classList.add('active');
    setInterval(()=>{ slides[i].classList.remove('active'); i=(i+1)%slides.length; slides[i].classList.add('active'); }, 4500);
  }
})();

// Плавное появление секций при прокрутке
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(e => e.classList.add('in-view')); // фоллбек
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('in-view');
        io.unobserve(ent.target); // анимировать один раз
      }
    });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
})();

/* Header sticky + hide topbar on scroll + smooth anchor scrolling with header offset
   Вставить в script.js. Работает на всех страницах при условии:
   - .site-header содержит .topbar и .header-inner
   - nav ссылки используют обычные href="#id" или href="page.html#id"
*/

(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const topbar = header.querySelector('.topbar');
  const headerInner = header.querySelector('.header-inner');
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.querySelector('.nav-toggle');

  // если нет headerInner — выходим
  if (!headerInner) return;

  // вычисляем высоту topbar и headerInner
  function getHeights() {
    const topbarH = topbar ? topbar.getBoundingClientRect().height : 0;
    const headerH = headerInner.getBoundingClientRect().height;
    return { topbarH, headerH };
  }

  // Улучшаем производительность: делаем флаг, чтобы не вызывать слишком часто
  let lastScrollY = window.scrollY;
  let ticking = false;

  // Порог, после которого topbar скрывается и header фиксируется
  // можно регулировать: hideTopbarAfter — число пикселей прокрутки
  let hideTopbarAfter = 60;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleHeaderScroll(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  function handleHeaderScroll(scrollY) {
    const { topbarH, headerH } = getHeights();

    // Если прокрутили больше порога - добавляем классы
    if (scrollY > hideTopbarAfter) {
      // скрываем topbar (compact) и делаем header фиксированным (sticky)
      header.classList.add('compact');
      header.classList.add('sticky');

      // гарантия: корректируем --header-sticky-offset (CSS var) и добавляем padding-top к body
      const offset = headerInner.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-sticky-offset', `${offset}px`);
      // задаём padding-top для body, чтобы контент не прыгал
      document.body.style.paddingTop = `${offset}px`;
    } else {
      // возвращаемся к изначальному состоянию
      header.classList.remove('compact');
      header.classList.remove('sticky');
      document.documentElement.style.removeProperty('--header-sticky-offset');
      document.body.style.paddingTop = ''; // сбрасываем
    }
  }

  // Инициализация: на случай если страница загружена уже прокрученной
  handleHeaderScroll(window.scrollY);

  // Подписываемся на скролл
  window.addEventListener('scroll', onScroll, { passive: true });

  // -------------------------------------------------------
  // Smooth scrolling to anchors WITH offset = headerInner height
  // Перехватываем клики по ссылкам с hash в меню и на странице.
  // -------------------------------------------------------
  function headerOffset() {
    // Если header фиксирован — берём реальную высоту headerInner. Если нет — берём его текущую высоту (работает и при смене режима).
    return headerInner.getBoundingClientRect().height;
  }

  function scrollToElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - headerOffset() - 12; // небольшой gap 12px
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }

  // Обработка кликов по ссылкам с hash
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href) return;
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex);
    // если путь есть и не совпадает с текущим, позволим переход (браузер загрузит другую страницу)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const targetPath = path ? path.split('/').pop() : currentPath;

    if (!path || targetPath === currentPath) {
      // это якорь на той же странице -> перехватываем
      e.preventDefault();
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        // Если header еще не перешёл в sticky (например сразу после клика), убедимся, что padding уже выставлен.
        // Вызовем скролл через небольшой таймаут, чтобы браузер применил layout
        setTimeout(() => scrollToElement(targetEl), 10);
        // если мобильное меню открыто — закроем
        if (navMenu && navMenu.classList.contains('show')) {
          navMenu.classList.remove('show');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    } else {
      // ссылка ведёт на другую страницу с хэшем -> позволим переход (вариант: можно добавить сохранение флага и при загрузке скроллить)
      // ничего не делаем
    }
  }, { passive: false });

  // При загрузке страницы с хешом скроллим плавно после рендеринга
  window.addEventListener('load', function () {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        // немного ждём, чтобы header стал sticky и padding применился
        setTimeout(() => scrollToElement(el), 120);
      }
    }
  });

  // Обновим поведение при ресайзе — пересчитываем высоты и корректируем padding
  window.addEventListener('resize', function () {
    // если в sticky режиме — обновим отступ
    if (header.classList.contains('sticky')) {
      const offset = headerInner.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-sticky-offset', `${offset}px`);
      document.body.style.paddingTop = `${offset}px`;
    }
  }, { passive: true });

})();

// HERO background lazy loader — подключите в script.js или перед </body>
document.querySelectorAll('.hero.hero-cover').forEach(hero => {
  const bg = hero.getAttribute('data-bg');
  const bgEl = hero.querySelector('.hero-bg');
  if (!bg || bg.trim() === '') {
    // пометить как пустой (покажем паттерн)
    hero.classList.add('ph-empty');
    bgEl.classList.add('loaded');
    return;
  }
  // создать изображение для предзагрузки
  const img = new Image();
  img.onload = () => {
    bgEl.style.backgroundImage = `url('${bg}')`;
    // плавный показ
    requestAnimationFrame(()=> bgEl.classList.add('loaded'));
  };
  img.onerror = () => {
    // fallback — пометить пустым
    hero.classList.add('ph-empty');
    bgEl.classList.add('loaded');
  };
  img.src = bg;
});


/* ========== HEADER / SCROLL / FORM HELPERS ========== */
(function(){
  // элементы
  const siteHeader = document.querySelector('.site-header');
  const headerInner = document.querySelector('.site-header .header-inner');
  const topbar = document.querySelector('.site-header .topbar');
  const navList = document.querySelector('.nav-list');

  // safety
  if(!siteHeader || !headerInner){
    // nothing to do
  }

  // helper: get heights (recompute dynamic)
  function getHeights(){
    const topbarH = topbar ? Math.round(topbar.getBoundingClientRect().height) : 0;
    const headerH = Math.round(headerInner.getBoundingClientRect().height);
    return { topbarH, headerH };
  }

  // toggle sticky / compact on scroll
  function onScrollHandler(){
    const y = window.scrollY || window.pageYOffset;
    const { topbarH } = getHeights();

    if(y > (topbarH + 10)){ // немного буфера
      if(!siteHeader.classList.contains('sticky')){
        siteHeader.classList.add('sticky');
      }
      if(!siteHeader.classList.contains('compact')){
        siteHeader.classList.add('compact');
      }
      // компенсируем высоту закреплённого header (headerInner)
      const headerH = headerInner.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-sticky-offset', headerH + 'px');
      document.body.style.paddingTop = headerH + 'px';
    } else {
      siteHeader.classList.remove('sticky','compact');
      document.documentElement.style.removeProperty('--header-sticky-offset');
      document.body.style.paddingTop = ''; // сброс
    }
  }

  // initial call and listener
  window.addEventListener('scroll', onScrollHandler, { passive:true });
  window.addEventListener('resize', onScrollHandler);
  // call once
  onScrollHandler();

  /* ===== smooth anchor scroll, учитываем фиксированную шапку ===== */
  function scrollToOffset(targetEl){
    if(!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    // высота фиксированного header сейчас:
    const headerH = (headerInner && siteHeader.classList.contains('sticky')) ? headerInner.getBoundingClientRect().height : (headerInner ? headerInner.getBoundingClientRect().height : 0);
    const targetY = Math.round(scrollTop + rect.top - (headerH + 12)); // 12px дополнительный отступ
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  // перехват кликов по ссылкам с хешом (местные ссылки)
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href*="#"]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href || href.indexOf('#') === -1) return;
    // same page anchor?
    const parts = href.split('#');
    // Если ссылка ведёт на другой файл (имеется путь до .html), позволяем норм. Навигация.
    const path = parts[0];
    const hash = parts[1];
    if(hash && (!path || path === '' || path === window.location.pathname.split('/').pop())){
      // предотвращаем дефолт и плавно скроллим
      e.preventDefault();
      const target = document.getElementById(hash);
      if(target){
        scrollToOffset(target);
        // обновим hash без прыжка
        history.replaceState(null, '', '#' + hash);
      }
    }
  });

  /* ===== Contact form AJAX handler (универсальный) =====
     Ожидает наличие формы .contact-form-form (id='contactForm' рекомендуем)
     При отправке сделает POST на /form.php (можно поменять)
  */
  const contactForm = document.querySelector('#contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(ev){
      ev.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if(btn) { btn.disabled = true; btn.classList.add('loading'); }
      const formData = new FormData(contactForm);

      fetch(contactForm.action || 'form.php', {
        method: contactForm.method || 'POST',
        body: formData,
        credentials: 'same-origin'
      })
      .then(r => r.json ? r.json() : r.text())
      .then(data => {
        // предполагаем json { success: true, message: '...' }
        if(typeof data === 'object' && data.success){
          alert(data.message || 'Danke — Ihre Nachricht wurde gesendet.');
          contactForm.reset();
        } else {
          const msg = (data && data.message) ? data.message : 'Fehler beim Senden. Bitte versuchen Sie es später.';
          alert(msg);
        }
      })
      .catch(err => {
        console.error(err);
        alert('Fehler beim Senden. Bitte prüfen Sie die Eingaben oder versuchen Sie es später.');
      })
      .finally(()=>{
        if(btn){ btn.disabled = false; btn.classList.remove('loading'); }
      });
    });
  }

})(); /* end IIFE */

// contact form logic (add to script.js)
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file');
  const preview = document.getElementById('drop-preview');
  const msgEl = document.getElementById('form-msg');

  // drag/drop UX
  ['dragenter','dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      fileInput.files = dt.files;
      showPreview(dt.files[0]);
    }
  });
  fileInput.addEventListener('change', (e) => {
    if (fileInput.files && fileInput.files[0]) showPreview(fileInput.files[0]);
  });

  function showPreview(file) {
    preview.innerHTML = `<div><strong>${escapeHtml(file.name)}</strong> (${Math.round(file.size/1024)} KB)</div>`;
    preview.setAttribute('aria-hidden','false');
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // AJAX submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    msgEl.hidden = true;
    msgEl.className = 'form-msg';
    // Simple honeypot check
    if (document.getElementById('hp_field').value.trim() !== '') {
      // bot — fail silently
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sende...';

    const fd = new FormData(form);
    // AJAX
    fetch(form.action, {
      method: 'POST',
      body: fd,
      credentials: 'same-origin'
    }).then(res => res.json())
      .then(json => {
        if (json && json.success) {
          msgEl.classList.add('success');
          msgEl.textContent = json.message || 'Vielen Dank — Ihre Nachricht wurde gesendet.';
          msgEl.hidden = false;
          form.reset();
          preview.innerHTML = '';
        } else {
          msgEl.classList.add('error');
          msgEl.textContent = (json && json.message) ? json.message : 'Fehler beim Senden. Bitte versuchen Sie es später.';
          msgEl.hidden = false;
        }
      })
      .catch(err => {
        console.error(err);
        msgEl.classList.add('error');
        msgEl.textContent = 'Serverfehler. Bitte kontaktieren Sie uns per E-Mail.';
        msgEl.hidden = false;
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Absenden';
      });
  });

});

/* script-contact.js */
(() => {
  const form = document.getElementById('contactForm');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const selectedFileDisplay = document.getElementById('selectedFile');
  const resultBox = document.getElementById('contact-result');

  let selectedFile = null;
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED = ['image/jpeg','image/jpg','image/png','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/gif'];

  function showResult(message, type='success'){
    resultBox.style.display = 'block';
    resultBox.className = 'contact-result ' + (type === 'success' ? 'success' : 'error');
    resultBox.textContent = message;
    // если success — убрать через 6s
    if(type === 'success'){
      setTimeout(()=>{ resultBox.style.display = 'none'; }, 6000);
    }
  }

  function clearResult(){
    resultBox.style.display = 'none';
    resultBox.className = 'contact-result';
    resultBox.textContent = '';
  }

  function setSelectedFile(file){
    selectedFile = file;
    if(file){
      selectedFileDisplay.style.display = 'block';
      selectedFileDisplay.textContent = file.name + ' (' + Math.round(file.size/1024) + ' KB)';
    } else {
      selectedFileDisplay.style.display = 'none';
      selectedFileDisplay.textContent = '';
    }
  }

  // drag & drop handlers
  ;['dragenter','dragover'].forEach(evt=>{
    dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('dragover'); }, false);
  });
  ;['dragleave','drop'].forEach(evt=>{
    dropZone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('dragover'); }, false);
  });

  dropZone.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    if(dt && dt.files && dt.files.length){
      const f = dt.files[0];
      handleFileSelect(f);
    }
  });

  fileInput.addEventListener('change', e => {
    if(e.target.files && e.target.files.length){
      handleFileSelect(e.target.files[0]);
    }
  });

  dropZone.addEventListener('click', () => fileInput.click());

  function handleFileSelect(file){
    if(!file) { setSelectedFile(null); return; }
    if(file.size > MAX_SIZE){
      alert('Datei ist zu groß. Max 5 MB.');
      fileInput.value = '';
      setSelectedFile(null);
      return;
    }
    if(ALLOWED.indexOf(file.type) === -1){
      // allow some files by extension fallback
      const name = file.name.toLowerCase();
      if(!(/\.(jpg|jpeg|png|pdf|doc|docx|xls|xlsx|gif)$/).test(name)){
        alert('Dateityp nicht erlaubt.');
        fileInput.value = '';
        setSelectedFile(null);
        return;
      }
    }
    setSelectedFile(file);
  }

  // client side validation quick
  function validateFormBeforeSubmit(formData){
    // honeypot
    if(formData.get('company') && formData.get('company').trim() !== ''){
      return { ok:false, msg: 'Spam detected.' };
    }
    if(!formData.get('firstname') || !formData.get('lastname') || !formData.get('email') || !formData.get('phone') || !formData.get('gdpr')){
      return { ok:false, msg: 'Bitte füllen Sie alle Pflichtfelder aus (Vorname, Nachname, E-Mail, Telefonnummer, Datenschutz).' };
    }
    return { ok:true };
  }

  // submit handler
  form.addEventListener('submit', function(e){
    e.preventDefault(); clearResult();

    const fd = new FormData(form);

    if(selectedFile) fd.set('attachment', selectedFile);

    const valid = validateFormBeforeSubmit(fd);
    if(!valid.ok){
      showResult(valid.msg, 'error');
      return;
    }

    // disable submit
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Senden...';

    fetch('form.php', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(data => {
        btn.disabled = false;
        btn.textContent = 'Absenden';
        if(data && data.success){
          showResult(data.message || 'Vielen Dank — Ihre Nachricht wurde gesendet.', 'success');
          form.reset();
          setSelectedFile(null);
        } else {
          showResult((data && data.message) ? data.message : 'Beim Senden ist ein Fehler aufgetreten.', 'error');
        }
      })
      .catch(err => {
        btn.disabled = false;
        btn.textContent = 'Absenden';
        showResult('Netzwerkfehler. Bitte später versuchen.', 'error');
        console.error(err);
      });

  });

})();
