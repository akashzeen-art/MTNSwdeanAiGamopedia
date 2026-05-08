const SERVICE_ID = '1000';
const CHECK_STATUS_URL = '/api/checkstatus';
const SUBSCRIPTION_INFO_URL = '/api/subscriptioninfo';

const loginView = document.getElementById('account-login');
const profileView = document.getElementById('account-profile');
const profileMsisdn = document.getElementById('profile_msisdn');
const profileStatus = document.getElementById('profile_status');
const errorEl = document.getElementById('account_error');

function t(key) { return typeof window.t === 'function' ? window.t(key) : key; }

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}
function hideError() { errorEl.style.display = 'none'; }

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function showProfile(msisdn, info) {
  profileMsisdn.textContent = '+249' + msisdn;

  const isActive = info?.response === 'ACTIVE';
  profileStatus.textContent = isActive ? t('accountActive') : t('accountInactive');
  profileStatus.style.color = isActive ? '#22c55e' : '#f97316';

  document.getElementById('profile_price').textContent = info?.pricePoint ? info.pricePoint + ' SDG' : '-';
  document.getElementById('profile_validity').textContent = info?.validity ? info.validity + ' ' + t('accountDay') : '-';
  document.getElementById('profile_actdate').textContent = formatDate(info?.actDate);
  document.getElementById('profile_renewdate').textContent = formatDate(info?.renewDate);

  loginView.style.display = 'none';
  profileView.style.display = 'flex';
}

async function loadProfile(msisdn) {
  try {
    const res = await fetch(`${SUBSCRIPTION_INFO_URL}?serviceid=${SERVICE_ID}&msisdn=249${msisdn}`);
    const info = await res.json();
    showProfile(msisdn, info);
  } catch {
    showProfile(msisdn, null);
  }
}

// Auto-login if saved
const saved = localStorage.getItem('aigamopedia_msisdn');
if (saved) loadProfile(saved);

// Login button
document.getElementById('account_login_btn')?.addEventListener('click', async () => {
  const input = document.getElementById('account_msisdn').value.trim();
  if (!/^\d{9}$/.test(input)) {
    showError(t('popupErrInvalid'));
    return;
  }
  hideError();
  const btn = document.getElementById('account_login_btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(`${CHECK_STATUS_URL}?serviceid=${SERVICE_ID}&msisdn=249${input}`);
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = t('accountCheckBtn');

    if (data.status !== 'success') { showError(t('popupErrGeneric')); return; }
    if (!data.serviceExists) { showError(t('popupErrUnavailable')); return; }

    localStorage.setItem('aigamopedia_msisdn', input);
    await loadProfile(input);
  } catch {
    btn.disabled = false;
    btn.textContent = t('accountCheckBtn');
    showError(t('popupErrGeneric'));
  }
});

// Logout
document.getElementById('account_logout_btn')?.addEventListener('click', () => {
  localStorage.removeItem('aigamopedia_msisdn');
  profileView.style.display = 'none';
  loginView.style.display = 'flex';
  document.getElementById('account_msisdn').value = '';
  hideError();
});
