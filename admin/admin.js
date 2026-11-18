const config = window.ERA_SUPABASE_CONFIG || {};
const supabaseClient =
  window.supabase?.createClient &&
  config.url &&
  config.publishableKey &&
  config.url !== 'SUPABASE_URL' &&
  config.publishableKey !== 'SUPABASE_PUBLISHABLE_KEY'
    ? window.supabase.createClient(config.url, config.publishableKey)
    : null;

const defaultSite = {
  homepageHeadline: '',
  homepageIntro: '',
  aboutTitle: '',
  aboutText: [],
  whyChoose: [],
  bookingPolicy: '',
  footerCopy: '',
  instagramUrl: '',
  googleMapsReviewUrl: ''
};

const defaultRegion = {
  location: '',
  currency: '',
  whatsapp: '',
  email: '',
  bookingInstructions: '',
  contactCopy: ''
};

let services = [];
let gallery = [];
let testimonials = [];
let settings = { site: { ...defaultSite }, ghana: { ...defaultRegion }, nigeria: { ...defaultRegion } };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function setAuthMessage(message, success = false) {
  const element = document.getElementById('auth-message');
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('success', success);
}

function showAdminToast(message, type = 'success') {
  const container = document.getElementById('admin-toast-container');
  if (!container) {
    console.error('The admin notification could not be displayed:', message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  container.appendChild(toast);
  window.requestAnimationFrame(() => toast.classList.add('is-visible'));
  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function reportError(error, operation) {
  console.error(`${operation} failed:`, error);
  const message = error?.message || 'An unexpected error occurred.';
  showAdminToast(`${operation} failed: ${message}`, 'error');
}

function setCurrentTab(tabName) {
  document.querySelectorAll('.admin-panel').forEach((panel) => {
    panel.classList.toggle('active-panel', panel.id === `${tabName}-screen`);
  });
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.tab === tabName);
  });
}

function setAdminSessionState(isLoggedIn) {
  document.getElementById('login-screen').classList.toggle('active-panel', !isLoggedIn);
  document.querySelectorAll('.admin-panel:not(#login-screen)').forEach((panel) => {
    panel.classList.toggle('active-panel', isLoggedIn && panel.id === 'overview-screen');
  });
  document.querySelector('.admin-sidebar').classList.toggle('hidden', !isLoggedIn);
  if (isLoggedIn) setCurrentTab('overview');
}

async function checkAdminAccess() {
  const { data, error } = await supabaseClient.rpc('is_admin');
  if (error) throw error;
  if (data !== true) {
    await supabaseClient.auth.signOut();
    setAdminSessionState(false);
    setAuthMessage('This account is not authorized for the administrator portal.');
    return false;
  }
  setAdminSessionState(true);
  await loadAdminData();
  return true;
}

async function loadAdminData() {
  const [servicesResult, galleryResult, testimonialsResult, settingsResult] = await Promise.all([
    supabaseClient.from('services').select('*').order('display_order'),
    supabaseClient.from('gallery').select('*').order('display_order'),
    supabaseClient.from('testimonials').select('*').order('review_date', { ascending: false }),
    supabaseClient.from('site_settings').select('key, value')
  ]);
  for (const result of [servicesResult, galleryResult, testimonialsResult, settingsResult]) {
    if (result.error) throw result.error;
  }
  services = servicesResult.data || [];
  gallery = galleryResult.data || [];
  testimonials = testimonialsResult.data || [];
  const loadedSettings = Object.fromEntries(
    (settingsResult.data || []).map(({ key, value }) => [key, value])
  );
  settings = {
    site: { ...defaultSite, ...(loadedSettings.site || {}) },
    ghana: { ...defaultRegion, ...(loadedSettings.ghana || {}) },
    nigeria: { ...defaultRegion, ...(loadedSettings.nigeria || {}) }
  };
  renderAll();
}

function renderOverview() {
  document.getElementById('metric-services').textContent = services.length;
  document.getElementById('metric-gallery').textContent = gallery.length;
  document.getElementById('metric-testimonials').textContent = testimonials.length;
  document.getElementById('metric-bookings').textContent = 'Netlify';

  const recentBookings = document.getElementById('recent-bookings');
  recentBookings.innerHTML = `
    <li>Booking enquiries are collected securely by Netlify Forms.</li>
    <li><a href="https://app.netlify.com/" target="_blank" rel="noopener noreferrer">Open Netlify Forms submissions</a></li>
  `;
}

