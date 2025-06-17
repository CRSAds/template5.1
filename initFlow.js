import { reloadImages } from './imageFix.js';
import { fetchLead, buildPayload, setupFormSubmit } from './formSubmit.js';
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

  setupFormSubmit(); // ✅ long form submit handler

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

        if (form) {
          const fields = ['gender', 'firstname', 'lastname', 'dob_day', 'dob_month', 'dob_year', 'email'];
          fields.forEach(f => {
            const el = form.querySelector(`[name="${f}"], #${f}`);
            if (el) sessionStorage.setItem(f, el.value?.trim() || '');
          });
          const t_id = new URLSearchParams(window.location.search).get('t_id') || crypto.randomUUID();
          sessionStorage.setItem('t_id', t_id);

          if (isShortForm && !hasSubmittedShortForm) {
            hasSubmittedShortForm = true;
            const payload = buildPayload(sponsorCampaigns["campaign-leadsnl"], { includeSponsors: true });
            fetchLead(payload).then(() => {
              fireFacebookLeadEventIfNeeded();
              step.style.display = 'none';
              const next = skipNext ? steps[stepIndex + 2] : steps[stepIndex + 1];
              if (next) {
                next.style.display = 'block';
                reloadImages(next);
                if (next.id === 'sovendus-section') setupSovendus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            });
            return;
          }
        }

        step.style.display = 'none';
        const next = skipNext ? steps[stepIndex + 2] : steps[stepIndex + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
          if (next.id === 'sovendus-section') setupSovendus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

step.querySelectorAll('.sponsor-optin').forEach(button => {
  button.addEventListener('click', () => {
    const campaignId = button.id;
    const campaign = sponsorCampaigns[campaignId];
    if (!campaign) return;

    const answer = button.innerText.toLowerCase();
    const isPositive = campaign.requiresLongForm
      ? ['ja', 'yes', 'akkoord', 'graag'].some(word => answer.includes(word))
      : true;

    console.log("📮 Antwoord:", { campaignId, answer, isPositive });

    if (campaign.coregAnswerKey) {
      sessionStorage.setItem(campaign.coregAnswerKey, answer);
    }

    if (campaign.requiresLongForm && isPositive) {
      if (!longFormCampaigns.find(c => c.cid === campaign.cid)) {
        longFormCampaigns.push(campaign);
        console.log("➕ Toegevoegd aan longFormCampaigns:", campaign.cid);
      }
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
    setTimeout(() => checkIfLongFormShouldBeShown(), 200);
      });
    });
  });
}

function checkIfLongFormShouldBeShown() {
  const longFormSection = document.getElementById('long-form-section');
  const alreadyHandled = longFormSection?.getAttribute('data-displayed') === 'true';

  const remainingCoregs = Array.from(document.querySelectorAll('.coreg-section'))
    .filter(s => window.getComputedStyle(s).display !== 'none');

  console.log("🟢 Long form check:", {
    longFormCampaigns,
    remainingCoregs,
    alreadyHandled
  });

  if (alreadyHandled || remainingCoregs.length > 0) return;

  if (longFormCampaigns.length > 0) {
    longFormSection.style.display = 'block';
    longFormSection.setAttribute('data-displayed', 'true');
    reloadImages(longFormSection);
    console.log("📬 Long form getoond");
  } else {
    // ✅ Niets doen: volgende sectie is al getoond in click-handler
    console.log("🚫 Long form overgeslagen — volgende stap al getoond");
  }
}
