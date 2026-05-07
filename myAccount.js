const SERVICE_ID = '1000';
const CHECK_STATUS_URL = '/api/checkstatus';

const loginView = document.getElementById('account-login');
const profileView = document.getElementById('account-profile');
const profileMsisdn = document.getElementById('profile_msisdn');
const profileStatus = document.getElementById('profile_status');
const errorEl = document.getElementById('account_error');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}

function hideError() {
  errorEl.style.display = 'none';
}

function showProfile(msisdn, subscribed) {
  profileMsisdn.textContent = '+249' + msisdn;
  profileStatus.textContent = subscribed
    ? (typeof window.t === 'function' ? window.t('accountActive') : 'Active ✓')
    : (typeof window.t === 'function' ? window.t('accountInactive') : 'Not Subscribed');
  profileStatus.style.color = subscribed ? '#22c55e' : '#f97316';
  loginView.style.display = 'none';
  profileView.style.display = 'flex';
}

// Check localStorage on load
const saved = localStorage.getItem('aigamopedia_msisdn');
if (saved) {
  fetch(`${CHECK_STATUS_URL}?serviceid=${SERVICE_ID}&msisdn=249${saved}`)
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success' && data.serviceExists) {
        showProfile(saved, data.subscribed);
      } else {
        localStorage.removeItem('aigamopedia_msisdn');
      }
    })
    .catch(() => localStorage.removeItem('aigamopedia_msisdn'));
}

// Login button
document.getElementById('account_login_btn')?.addEventListener('click', async () => {
  const input = document.getElementById('account_msisdn').value.trim();
  if (!/^\d{9}$/.test(input)) {
    showError(typeof window.t === 'function' ? window.t('popupErrInvalid') : 'Please enter a valid 9-digit number');
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
    btn.textContent = typeof window.t === 'function' ? window.t('accountCheckBtn') : 'Check Status';

    if (data.status !== 'success') {
      showError(typeof window.t === 'function' ? window.t('popupErrGeneric') : 'Something went wrong.');
      return;
    }
    if (!data.serviceExists) {
      showError(typeof window.t === 'function' ? window.t('popupErrUnavailable') : 'Service unavailable.');
      return;
    }
    localStorage.setItem('aigamopedia_msisdn', input);
    showProfile(input, data.subscribed);
  } catch {
    btn.disabled = false;
    btn.textContent = typeof window.t === 'function' ? window.t('accountCheckBtn') : 'Check Status';
    showError(typeof window.t === 'function' ? window.t('popupErrGeneric') : 'Something went wrong.');
  }
});

// Logout button
document.getElementById('account_logout_btn')?.addEventListener('click', () => {
  localStorage.removeItem('aigamopedia_msisdn');
  profileView.style.display = 'none';
  loginView.style.display = 'flex';
  document.getElementById('account_msisdn').value = '';
  hideError();
});
