const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const API_BASE = window.API_BASE || (
  LOCAL_HOSTS.includes(window.location.hostname)
    ? `${window.location.port === '5001' ? window.location.origin : 'http://localhost:5001'}/api`
    : 'https://spotlight-salon-appointment-app.onrender.com/api'
);
const CATEGORIES = ['all', 'hair', 'skin', 'nails', 'spa', 'other'];
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const SERVICE_IMAGE_FALLBACKS = [
  {
    match: ['color', 'colour', 'highlight'],
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['cut', 'haircut', 'styling'],
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['spa', 'conditioning', 'treatment'],
    url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['wash'],
    url: 'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['facial', 'skin'],
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['manicure', 'nail', 'pedicure'],
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['massage', 'stone'],
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=900&auto=format&fit=crop&q=80',
  },
  {
    match: ['bridal', 'makeup', 'make-up'],
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
  },
];

const CATEGORY_IMAGE_FALLBACKS = {
  hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80',
  skin: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80',
  nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&auto=format&fit=crop&q=80',
  spa: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=900&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
};

const state = {
  user: readUser(),
  services: [],
  appointments: [],
  adminAppointments: [],
  adminServices: [],
  route: getRoute(),
};

const app = document.querySelector('#app');
const navLinks = document.querySelector('#navLinks');
const menuToggle = document.querySelector('.menu-toggle');

menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
window.addEventListener('hashchange', () => {
  state.route = getRoute();
  render();
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-link]');
  if (link) navLinks.classList.remove('open');
});

document.addEventListener('submit', handleSubmit);
document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);

render();

function getRoute() {
  const raw = window.location.hash.replace(/^#/, '') || 'home';
  const [path, query = ''] = raw.split('?');
  return { path, params: new URLSearchParams(query) };
}

function go(path) {
  window.location.hash = path;
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('salonUser')) || null;
  } catch {
    localStorage.removeItem('salonUser');
    return null;
  }
}

function saveUser(user) {
  state.user = user;
  localStorage.setItem('salonUser', JSON.stringify(user));
  render();
}

