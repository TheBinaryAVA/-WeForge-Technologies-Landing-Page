/* ==========================================================================
   WeForge Technologies — script.js
   Vanilla JS only. Organized into small, focused modules (IIFE-style init
   functions) so each feature can be reasoned about independently.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initRipple();
  initContactForm();
  initChatbot();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* --------------------------------------------------------------------------
   Navbar background-on-scroll
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = () => {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* --------------------------------------------------------------------------
   Mobile hamburger menu
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is tapped (mobile UX)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   Smooth scrolling for in-page anchor links
   (CSS `scroll-behavior: smooth` already covers most browsers; this adds
   a JS fallback and accounts for the fixed navbar height.)
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* --------------------------------------------------------------------------
   Scroll reveal via IntersectionObserver
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Animated stat counters — triggered once when the stats grid enters view
   -------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Button ripple / glow effect — tracks pointer position for the radial glow
   -------------------------------------------------------------------------- */
function initRipple() {
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--rx', `${x}%`);
      btn.style.setProperty('--ry', `${y}%`);
    });
  });
}

/* --------------------------------------------------------------------------
   Contact form validation + fake async submit (no backend)
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const successBox = document.getElementById('form-success');

  const errors = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    message: document.getElementById('message-error'),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorEl, message) {
    if (message) {
      input.classList.add('invalid');
      errorEl.textContent = message;
    } else {
      input.classList.remove('invalid');
      errorEl.textContent = '';
    }
  }

  function validate() {
    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, errors.name, 'Please enter your name.');
      valid = false;
    } else if (nameInput.value.trim().length < 2) {
      setError(nameInput, errors.name, 'Name looks too short.');
      valid = false;
    } else {
      setError(nameInput, errors.name, '');
    }

    if (!emailInput.value.trim()) {
      setError(emailInput, errors.email, 'Please enter your email.');
      valid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      setError(emailInput, errors.email, 'Please enter a valid email address.');
      valid = false;
    } else {
      setError(emailInput, errors.email, '');
    }

    if (!messageInput.value.trim()) {
      setError(messageInput, errors.message, 'Please add a short message.');
      valid = false;
    } else if (messageInput.value.trim().length < 10) {
      setError(messageInput, errors.message, 'Tell us a little more (10+ characters).');
      valid = false;
    } else {
      setError(messageInput, errors.message, '');
    }

    return valid;
  }

  // Live validation once a field has been touched
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('blur', validate);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successBox.classList.remove('visible');

    if (!validate()) return;

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate an async request — no backend required
    setTimeout(() => {
      successBox.classList.add('visible');
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      setTimeout(() => successBox.classList.remove('visible'), 6000);
    }, 900);
  });
}

/* --------------------------------------------------------------------------
   Floating AI chatbot widget
   Predefined intent matching — no backend, just pattern matching over
   keywords with a typing-indicator delay to mimic real inference latency.
   -------------------------------------------------------------------------- */
function initChatbot() {
  const toggleBtn = document.getElementById('chat-toggle');
  const closeBtn = document.getElementById('chat-close');
  const chatWindow = document.getElementById('chat-window');
  const messages = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const quickReplies = document.getElementById('chat-quick-replies');
  const openFromHero = document.getElementById('ai-cta-open');

  function openChat() {
    chatWindow.classList.add('open');
    chatWindow.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Close chat assistant');
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Open chat assistant');
  }

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  if (openFromHero) openFromHero.addEventListener('click', openChat);

  // Close chat on Escape for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWindow.classList.contains('open')) closeChat();
  });

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    const p = document.createElement('p');
    p.textContent = text;
    msg.appendChild(p);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  // ---- Intent patterns -> responses -------------------------------------
  const intents = [
    {
      keywords: ['service', 'services', 'offer', 'do you do', 'what do you build'],
      response: "We offer six core services: AI Solutions, Web Development, Mobile Apps, Cloud Integration, UI/UX Design, and Data Analytics. Scroll to the Services section above for details on each."
    },
    {
      keywords: ['contact', 'reach', 'email', 'phone', 'call', 'get in touch'],
      response: "You can reach us at hello@weforgetech.com or +1 (800) 555-1234, or just fill out the contact form below — we reply within one business day."
    },
    {
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'model'],
      response: "Yes! AI is one of our core practices — we build custom ML models, LLM-powered features, and intelligent automation tailored to real production data, not just demos."
    },
    {
      keywords: ['technology', 'tech stack', 'stack', 'tools', 'languages', 'framework'],
      response: "We work across modern stacks — TypeScript/React and Node on the web, Python for AI/ML, and cloud-native infrastructure on AWS or GCP, chosen per project rather than one-size-fits-all."
    },
    {
      keywords: ['price', 'cost', 'pricing', 'budget', 'quote'],
      response: "Pricing depends on scope — most engagements start with a short discovery call so we can give you an accurate estimate. Want to schedule one via the contact form?"
    },
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      response: "Hey there! I'm the Forge Assistant. Ask me about our services, our stack, or how to reach the team."
    },
    {
      keywords: ['thank', 'thanks'],
      response: "You're very welcome! Let me know if there's anything else you'd like to know about WeForge."
    },
  ];

  function getResponse(userText) {
    const lower = userText.toLowerCase();
    for (const intent of intents) {
      if (intent.keywords.some(kw => lower.includes(kw))) {
        return intent.response;
      }
    }
    return "I'm not totally sure about that one — but our team can help directly. Try asking about our services, our tech stack, or how to get in touch, or reach us at hello@weforgetech.com.";
  }

  function handleUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage(trimmed, 'user');
    quickReplies.style.display = 'none';

    const typingEl = showTyping();
    const delay = 700 + Math.random() * 700; // mimic variable inference latency

    setTimeout(() => {
      typingEl.remove();
      addMessage(getResponse(trimmed), 'bot');
    }, delay);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    handleUserMessage(text);
  });

  quickReplies.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => handleUserMessage(btn.textContent));
  });
}
