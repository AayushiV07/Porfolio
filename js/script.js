/* Enhanced Portfolio Script with Email Integration */

/* Helper functions */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* DOM references */
const header = $('#header');
const nav = $('#navbar');
const navLinks = $$('.nav-link');
const menuToggle = $('#menu-toggle');
const themeToggle = $('#theme-toggle');
const typedEl = $('#typed');
const progressEls = $$('.progress');
const filterBtns = $$('.filter-btn');
const projectsGrid = $('#projects-grid');
const openResumeBtn = $('#open-resume');
const resumeModal = $('#resume-modal');
const closeResumeBtn = $('#close-resume');
const resumePreviewBtn = $('#resume-preview');
const resumePreviewFrame = $('#resume-preview-frame');
const lightbox = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const closeLightbox = $('#close-lightbox');
const yearEl = $('#year');
const contactForm = $('#contact-form');
const formSuccess = $('#form-success');
const formError = $('#form-error');
const submitBtn = $('#submit-btn');

/* Initialize EmailJS with environment variables */
// Initialize EmailJS when the script loads
document.addEventListener('DOMContentLoaded', () => {
  // Get credentials from meta tags (we'll add these to HTML)
  const publicKey = document.querySelector('meta[name="emailjs-public-key"]')?.content;
  const serviceId = document.querySelector('meta[name="emailjs-service-id"]')?.content;
  const templateId = document.querySelector('meta[name="emailjs-template-id"]')?.content;
  
  console.log('EmailJS Config Check:', {
    publicKey: publicKey ? 'Found' : 'Missing',
    serviceId: serviceId ? 'Found' : 'Missing', 
    templateId: templateId ? 'Found' : 'Missing'
  });
  
  if (publicKey) {
    try {
      emailjs.init(publicKey);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization failed:', error);
    }
  } else {
    console.error('EmailJS public key not found');
  }
});

/* Small initializations */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Initialize particles.js */
if (window.particlesJS) {
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#00abf0' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#00abf0',
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 6,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' }
      }
    },
    retina_detect: true
  });
}

/* ---------- Menu toggle (mobile) ---------- */
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('bx-x');
      icon.classList.toggle('bx-menu');
    }
  });

  /* Close nav on link click */
  navLinks.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.classList.remove('bx-x');
      icon.classList.add('bx-menu');
    }
  }));
}

/* ---------- Theme toggle (persist) ---------- */
function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('site-theme', theme);
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'light' ? 
      "<i class='bx bx-sun'></i>" : 
      "<i class='bx bx-moon'></i>";
  }
}

const savedTheme = localStorage.getItem('site-theme') || 'dark';
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  });
}

/* ---------- Typed effect (vanilla) ---------- */
const phrases = [
  'Frontend Developer', 
  'DSA with Java', 
  'AR/VR Explorer', 
  'React & UI Enthusiast',
  'Problem Solver',
  'Creative Thinker'
];

let tIndex = 0, cIndex = 0, deleting = false;

function typeTick() {
  if (!typedEl) return;
  
  const current = phrases[tIndex % phrases.length];
  
  if (!deleting) {
    cIndex++;
    typedEl.textContent = current.slice(0, cIndex);
    if (cIndex === current.length) {
      deleting = true;
      setTimeout(typeTick, 1200);
      return;
    }
  } else {
    cIndex--;
    typedEl.textContent = current.slice(0, cIndex);
    if (cIndex === 0) {
      deleting = false;
      tIndex++;
      setTimeout(typeTick, 300);
      return;
    }
  }
  setTimeout(typeTick, deleting ? 50 : 100);
}

// Start typing effect
typeTick();

/* ---------- Intersection Observer: reveal sections + active nav ---------- */
const sections = Array.from(document.querySelectorAll('.section'));
const animateElements = Array.from(document.querySelectorAll('.animate-on-scroll'));
const allElements = [...sections, ...animateElements];

const ioOptions = { root: null, rootMargin: '-50px', threshold: 0.1 };

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('inview');
      
      // Handle section-specific animations
      const id = entry.target.id;
      if (id) {
        // Set active nav link
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
        
        // Animate skills progress bars
        if (id === 'skills') animateProgress();
        
        // Animate counters in about section
        if (id === 'about') animateCounters();
      }
      
      // Animate project cards with stagger
      if (entry.target.classList.contains('project-card')) {
        setTimeout(() => {
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.opacity = '1';
        }, Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100);
      }
    }
  });
}, ioOptions);

