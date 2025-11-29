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