function logout() {
  state.user = null;
  localStorage.removeItem('salonUser');
  go('home');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (state.user?.token) {
    headers.Authorization = `Bearer ${state.user.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('salonUser');
      state.user = null;
    }
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

function render() {
  renderNav();

  const route = state.route.path;
  if (route === 'home') return renderHome();
  if (route === 'services') return renderServices();
  if (route === 'login') return renderLogin();
  if (route === 'register') return renderRegister();
  if (route === 'book') return requireAuth(renderBook);
  if (route === 'dashboard') return requireAuth(renderDashboard);
  if (route === 'admin') return requireAdmin(renderAdmin);

  app.innerHTML = pageHead('Page not found', 'That page does not exist.') + empty('Try using the navigation above.');
}

function requireAuth(renderer) {
  if (!state.user) {
    go('login');
    return;
  }
  renderer();
}

function requireAdmin(renderer) {
  if (!state.user) {
    go('login');
    return;
  }
  if (state.user.role !== 'admin') {
    go('dashboard');
    return;
  }
  renderer();
}

function renderNav() {
  const active = (name) => (state.route.path === name ? 'active' : '');
  const user = state.user;
  const links = [
    `<a class="${active('home')}" href="#home" data-link>Home</a>`,
    `<a class="${active('services')}" href="#services" data-link>Services</a>`,
  ];

  if (user) {
    links.push(`<a class="${active('book')}" href="#book" data-link>Book Appointment</a>`);
    links.push(
      user.role === 'admin'
        ? `<a class="${active('admin')}" href="#admin" data-link>Admin</a>`
        : `<a class="${active('dashboard')}" href="#dashboard" data-link>My Bookings</a>`
    );
    links.push(`<button type="button" data-action="logout">Sign Out</button>`);
  } else {
    links.push(`<a class="${active('login')}" href="#login" data-link>Sign In</a>`);
    links.push(`<a class="${active('register')}" href="#register" data-link>Book Appointment</a>`);
  }

  navLinks.innerHTML = links.join('');
}

function pageHead(title, copy) {
  return `
    <header class="page-head">
      <div class="page-head-inner">
        <p class="eyebrow">Spotlight Salon</p>
        <h1>${escapeHtml(title)}</h1>
        ${copy ? `<p>${escapeHtml(copy)}</p>` : ''}
      </div>
    </header>
  `;
}

function alertBox(type, message) {
  return `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
}

function empty(message) {
  return `<div class="section"><div class="empty">${escapeHtml(message)}</div></div>`;
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

async function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Premium Beauty Studio - Jaipur</p>
        <h1>Beauty crafted for you.</h1>
        <p>Haircuts, facials, nail art, and spa treatments, all bookable online in moments.</p>
        <div class="actions">
          <a class="btn btn-primary" href="#register" data-link>Book an Appointment</a>
          <a class="btn btn-ghost" href="#services" data-link>Explore Services</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="grid grid-3">
        ${[
          ['Expert Stylists', 'Experienced professionals focused on polished, personal results.'],
          ['Premium Products', 'Clean products selected for hair, skin, and nail care.'],
          ['Easy Booking', 'Choose a service, pick your time, and manage appointments online.'],
        ].map(([title, copy]) => `<article class="card"><h3>${title}</h3><p class="muted">${copy}</p></article>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="toolbar">
        <div>
          <p class="eyebrow">Our Treatments</p>
          <h2>Popular services</h2>
        </div>
        <a class="btn btn-secondary" href="#services" data-link>View all services</a>
      </div>
      <div id="featuredServices" class="grid grid-3">${emptyCards(3)}</div>
    </section>
  `;

  try {
    const services = await api('/services');
    document.querySelector('#featuredServices').innerHTML = services.slice(0, 3).map(serviceCard).join('');
  } catch (error) {
    document.querySelector('#featuredServices').innerHTML = alertBox('error', error.message);
  }
}

async function renderServices(category = 'all') {
  app.innerHTML = `
    ${pageHead('Our Services', 'Every treatment is tailored to you. Browse below and book the one that fits your day.')}
    <section class="section">
      <div class="filters">
        ${CATEGORIES.map((cat) => `<button class="pill ${cat === category ? 'active' : ''}" data-action="filter-services" data-category="${cat}">${cat}</button>`).join('')}
      </div>
      <div id="servicesGrid" class="grid grid-3" style="margin-top: 24px">${emptyCards(6)}</div>
    </section>
  `;

  try {
    state.services = await api('/services');
    paintServices(category);
  } catch (error) {
    document.querySelector('#servicesGrid').innerHTML = alertBox('error', error.message);
  }
}

function paintServices(category = 'all') {
  const filtered = category === 'all'
    ? state.services
    : state.services.filter((service) => service.category === category);

  document.querySelector('#servicesGrid').innerHTML = filtered.length
    ? filtered.map(serviceCard).join('')
    : `<div class="empty">No services found in this category.</div>`;

  document.querySelectorAll('[data-action="filter-services"]').forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category);
  });
}

function serviceCard(service) {
  const bookHref = state.user ? `#book?serviceId=${service._id}` : `#login`;
  const imageUrl = serviceImageUrl(service);
  return `
    <article class="service-card">
      <div class="service-image">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(service.name)}" loading="lazy">
      </div>
      <div class="service-body">
        <span class="pill">${escapeHtml(service.category || 'other')}</span>
        <h3 style="margin-top: 12px">${escapeHtml(service.name)}</h3>
        <p class="muted">${escapeHtml(service.description || '')}</p>
        <div class="price-row">
          <div><strong>${money(service.price)}</strong><br><span class="muted">${service.duration} mins</span></div>
          <a class="btn btn-primary" href="${bookHref}" data-link data-book-service="${service._id}">Book Now</a>
        </div>
      </div>
    </article>
  `;
}

