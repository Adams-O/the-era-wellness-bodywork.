const defaultContent = {
  site: {
    homepageHeadline: 'Reset, restore and return to balance.',
    homepageIntro:
      'Bespoke massage and bodywork experiences designed to help you unwind, recover, and feel deeply cared for in the comfort of your home, hotel, or private retreat.',
    aboutTitle: 'Personalised wellness, designed around your needs.',
    aboutText: [
      'At The Era Wellness & Bodywork, we create mindful experiences that support stress relief, deep recovery and lasting calm. Our treatments are tailored to real life, blending luxury care with practical wellness support.',
      'Whether you are seeking a restorative massage, a soothing after-work ritual or a premium mobile treatment for a special occasion, we bring professional care directly to your preferred space with warmth, discretion and attention to detail.'
    ],
    whyChoose: [
      { icon: '✦', title: 'Tailored rituals', text: 'Every session is designed around your body, pace, and goals.' },
      { icon: '✧', title: 'Mobile convenience', text: 'Receive premium bodywork in the comfort and privacy of your home or suite.' },
      { icon: '✷', title: 'Luxury standards', text: 'Fresh linens, elegant care and a restorative environment for every treatment.' },
      { icon: '✹', title: 'Trusted professionals', text: 'Thoughtful service, clear communication and a high-touch experience from start to finish.' }
    ],
    bookingPolicy: 'A 50% deposit is required to secure a booking. A booking is only confirmed after the business confirms availability and receives the required deposit.',
    footerCopy: 'The Era Wellness & Bodywork offers luxury massage and wellness services across Ghana and Nigeria.',
    instagramUrl: 'https://www.instagram.com/theera377/',
    googleMapsReviewUrl: 'https://maps.app.goo.gl/VLtEwfNDoJrg8RL18?g_st=ic'
  },
  regions: {
    ghana: {
      location: 'Kumasi, Ghana',
      currency: 'GHS / GH₵',
      whatsapp: '+233543311806',
      email: '',
      bookingInstructions: 'Share your preferred date, time and treatment and we will confirm availability and secure your booking with a 50% deposit.',
      contactCopy: 'Luxury massage and wellness services in Kumasi, Ghana.'
    },
    nigeria: {
      location: 'Lagos and Ilorin, Kwara State, Nigeria',
      currency: 'NGN / ₦',
      whatsapp: '+2349137948427',
      email: 'tera84345@gmail.com',
      bookingInstructions: 'Share your location and preferred treatment, and our team will confirm availability and send booking details.',
      contactCopy: 'Premium mobile bodywork services in Lagos and Ilorin, Nigeria.'
    }
  },
  services: [
    {
      id: 'service-1',
      name: 'Deep Tissue Reset',
      description: 'A targeted therapy for muscle tension, stress and recovery.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
      price_gh: 350,
      price_ng: 45000,
      active: true
    },
    {
      id: 'service-2',
      name: 'Luxury Swedish Massage',
      description: 'A soothing full-body ritual designed to relax and restore the nervous system.',
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80',
      price_gh: 420,
      price_ng: 56000,
      active: true
    },
    {
      id: 'service-3',
      name: 'Couples Wellness Escape',
      description: 'An indulgent shared experience for two, created for connection and calm.',
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
      price_gh: 650,
      price_ng: 86000,
      active: true
    }
  ],
  gallery: [
    { id: 'photo-1', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80', caption: 'Calm, restorative care', published: true },
    { id: 'photo-2', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80', caption: 'A discreet in-room ritual', published: true },
    { id: 'photo-3', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', caption: 'Bodywork for recovery', published: true },
    { id: 'photo-4', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80', caption: 'Luxury wellness moments', published: true }
  ],
  testimonials: [
    { id: 'google-review-ma-ya', name: 'MA YA', source: 'Google', approved: true, url: 'https://maps.app.goo.gl/afYefTBpMzgWaeW1A', text: 'Absolutely amazing service! She is very talented, professional, and knows exactly how to make you feel relaxed. One of the best massage experiences I’ve had. Highly recommended!' },
    { id: 'google-review-olaoye-sodiq', name: 'Olaoye Sodiq', source: 'Google', approved: true, url: 'https://maps.app.goo.gl/uM2FnydMGV7AX2VMA', text: 'I walked in stressed and left feeling like a brand-new person. Highly recommend your services!' },
    { id: 'google-review-lumora-sparkclean', name: 'Lumora Sparkclean', source: 'Google', approved: true, url: 'https://maps.app.goo.gl/hf5H2NaD6n3JkkZT7', text: 'Her hands are blessed I feel so relaxed like never before am so happy to know you' },
    { id: 'google-review-abdulazeez-sekinah', name: 'Abdulazeez Sekinah', source: 'Google', approved: true, url: '', text: 'She’s good at what she’s does☺️💗 …' }
  ]
};

let siteContent = structuredClone(defaultContent);
const seededDemoReviewIds = new Set([
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000022',
  '00000000-0000-4000-8000-000000000023'
]);

const config = window.ERA_SUPABASE_CONFIG || {};
const supabaseClient =
  window.supabase?.createClient &&
  config.url &&
  config.publishableKey &&
  config.url !== 'SUPABASE_URL' &&
  config.publishableKey !== 'SUPABASE_PUBLISHABLE_KEY'
    ? window.supabase.createClient(config.url, config.publishableKey)
    : null;

function getContent() {
  return siteContent;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function renderPublicImage(value, alt, className) {
  const url = safeExternalUrl(value);
  if (!url) return `<div class="${className} image-placeholder" aria-hidden="true"></div>`;
  return `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
}

async function loadSiteContent() {
  if (!supabaseClient) {
    console.warn('Supabase is not configured. Showing the included preview content.');
    return;
  }

  const [servicesResult, galleryResult, testimonialsResult, settingsResult] = await Promise.all([
    supabaseClient.from('services').select('*').eq('active', true).order('display_order'),
    supabaseClient.from('gallery').select('*').eq('published', true).order('display_order'),
    supabaseClient.from('testimonials').select('*').eq('approved', true).order('review_date', { ascending: false }),
    supabaseClient.from('site_settings').select('key, value')
  ]);
  const failedResult = [servicesResult, galleryResult, testimonialsResult, settingsResult]
    .find((result) => result.error);
  if (failedResult) {
    console.error('Unable to load public content from Supabase:', failedResult.error);
  }

  const settings = Object.fromEntries(
    (settingsResult.data || []).map(({ key, value }) => [key, value])
  );
  const cmsReviews = (testimonialsResult.data || [])
    .filter((review) => !seededDemoReviewIds.has(review.id))
    .map((review) => ({
      ...review,
      date: review.review_date,
      url: review.original_url
    }));
  const suppliedReviews = defaultContent.testimonials.map((review) => {
    const cmsReview = cmsReviews.find(
      (candidate) => candidate.name.trim().toLowerCase() === review.name.toLowerCase()
    );
    return cmsReview
      ? { ...review, ...cmsReview, source: 'Google', url: review.url, approved: true }
      : review;
  });
  const suppliedReviewNames = new Set(suppliedReviews.map((review) => review.name.toLowerCase()));
  siteContent = {
    site: { ...defaultContent.site, ...(settings.site || {}) },
    regions: {
      ghana: { ...defaultContent.regions.ghana, ...(settings.ghana || {}) },
      nigeria: { ...defaultContent.regions.nigeria, ...(settings.nigeria || {}) }
    },
    services: servicesResult.error
      ? defaultContent.services
      : servicesResult.data.map((service) => ({ ...service, image: service.image_url })),
    gallery: galleryResult.error
      ? defaultContent.gallery
      : galleryResult.data.map((photo) => ({ ...photo, image: photo.image_url })),
    testimonials: [
      ...cmsReviews.filter((review) => !suppliedReviewNames.has(review.name.toLowerCase())),
      ...suppliedReviews
    ]
  };
}

function populateServiceOptions() {
  const selector = document.getElementById('booking-service');
  if (!selector) return;
  const content = getContent();
  const activeServices = content.services
    .filter((service) => service.active)
    .map((service) => `<option value="${escapeHtml(service.name)}">${escapeHtml(service.name)}</option>`);
  if (activeServices.length === 0) {
    activeServices.push('<option value="Help me choose a service">Help me choose a service</option>');
  }
  selector.innerHTML = activeServices.join('');
  selector.insertAdjacentHTML('afterbegin', '<option value="" disabled selected>Select a service</option>');
}

function renderServices() {
  const root = document.getElementById('services-grid');
  if (!root) return;
  const content = getContent();
  root.innerHTML = (content.services || [])
    .filter((service) => service.active)
    .map(
      (service) => `
        <article class="service-card">
          ${renderPublicImage(service.image, service.name, 'thumb')}
          <div class="body">
            <h3>${escapeHtml(service.name)}</h3>
            <p>${escapeHtml(service.description)}</p>
            <div class="service-meta">
              <span><small>Ghana</small><strong>GH₵ ${Number(service.price_gh || 0).toFixed(2)}</strong></span>
              <span><small>Nigeria</small><strong>₦ ${Number(service.price_ng || 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </article>
      `
    )
    .join('');
  root.setAttribute('aria-busy', 'false');
}

function renderGallery() {
  const root = document.getElementById('gallery-grid');
  if (!root) return;
  const content = getContent();
  root.innerHTML = (content.gallery || [])
    .filter((photo) => photo.published)
    .map((photo) => {
      const caption = photo.caption || 'The Era experience';
      const imageUrl = safeExternalUrl(photo.image);
      return `
        <figure class="gallery-item">
          <button
            class="gallery-open"
            type="button"
            aria-label="View image: ${escapeHtml(caption)}"
            data-caption="${escapeHtml(caption)}"
            ${imageUrl ? '' : 'disabled'}
          >
            ${renderPublicImage(imageUrl, caption, 'gallery-image')}
          </button>
          <figcaption class="caption">${escapeHtml(caption)}</figcaption>
        </figure>
      `;
    })
    .join('');
  root.setAttribute('aria-busy', 'false');
}

function initializeGalleryLightbox() {
  const gallery = document.getElementById('gallery-grid');
  const dialog = document.getElementById('gallery-lightbox');
  const preview = document.getElementById('gallery-lightbox-image');
  const caption = document.getElementById('gallery-lightbox-caption');
  const closeButton = dialog?.querySelector('.gallery-lightbox-close');
  if (
    !gallery ||
    !dialog ||
    dialog.tagName !== 'DIALOG' ||
    typeof dialog.showModal !== 'function' ||
    !preview ||
    !caption ||
    !closeButton
  ) return;

  gallery.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest('.gallery-open');
    if (!(trigger instanceof HTMLButtonElement) || trigger.disabled) return;

    const image = trigger.querySelector('img');
    if (!image) return;
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    caption.textContent = trigger.dataset.caption || image.alt;
    dialog.showModal();
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    preview.removeAttribute('src');
    preview.alt = '';
    caption.textContent = '';
  });
}

function renderTestimonials() {
  const root = document.getElementById('testimonials-grid');
  if (!root) return;
  const content = getContent();
  root.innerHTML = (content.testimonials || [])
    .filter((review) => review.approved)
    .map(
      (review) => {
        const rating = Number(review.rating);
        const verifiedRating = review.verified === true && Number.isInteger(rating) && rating >= 1 && rating <= 5;
        const reviewDate = review.date ? new Date(`${review.date}T12:00:00`) : null;
        const dateLabel = reviewDate && Number.isFinite(reviewDate.getTime())
          ? reviewDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
          : '';
        const reviewUrl = safeExternalUrl(review.url);
        return `
        <article class="review-card">
            ${verifiedRating ? `<div class="stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>` : ''}
            ${review.text
              ? `<blockquote>${escapeHtml(review.text)}</blockquote>`
              : `<p class="review-link-copy">${reviewUrl ? `<a href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener noreferrer">Read ${escapeHtml(review.name)}’s original Google review</a>` : 'Google review'}</p>`}
            <div class="review-meta">
              <strong>${escapeHtml(review.name)}</strong>
              <span>${escapeHtml(review.source || 'Google')}</span>
              ${dateLabel ? `<time datetime="${escapeHtml(review.date)}">${dateLabel}</time>` : ''}
            </div>
          </article>
        `;
      }
    )
    .join('');
  root.setAttribute('aria-busy', 'false');
}

function renderSiteContent() {
  const content = getContent();
  const site = content.site || {};

  const headline = document.getElementById('homepage-headline');
  if (headline) headline.textContent = site.homepageHeadline;

  const intro = document.getElementById('homepage-intro');
  if (intro) intro.textContent = site.homepageIntro;

  const aboutTitle = document.getElementById('about-section-title');
  if (aboutTitle) aboutTitle.textContent = site.aboutTitle;

  const aboutContent = document.getElementById('about-section-content');
  if (aboutContent) {
    aboutContent.innerHTML = (site.aboutText || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  }

  const whyTitle = document.getElementById('why-choose-title');
  if (whyTitle) whyTitle.textContent = 'A more elevated approach to rest.';

  const whyContainer = document.getElementById('why-choose-items');
  if (whyContainer) {
    whyContainer.innerHTML = (site.whyChoose || []).map(
      (item) => `
        <article class="why-card">
        <div class="why-icon" aria-hidden="true"></div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    ).join('');
  }

  const bookingPolicy = document.getElementById('booking-policy');
  if (bookingPolicy) bookingPolicy.textContent = site.bookingPolicy || defaultContent.site.bookingPolicy;

  const footerCopy = document.getElementById('footer-copy');
  if (footerCopy) footerCopy.textContent = site.footerCopy || defaultContent.site.footerCopy;

  const instagramLink = document.getElementById('instagram-link');
  const footerInstagram = document.getElementById('footer-instagram');
  const instagramUrl = safeExternalUrl(site.instagramUrl || defaultContent.site.instagramUrl);
  if (instagramLink) instagramLink.href = instagramUrl || '#';
  if (footerInstagram) footerInstagram.href = instagramUrl || '#';
  const mapsUrl = safeExternalUrl(site.googleMapsReviewUrl) || defaultContent.site.googleMapsReviewUrl;
  document.querySelectorAll('.review-actions a').forEach((link) => {
    link.href = mapsUrl;
  });

  const gWhatsapp = document.getElementById('ghana-whatsapp');
  const gContact = document.getElementById('ghana-contact-copy');
  if (gWhatsapp) gWhatsapp.href = `https://wa.me/${String(content.regions.ghana.whatsapp || '').replace(/\D/g, '')}`;
  if (gContact) gContact.textContent = content.regions.ghana.contactCopy || `${content.regions.ghana.location} • ${content.regions.ghana.currency}`;
  const gEmail = document.getElementById('ghana-email');
  if (gEmail) {
    gEmail.href = content.regions.ghana.email ? `mailto:${content.regions.ghana.email}` : '#';
    gEmail.classList.toggle('hidden', !content.regions.ghana.email);
  }

  const nWhatsapp = document.getElementById('nigeria-whatsapp');
  const nEmail = document.getElementById('nigeria-email');
  const nContact = document.getElementById('nigeria-contact-copy');
  if (nWhatsapp) nWhatsapp.href = `https://wa.me/${String(content.regions.nigeria.whatsapp || '').replace(/\D/g, '')}`;
  if (nEmail) {
    nEmail.href = content.regions.nigeria.email ? `mailto:${content.regions.nigeria.email}` : '#';
    nEmail.classList.toggle('hidden', !content.regions.nigeria.email);
  }
  if (nContact) nContact.textContent = content.regions.nigeria.contactCopy || `${content.regions.nigeria.location} • ${content.regions.nigeria.currency}`;
}

function initializeScrollNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => {
    header.classList.toggle('nav-scrolled', window.scrollY > 20);
  };
  update();
  window.addEventListener('scroll', update);
}

function showContentSkeletons() {
  const skeletons = [
    ['services-grid', 3, 'service'],
    ['gallery-grid', 4, 'gallery'],
    ['testimonials-grid', 4, 'review']
  ];

  for (const [id, count, type] of skeletons) {
    const root = document.getElementById(id);
    if (!root) continue;
    root.setAttribute('aria-busy', 'true');
    root.innerHTML = Array.from({ length: count }, () => `
      <div class="content-skeleton ${type}-skeleton" aria-hidden="true">
        <span class="skeleton-image"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-line short"></span>
      </div>
    `).join('');
  }
}

function initializeScrollReveal() {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll(
    '.section-space, .service-card, .why-card, .gallery-item, .review-card'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  targets.forEach((target) => {
    target.classList.add('reveal-on-scroll');
    observer.observe(target);
  });
}

function initializeBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const status = document.getElementById('booking-form-status');
  const submitButton = document.getElementById('booking-submit');
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    dateInput.min = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
  }
  let submitted = false;
  let submitting = false;
  const refreshBookingActions = () => {
    if (submitted && !submitting) {
      submitted = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'SEND BOOKING ENQUIRY';
      }
      if (status) {
        status.textContent = '';
        delete status.dataset.state;
      }
    }
    updateBookingWhatsApp();
  };
  form.addEventListener('input', refreshBookingActions);
  form.addEventListener('change', refreshBookingActions);
  updateBookingWhatsApp();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitting = true;
    if (submitButton) submitButton.disabled = true;
    if (status) {
      status.dataset.state = 'sending';
      status.textContent = 'Sending your enquiry…';
    }
    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!response.ok) throw new Error(`Netlify Forms returned HTTP ${response.status}`);
      submitted = true;
      if (status) {
        status.dataset.state = 'success';
        status.textContent = 'Thank you for choosing The Era Wellness & Bodywork. Your enquiry has been received. Our team will contact you to confirm availability and discuss the next steps. An appointment is confirmed only after the business approves availability and receives the required 50% deposit.';
      }
      if (submitButton) submitButton.textContent = 'ENQUIRY SENT';
    } catch (error) {
      console.error('Unable to submit booking enquiry to Netlify Forms:', error);
      if (status) {
        status.dataset.state = 'error';
        status.textContent = 'We could not submit your enquiry. Please try again or contact us on WhatsApp below.';
      }
    } finally {
      submitting = false;
      if (!submitted && submitButton) submitButton.disabled = false;
    }
  });
}

