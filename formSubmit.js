import { reloadImages } from './imageFix.js';
import sponsorCampaigns from './sponsorCampaigns.js';

window.sponsorCampaigns = sponsorCampaigns;
window.submittedCampaigns = new Set();

const sponsorOptinText = `spaaractief_ja directdeals_ja qliqs_ja outspot_ja onlineacties_ja aownu_ja betervrouw_ja ipay_ja cashbackkorting_ja cashhier_ja myclics_ja seniorenvoordeelpas_ja favorieteacties_ja spaaronline_ja cashbackacties_ja woolsocks_ja dealdonkey_ja centmail_ja`;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('accept-sponsors-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      localStorage.setItem('sponsor_optin', sponsorOptinText);
    });
  }

  const day = document.getElementById("dob-day");
  const month = document.getElementById("dob-month");
  const year = document.getElementById("dob-year");

  if (day) {
    day.addEventListener("input", () => {
      if (day.value.length === 2 || parseInt(day.value[0], 10) >= 4) month.focus();
    });
  }

  if (month) {
    month.addEventListener("input", () => {
      if (month.value.length === 2 || parseInt(month.value[0], 10) >= 2) year.focus();
    });
  }
});

export function buildPayload(campaign, options = { includeSponsors: true }) {
  const urlParams = new URLSearchParams(window.location.search);
  const t_id = urlParams.get("t_id") || crypto.randomUUID();

  const dob_day = localStorage.getItem('dob_day');
  const dob_month = localStorage.getItem('dob_month');
  const dob_year = localStorage.getItem('dob_year');
  const dob_iso = dob_year && dob_month && dob_day
    ? `${dob_year.padStart(4, '0')}-${dob_month.padStart(2, '0')}-${dob_day.padStart(2, '0')}`
    : '';

  const payload = {
    cid: campaign.cid,
    sid: campaign.sid,
    gender: localStorage.getItem('gender'),
    firstname: localStorage.getItem('firstname'),
    lastname: localStorage.getItem('lastname'),
    email: localStorage.getItem('email'),
    dob_day,
    dob_month,
    dob_year,
    f_5_dob: dob_iso,
    t_id,
    postcode: localStorage.getItem('postcode') || '',
    straat: localStorage.getItem('straat') || '',
    huisnummer: localStorage.getItem('huisnummer') || '',
    woonplaats: localStorage.getItem('woonplaats') || '',
    telefoon: localStorage.getItem('telefoon') || '',
    campaignId: Object.keys(sponsorCampaigns).find(key => sponsorCampaigns[key].cid === campaign.cid)
  };

  if (campaign.coregAnswerKey) {
    payload.f_2014_coreg_answer = localStorage.getItem(campaign.coregAnswerKey) || '';
  }

  payload.f_1453_campagne_url = window.location.origin + window.location.pathname;

  if (campaign.cid === 925 && options.includeSponsors) {
    const optin = localStorage.getItem('sponsor_optin');
    if (optin) {
      payload.f_2047_EM_CO_sponsors = optin;
    }
  }

  return payload;
}
window.buildPayload = buildPayload;

export function fetchLead(payload) {
  const key = `${payload.cid}_${payload.sid}`;
  if (window.submittedCampaigns.has(key)) {
    console.warn("⛔️ fetchLead overgeslagen → al verzonden:", key);
    return Promise.resolve({ skipped: true });
  }

  window.submittedCampaigns.add(key);

  return fetch('https://template5-1.vercel.app/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Lead verzonden:", data);
      return data;
    })
    .catch(err => {
      console.error("❌ Verzendfout:", err);
      throw err;
    });
}
window.fetchLead = fetchLead;

export function validateLongForm(form) {
  let valid = true;
  let messages = [];

  const fields = ['postcode', 'straat', 'huisnummer', 'woonplaats', 'telefoon'];
  const maxPhone = 11;

  fields.forEach(id => {
    const val = form.querySelector(`#${id}`)?.value.trim();
    if (!val) messages.push(id);
    if (id === 'telefoon' && val && val.length > maxPhone) {
      messages.push('Telefoonnummer mag max. 11 tekens bevatten');
    }
  });

  if (messages.length > 0) {
    alert('Vul aub alle velden correct in:\n' + messages.join('\n'));
    valid = false;
  }

  return valid;
}

export function setupFormSubmit() {
  const btn = document.getElementById('submit-long-form');
  const section = document.getElementById('long-form-section');
  if (!btn || !section) return;

  btn.addEventListener('click', () => {
    const form = section.querySelector('form');
    if (!validateLongForm(form)) return;

    ['postcode', 'straat', 'huisnummer', 'woonplaats', 'telefoon'].forEach(id => {
      const val = document.getElementById(id)?.value.trim();
      if (val) localStorage.setItem(id, val);
    });

    if (Array.isArray(window.longFormCampaigns)) {
      window.longFormCampaigns.forEach(campaign => {
        const payload = buildPayload(campaign);
        fetchLead(payload);
      });
    }

    section.style.display = 'none';
    const steps = Array.from(document.querySelectorAll('.flow-section, .coreg-section'));
    const idx = steps.findIndex(s => s.id === 'long-form-section');
    const next = steps[idx + 1];

    if (next) {
      next.classList.remove('hide-on-live');
      next.style.removeProperty('display');
      reloadImages(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