function serviceImageUrl(service) {
  if (service.image) return service.image;

  const searchable = `${service.name || ''} ${service.description || ''} ${service.category || ''}`.toLowerCase();
  const match = SERVICE_IMAGE_FALLBACKS.find((fallback) =>
    fallback.match.some((keyword) => searchable.includes(keyword))
  );

  return match?.url || CATEGORY_IMAGE_FALLBACKS[service.category] || CATEGORY_IMAGE_FALLBACKS.other;
}

function emptyCards(count) {
  return Array.from({ length: count }, () => '<article class="card"><p class="muted">Loading...</p></article>').join('');
}

function renderLogin(error = '') {
  if (state.user) {
    go(state.user.role === 'admin' ? 'admin' : 'dashboard');
    return;
  }

  app.innerHTML = `
    <section class="auth-wrap">
      <div class="auth-card">
        <h2>Welcome back</h2>
        <p class="muted">Sign in to manage your appointments.</p>
        <div class="form-panel">
          ${error ? alertBox('error', error) : ''}
          <form data-form="login">
            <div class="field"><label>Email</label><input type="email" name="email" required autofocus></div>
            <div class="field"><label>Password</label><input type="password" name="password" required></div>
            <button class="btn btn-primary" type="submit" style="width: 100%">Sign in</button>
          </form>
          <p class="muted">Demo admin: admin@salon.com / admin123456</p>
        </div>
        <p class="muted">New here? <a href="#register" data-link>Create an account</a></p>
      </div>
    </section>
  `;
}

function renderRegister(error = '') {
  if (state.user) {
    go('dashboard');
    return;
  }

  app.innerHTML = `
    <section class="auth-wrap">
      <div class="auth-card">
        <h2>Create account</h2>
        <p class="muted">Join Spotlight and book your first treatment.</p>
        <div class="form-panel">
          ${error ? alertBox('error', error) : ''}
          <form data-form="register">
            <div class="field"><label>Full name</label><input type="text" name="name" required autofocus></div>
            <div class="field"><label>Email</label><input type="email" name="email" required></div>
            <div class="field"><label>Phone</label><input type="tel" name="phone"></div>
            <div class="field"><label>Password</label><input type="password" name="password" minlength="6" required></div>
            <div class="field"><label>Confirm password</label><input type="password" name="confirm" minlength="6" required></div>
            <button class="btn btn-primary" type="submit" style="width: 100%">Create account</button>
          </form>
        </div>
        <p class="muted">Already have an account? <a href="#login" data-link>Sign in</a></p>
      </div>
    </section>
  `;
}

async function renderBook(error = '') {
  const selectedId = state.route.params.get('serviceId') || '';

  app.innerHTML = `
    ${pageHead('Book an Appointment', 'Pick your service, choose a date and time, then confirm your booking.')}
    <section class="section">
      ${error ? alertBox('error', error) : ''}
      <form class="form-panel booking-steps" data-form="booking">
        <div class="field">
          <label>Service</label>
          <select name="serviceId" id="bookingService" required><option value="">Loading services...</option></select>
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" name="date" id="bookingDate" min="${minDate()}" max="${maxDate()}" required>
        </div>
        <div>
          <label class="muted">Available time slots</label>
          <div class="slots" id="slots"><span class="muted">Choose a service and date.</span></div>
        </div>
        <div class="field">
          <label>Notes</label>
          <textarea name="notes" rows="3" placeholder="Optional requests for your stylist"></textarea>
        </div>
        <div id="bookingSummary" class="selected-summary" style="display:none"></div>
        <button class="btn btn-primary" type="submit">Confirm appointment</button>
      </form>
    </section>
  `;

  try {
    state.services = await api('/services');
    const select = document.querySelector('#bookingService');
    select.innerHTML = `<option value="">Select a service</option>${state.services.map((service) => (
      `<option value="${service._id}" ${service._id === selectedId ? 'selected' : ''}>${escapeHtml(service.name)} - ${money(service.price)} - ${service.duration} mins</option>`
    )).join('')}`;
  } catch (err) {
    app.querySelector('.section').insertAdjacentHTML('afterbegin', alertBox('error', err.message));
  }
}

