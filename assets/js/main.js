/* Metafab — site interactions */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var WHATSAPP_NUMBER = '919605848047'; /* digits only, international format, no + */
  var CONTACT_EMAIL = 'vishnuanilkumar203@gmail.com';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL; /* free relay, no key */

  /* Mobile navigation -------------------------------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.getElementById('site-nav');

  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* Header shadow on scroll -------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var setHeaderState = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
  }

  /* Current year ------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Reveal on scroll --------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Project filters ---------------------------------------------------- */
  var filterButtons = document.querySelectorAll('[data-filter]');
  var projectCards = document.querySelectorAll('[data-cat]');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (other) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      var filter = button.dataset.filter;
      projectCards.forEach(function (card) {
        var categories = card.dataset.cat.split(' ');
        card.hidden = !(filter === 'all' || categories.indexOf(filter) !== -1);
      });
    });
  });

  /* Project lightbox --------------------------------------------------- */
  var lightbox = document.querySelector('[data-lightbox]');

  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCap = lightbox.querySelector('[data-lightbox-caption]');
    var lightboxClose = lightbox.querySelector('[data-lightbox-close]');

    var openLightbox = function (trigger) {
      lightboxImg.src = trigger.dataset.lightboxSrc;
      lightboxImg.alt = trigger.dataset.lightboxAlt || '';
      if (lightboxCap) lightboxCap.textContent = trigger.dataset.lightboxCaption || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-lightbox-src]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openLightbox(trigger);
      });
    });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target.closest('[data-lightbox-close]')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  /* Quote form --------------------------------------------------------- */
  var quoteForm = document.querySelector('[data-quote-form]');

  if (quoteForm) {
    var status = quoteForm.querySelector('[data-form-status]');

    var showStatus = function (message, type) {
      if (!status) return;
      status.className = 'form-status' + (type ? ' form-status--' + type : '');
      status.textContent = message;
      status.hidden = false;
      status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    var readForm = function () {
      var data = {};
      new FormData(quoteForm).forEach(function (value, key) {
        data[key] = String(value).trim();
      });
      return data;
    };

    var isValid = function () {
      if (quoteForm.checkValidity()) return true;
      quoteForm.reportValidity();
      return false;
    };

    var buildMessage = function (data) {
      var lines = [
        'New quote request from the Metafab website',
        '',
        'Name: ' + (data.name || ''),
        'Phone: ' + (data.phone || ''),
        data.email ? 'Email: ' + data.email : '',
        'Service: ' + (data.service || ''),
        data.area ? 'Area / postcode: ' + data.area : '',
        data.timeline ? 'Timeline: ' + data.timeline : '',
        '',
        'Project details:',
        data.details || ''
      ];
      return lines.filter(function (line) { return line !== ''; }).join('\n');
    };

    var gmailButton = quoteForm.querySelector('[data-send-gmail]');
    if (gmailButton) {
      gmailButton.addEventListener('click', function () {
        if (!isValid()) return;

        var data = readForm();
        var subject = 'Quote request – ' + (data.service || 'Metafab');
        var url = 'https://mail.google.com/mail/?view=cm&fs=1' +
          '&to=' + encodeURIComponent(CONTACT_EMAIL) +
          '&su=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(buildMessage(data));

        window.open(url, '_blank', 'noopener');
        showStatus('Gmail is opening in a new tab with your details already filled in. Press send there and we will reply with a quote, usually the same working day.', 'ok');
      });
    }

    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!isValid()) return;

      var data = readForm();
      var payload = {
        Name: data.name,
        Phone: data.phone,
        Email: data.email || 'Not provided',
        'Town / PIN': data.area || 'Not provided',
        Service: data.service,
        Timeline: data.timeline || 'No fixed date',
        Details: data.details,
        _subject: 'Quote request – ' + (data.service || 'Metafab'),
        _template: 'table',
        _captcha: 'false'
      };
      if (data.email) payload._replyto = data.email;

      var sendButton = quoteForm.querySelector('[data-send-site]');
      if (sendButton) sendButton.disabled = true;
      showStatus('Sending your request…', '');

      var finish = function (message, type) {
        if (sendButton) sendButton.disabled = false;
        showStatus(message, type);
      };

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (body) {
            return { ok: response.ok, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok || String(result.body.success) === 'false') {
            throw new Error('send failed');
          }
          quoteForm.reset();
          finish('Thanks — your request has been sent straight to our inbox. We will come back to you with a quote, usually within one working day. If it is urgent, call ' + '+91 96058 48047' + '.', 'ok');
        })
        .catch(function () {
          finish('Sorry — the automatic send did not go through. Please use “Send via Gmail” above, or call ' + '+91 96058 48047' + ' and we will take the details over the phone. Your answers are still in the form.', 'error');
        });
    });
  }
})();
