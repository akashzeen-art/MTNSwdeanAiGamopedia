const SERVICE_ID = '1000';
const CHECK_STATUS_URL = '/api/checkstatus';
const SUBSCRIPTION_INFO_URL = '/api/subscriptioninfo';

function tr(key) { return typeof window.t === 'function' ? window.t(key) : key; }

function formatDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function showError(msg) {
  const el = document.getElementById('account_error');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError() {
  document.getElementById('account_error').style.display = 'none';
}

function renderProfile(msisdn, info) {
  document.getElementById('profile_msisdn').textContent = '+249' + msisdn;

  const isActive = info?.response === 'ACTIVE';
  const statusEl = document.getElementById('profile_status');
  statusEl.textContent = isActive ? tr('accountActive') : tr('accountInactive');
  statusEl.style.color = isActive ? '#22c55e' : '#f97316';

  document.getElementById('profile_price').textContent = info?.pricePoint ? info.pricePoint + ' SDG' : '-';
  document.getElementById('profile_validity').textContent = info?.validity ? info.validity + ' ' + tr('accountDay') : '-';
  document.getElementById('profile_actdate').textContent = formatDate(info?.actDate);
  document.getElementById('profile_renewdate').textContent = formatDate(info?.renewDate);

  document.getElementById('account-login').style.display = 'none';
  document.getElementById('account-profile').style.display = 'flex';
}

async function loadProfile(msisdn) {
  try {
    const res = await fetch(`${SUBSCRIPTION_INFO_URL}?serviceid=${SERVICE_ID}&msisdn=249${msisdn}`);
    const info = await res.json();
    renderProfile(msisdn, info);
  } catch {
    renderProfile(msisdn, null);
  }
}

async function doLogin() {
  const input = document.getElementById('account_msisdn').value.trim();
  if (!/^\d{9}$/.test(input)) { showError(tr('popupErrInvalid')); return; }
  hideError();

  const btn = document.getElementById('account_login_btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(`${CHECK_STATUS_URL}?serviceid=${SERVICE_ID}&msisdn=249${input}`);
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = tr('accountCheckBtn');

    if (data.status !== 'success') { showError(tr('popupErrGeneric')); return; }
    if (!data.serviceExists) { showError(tr('popupErrUnavailable')); return; }

    localStorage.setItem('aigamopedia_msisdn', input);
    await loadProfile(input);
  } catch {
    btn.disabled = false;
    btn.textContent = tr('accountCheckBtn');
    showError(tr('popupErrGeneric'));
  }
}

function init() {
  // Auto-load if already logged in
  const saved = localStorage.getItem('aigamopedia_msisdn');
  if (saved) { loadProfile(saved); return; }

  // Login button
  document.getElementById('account_login_btn')?.addEventListener('click', doLogin);

  // Enter key on input
  document.getElementById('account_msisdn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // Logout
  document.getElementById('account_logout_btn')?.addEventListener('click', () => {
    localStorage.removeItem('aigamopedia_msisdn');
    document.getElementById('account-profile').style.display = 'none';
    document.getElementById('account-login').style.display = 'flex';
    document.getElementById('account_msisdn').value = '';
    hideError();
    // Re-attach login listener after showing login view
    document.getElementById('account_login_btn')?.addEventListener('click', doLogin);
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
