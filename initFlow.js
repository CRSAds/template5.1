import { reloadImages } from './imageFix.js';
import { fetchLead, buildPayload } from './formSubmit.js';
import sponsorCampaigns from './sponsorCampaigns.js';
import setupSovendus from './setupSovendus.js';
import { fireFacebookLeadEventIfNeeded } from './facebookpixel.js';

const longFormCampaigns = [];
window.longFormCampaigns = longFormCampaigns;
let hasSubmittedShortForm = false;

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
        if (form && !validateForm(form)) return;

        if (form && form.id === 'lead-form' && !hasSubmittedShortForm) {
          hasSubmittedShortForm = true;

          const gender = form.querySelector('input[name="gender"]:checked')?.value || '';
          const firstname = form.querySelector('#firstname')?.value.trim() || '';
          const lastname = form.querySelector('#lastname')?.value.trim() || '';
          const dob_day = form.querySelector('#dob-day')?.value || '';
          const dob_month = form.querySelector('#dob-month')?.value || '';
          const dob_year = form.querySelector('#dob-year')?.value || '';
          const email = form.querySelector('#email')?.value.trim() || '';
          const t_id = new URLSearchParams(window.location.search).get("t_id") || crypto.randomUUID();

          sessionStorage.setItem('gender', gender);
          sessionStorage.setItem('firstname', firstname);
          sessionStorage.setItem('lastname', lastname);
          sessionStorage.setItem('dob_day', dob_day);
          sessionStorage.setItem('dob_month', dob_month);
          sessionStorage.setItem('dob_year', dob_year);
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('t_id', t_id);

          const payload = buildPayload(sponsorCampaigns["campaign-leadsnl"]);
          fetchLead(payload).then(() => fireFacebookLeadEventIfNeeded());
        }

        step.style.display = 'none';
        const next = skipNext ? steps[stepIndex + 2] : steps[stepIndex + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
          if (next.id === 'sovendus-section') setupSovendus();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    step.querySelectorAll('.sponsor-optin').forEach(button => {
      button.addEventListener('click', () => {
        const campaignId = button.id;
        const campaign = sponsorCampaigns[campaignId];
        if (!campaign) return;

        const answer = button.innerText.trim().toLowerCase();
        const isPositive = ['ja', 'yes', 'graag', 'akkoord'].some(txt => answer.includes(txt));
        console.log("📮 Antwoord:", { campaignId, answer, isPositive, requiresLongForm: campaign.requiresLongForm });

        if (campaign.coregAnswerKey) {
          sessionStorage.setItem(campaign.coregAnswerKey, answer);
        }

        if (campaign.requiresLongForm && isPositive) {
          if (!longFormCampaigns.find(c => c.cid === campaign.cid)) {
            longFormCampaigns.push(campaign);
            console.log("➕ Toegevoegd aan longFormCampaigns:", campaign.cid);
          }
        } else if (!campaign.requiresLongForm) {
          // ✅ Short form sponsor altijd verzenden
          fetchLead(buildPayload(campaign));
        }

        step.style.display = 'none';
        const next = steps[steps.indexOf(step) + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // ✅ Alleen checken na álle coregs
        setTimeout(() => checkIfLongFormShouldBeShown(), 200);
      });
    });
  });

  Object.entries(sponsorCampaigns).forEach(([id, config]) => {
    if (config.hasCoregFlow && config.coregAnswerKey) {
      initGenericCoregSponsorFlow(id, config.coregAnswerKey);
    }
  });
}

function validateForm(form) {
  const required = {
    'lead-form': ['gender', 'firstname', 'lastname', 'dob-day', 'dob-month', 'dob-year', 'email'],
    'long-form': ['postcode', 'straat', 'huisnummer', 'woonplaats', 'telefoon']
  };

  const messages = [];
  const ids = required[form.id] || [];

  ids.forEach(id => {
    const el = form.querySelector(`#${id}`) || form.querySelector(`input[name="${id}"]:checked`);
    const val = el?.value?.trim() || '';
    if (!val) messages.push(id);
    if (id === 'telefoon' && val.length > 11) messages.push('telefoon (max. 11 tekens)');
  });

  if (messages.length > 0) {
    alert('Vul aub de volgende velden correct in:\n' + messages.join('\n'));
    return false;
  }
  return true;
}

const coregAnswers = {};
window.coregAnswers = coregAnswers;

function initGenericCoregSponsorFlow(sponsorId, coregAnswerKey) {
  coregAnswers[sponsorId] = [];
  const sections = document.querySelectorAll(`[id^="campaign-${sponsorId}"]`);

  sections.forEach(section => {
    section.querySelectorAll('.flow-next').forEach(button => {
      button.addEventListener('click', () => {
        const answer = button.innerText.trim();
        coregAnswers[sponsorId].push(answer);

        if (!button.classList.contains('sponsor-next')) return;

        let nextStepId = '';
        button.classList.forEach(cls => {
          if (cls.startsWith('next-step-')) {
            nextStepId = cls.replace('next-step-', '');
          }
        });

        section.style.display = 'none';

        if (nextStepId) {
          const next = document.getElementById(nextStepId);
          if (next) next.style.display = 'block';
        } else {
          handleGenericNextCoregSponsor(sponsorId, coregAnswerKey);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  });
}

function handleGenericNextCoregSponsor(sponsorId, coregAnswerKey) {
  const combined = coregAnswers[sponsorId].join(' - ');
  sessionStorage.setItem(coregAnswerKey, combined);

  const visible = document.querySelector(`.coreg-section[style*="display: block"]`);
  const flowBtn = visible?.querySelector('.flow-next');
  flowBtn?.click();
}

function checkIfLongFormShouldBeShown() {
  const longFormSection = document.getElementById('long-form-section');
  const alreadyShown = longFormSection?.getAttribute('data-displayed') === 'true';

  const remainingCoregs = Array.from(document.querySelectorAll('.coreg-section'))
    .filter(s => window.getComputedStyle(s).display !== 'none');

  console.log("🔎 Long form check:", {
    longFormCampaigns,
    remainingCoregs,
    alreadyShown
  });

  if (remainingCoregs.length > 0 || alreadyShown) return;

  if (longFormCampaigns.length > 0) {
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
