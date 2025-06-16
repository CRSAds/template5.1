import { reloadImages } from './imageFix.js';
import { fetchLead, buildPayload } from './formSubmit.js';
import sponsorCampaigns from './sponsorCampaigns.js';
import setupSovendus from './setupSovendus.js';
import { fireFacebookLeadEventIfNeeded } from './facebookpixel.js';

let hasSubmittedShortForm = false;
window.longFormCampaigns = [];

function validateForm(form) {
  let valid = true;
  let messages = [];

  if (form.id === 'lead-form') {
    const gender = form.querySelector('input[name="gender"]:checked');
    const firstname = form.querySelector('#firstname')?.value.trim();
    const lastname = form.querySelector('#lastname')?.value.trim();
    const dob_day = form.querySelector('#dob-day')?.value.trim();
    const dob_month = form.querySelector('#dob-month')?.value.trim();
    const dob_year = form.querySelector('#dob-year')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();

    if (!gender) messages.push('Geslacht invullen');
    if (!firstname) messages.push('Voornaam invullen');
    if (!lastname) messages.push('Achternaam invullen');
    if (!dob_day || !dob_month || !dob_year) messages.push('Geboortedatum invullen');
    if (!email || !email.includes('@') || !email.includes('.')) {
      messages.push('Geldig e-mailadres invullen');
    }

    valid = messages.length === 0;
  }

  if (!valid) {
    alert('Vul aub alle velden correct in:\n' + messages.join('\n'));
  }

  return valid;
}

export default function initFlow() {
  const steps = Array.from(document.querySelectorAll('.flow-section, .coreg-section'));
  const longFormSection = document.getElementById('long-form-section');

  // Initialisatie
  steps.forEach((el, i) => {
    el.style.display = i === 0 ? 'block' : 'none';
  });

  if (longFormSection) {
    longFormSection.style.display = 'none';
    longFormSection.setAttribute('data-displayed', 'false');
  }

  // Eventlisteners voor flow stappen
  steps.forEach((step, index) => {
    step.querySelectorAll('.flow-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const skipNext = btn.classList.contains('skip-next-section');
        const campaignId = step.id?.startsWith('campaign-') ? step.id : null;
        const campaign = sponsorCampaigns[campaignId];

        if (campaign?.coregAnswerKey && btn.classList.contains('sponsor-next')) {
          localStorage.setItem(campaign.coregAnswerKey, btn.innerText.trim());
        }

        if (step.id === 'voorwaarden-section' && !btn.id) {
          localStorage.removeItem('sponsor_optin');
        }

        const form = step.querySelector('form');
        const isShortForm = form?.id === 'lead-form';

        if (form && !validateForm(form)) return;

        if (form) {
          const gender = form.querySelector('input[name="gender"]:checked')?.value || '';
          const firstname = form.querySelector('#firstname')?.value.trim() || '';
          const lastname = form.querySelector('#lastname')?.value.trim() || '';
          const dob_day = form.querySelector('#dob-day')?.value || '';
          const dob_month = form.querySelector('#dob-month')?.value || '';
          const dob_year = form.querySelector('#dob-year')?.value || '';
          const email = form.querySelector('#email')?.value.trim() || '';
          const urlParams = new URLSearchParams(window.location.search);
          const t_id = urlParams.get('t_id') || crypto.randomUUID();

          localStorage.setItem('gender', gender);
          localStorage.setItem('firstname', firstname);
          localStorage.setItem('lastname', lastname);
          localStorage.setItem('dob_day', dob_day);
          localStorage.setItem('dob_month', dob_month);
          localStorage.setItem('dob_year', dob_year);
          localStorage.setItem('email', email);
          localStorage.setItem('t_id', t_id);

          if (isShortForm && !hasSubmittedShortForm) {
            hasSubmittedShortForm = true;
            const payload = buildPayload(sponsorCampaigns["campaign-leadsnl"]);

            fetchLead(payload).then(() => {
              fireFacebookLeadEventIfNeeded();
              step.style.display = 'none';
              const next = skipNext ? steps[index + 2] : steps[index + 1];
              if (next) {
                next.style.display = 'block';
                if (next.id === 'sovendus-section') setupSovendus();
                reloadImages(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            });

            return;
          }
        }

        step.style.display = 'none';
        const next = skipNext ? steps[index + 2] : steps[index + 1];
        if (next) {
          next.style.display = 'block';
          if (next.id === 'sovendus-section') setupSovendus();
          reloadImages(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Sponsor JA/NEE clicks
    step.querySelectorAll('.sponsor-optin').forEach(button => {
      button.addEventListener('click', () => {
        const campaignId = button.id;
        const campaign = sponsorCampaigns[campaignId];
        if (!campaign) return;

        const answer = button.innerText.trim().toLowerCase();
        const isPositive = ['ja', 'yes', 'akkoord'].includes(answer);
        const requiresLongForm = String(campaign.requiresLongForm).toLowerCase() === 'true';

        if (campaign.coregAnswerKey) {
          localStorage.setItem(campaign.coregAnswerKey, answer);
        }

   if (requiresLongForm) {
  if (isPositive) {
    // Uitstel tot long form wordt ingevuld
    if (!window.longFormCampaigns.find(c => c.cid === campaign.cid)) {
      window.longFormCampaigns.push(campaign);
      console.log('⏳ Long form vereist → lead uitgesteld:', campaignId);
    }
  } else {
    // Negatief antwoord → geen long form → direct versturen
    const payload = buildPayload(campaign);
    fetchLead(payload);
    console.log('🚀 Lead direct verzonden (NEE bij long form):', campaignId);
  }
} else {
  // Gewone campagne → direct versturen
  const payload = buildPayload(campaign);
  fetchLead(payload);
  console.log('🚀 Lead direct verzonden:', campaignId);
}

        step.style.display = 'none';
        const next = steps[index + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  });
}