function renderServicesList() {
  document.getElementById('service-list').innerHTML = services.map((service) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(service.name)}</strong>
        <small>${service.active ? 'Active' : 'Hidden'}</small>
      </div>
      <div class="muted">GHS ${Number(service.price_gh || 0).toFixed(2)} • NGN ${Number(service.price_ng || 0).toLocaleString()}</div>
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary edit-service" data-id="${escapeHtml(service.id)}">Edit</button>
        <button type="button" class="btn btn-secondary delete-service" data-id="${escapeHtml(service.id)}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderGalleryList() {
  document.getElementById('gallery-list').innerHTML = gallery.map((photo) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(photo.caption || 'Untitled photo')}</strong>
        <small>${photo.published ? 'Published' : 'Hidden'}</small>
      </div>
      <div class="muted">${escapeHtml(photo.image_url)}</div>
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary edit-gallery" data-id="${escapeHtml(photo.id)}">Edit</button>
        <button type="button" class="btn btn-secondary delete-gallery" data-id="${escapeHtml(photo.id)}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderTestimonialsList() {
  document.getElementById('testimonial-list').innerHTML = testimonials.map((review) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(review.name)}</strong>
        <small>${review.approved ? 'Approved' : 'Hidden'}</small>
      </div>
      <div class="muted">${escapeHtml(review.source)} • ${review.rating || 5}★</div>
      <div class="muted">${escapeHtml(review.text)}</div>
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary edit-review" data-id="${escapeHtml(review.id)}">Edit</button>
        <button type="button" class="btn btn-secondary delete-review" data-id="${escapeHtml(review.id)}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderRegionPreview() {
  document.getElementById('region-preview').innerHTML = ['ghana', 'nigeria'].map((country) => {
    const region = settings[country];
    return `
      <div class="list-item">
        <strong>${country === 'ghana' ? 'Ghana' : 'Nigeria'}</strong>
        <div class="muted">${escapeHtml(region.location)} • ${escapeHtml(region.currency)}</div>
        <div class="muted">WhatsApp: ${escapeHtml(region.whatsapp)} • Email: ${escapeHtml(region.email)}</div>
      </div>
    `;
  }).join('');
}

function fillContentForm() {
  const site = settings.site;
  document.getElementById('content-headline').value = site.homepageHeadline || '';
  document.getElementById('content-about-title').value = site.aboutTitle || '';
  document.getElementById('content-intro').value = site.homepageIntro || '';
  document.getElementById('about-section').value = (site.aboutText || []).join('\n\n');
  document.getElementById('why-choose-section').value = (site.whyChoose || [])
    .map((item) => `${item.title}: ${item.text}`).join('\n\n');
  document.getElementById('booking-policy-text').value = site.bookingPolicy || '';
  document.getElementById('footer-copy-text').value = site.footerCopy || '';
  document.getElementById('content-instagram').value = site.instagramUrl || '';
  document.getElementById('content-google-maps').value = site.googleMapsReviewUrl || '';

  document.getElementById('ghana-location').value = settings.ghana.location || '';
  document.getElementById('ghana-contact-copy-input').value = settings.ghana.contactCopy || '';
  document.getElementById('ghana-whatsapp-input').value = settings.ghana.whatsapp || '';
  document.getElementById('ghana-email-input').value = settings.ghana.email || '';
  document.getElementById('ghana-currency').value = settings.ghana.currency || '';
  document.getElementById('ghana-booking').value = settings.ghana.bookingInstructions || '';
  document.getElementById('nigeria-location').value = settings.nigeria.location || '';
  document.getElementById('nigeria-contact-copy-input').value = settings.nigeria.contactCopy || '';
  document.getElementById('nigeria-whatsapp-input').value = settings.nigeria.whatsapp || '';
  document.getElementById('nigeria-email-input').value = settings.nigeria.email || '';
  document.getElementById('nigeria-currency').value = settings.nigeria.currency || '';
  document.getElementById('nigeria-booking').value = settings.nigeria.bookingInstructions || '';
}

