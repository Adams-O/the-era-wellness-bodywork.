const config = window.ERA_SUPABASE_CONFIG || {};
const galleryBucket = 'era-gallery';
const maxGalleryFileSize = 10 * 1024 * 1024;
const allowedGalleryTypes = new Map([
  ['image/jpeg', { extension: 'jpg', signature: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff }],
  ['image/png', { extension: 'png', signature: (bytes) => bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10' }],
  ['image/webp', { extension: 'webp', signature: (bytes) => bytes.slice(0, 4).join(',') === '82,73,70,70' && bytes.slice(8, 12).join(',') === '87,69,66,80' }],
  ['image/gif', { extension: 'gif', signature: (bytes) => ['GIF87a', 'GIF89a'].includes(String.fromCharCode(...bytes.slice(0, 6))) }]
]);
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
let authCheckTimer;
let galleryPreviewUrl = '';
let authStateRevision = 0;
let pendingAccessRecheck = false;

const requiredServices = [
  { name: 'Nuru Massage', description: 'A fluid, full-body wellness experience designed for deep relaxation.', price_gh: 1500, display_order: 0 },
  { name: 'Signature Swedish', description: 'A soothing signature ritual designed to relax and restore the nervous system.', price_gh: 700, display_order: 1 },
  { name: 'Deep Tissue Recovery', description: 'A targeted therapy for muscle tension, stress and recovery.', price_gh: 700, display_order: 2 },
  { name: 'Hot Stone Healing', description: 'Warm stones and mindful bodywork encourage deep release and calm.', price_gh: 800, display_order: 3 },
  { name: 'Foot Massage', description: 'Focused foot and lower-leg care for tiredness and everyday tension.', price_gh: 300, display_order: 4 },
  { name: 'Hand Massage', description: 'Gentle, restorative care for hands and forearms.', price_gh: 200, display_order: 5 }
];

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

async function withBusyButton(button, busyLabel, action) {
  if (!button) return action();
  const originalLabel = button.textContent;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = busyLabel;
  try {
    return await action();
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = originalLabel;
  }
}

async function updateRecord(table, id, updates) {
  const { data, error } = await supabaseClient
    .from(table)
    .update(updates)
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The record was not found or your permissions have changed. Refresh and try again.');
}

async function removeRecord(table, id) {
  const { data, error } = await supabaseClient
    .from(table)
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The record was not found or your permissions have changed. Refresh and try again.');
}

function formatPrice(value, locale) {
  if (value === null || value === undefined || value === '') return 'Not set';
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Unavailable';
}

function nextDisplayOrder(items) {
  const lastOrder = items.reduce((highest, item) => {
    const order = Number(item.display_order);
    return Number.isFinite(order) ? Math.max(highest, order) : highest;
  }, -1);
  return lastOrder + 1;
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
    if (tab.dataset.tab === tabName) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
}

function clearAdminData() {
  services = [];
  gallery = [];
  testimonials = [];
  settings = { site: { ...defaultSite }, ghana: { ...defaultRegion }, nigeria: { ...defaultRegion } };
  for (const id of ['service-list', 'gallery-list', 'testimonial-list', 'recent-bookings', 'region-preview', 'admin-bookings-list']) {
    document.getElementById(id).innerHTML = '';
  }
  for (const id of ['metric-services', 'metric-gallery', 'metric-testimonials', 'metric-approved-testimonials']) {
    document.getElementById(id).textContent = '0';
  }
  for (const id of ['service-form', 'gallery-form', 'content-form', 'region-form']) {
    document.getElementById(id).reset();
  }
  for (const id of ['cancel-service-edit', 'cancel-gallery-edit']) {
    document.getElementById(id).classList.add('hidden');
  }
  document.getElementById('admin-password').value = '';
  updateGalleryPreview('');
}

function setAdminSessionState(state) {
  const isLoggedIn = state === 'authorized';
  if (!isLoggedIn) clearAdminData();
  document.getElementById('login-screen').classList.toggle('active-panel', state === 'signed-out');
  document.getElementById('loading-screen').classList.toggle('active-panel', state === 'checking');
  document.querySelectorAll('.admin-panel:not(#login-screen)').forEach((panel) => {
    panel.classList.toggle('active-panel', isLoggedIn && panel.id === 'overview-screen');
  });
  document.querySelector('.admin-sidebar').classList.toggle('hidden', !isLoggedIn);
  if (isLoggedIn) setCurrentTab('overview');
}

let adminAccessCheck;

function checkAdminAccess() {
  if (adminAccessCheck) {
    pendingAccessRecheck = true;
    return adminAccessCheck;
  }
  const revision = authStateRevision;
  adminAccessCheck = verifyAdminAccess(revision)
    .catch((error) => {
      if (revision !== authStateRevision) {
        clearAdminData();
        return false;
      }
      throw error;
    })
    .finally(() => {
      adminAccessCheck = null;
      if (pendingAccessRecheck) {
        pendingAccessRecheck = false;
        window.setTimeout(() => {
          checkAdminAccess().catch((error) => {
            setAdminSessionState('signed-out');
            setAuthMessage('Unable to verify administrator access. Check your connection and try again.');
            reportError(error, 'Verifying administrator access');
          });
        }, 0);
      }
    });
  return adminAccessCheck;
}

async function verifyAdminAccess(revision) {
  setAdminSessionState('checking');
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();
  if (revision !== authStateRevision) return false;
  if (userError) throw userError;
  if (!userData.user) {
    setAdminSessionState('signed-out');
    return false;
  }

  const [membershipResult, adminResult] = await Promise.all([
    supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle(),
    supabaseClient.rpc('is_admin')
  ]);
  if (revision !== authStateRevision) return false;
  if (membershipResult.error) throw membershipResult.error;
  if (adminResult.error) throw adminResult.error;
  if (!membershipResult.data || adminResult.data !== true) {
    const { error: signOutError } = await supabaseClient.auth.signOut();
    if (signOutError) throw signOutError;
    setAdminSessionState('signed-out');
    setAuthMessage('This account is not authorized for the administrator portal.');
    return false;
  }

  await loadAdminData();
  if (revision !== authStateRevision) {
    clearAdminData();
    return false;
  }
  setAdminSessionState('authorized');
  setAuthMessage('');
  return true;
}

async function ensureRequiredServices() {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  let changed = false;

  for (const required of requiredServices) {
    const existing = services.find((service) => normalize(service.name) === normalize(required.name));
    if (existing) {
      if (Number(existing.price_gh) !== required.price_gh) {
        await updateRecord('services', existing.id, { price_gh: required.price_gh });
        changed = true;
      }
    } else {
      const duplicate = services.some((service) => normalize(service.name) === normalize(required.name));
      if (!duplicate) {
        const { error } = await supabaseClient.from('services').insert({
          ...required,
          price_ng: null,
          image_url: '',
          active: true
        });
        if (error) throw error;
        changed = true;
      }
    }
  }

  if (changed) {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .order('display_order');
    if (error) throw error;
    services = data || [];
  }
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
  await ensureRequiredServices();
  gallery = galleryResult.data || [];
  testimonials = testimonialsResult.data || [];
  const loadedSettings = Object.fromEntries(
    (settingsResult.data || []).map(({ key, value }) => [key, value])
  );
  const asSettingsObject = (value) => (
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  settings = {
    site: { ...defaultSite, ...asSettingsObject(loadedSettings.site) },
    ghana: { ...defaultRegion, ...asSettingsObject(loadedSettings.ghana) },
    nigeria: { ...defaultRegion, ...asSettingsObject(loadedSettings.nigeria) }
  };
  renderAll();
}

function renderOverview() {
  document.getElementById('metric-services').textContent = services.length;
  document.getElementById('metric-gallery').textContent = gallery.filter((photo) => photo.published).length;
  document.getElementById('metric-testimonials').textContent = testimonials.filter((review) => !review.approved).length;
  document.getElementById('metric-approved-testimonials').textContent = testimonials.filter((review) => review.approved).length;

  const recentBookings = document.getElementById('recent-bookings');
  recentBookings.innerHTML = `
    <li>Booking enquiries are collected securely by Netlify Forms. No booking data is stored in this dashboard.</li>
    <li><a href="https://app.netlify.com/" target="_blank" rel="noopener noreferrer">Open Netlify Forms submissions</a></li>
  `;
}

function renderServicesList() {
  document.getElementById('service-list').innerHTML = services.map((service) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(service.name)}</strong>
        <small>${service.active ? 'Active' : 'Inactive'}</small>
      </div>
      <p class="muted">${escapeHtml(service.description)}</p>
      ${safeExternalUrl(service.image_url) ? `<img class="admin-list-image" src="${escapeHtml(safeExternalUrl(service.image_url))}" alt="${escapeHtml(service.name)}" loading="lazy" decoding="async">` : ''}
      <div class="muted">GHS ${escapeHtml(formatPrice(service.price_gh, 'en-GH'))} • NGN ${escapeHtml(formatPrice(service.price_ng, 'en-NG'))}</div>
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary edit-service" data-id="${escapeHtml(service.id)}">Edit</button>
        <button type="button" class="btn btn-secondary toggle-service" data-id="${escapeHtml(service.id)}" aria-label="${service.active ? 'Deactivate' : 'Activate'} ${escapeHtml(service.name)}">${service.active ? 'Deactivate' : 'Activate'}</button>
        <button type="button" class="btn btn-secondary delete-service" data-id="${escapeHtml(service.id)}">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No services have been added yet.</p>';
}

function renderGalleryList() {
  document.getElementById('gallery-list').innerHTML = gallery.map((photo) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(photo.caption || 'Untitled photo')}</strong>
        <small>${photo.published ? 'Published' : 'Unpublished'}</small>
      </div>
      ${safeExternalUrl(photo.image_url) ? `<img class="admin-list-image" src="${escapeHtml(safeExternalUrl(photo.image_url))}" alt="${escapeHtml(photo.caption || 'Gallery image')}" loading="lazy" decoding="async">` : '<p class="muted">Image URL is unavailable.</p>'}
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary edit-gallery" data-id="${escapeHtml(photo.id)}">Edit</button>
        <button type="button" class="btn btn-secondary toggle-gallery" data-id="${escapeHtml(photo.id)}" aria-label="${photo.published ? 'Unpublish' : 'Publish'} ${escapeHtml(photo.caption || 'image')}">${photo.published ? 'Unpublish' : 'Publish'}</button>
        <button type="button" class="btn btn-secondary delete-gallery" data-id="${escapeHtml(photo.id)}">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No gallery images have been added yet.</p>';
}

function renderTestimonialsList() {
  document.getElementById('testimonial-list').innerHTML = testimonials.map((review) => `
    <div class="list-item">
      <div class="list-item-head">
        <strong>${escapeHtml(review.name)}</strong>
        <small>${review.approved ? 'Approved' : 'Pending approval'}</small>
      </div>
      <div class="muted">${escapeHtml(review.source || 'Review')} • ${review.rating ? `${escapeHtml(review.rating)}/5` : 'No rating provided'}${review.review_date ? ` • ${escapeHtml(review.review_date)}` : ''}</div>
      <p class="review-copy">${escapeHtml(review.text || 'No review text provided.')}</p>
      <div class="list-item-actions">
        <button type="button" class="btn btn-secondary review-approval" data-id="${escapeHtml(review.id)}" data-approved="${!review.approved}" aria-label="${review.approved ? 'Reject' : 'Approve'} review by ${escapeHtml(review.name)}">${review.approved ? 'Reject' : 'Approve'}</button>
        <button type="button" class="btn btn-secondary delete-review" data-id="${escapeHtml(review.id)}">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No testimonials have been submitted.</p>';
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

async function saveSettings(entries) {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .upsert(entries, { onConflict: 'key' })
    .select('key');
  if (error) throw error;
  if (!data || data.length !== entries.length) {
    throw new Error('Not all website settings were saved. Check administrator permissions and try again.');
  }
}

function saveSetting(key, value) {
  return saveSettings([{ key, value }]);
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

  document.getElementById('refresh-metrics').addEventListener('click', (event) => {
    withBusyButton(event.currentTarget, 'Refreshing…', async () => {
      await checkAdminAccess();
    }).catch((error) => {
      setAdminSessionState('signed-out');
      setAuthMessage('Unable to verify administrator access. Check your connection and sign in again.');
      reportError(error, 'Refreshing dashboard data');
    });
  });
}

function bindListActions() {
  document.getElementById('service-list').addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const service = services.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('edit-service') && service) {
      document.getElementById('service-id').value = service.id;
      document.getElementById('service-name').value = service.name;
      document.getElementById('service-description').value = service.description;
      document.getElementById('service-price-gh').value = service.price_gh;
      document.getElementById('service-price-ng').value = service.price_ng ?? '';
      document.getElementById('service-display-order').value = service.display_order ?? '';
      document.getElementById('service-image').value = service.image_url || '';
      document.getElementById('service-active').checked = service.active;
      document.getElementById('cancel-service-edit').classList.remove('hidden');
    } else if (button.classList.contains('toggle-service') && service) {
      withBusyButton(button, 'Updating…', async () => {
        await updateRecord('services', service.id, { active: !service.active });
        await loadAdminData();
        showAdminToast(`Service ${service.active ? 'deactivated' : 'activated'}.`);
      }).catch((error) => reportError(error, 'Updating service status'));
    } else if (button.classList.contains('delete-service') && service && window.confirm(`Permanently delete "${service.name}"? This cannot be undone.`)) {
      withBusyButton(button, 'Deleting…', async () => {
        await removeRecord('services', service.id);
        await loadAdminData();
        showAdminToast('Service deleted.');
      }).catch((error) => reportError(error, 'Deleting service'));
    }
  });

  document.getElementById('gallery-list').addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const photo = gallery.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('edit-gallery') && photo) {
      document.getElementById('gallery-id').value = photo.id;
      document.getElementById('gallery-image-url').value = photo.image_url || '';
      document.getElementById('gallery-caption').value = photo.caption || '';
      document.getElementById('gallery-published').checked = photo.published;
      document.getElementById('gallery-image-file').value = '';
      document.getElementById('cancel-gallery-edit').classList.remove('hidden');
      updateGalleryPreview(photo.image_url, photo.caption);
    } else if (button.classList.contains('toggle-gallery') && photo) {
      withBusyButton(button, 'Updating…', async () => {
        await updateRecord('gallery', photo.id, { published: !photo.published });
        await loadAdminData();
        showAdminToast(`Gallery image ${photo.published ? 'unpublished' : 'published'}.`);
      }).catch((error) => reportError(error, 'Updating gallery image status'));
    } else if (button.classList.contains('delete-gallery') && photo && window.confirm('Permanently delete this gallery image and its stored file? This cannot be undone.')) {
      withBusyButton(button, 'Deleting…', async () => {
        await removeRecord('gallery', photo.id);
        let storageError;
        if (photo.storage_path) {
          const result = await supabaseClient.storage
            .from(galleryBucket)
            .remove([photo.storage_path]);
          storageError = result.error;
        }
        await loadAdminData();
        if (storageError) {
          console.error('Gallery record deleted, but its stored image could not be removed:', storageError);
          showAdminToast('Image record deleted, but its stored file could not be removed. Remove it from Supabase Storage manually.', 'error');
          return;
        }
        showAdminToast('Gallery image deleted.');
      }).catch((error) => reportError(error, 'Deleting gallery image'));
    }
  });

  document.getElementById('testimonial-list').addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const review = testimonials.find((item) => item.id === button.dataset.id);
    if (button.classList.contains('review-approval') && review) {
      const approved = button.dataset.approved === 'true';
      withBusyButton(button, 'Updating…', async () => {
        await updateRecord('testimonials', review.id, { approved });
        await loadAdminData();
        showAdminToast(`Review ${approved ? 'approved' : 'rejected'}.`);
      }).catch((error) => reportError(error, 'Updating review approval'));
    } else if (button.classList.contains('delete-review') && review && window.confirm(`Permanently delete the review by "${review.name}"? This cannot be undone.`)) {
      withBusyButton(button, 'Deleting…', async () => {
        await removeRecord('testimonials', review.id);
        await loadAdminData();
        showAdminToast('Review deleted.');
      }).catch((error) => reportError(error, 'Deleting review'));
    }
  });
}

function updateGalleryPreview(url, caption = '', isLocalPreview = false) {
  const preview = document.getElementById('gallery-preview');
  const image = document.getElementById('gallery-preview-image');
  const captionElement = document.getElementById('gallery-preview-caption');
  if (galleryPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(galleryPreviewUrl);

  const safeUrl = isLocalPreview && url.startsWith('blob:') ? url : safeExternalUrl(url);
  galleryPreviewUrl = safeUrl;
  preview.classList.toggle('hidden', !safeUrl);
  if (safeUrl) {
    image.src = safeUrl;
    image.alt = caption || 'Gallery image preview';
    captionElement.textContent = caption;
  } else {
    image.removeAttribute('src');
    image.alt = 'Gallery image preview';
    captionElement.textContent = '';
  }
}

async function validateGalleryFile(file) {
  const format = allowedGalleryTypes.get(file.type);
  if (!format || file.size === 0 || file.size > maxGalleryFileSize) {
    throw new Error('Choose a non-empty JPG, PNG, WebP, or GIF image no larger than 10 MB.');
  }
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!format.signature(signature)) {
    throw new Error('The image file contents do not match its selected file type.');
  }
  return format;
}

function bindForms() {
  const serviceForm = document.getElementById('service-form');
  serviceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await withBusyButton(event.submitter, 'Saving…', async () => {
        const id = document.getElementById('service-id').value;
        const imageInput = document.getElementById('service-image').value.trim();
        const service = {
          name: document.getElementById('service-name').value.trim(),
          description: document.getElementById('service-description').value.trim(),
          price_gh: document.getElementById('service-price-gh').valueAsNumber,
          price_ng: document.getElementById('service-price-ng').value.trim()
            ? document.getElementById('service-price-ng').valueAsNumber
            : null,
          image_url: imageInput ? safeExternalUrl(imageInput) : '',
          active: document.getElementById('service-active').checked,
          display_order: document.getElementById('service-display-order').value.trim()
            ? document.getElementById('service-display-order').valueAsNumber
            : (id ? services.find((item) => item.id === id)?.display_order ?? 0 : nextDisplayOrder(services))
        };
        if (!service.name || !service.description) throw new Error('Enter a service name and description.');
        if (!Number.isFinite(service.price_gh) || service.price_gh < 0) {
          throw new Error('Enter a valid, non-negative Ghana price.');
        }
        if (service.price_ng !== null && (!Number.isFinite(service.price_ng) || service.price_ng < 0)) {
          throw new Error('Enter a valid, non-negative Nigeria price.');
        }
        if (!Number.isInteger(service.display_order) || service.display_order < 0) {
          throw new Error('Display order must be a non-negative whole number.');
        }
        if (imageInput && !service.image_url) throw new Error('Service image URLs must use HTTPS.');
        if (id) {
          const normalizedName = service.name.toLowerCase().replace(/\s+/g, ' ').trim();
          const duplicate = services.some((item) =>
            item.id !== id &&
            String(item.name || '').toLowerCase().replace(/\s+/g, ' ').trim() === normalizedName
          );
          if (duplicate) throw new Error(`A service named "${service.name}" already exists.`);
        } else {
          const normalizedName = service.name.toLowerCase().replace(/\s+/g, ' ').trim();
          const duplicate = services.some((item) =>
            String(item.name || '').toLowerCase().replace(/\s+/g, ' ').trim() === normalizedName
          );
          if (duplicate) throw new Error(`A service named "${service.name}" already exists.`);
        }

        if (id) {
          await updateRecord('services', id, service);
        } else {
          const { error } = await supabaseClient.from('services').insert(service);
          if (error) throw error;
        }
        resetForm(serviceForm, 'cancel-service-edit');
        await loadAdminData();
        showAdminToast('Service saved.');
      });
    } catch (error) {
      reportError(error, 'Saving service');
    }
  });

  const galleryForm = document.getElementById('gallery-form');
  galleryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await withBusyButton(event.submitter, 'Saving…', async () => {
        const fileInput = document.getElementById('gallery-image-file');
        const file = fileInput.files[0];
        const id = document.getElementById('gallery-id').value;
        const oldPhoto = gallery.find((item) => item.id === id);
        if (id && !oldPhoto) throw new Error('This gallery image is no longer available. Refresh and try again.');
        const imageInput = document.getElementById('gallery-image-url');
        let imageUrl = imageInput.value.trim();
        let storagePath = oldPhoto?.storage_path || null;
        let uploadedPath = null;
        let recordSaved = false;

        try {
          if (file) {
            const format = await validateGalleryFile(file);
            const { data: userData, error: userError } = await supabaseClient.auth.getUser();
            if (userError) throw userError;
            if (!userData.user) throw new Error('Your administrator session has expired. Sign in again.');
            if (!window.crypto?.randomUUID) throw new Error('Secure image uploads are not supported in this browser.');

            uploadedPath = `${userData.user.id}/${window.crypto.randomUUID()}.${format.extension}`;
            const { error: uploadError } = await supabaseClient.storage
              .from(galleryBucket)
              .upload(uploadedPath, file, { contentType: file.type, cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            imageUrl = supabaseClient.storage.from(galleryBucket).getPublicUrl(uploadedPath).data.publicUrl;
            storagePath = uploadedPath;
          } else if (oldPhoto && imageUrl !== oldPhoto.image_url) {
            storagePath = null;
          }

          imageUrl = safeExternalUrl(imageUrl);
          if (!imageUrl) throw new Error('Provide a valid HTTPS image URL or choose a supported image file.');

          const photo = {
            image_url: imageUrl,
            storage_path: storagePath,
            caption: document.getElementById('gallery-caption').value.trim(),
            published: document.getElementById('gallery-published').checked
          };
          if (id) {
            await updateRecord('gallery', id, photo);
          } else {
            photo.display_order = nextDisplayOrder(gallery);
            const { error } = await supabaseClient.from('gallery').insert(photo);
            if (error) throw error;
          }
          recordSaved = true;

          let cleanupWarning = false;
          if (oldPhoto?.storage_path && oldPhoto.storage_path !== storagePath) {
            const { error: removeError } = await supabaseClient.storage
              .from(galleryBucket)
              .remove([oldPhoto.storage_path]);
            if (removeError) {
              cleanupWarning = true;
              console.error('Gallery image was saved, but the previous stored file could not be removed:', removeError);
              showAdminToast('Image saved, but the previous stored file could not be removed. Remove it from Supabase Storage manually.', 'error');
            }
          }
          resetForm(galleryForm, 'cancel-gallery-edit');
          updateGalleryPreview('');
          await loadAdminData();
          if (!cleanupWarning) showAdminToast('Gallery image saved.');
        } catch (error) {
          if (uploadedPath && !recordSaved) {
            const { error: cleanupError } = await supabaseClient.storage
              .from(galleryBucket)
              .remove([uploadedPath]);
            if (cleanupError) {
              console.error('Unable to remove the unused uploaded image:', cleanupError);
              showAdminToast('The image could not be saved and its unused upload could not be removed. Check Supabase Storage.', 'error');
            }
          }
          throw error;
        }
      });
    } catch (error) {
      reportError(error, 'Saving gallery image');
    }
  });

  const imageInput = document.getElementById('gallery-image-url');
  const captionInput = document.getElementById('gallery-caption');
  const fileInput = document.getElementById('gallery-image-file');
  const refreshGalleryPreview = () => {
    if (!fileInput.files[0]) updateGalleryPreview(imageInput.value, captionInput.value);
  };
  imageInput.addEventListener('input', refreshGalleryPreview);
  captionInput.addEventListener('input', refreshGalleryPreview);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return refreshGalleryPreview();
    try {
      await validateGalleryFile(file);
      updateGalleryPreview(URL.createObjectURL(file), captionInput.value, true);
    } catch (error) {
      fileInput.value = '';
      updateGalleryPreview(imageInput.value, captionInput.value);
      showAdminToast(error.message, 'error');
    }
  });

  document.getElementById('content-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await withBusyButton(event.submitter, 'Saving…', async () => {
        const instagramInput = document.getElementById('content-instagram').value.trim();
        const mapsInput = document.getElementById('content-google-maps').value.trim();
        const site = {
          homepageHeadline: document.getElementById('content-headline').value.trim(),
          aboutTitle: document.getElementById('content-about-title').value.trim(),
          homepageIntro: document.getElementById('content-intro').value.trim(),
          aboutText: document.getElementById('about-section').value.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean),
          whyChoose: document.getElementById('why-choose-section').value.split(/\n\s*\n/).map((entry) => {
            const [title, ...rest] = entry.split(':');
            return { icon: '✦', title: title.trim(), text: rest.join(':').trim() };
          }).filter((item) => item.title && item.text),
          bookingPolicy: document.getElementById('booking-policy-text').value.trim(),
          footerCopy: document.getElementById('footer-copy-text').value.trim(),
          instagramUrl: instagramInput ? safeExternalUrl(instagramInput) : '',
          googleMapsReviewUrl: mapsInput ? safeExternalUrl(mapsInput) : ''
        };
        if (instagramInput && !site.instagramUrl) throw new Error('Instagram URLs must use HTTPS.');
        if (mapsInput && !site.googleMapsReviewUrl) throw new Error('Google Maps URLs must use HTTPS.');
        await saveSetting('site', site);
        await loadAdminData();
        showAdminToast('Website content saved successfully.');
      });
    } catch (error) {
      reportError(error, 'Saving website content');
    }
  });

  document.getElementById('region-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await withBusyButton(event.submitter, 'Saving…', async () => {
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
        for (const [country, region] of Object.entries({ Ghana: ghana, Nigeria: nigeria })) {
          if (!/^\+?[0-9\s().-]{7,20}$/.test(region.whatsapp)) {
            throw new Error(`Enter a valid WhatsApp number for ${country}.`);
          }
        }
        await saveSettings([
          { key: 'ghana', value: ghana },
          { key: 'nigeria', value: nigeria }
        ]);
        await loadAdminData();
        showAdminToast('Regional settings saved successfully.');
      });
    } catch (error) {
      reportError(error, 'Saving regional settings');
    }
  });

  document.getElementById('cancel-service-edit').addEventListener('click', () => resetForm(serviceForm, 'cancel-service-edit'));
  document.getElementById('cancel-gallery-edit').addEventListener('click', () => {
    resetForm(galleryForm, 'cancel-gallery-edit');
    updateGalleryPreview('');
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const passwordInput = document.getElementById('admin-password');
  if (!supabaseClient) {
    setAuthMessage('Add your Supabase project URL and publishable key to supabase-config.js before signing in.');
    return;
  }
  try {
    await withBusyButton(form.querySelector('button[type="submit"]'), 'Verifying…', async () => {
      const email = document.getElementById('admin-email').value.trim();
      const password = passwordInput.value;
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      passwordInput.value = '';
      if (error) throw error;
      const authorized = await checkAdminAccess();
      if (authorized) form.reset();
    });
  } catch (error) {
    passwordInput.value = '';
    setAdminSessionState('signed-out');
    setAuthMessage(error?.message || 'Unable to verify administrator access. Please try again.');
  }
}

function initializeAdmin() {
  bindNavigation();
  bindListActions();
  bindForms();
  document.getElementById('admin-login-form').addEventListener('submit', (event) => {
    handleLogin(event).catch((error) => reportError(error, 'Signing in'));
  });
  document.getElementById('logout-button').addEventListener('click', async (event) => {
    if (!supabaseClient) return;
    try {
      await withBusyButton(event.currentTarget, 'Signing out…', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        setAdminSessionState('signed-out');
        setAuthMessage('Signed out successfully.', true);
      });
    } catch (error) {
      reportError(error, 'Signing out');
    }
  });

  if (!supabaseClient) {
    setAdminSessionState('signed-out');
    setAuthMessage('Configure Supabase in supabase-config.js to enable owner sign-in.');
    return;
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    authStateRevision += 1;
    if (event === 'SIGNED_OUT' || !session) {
      window.clearTimeout(authCheckTimer);
      pendingAccessRecheck = false;
      setAdminSessionState('signed-out');
      return;
    }
    setAdminSessionState('checking');
    window.clearTimeout(authCheckTimer);
    authCheckTimer = window.setTimeout(() => {
      checkAdminAccess().catch((error) => {
        setAdminSessionState('signed-out');
        setAuthMessage('Unable to verify administrator access. Check your connection and try again.');
        reportError(error, 'Verifying administrator access');
      });
    }, 0);
  });
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    if (data.session) return checkAdminAccess();
    setAdminSessionState('signed-out');
  }).catch((error) => {
    setAdminSessionState('signed-out');
    setAuthMessage('Unable to verify administrator access. Check your connection and try again.');
    reportError(error, 'Checking administrator session');
  });
}

document.addEventListener('DOMContentLoaded', initializeAdmin);