async function renderDashboard(message = null) {
  app.innerHTML = `
    ${pageHead(`Hello, ${state.user.name.split(' ')[0]}`, 'Manage your appointments and book your next visit.')}
    <section class="section">
      ${message ? alertBox(message.type, message.text) : ''}
      <div class="toolbar">
        <h2>My Appointments</h2>
        <a class="btn btn-primary" href="#book" data-link>Book new appointment</a>
      </div>
      <div class="filters">
        ${['all', ...STATUSES].map((status) => `<button class="pill ${status === 'all' ? 'active' : ''}" data-action="filter-my" data-status="${status}">${status}</button>`).join('')}
      </div>
      <div id="myAppointments" style="margin-top: 22px">${emptyCards(2)}</div>
    </section>
  `;

  try {
    state.appointments = await api('/appointments/my');
    paintMyAppointments('all');
  } catch (error) {
    document.querySelector('#myAppointments').innerHTML = alertBox('error', error.message);
  }
}

function paintMyAppointments(status) {
  const list = status === 'all'
    ? state.appointments
    : state.appointments.filter((appointment) => appointment.status === status);

  document.querySelector('#myAppointments').innerHTML = list.length
    ? list.map(appointmentCard).join('')
    : `<div class="empty">No ${status === 'all' ? '' : status} appointments found.</div>`;

  document.querySelectorAll('[data-action="filter-my"]').forEach((button) => {
    button.classList.toggle('active', button.dataset.status === status);
  });
}