function renderBookings() {
  document.getElementById('admin-bookings-list').innerHTML = `
    <div class="list-item">
      <p>Booking submissions are handled by Netlify Forms and are not stored in the Supabase database.</p>
      <a href="https://app.netlify.com/" target="_blank" rel="noopener noreferrer">View submissions in the Netlify site dashboard</a>
    </div>
  `;
}

function renderAll() {
  renderOverview();
  renderServicesList();
  renderGalleryList();
  renderTestimonialsList();
  renderRegionPreview();
  renderBookings();
  fillContentForm();
}

async function saveSetting(key, value) {
  const { error } = await supabaseClient
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
}

function resetForm(form, cancelButton) {
  form.reset();
  const idInput = form.querySelector('input[type="hidden"]');
  if (idInput) idInput.value = '';
  if (cancelButton) document.getElementById(cancelButton).classList.add('hidden');
}

function bindNavigation() {
  document.querySelectorAll('.nav-tab, [data-tab]:not(.nav-tab)').forEach((button) => {
    button.addEventListener('click', () => setCurrentTab(button.dataset.tab));
  });

  document.getElementById('refresh-metrics').addEventListener('click', () => {
    loadAdminData().catch((error) => reportError(error, 'Refreshing dashboard data'));
  });
}

function bindListActions() {
  document.getElementById('service-list').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const service = services.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('edit-service') && service) {
      document.getElementById('service-id').value = service.id;
      document.getElementById('service-name').value = service.name;
      document.getElementById('service-description').value = service.description;
      document.getElementById('service-price-gh').value = service.price_gh;
      document.getElementById('service-price-ng').value = service.price_ng;
      document.getElementById('service-image').value = service.image_url || '';
      document.getElementById('service-active').checked = service.active;
      document.getElementById('cancel-service-edit').classList.remove('hidden');
    } else if (button.classList.contains('delete-service') && service && window.confirm(`Delete "${service.name}"?`)) {
      supabaseClient.from('services').delete().eq('id', service.id)
        .then(({ error }) => {
          if (error) throw error;
          return loadAdminData();
        })
        .then(() => showAdminToast('Service deleted.'))
        .catch((error) => reportError(error, 'Deleting service'));
    }
  });

  document.getElementById('gallery-list').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const photo = gallery.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('edit-gallery') && photo) {
      document.getElementById('gallery-id').value = photo.id;
      document.getElementById('gallery-image-url').value = photo.image_url || '';
      document.getElementById('gallery-caption').value = photo.caption || '';
      document.getElementById('gallery-published').checked = photo.published;
      document.getElementById('cancel-gallery-edit').classList.remove('hidden');
    } else if (button.classList.contains('delete-gallery') && photo && window.confirm('Delete this gallery image?')) {
      (async () => {
        const { error } = await supabaseClient.from('gallery').delete().eq('id', photo.id);
        if (error) throw error;
        if (photo.storage_path) {
          const { error: storageError } = await supabaseClient.storage
            .from('era-gallery')
            .remove([photo.storage_path]);
          if (storageError) throw storageError;
        }
        await loadAdminData();
        showAdminToast('Gallery image deleted.');
      })().catch((error) => reportError(error, 'Deleting gallery image'));
    }
  });

  document.getElementById('testimonial-list').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const review = testimonials.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('edit-review') && review) {
      document.getElementById('testimonial-id').value = review.id;
      document.getElementById('reviewer-name').value = review.name;
      document.getElementById('review-date').value = review.review_date || '';
      document.getElementById('review-rating').value = review.rating || 5;
      document.getElementById('review-source').value = review.source || '';
      document.getElementById('review-url').value = review.original_url || '';
      document.getElementById('review-text').value = review.text || '';
      document.getElementById('review-approved').checked = review.approved;
      document.getElementById('cancel-review-edit').classList.remove('hidden');
    } else if (button.classList.contains('delete-review') && review && window.confirm('Delete this review?')) {
      supabaseClient.from('testimonials').delete().eq('id', review.id)
        .then(({ error }) => {
          if (error) throw error;
          return loadAdminData();
        })
        .then(() => showAdminToast('Review deleted.'))
        .catch((error) => reportError(error, 'Deleting review'));
    }
  });
}

