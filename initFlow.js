
import { reloadImages } from './imageFix.js';
import { fetchLead, buildPayload } from './formSubmit.js';
import sponsorCampaigns from './sponsorCampaigns.js';
import setupSovendus from './setupSovendus.js';
import { fireFacebookLeadEventIfNeeded } from './facebookpixel.js';

const longFormCampaigns = [];
window.longFormCampaigns = longFormCampaigns;
let hasSubmittedShortForm = false;

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

  if (form.id === 'long-form') {
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

    valid = messages.length === 0;
  }

  if (!valid) {
    alert('Vul aub alle velden correct in:\n' + messages.join('\n'));
  }

  return valid;
}

export default function initFlow() {
  const longFormSection = document.getElementById('long-form-section');
  if (longFormSection) {
    longFormSection.style.display = 'none';
    longFormSection.setAttribute('data-displayed', 'false');
  }

  const steps = Array.from(document.querySelectorAll('.flow-section, .coreg-section'));
  longFormCampaigns.length = 0;

  if (!window.location.hostname.includes("swipepages.com")) {
    steps.forEach((el, i) => el.style.display = i === 0 ? 'block' : 'none');
    document.querySelectorAll('.hide-on-live, #long-form-section').forEach(el => {
      el.style.display = 'none';
    });
  }

  steps.forEach((step, stepIndex) => {
    step.querySelectorAll('.flow-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const skipNext = btn.classList.contains('skip-next-section');
        const form = step.querySelector('form');
        const isShortForm = form?.id === 'lead-form';

        if (form && !validateForm(form)) return;

        if (form && isShortForm && !hasSubmittedShortForm) {
          hasSubmittedShortForm = true;

          const fields = ['gender', 'firstname', 'lastname', 'dob_day', 'dob_month', 'dob_year', 'email'];
          fields.forEach(f => {
            const el = form.querySelector(`#${f}`) || form.querySelector(`input[name="${f}"]:checked`);
            if (el) sessionStorage.setItem(f, el.value.trim());
          });

          const urlParams = new URLSearchParams(window.location.search);
          const t_id = urlParams.get('t_id') || crypto.randomUUID();
          sessionStorage.setItem('t_id', t_id);

          const payload = buildPayload(sponsorCampaigns["campaign-leadsnl"]);
          fetchLead(payload).then(() => {
            fireFacebookLeadEventIfNeeded();
            step.style.display = 'none';
            const next = skipNext ? steps[stepIndex + 2] : steps[stepIndex + 1];
            if (next) {
              next.style.display = 'block';
              reloadImages(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          });

          return;
        }

        step.style.display = 'none';
        const next = skipNext ? steps[stepIndex + 2] : steps[stepIndex + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    step.querySelectorAll('.sponsor-optin').forEach(button => {
      button.addEventListener('click', () => {
        const campaignId = button.id;
        const campaign = sponsorCampaigns[campaignId];
        if (!campaign) return;

        const answer = button.innerText.trim().toLowerCase();
        const isPositive = ['ja', 'yes', 'akkoord'].some(kw => answer.includes(kw));
        sessionStorage.setItem(campaign.coregAnswerKey, answer);

        console.log('📮 Antwoord:', { campaignId, answer, isPositive, requiresLongForm: campaign.requiresLongForm });

        if (campaign.requiresLongForm) {
          sessionStorage.setItem(`lf_answer_${campaignId}`, answer);
        } else if (isPositive) {
          fetchLead(buildPayload(campaign));
        }

        step.style.display = 'none';
        const next = steps[steps.indexOf(step) + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const remaining = document.querySelectorAll('.coreg-section');
        const remainingVisible = Array.from(remaining).filter(s => window.getComputedStyle(s).display !== 'none');
        const alreadyShown = longFormSection?.getAttribute('data-displayed') === 'true';
        if (remainingVisible.length === 0 && !alreadyShown) {
          const anyYes = Object.keys(sessionStorage)
            .filter(k => k.startsWith('lf_answer_'))
            .some(k => ['ja', 'yes', 'akkoord'].some(kw => sessionStorage[k].toLowerCase().includes(kw)));

          if (anyYes) {
            longFormSection.style.display = 'block';
            longFormSection.setAttribute('data-displayed', 'true');
            reloadImages(longFormSection);
          } else {
            const next = longFormSection?.nextElementSibling;
            if (next) {
              next.style.display = 'block';
              reloadImages(next);
            }
          }
        }
      });
    });
  });
}