allElements.forEach(el => io.observe(el));

/* ---------- Animate progress bars ---------- */
let progressAnimated = false;

function animateProgress() {
  if (progressAnimated || !progressEls.length) return;
  
  progressEls.forEach((p, index) => {
    setTimeout(() => {
      const val = parseInt(p.dataset.value || 0, 10);
      const span = p.querySelector('span');
      if (span) {
        span.style.width = val + '%';
      }
      
      // Update percentage display if exists
      const percentageEl = p.parentElement.querySelector('.skill-percentage');
      if (percentageEl) {
        animateNumber(percentageEl, 0, val, 1500, '%');
      }
    }, index * 200);
  });
  
  progressAnimated = true;
}

/* ---------- Animate counters ---------- */
let countersAnimated = false;

function animateCounters() {
  if (countersAnimated) return;
  
  const counters = $$('.counter');
  counters.forEach((counter, index) => {
    setTimeout(() => {
      const target = parseFloat(counter.dataset.count || 0);
      animateNumber(counter, 0, target, 2000);
    }, index * 200);
  });
  
  countersAnimated = true;
}

function animateNumber(element, start, end, duration, suffix = '') {
  const startTime = performance.now();
  const isFloat = end % 1 !== 0;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeOutCubic;
    
    element.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

/* ---------- Projects filter + lightbox ---------- */
if (filterBtns.length && projectsGrid) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      const cards = Array.from(projectsGrid.children);
      
      cards.forEach((card, index) => {
        const type = card.dataset.type || 'all';
        const shouldShow = filter === 'all' || type === filter;
        
        if (shouldShow) {
          card.style.display = '';
          setTimeout(() => {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
          }, index * 100);
        } else {
          card.style.transform = 'translateY(20px)';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* Project preview handler (lightbox) */
if (projectsGrid && lightbox && lightboxImg) {
  projectsGrid.addEventListener('click', e => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    
    const card = btn.closest('.project-card');
    const img = card.querySelector('img');
    const title = card.querySelector('h3');
    
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = title ? title.textContent : 'Project preview';
    } else {
      // Handle placeholder images
      lightboxImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzBmMmEzOCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNiZmNiZDYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0IFByZXZpZXc8L3RleHQ+PC9zdmc+';
    }
    
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

if (closeLightbox && lightbox) {
  closeLightbox.addEventListener('click', () => {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
  
  // Close on background click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Resume modal ---------- */
if (openResumeBtn && resumeModal) {
  openResumeBtn.addEventListener('click', () => {
    resumeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

if (closeResumeBtn && resumeModal) {
  closeResumeBtn.addEventListener('click', () => {
    resumeModal.setAttribute('aria-hidden', 'true');
    if (resumePreviewFrame) resumePreviewFrame.hidden = true;
    document.body.style.overflow = '';
  });
}

if (resumePreviewBtn && resumePreviewFrame) {
  resumePreviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resumePreviewFrame.hidden = !resumePreviewFrame.hidden;
  });
}

/* Close modal on outside click */
if (resumeModal && resumePreviewFrame) {
  resumeModal.addEventListener('click', e => {
    if (e.target === resumeModal) {
      resumeModal.setAttribute('aria-hidden', 'true');
      resumePreviewFrame.hidden = true;
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Sticky header on scroll ---------- */
if (header) {
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add sticky class
    header.classList.toggle('sticky', currentScrollY > 100);
    
    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 500) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
  });
}

/* ---------- Enhanced Contact form with EmailJS ---------- */
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const subject = formData.get('subject')?.trim() || 'Contact from Portfolio';
    const message = formData.get('message')?.trim();
    
    // Validation
    if (!name || !email || !message) {
      showFormMessage('Please fill in all required fields (Name, Email, Message).', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    try {
      // Send email using EmailJS
      await sendEmailWithEmailJS({
        name,
        email,
        phone,
        subject,
        message
      });
      
      // Success
      contactForm.reset();
      showFormMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
      
    } catch (error) {
      console.error('Error sending message:', error);
      showFormMessage('Sorry, there was an error sending your message. Please try again or contact me directly at kusum2006verma@gmail.com', 'error');
    } finally {
      setSubmitButtonLoading(false);
    }
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function setSubmitButtonLoading(loading) {
  if (!submitBtn) return;
  
  const btnText = submitBtn.querySelector('.btn-text');
  const loadingIcon = submitBtn.querySelector('.loading-icon');
  
  if (loading) {
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';
    if (loadingIcon) loadingIcon.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message';
    if (loadingIcon) loadingIcon.style.display = 'none';
  }
}

function showFormMessage(message, type) {
  const messageEl = type === 'success' ? formSuccess : formError;
  const otherEl = type === 'success' ? formError : formSuccess;
  
  if (!messageEl) return;
  
  // Hide other message
  if (otherEl) otherEl.hidden = true;
  
  // Update message content
  const textNode = messageEl.querySelector('i').nextSibling;
  if (textNode) {
    textNode.textContent = ' ' + message;
  }
  
  // Show message
  messageEl.hidden = false;
  
  // Auto-hide after delay
  setTimeout(() => {
    messageEl.hidden = true;
  }, type === 'success' ? 5000 : 7000);
}

// Send email using EmailJS
async function sendEmailWithEmailJS(data) {
  const serviceId = document.querySelector('meta[name="emailjs-service-id"]')?.content;
  const templateId = document.querySelector('meta[name="emailjs-template-id"]')?.content;
  
  console.log('Sending email with:', { serviceId, templateId });
  
  if (!serviceId || !templateId) {
    const error = 'EmailJS configuration missing. Service ID: ' + (serviceId || 'missing') + ', Template ID: ' + (templateId || 'missing');
    console.error(error);
    throw new Error(error);
  }
  
  if (typeof emailjs === 'undefined') {
    const error = 'EmailJS library not loaded';
    console.error(error);
    throw new Error(error);
  }
  
  const templateParams = {
    from_name: data.name,
    from_email: data.email,
    phone: data.phone || 'Not provided',
    subject: data.subject,
    message: data.message,
    to_email: 'kusum2006verma@gmail.com',
    timestamp: new Date().toLocaleString()
  };
  
  console.log('Template params:', templateParams);
  
  try {
    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('EmailJS send error:', error);
    console.error('Error details:', error.text || error.message);
    throw new Error('Failed to send email: ' + (error.text || error.message || 'Unknown error'));
  }
}

/* ---------- Smooth scrolling for anchor links ---------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  
  e.preventDefault();
  const targetId = link.getAttribute('href').slice(1);
  const targetElement = document.getElementById(targetId);
  
  if (targetElement) {
    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      const icon = menuToggle?.querySelector('i');
      if (icon) {
        icon.classList.remove('bx-x');
        icon.classList.add('bx-menu');
      }
    }
  }
});

/* ---------- Accessibility: Keyboard navigation ---------- */
document.addEventListener('keydown', (e) => {
  // Close modals with Escape key
  if (e.key === 'Escape') {
    // Close resume modal
    if (resumeModal && resumeModal.getAttribute('aria-hidden') === 'false') {
      resumeModal.setAttribute('aria-hidden', 'true');
      if (resumePreviewFrame) resumePreviewFrame.hidden = true;
      document.body.style.overflow = '';
    }
    
    // Close lightbox
    if (lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    
    // Close mobile nav
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      const icon = menuToggle?.querySelector('i');
      if (icon) {
        icon.classList.remove('bx-x');
        icon.classList.add('bx-menu');
      }
    }
  }
});

/* ---------- Performance optimizations ---------- */
// Lazy load images when they come into view
const images = document.querySelectorAll('img[data-src]');
if (images.length) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

/* ---------- Error handling for missing images ---------- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.opacity = '0.4';
    img.style.filter = 'grayscale(100%)';
  });
});

/* ---------- Preload critical resources ---------- */
function preloadCriticalResources() {
  const criticalResources = [
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap'
  ];
  
  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  preloadCriticalResources();
  
  // Add loading complete class to body
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 500);
});

/* ---------- Service Worker Registration (for PWA features) ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}