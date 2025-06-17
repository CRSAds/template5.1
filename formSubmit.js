import { reloadImages } from './imageFix.js';
import sponsorCampaigns from './sponsorCampaigns.js';

window.sponsorCampaigns = sponsorCampaigns;
window.submittedCampaigns = new Set();

// ✅ Sponsoroptin registratie bij akkoord-button
const sponsorOptinText = `spaaractief_ja directdeals_ja qliqs_ja outspot_ja onlineacties_ja aownu_ja betervrouw_ja ipay_ja cashbackkorting_ja cashhier_ja myclics_ja seniorenvoordeelpas_ja favorieteacties_ja spaaronline_ja cashbackacties_ja woolsocks_ja dealdonkey_ja centmail_ja`;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('accept-sponsors-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      sessionStorage.setItem('sponsor_optin', sponsorOptinText);
    });
  }

  // ✅ Autofocus geboortedatum (hersteld)
  const day = document.getElementById("dob-day");
  const month = document.getElementById("dob-month");
  const year = document.getElementById("dob-year");

  if (day) {
    day.addEventListener("input", () => {
      const val = day.value;
      if (val.length === 2 || parseInt(val[0], 10) >= 4) {
        month.focus();
      }
    });
  }

  if (month) {
    month.addEventListener("input", () => {
      const val = month.value;
      if (val.length === 2 || parseInt(val[0], 10) >= 2) {
        year.focus();
      }
    });
  }
});

export function buildPayload(campaign, options = { includeSponsors: true }) {
  const urlParams = new URLSearchParams(window.location.search);
  const t_id = urlParams.get("t_id") || crypto.randomUUID();

  const dob_day = sessionStorage.getItem('dob_day');
  const dob_month = sessionStorage.getItem('dob_month');
  const dob_year = sessionStorage.getItem('dob_year');
  const dob_iso = dob_year && dob_month && dob_day
    ? `${dob_year.padStart(4, '0')}-${dob_month.padStart(2, '0')}-${dob_day.padStart(2, '0')}`
    : '';

  const payload = {
    cid: campaign.cid,
    sid: campaign.sid,
    gender: sessionStorage.getItem('gender'),
    firstname: sessionStorage.getItem('firstname'),
    lastname: sessionStorage.getItem('lastname'),
    email: sessionStorage.getItem('email'),
    dob_day,
    dob_month,
    dob_year,
    f_5_dob: dob_iso,
    t_id,
    postcode: sessionStorage.getItem('postcode') || '',
    straat: sessionStorage.getItem('straat') || '',
    huisnummer: sessionStorage.getItem('huisnummer') || '',
    woonplaats: sessionStorage.getItem('woonplaats') || '',
    telefoon: sessionStorage.getItem('telefoon') || '',
    campaignId: Object.keys(sponsorCampaigns).find(key => sponsorCampaigns[key].cid === campaign.cid)
  };

  if (campaign.coregAnswerKey) {
    payload.f_2014_coreg_answer = sessionStorage.getItem(campaign.coregAnswerKey) || '';
  }

  payload.f_1453_campagne_url = window.location.origin + window.location.pathname;

  if (campaign.cid === 925 && options.includeSponsors) {
    const optin = sessionStorage.getItem('sponsor_optin');
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

      // ✅ Facebook Pixel tracking indien van toepassing
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('utm_source') === 'facebook' && typeof fbq === 'function') {
          fbq('track', 'Lead');
        }
      } catch (e) {
        console.warn("⚠️ Facebook pixel niet beschikbaar of fout:", e);
      }

      return data;
    })
    .catch(err => {
      console.error("❌ Verzendfout:", err);
      throw err;
    });
}
window.fetchLead = fetchLead;

// ✅ Validatie long form
export function validateLongForm(form) {
  let valid = true;
  let messages = [];

  const postcode = form.querySelector('#postcode')?.value.trim();
  const straat = form.querySelector('#straat')?.value.trim();
  const huisnummer = form.querySelector('#huisnummer')?.value.trim();
  const woonplaats = form.querySelector('#woonplaats')?.value.trim();
  const telefoon = form.querySelector('#telefoon')?.value.trim();

  if (!postcode) messages.push('Postcode invullen');
  if (!straat) messages.push('Straat invullen');
  if (!huisnummer) messages.push('Huisnummer invullen');
  if (!woonplaats) messages.push('Woonplaats invullen');
  if (!telefoon) messages.push('Telefoonnummer invullen');
  else if (telefoon.length > 11) messages.push('Telefoonnummer mag max. 11 tekens bevatten');

  if (messages.length > 0) {
    alert('Vul aub alle velden correct in:\n' + messages.join('\n'));
    valid = false;
  }

  return valid;
}

export default function setupFormSubmit() {
  const btn = document.getElementById('submit-long-form');
  const section = document.getElementById('long-form-section');
  if (!btn || !section) return;

  btn.addEventListener('click', () => {
    const form = section.querySelector('form');
    if (!validateLongForm(form)) return;

    const extraData = {
      postcode: document.getElementById('postcode')?.value.trim(),
      straat: document.getElementById('straat')?.value.trim(),
      huisnummer: document.getElementById('huisnummer')?.value.trim(),
      woonplaats: document.getElementById('woonplaats')?.value.trim(),
      telefoon: document.getElementById('telefoon')?.value.trim()
    };

    for (const [key, value] of Object.entries(extraData)) {
      sessionStorage.setItem(key, value);
    }

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