function appointmentCard(appointment) {
  const service = appointment.service || {};
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return `
    <article class="appointment-card">
      <div class="appointment-top">
        <div>
          <h3>${escapeHtml(service.name || 'Salon Service')}</h3>
          <div class="meta-grid">
            <span>Date: ${escapeHtml(appointment.date)}</span>
            <span>Time: ${escapeHtml(appointment.timeSlot)}</span>
            <span>Duration: ${service.duration || 0} mins</span>
            <span>Price: ${money(appointment.pricePaid)}</span>
          </div>
          ${appointment.notes ? `<p class="muted">${escapeHtml(appointment.notes)}</p>` : ''}
        </div>
        <div>
          <span class="badge badge-${appointment.status}">${escapeHtml(appointment.status)}</span>
          ${canCancel ? `<button class="btn btn-danger" type="button" data-action="cancel-appointment" data-id="${appointment._id}" style="margin-top: 10px">Cancel</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function renderAdmin(message = null) {
  const tab = state.route.params.get('tab') || 'appointments';

  app.innerHTML = `
    ${pageHead('Admin Dashboard', 'Review bookings, update statuses, and manage the service menu.')}
    <section class="section">
      ${message ? alertBox(message.type, message.text) : ''}
      <div id="adminStats" class="stats">${emptyCards(4)}</div>
      <div class="tabs">
        <a class="pill ${tab === 'appointments' ? 'active' : ''}" href="#admin?tab=appointments" data-link>Appointments</a>
        <a class="pill ${tab === 'services' ? 'active' : ''}" href="#admin?tab=services" data-link>Services</a>
      </div>
      <div id="adminPanel" style="margin-top: 22px">${emptyCards(2)}</div>
    </section>
  `;

  try {
    const [appointments, services] = await Promise.all([
      api('/appointments/admin/all'),
      api('/services/all'),
    ]);
    state.adminAppointments = appointments;
    state.adminServices = services;
    paintAdminStats();
    tab === 'services' ? paintAdminServices() : paintAdminAppointments();
  } catch (error) {
    document.querySelector('#adminPanel').innerHTML = alertBox('error', error.message);
  }
}

function paintAdminStats() {
  const appointments = state.adminAppointments;
  const revenue = appointments
    .filter((appointment) => appointment.status !== 'cancelled')
    .reduce((sum, appointment) => sum + Number(appointment.pricePaid || 0), 0);

  document.querySelector('#adminStats').innerHTML = [
    ['Total bookings', appointments.length],
    ['Pending', appointments.filter((appointment) => appointment.status === 'pending').length],
    ['Confirmed', appointments.filter((appointment) => appointment.status === 'confirmed').length],
    ['Revenue', money(revenue)],
  ].map(([label, value]) => `<article class="card stat"><span class="muted">${label}</span><strong>${value}</strong></article>`).join('');
}

function paintAdminAppointments() {
  document.querySelector('#adminPanel').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${state.adminAppointments.map((appointment) => `
            <tr>
              <td><strong>${escapeHtml(appointment.user?.name || '')}</strong><br><span class="muted">${escapeHtml(appointment.user?.email || '')}</span></td>
              <td>${escapeHtml(appointment.service?.name || '')}</td>
              <td>${escapeHtml(appointment.date)}</td>
              <td>${escapeHtml(appointment.timeSlot)}</td>
              <td>${money(appointment.pricePaid)}</td>
              <td><span class="badge badge-${appointment.status}">${escapeHtml(appointment.status)}</span></td>
              <td>
                <select data-action="admin-status" data-id="${appointment._id}">
                  ${STATUSES.map((status) => `<option value="${status}" ${status === appointment.status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function paintAdminServices() {
  document.querySelector('#adminPanel').innerHTML = `
    <div class="toolbar">
      <p class="muted">${state.adminServices.length} services</p>
      <button class="btn btn-primary" type="button" data-action="open-service-modal">Add service</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Duration</th><th>Available</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.adminServices.map((service) => `
            <tr>
              <td><strong>${escapeHtml(service.name)}</strong></td>
              <td>${escapeHtml(service.category)}</td>
              <td>${money(service.price)}</td>
              <td>${service.duration} mins</td>
              <td>${service.isAvailable ? 'Yes' : 'No'}</td>
              <td>
                <button class="btn btn-secondary" type="button" data-action="open-service-modal" data-id="${service._id}">Edit</button>
                <button class="btn btn-danger" type="button" data-action="delete-service" data-id="${service._id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function serviceModal(service = null) {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="toolbar">
          <h2>${service ? 'Edit Service' : 'Add Service'}</h2>
          <button class="btn btn-secondary" type="button" data-action="close-modal">Close</button>
        </div>
        <form data-form="service" data-id="${service?._id || ''}">
          <div class="field"><label>Name</label><input name="name" value="${escapeHtml(service?.name || '')}" required></div>
          <div class="field"><label>Price</label><input name="price" type="number" min="0" value="${service?.price || ''}" required></div>
          <div class="field"><label>Duration minutes</label><input name="duration" type="number" min="15" value="${service?.duration || ''}" required></div>
          <div class="field"><label>Category</label><select name="category">${CATEGORIES.filter((cat) => cat !== 'all').map((cat) => `<option value="${cat}" ${service?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></div>
          <div class="field"><label>Image URL</label><input name="image" type="url" value="${escapeHtml(service?.image || '')}"></div>
          <div class="field"><label>Description</label><textarea name="description" rows="3" required>${escapeHtml(service?.description || '')}</textarea></div>
          <label><input type="checkbox" name="isAvailable" ${service?.isAvailable === false ? '' : 'checked'}> Available for booking</label>
          <div class="actions"><button class="btn btn-primary" type="submit">Save service</button></div>
        </form>
      </div>
    </div>
  `);
}

async function handleSubmit(event) {
  const form = event.target;
  const type = form.dataset.form;
  if (!type) return;

  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    if (type === 'login') {
      const user = await api('/auth/login', { method: 'POST', body: JSON.stringify(data) });
      saveUser(user);
      go(user.role === 'admin' ? 'admin' : 'dashboard');
    }

    if (type === 'register') {
      if (data.password !== data.confirm) throw new Error('Passwords do not match');
      const user = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password }),
      });
      saveUser(user);
      go('dashboard');
    }

    if (type === 'booking') {
      const selectedSlot = document.querySelector('[data-slot].active')?.dataset.slot;
      if (!selectedSlot) throw new Error('Please choose a time slot');

      await api('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: data.serviceId,
          date: data.date,
          timeSlot: selectedSlot,
          notes: data.notes,
        }),
      });
      renderDashboard({ type: 'success', text: 'Appointment booked.' });
    }

    if (type === 'service') {
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        category: data.category,
        image: data.image,
        isAvailable: form.elements.isAvailable.checked,
      };
      const id = form.dataset.id;
      await api(id ? `/services/${id}` : '/services', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      closeModal();
      renderAdmin({ type: 'success', text: 'Service saved.' });
    }
  } catch (error) {
    if (type === 'login') renderLogin(error.message);
    else if (type === 'register') renderRegister(error.message);
    else if (type === 'booking') renderBook(error.message);
    else alert(error.message);
  }
}

