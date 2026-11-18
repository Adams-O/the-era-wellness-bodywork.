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
    googleMapsReviewUrl: ''
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
    {
      id: 'review-1',
      name: 'Ama K.',
      date: '2025-02-14',
      rating: 5,
      source: 'Google',
      approved: true,
      url: 'https://example.com',
      text: 'The massage was deeply relaxing and exactly what I needed after a long week. The mobile service was seamless and the atmosphere was beautifully calming.'
    },
    {
      id: 'review-2',
      name: 'Tobi A.',
      date: '2025-04-06',
      rating: 5,
      source: 'Instagram',
      approved: true,
      url: 'https://example.com',
      text: 'The treatment felt premium from start to finish. It was luxurious, professional and genuinely restorative.'
    },
    {
      id: 'review-3',
      name: 'Nadia M.',
      date: '2025-06-11',
      rating: 4,
      source: 'Direct Client',
      approved: true,
      url: '',
      text: 'Very thoughtful service with a calming aesthetic. I appreciated the care, the attention to detail and the relaxed energy.'
    }
  ]
};

let siteContent = structuredClone(defaultContent);

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
    testimonials: testimonialsResult.error
      ? defaultContent.testimonials
      : testimonialsResult.data.map((review) => ({
        ...review,
        date: review.review_date,
        url: review.original_url
      }))
  };
}

function populateServiceOptions() {
  const selector = document.getElementById('booking-service');
  if (!selector) return;
  const content = getContent();
  selector.innerHTML = content.services
    .filter((service) => service.active)
    .map((service) => `<option value="${escapeHtml(service.name)}">${escapeHtml(service.name)}</option>`)
    .join('');
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
    .map(
      (photo) => `
        <figure class="gallery-item">
          ${renderPublicImage(photo.image, photo.caption || 'The Era experience', 'gallery-image')}
          <figcaption class="caption">${escapeHtml(photo.caption || 'The Era experience')}</figcaption>
        </figure>
      `
    )
    .join('');
  root.setAttribute('aria-busy', 'false');
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
        return `
        <article class="review-card">
            ${verifiedRating ? `<div class="stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>` : ''}
            <blockquote>${escapeHtml(review.text)}</blockquote>
            <div class="review-meta">
              <strong>${escapeHtml(review.name)}</strong>
              <span>${escapeHtml(review.source)}</span>
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
  const mapsReviewLink = document.getElementById('google-maps-review-link');
  const mapsUrl = safeExternalUrl(site.googleMapsReviewUrl);
  if (mapsReviewLink && mapsUrl) {
    mapsReviewLink.href = mapsUrl;
    mapsReviewLink.classList.remove('hidden');
  }

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
    ['testimonials-grid', 3, 'review']
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
  let submitted = false;
  let submitting = false;
  const refreshBookingActions = () => {
    if (submitted && !submitting) {
      submitted = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send enquiry';
      }
      if (status) status.textContent = '';
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
    if (status) status.textContent = 'Sending your enquiry…';
    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!response.ok) throw new Error(`Netlify Forms returned HTTP ${response.status}`);
      submitted = true;
      if (status) status.textContent = 'Thank you. Your enquiry has been sent. You can also continue with the correct regional WhatsApp contact below.';
      if (submitButton) submitButton.textContent = 'Enquiry sent';
    } catch (error) {
      console.error('Unable to submit booking enquiry to Netlify Forms:', error);
      if (status) status.textContent = 'We could not submit your enquiry. Please try again or contact us on WhatsApp below.';
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

async function setupPublicSite() {
  showContentSkeletons();
  try {
    await loadSiteContent();
  } catch (error) {
    console.error('Unable to load public content. Showing the included preview content:', error);
  }
  renderServices();
  renderGallery();
  renderTestimonials();
  renderSiteContent();
  populateServiceOptions();
  initializeScrollNav();
  initializeScrollReveal();
  initializeBookingForm();
}

document.addEventListener('DOMContentLoaded', () => {
  setupPublicSite().catch((error) => {
    console.error('Unable to initialize the public website:', error);
  });
});