function bindForms() {
  const serviceForm = document.getElementById('service-form');
  serviceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const id = document.getElementById('service-id').value;
      const service = {
        name: document.getElementById('service-name').value.trim(),
        description: document.getElementById('service-description').value.trim(),
        price_gh: Number(document.getElementById('service-price-gh').value || 0),
        price_ng: Number(document.getElementById('service-price-ng').value || 0),
        image_url: document.getElementById('service-image').value.trim(),
        active: document.getElementById('service-active').checked
      };
      const result = id
        ? await supabaseClient.from('services').update(service).eq('id', id)
        : await supabaseClient.from('services').insert(service);
      if (result.error) throw result.error;
      resetForm(serviceForm, 'cancel-service-edit');
      await loadAdminData();
      showAdminToast('Service saved.');
    } catch (error) {
      reportError(error, 'Saving service');
    }
  });

  const galleryForm = document.getElementById('gallery-form');
  galleryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = document.getElementById('gallery-image-file').files[0];
    const id = document.getElementById('gallery-id').value;
    const oldPhoto = gallery.find((item) => item.id === id);
    const imageInput = document.getElementById('gallery-image-url');
    let imageUrl = imageInput.value.trim();
    let storagePath = oldPhoto?.storage_path || null;
    let uploadedPath = null;
    let recordSaved = false;

    try {
      if (file) {
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!supportedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
          throw new Error('Choose a JPG, PNG, WebP, or GIF image smaller than 10 MB.');
        }
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) throw new Error('Your administrator session has expired. Sign in again.');
        uploadedPath = `${userData.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('era-gallery')
          .upload(uploadedPath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = supabaseClient.storage.from('era-gallery').getPublicUrl(uploadedPath).data.publicUrl;
        storagePath = uploadedPath;
      }
      if (!imageUrl) throw new Error('Provide an image URL or choose an image file to upload.');

      const photo = {
        image_url: imageUrl,
        storage_path: storagePath,
        caption: document.getElementById('gallery-caption').value.trim(),
        published: document.getElementById('gallery-published').checked
      };
      const result = id
        ? await supabaseClient.from('gallery').update(photo).eq('id', id)
        : await supabaseClient.from('gallery').insert(photo);
      if (result.error) throw result.error;
      recordSaved = true;
      if (uploadedPath && oldPhoto?.storage_path) {
        const { error: removeError } = await supabaseClient.storage
          .from('era-gallery')
          .remove([oldPhoto.storage_path]);
        if (removeError) throw removeError;
      }
      resetForm(galleryForm, 'cancel-gallery-edit');
      await loadAdminData();
      showAdminToast('Gallery image saved.');
    } catch (error) {
      if (uploadedPath && !recordSaved) {
        const { error: cleanupError } = await supabaseClient.storage
          .from('era-gallery')
          .remove([uploadedPath]);
        if (cleanupError) console.error('Unable to remove the unused uploaded image:', cleanupError);
      }
      reportError(error, 'Saving gallery image');
    }
  });

  const testimonialForm = document.getElementById('testimonial-form');
  testimonialForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const id = document.getElementById('testimonial-id').value;
      const review = {
        name: document.getElementById('reviewer-name').value.trim(),
        review_date: document.getElementById('review-date').value || null,
        rating: Number(document.getElementById('review-rating').value || 5),
        source: document.getElementById('review-source').value,
        original_url: document.getElementById('review-url').value.trim(),
        text: document.getElementById('review-text').value.trim(),
        approved: document.getElementById('review-approved').checked
      };
      const result = id
        ? await supabaseClient.from('testimonials').update(review).eq('id', id)
        : await supabaseClient.from('testimonials').insert(review);
      if (result.error) throw result.error;
      resetForm(testimonialForm, 'cancel-review-edit');
      await loadAdminData();
      showAdminToast('Review saved.');
    } catch (error) {
      reportError(error, 'Saving review');
    }
  });

  document.getElementById('content-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const site = {
      homepageHeadline: document.getElementById('content-headline').value.trim(),
      aboutTitle: document.getElementById('content-about-title').value.trim(),
      homepageIntro: document.getElementById('content-intro').value.trim(),
      aboutText: document.getElementById('about-section').value.split(/\n\s*\n/).filter(Boolean),
      whyChoose: document.getElementById('why-choose-section').value.split(/\n\s*\n/).filter(Boolean).map((entry) => {
        const [title, ...rest] = entry.split(':');
        return { icon: '✦', title: title.trim(), text: rest.join(':').trim() };
      }),
      bookingPolicy: document.getElementById('booking-policy-text').value.trim(),
      footerCopy: document.getElementById('footer-copy-text').value.trim(),
      instagramUrl: document.getElementById('content-instagram').value.trim(),
      googleMapsReviewUrl: document.getElementById('content-google-maps').value.trim()
    };
    try {
      await saveSetting('site', site);
      await loadAdminData();
      showAdminToast('Website content saved successfully.');
    } catch (error) {
      reportError(error, 'Saving website content');
    }
  });

  document.getElementById('region-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const ghana = {
      location: document.getElementById('ghana-location').value.trim(),
      contactCopy: document.getElementById('ghana-contact-copy-input').value.trim(),
      whatsapp: document.getElementById('ghana-whatsapp-input').value.trim(),
      email: document.getElementById('ghana-email-input').value.trim(),
      currency: document.getElementById('ghana-currency').value.trim(),
      bookingInstructions: document.getElementById('ghana-booking').value.trim()
    };
    const nigeria = {
      location: document.getElementById('nigeria-location').value.trim(),
      contactCopy: document.getElementById('nigeria-contact-copy-input').value.trim(),
      whatsapp: document.getElementById('nigeria-whatsapp-input').value.trim(),
      email: document.getElementById('nigeria-email-input').value.trim(),
      currency: document.getElementById('nigeria-currency').value.trim(),
      bookingInstructions: document.getElementById('nigeria-booking').value.trim()
    };
    try {
      await Promise.all([saveSetting('ghana', ghana), saveSetting('nigeria', nigeria)]);
      await loadAdminData();
      showAdminToast('Regional settings saved successfully.');
    } catch (error) {
      reportError(error, 'Saving regional settings');
    }
  });

  document.getElementById('cancel-service-edit').addEventListener('click', () => resetForm(serviceForm, 'cancel-service-edit'));
  document.getElementById('cancel-gallery-edit').addEventListener('click', () => resetForm(galleryForm, 'cancel-gallery-edit'));
  document.getElementById('cancel-review-edit').addEventListener('click', () => resetForm(testimonialForm, 'cancel-review-edit'));
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setAuthMessage('Add your Supabase project URL and publishable key to supabase-config.js before signing in.');
    return;
  }
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthMessage(error.message);
    return;
  }
  try {
    const authorized = await checkAdminAccess();
    if (authorized) {
      setAuthMessage('Signed in successfully.', true);
      event.currentTarget.reset();
    }
  } catch (accessError) {
    await supabaseClient.auth.signOut();
    setAdminSessionState(false);
    setAuthMessage(accessError.message);
  }
}

function initializeAdmin() {
  bindNavigation();
  bindListActions();
  bindForms();
  document.getElementById('admin-login-form').addEventListener('submit', (event) => {
    handleLogin(event).catch((error) => reportError(error, 'Signing in'));
  });
  document.getElementById('logout-button').addEventListener('click', async () => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) return reportError(error, 'Signing out');
    setAdminSessionState(false);
    setAuthMessage('Signed out successfully.', true);
  });

  if (!supabaseClient) {
    setAdminSessionState(false);
    setAuthMessage('Configure Supabase in supabase-config.js to enable owner sign-in.');
    return;
  }

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') setAdminSessionState(false);
  });
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    if (data.session) return checkAdminAccess();
    setAdminSessionState(false);
  }).catch((error) => {
    setAdminSessionState(false);
    setAuthMessage(error.message);
  });
}

document.addEventListener('DOMContentLoaded', initializeAdmin);