async function handleClick(event) {
  const target = event.target.closest('[data-action], [data-slot]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'logout') logout();
  if (action === 'filter-services') paintServices(target.dataset.category);
  if (action === 'filter-my') paintMyAppointments(target.dataset.status);

  if (target.dataset.slot) {
    document.querySelectorAll('[data-slot]').forEach((button) => button.classList.remove('active'));
    target.classList.add('active');
    updateBookingSummary();
  }

  if (action === 'cancel-appointment') {
    if (!window.confirm('Cancel this appointment?')) return;
    await api(`/appointments/${target.dataset.id}/cancel`, { method: 'PUT' });
    renderDashboard({ type: 'success', text: 'Appointment cancelled.' });
  }

  if (action === 'open-service-modal') {
    const service = state.adminServices.find((item) => item._id === target.dataset.id) || null;
    serviceModal(service);
  }

  if (
    action === 'close-modal' &&
    (event.target.classList.contains('modal-backdrop') || event.target.tagName === 'BUTTON')
  ) {
    closeModal();
  }

  if (action === 'delete-service') {
    if (!window.confirm('Delete this service?')) return;
    await api(`/services/${target.dataset.id}`, { method: 'DELETE' });
    renderAdmin({ type: 'success', text: 'Service deleted.' });
  }
}

async function handleChange(event) {
  const target = event.target;

  if (target.id === 'bookingService' || target.id === 'bookingDate') {
    await loadSlots();
    updateBookingSummary();
  }

  if (target.dataset.action === 'admin-status') {
    await api(`/appointments/admin/${target.dataset.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: target.value }),
    });
    renderAdmin({ type: 'success', text: 'Appointment status updated.' });
  }
}

async function loadSlots() {
  const serviceId = document.querySelector('#bookingService')?.value;
  const date = document.querySelector('#bookingDate')?.value;
  const slotsEl = document.querySelector('#slots');

  if (!serviceId || !date || !slotsEl) {
    if (slotsEl) slotsEl.innerHTML = '<span class="muted">Choose a service and date.</span>';
    return;
  }

  slotsEl.innerHTML = '<span class="muted">Checking availability...</span>';

  try {
    const data = await api(`/appointments/slots?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`);
    slotsEl.innerHTML = data.slots.length
      ? data.slots.map((slot) => `<button class="pill" type="button" data-slot="${slot}">${slot}</button>`).join('')
      : '<span class="muted">No slots available for this date.</span>';
  } catch (error) {
    slotsEl.innerHTML = alertBox('error', error.message);
  }
}

function updateBookingSummary() {
  const serviceId = document.querySelector('#bookingService')?.value;
  const date = document.querySelector('#bookingDate')?.value;
  const slot = document.querySelector('[data-slot].active')?.dataset.slot;
  const summary = document.querySelector('#bookingSummary');

  if (!summary) return;
  const service = state.services.find((item) => item._id === serviceId);

  if (!service || !date || !slot) {
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'grid';
  summary.innerHTML = `
    <strong>Confirming: ${escapeHtml(service.name)}</strong>
    <span>${escapeHtml(date)} at ${escapeHtml(slot)}</span>
    <span>${service.duration} mins - ${money(service.price)}</span>
  `;
}

function closeModal() {
  document.querySelector('.modal-backdrop')?.remove();
}

function minDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function maxDate() {
  const date = new Date();
  date.setDate(date.getDate() + 60);
  return date.toISOString().slice(0, 10);
}