function updateBookingWhatsApp() {
  const form = document.getElementById('booking-form');
  const link = document.getElementById('booking-whatsapp');
  if (!form || !link) return;

  const data = new FormData(form);
  const region = data.get('country') === 'Nigeria' ? getContent().regions.nigeria : getContent().regions.ghana;
  const number = String(region.whatsapp || '').replace(/\D/g, '');
  if (!number) {
    link.classList.add('hidden');
    return;
  }

  const message = [
    'Hello, I would like to enquire about a booking.',
    `Name: ${data.get('name') || ''}`,
    `Country: ${data.get('country') || ''}`,
    `Service: ${data.get('service') || ''}`,
    `Phone: ${data.get('phone') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Preferred date: ${data.get('preferred-date') || ''}`,
    `Preferred time: ${data.get('preferred-time') || ''}`,
    `Session: ${data.get('session-type') || ''}`,
    `Location: ${data.get('location') || ''}`,
    `Notes: ${data.get('notes') || ''}`,
    'I understand a 50% deposit is required to secure a confirmed booking.'
  ].join('\n');
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  link.classList.remove('hidden');
}

function initializeFloatingWhatsApp() {
  const link = document.getElementById('floating-whatsapp');
  if (!link) return;

  const bookingForm = document.getElementById('booking-form');
  const updateLink = () => {
    const country = bookingForm ? new FormData(bookingForm).get('country') : 'Ghana';
    const region = country === 'Nigeria' ? getContent().regions.nigeria : getContent().regions.ghana;
    const number = String(region.whatsapp || '').replace(/\D/g, '');
    if (!number) {
      link.removeAttribute('href');
      link.classList.add('hidden');
      return;
    }
    link.href = `https://wa.me/${number}`;
    link.classList.remove('hidden');
  };

  bookingForm?.addEventListener('change', updateLink);
  updateLink();

  const bookingCard = document.querySelector('.booking-form-card');
  if (bookingCard && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      link.classList.toggle('booking-form-visible', entry.isIntersecting);
    });
    observer.observe(bookingCard);
  }
}

function initializeMobileNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.navbar-toggler');
  const menu = document.getElementById('mainNav');
  if (!header || !toggle || !menu) return;

  const body = document.body;
  const originalBodyStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    width: body.style.width
  };
  let open = toggle.getAttribute('aria-expanded') === 'true';
  let lockedScrollY = 0;
  const syncMenuAccessibility = () => {
    const collapsed = window.matchMedia('(max-width: 991px)').matches;
    menu.inert = collapsed && !open;
    menu.setAttribute('aria-hidden', String(collapsed && !open));
  };
  const setOpen = (shouldOpen) => {
    const nextOpen = Boolean(shouldOpen);
    if (nextOpen !== open) {
      if (nextOpen) {
        lockedScrollY = window.scrollY;
        document.documentElement.classList.add('mobile-nav-open');
        body.style.position = 'fixed';
        body.style.top = `-${lockedScrollY}px`;
        body.style.left = '0';
        body.style.width = '100%';
      } else {
        document.documentElement.classList.remove('mobile-nav-open');
        body.style.position = originalBodyStyles.position;
        body.style.top = originalBodyStyles.top;
        body.style.left = originalBodyStyles.left;
        body.style.width = originalBodyStyles.width;
        const scrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, lockedScrollY);
        document.documentElement.style.scrollBehavior = scrollBehavior;
      }
    }
    open = nextOpen;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('is-open', open);
    menu.classList.toggle('show', open);
    syncMenuAccessibility();
  };
  const closeMenu = () => setOpen(false);

  setOpen(open);
  toggle.addEventListener('click', () => {
    setOpen(!open);
  });
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) closeMenu();
  });
  document.addEventListener('pointerdown', (event) => {
    if (
      open &&
      event.target instanceof Node &&
      !menu.contains(event.target) &&
      !toggle.contains(event.target)
    ) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      closeMenu();
      toggle.focus({ preventScroll: true });
    }
  });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 992px)').matches) closeMenu();
    else syncMenuAccessibility();
  });
  window.addEventListener('pageshow', closeMenu);
  window.addEventListener('hashchange', closeMenu);
}

async function setupPublicSite() {
  showContentSkeletons();
  try {
    await loadSiteContent();
  } catch (error) {
    console.error('Unable to load public content. Showing the included preview content:', error);
  }
  renderServices();
  renderGallery();
  initializeGalleryLightbox();
  renderTestimonials();
  renderSiteContent();
  populateServiceOptions();
  initializeScrollNav();
  initializeScrollReveal();
  initializeBookingForm();
  initializeFloatingWhatsApp();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeMobileNavigation();
  setupPublicSite().catch((error) => {
    console.error('Unable to initialize the public website:', error);
  });
});
