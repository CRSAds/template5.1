// initFlow.js
import { reloadImages } from './imageFix.js';
import { fetchLead, buildPayload } from './formSubmit.js';
import sponsorCampaigns from './sponsorCampaigns.js';

const longFormCampaigns = [];
window.longFormCampaigns = longFormCampaigns;
const coregAnswers = {};
window.coregAnswers = coregAnswers;

export default function initFlow() {
  const longFormSection = document.getElementById('long-form-section');
  const steps = Array.from(document.querySelectorAll('.flow-section, .coreg-section'));

  // Alleen eerste sectie tonen
  steps.forEach((el, i) => {
    el.style.display = i === 0 ? 'block' : 'none';
  });

  if (longFormSection) {
    longFormSection.style.display = 'none';
    longFormSection.setAttribute('data-displayed', 'false');
  }

  steps.forEach((step, index) => {
    // Flow-next buttons (shortform, voorwaarden, etc.)
    step.querySelectorAll('.flow-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const skipNext = btn.classList.contains('skip-next-section');
        const campaignId = step.id?.startsWith('campaign-') ? step.id : null;
        const campaign = sponsorCampaigns[campaignId];

        // Als sponsor-next bij flow-section: bewaar antwoord
        if (campaign?.coregAnswerKey && btn.classList.contains('sponsor-next')) {
          localStorage.setItem(campaign.coregAnswerKey, btn.innerText.trim());
        }

        // Als voorwaarden → zonder accept button → verwijder cosponsor optin
        if (step.id === 'voorwaarden-section' && !btn.id) {
          localStorage.removeItem('sponsor_optin');
        }

        const form = step.querySelector('form');
        if (form && form.id === 'lead-form' && !validateShortForm(form)) return;

        // Shortform lead versturen
        if (form && form.id === 'lead-form') {
          const includeSponsors = step.id !== 'voorwaarden-section' || btn.id === 'accept-sponsors-btn';
          const payload = buildPayload(sponsorCampaigns["campaign-leadsnl"], { includeSponsors });
          fetchLead(payload);
        }

        step.style.display = 'none';
        const next = skipNext ? steps[index + 2] : steps[index + 1];
        if (next) {
          next.style.display = 'block';
          reloadImages(next);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Sponsor-optin buttons
    step.querySelectorAll('.sponsor-optin').forEach(button => {
      button.addEventListener('click', () => {
        const campaignId = button.id;
        const campaign = sponsorCampaigns[campaignId];
        if (!campaign) return;

        const answer = button.innerText.trim().toLowerCase();
        const isPositive = ['ja', 'yes', 'akkoord'].includes(answer);

        if (campaign.coregAnswerKey) {
          localStorage.setItem(campaign.coregAnswerKey, answer);
        }

        if (campaign.requiresLongForm && isPositive) {
          if (!longFormCampaigns.find(c => c.cid === campaign.cid)) {
            longFormCampaigns.push(campaign);
          }
          // Géén fetchLead
        } else if (isPositive) {
          const payload = buildPayload(campaign);
          fetchLead(payload);
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

  Object.entries(sponsorCampaigns).forEach(([campaignId, config]) => {
    if (config.hasCoregFlow && config.coregAnswerKey) {
      initGenericCoregSponsorFlow(campaignId, config.coregAnswerKey);
    }
  });
}

function validateShortForm(form) {
  const fields = [
    { id: 'firstname', name: 'Voornaam' },
    { id: 'lastname', name: 'Achternaam' },
    { id: 'dob-day', name: 'Geboortedag' },
    { id: 'dob-month', name: 'Geboortemaand' },
    { id: 'dob-year', name: 'Geboortejaar' },
    { id: 'email', name: 'E-mailadres' },
  ];

  const gender = form.querySelector('input[name="gender"]:checked');
  const messages = [];

  if (!gender) messages.push('Geslacht');

  fields.forEach(({ id, name }) => {
    const val = form.querySelector(`#${id}`)?.value.trim();
    if (!val) messages.push(name);
  });

  const email = form.querySelector('#email')?.value.trim();
  if (email && (!email.includes('@') || !email.includes('.'))) {
    messages.push('Geldig e-mailadres');
  }

  if (messages.length > 0) {
    alert('Vul aub de volgende velden correct in:\n' + messages.join('\n'));
    return false;
  }

  return true;
}

function initGenericCoregSponsorFlow(sponsorId, coregAnswerKey) {
  coregAnswers[sponsorId] = [];

  const allSections = document.querySelectorAll(`[id^="campaign-${sponsorId}"]`);
  allSections.forEach(section => {
    const buttons = section.querySelectorAll('.flow-next');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const answerText = button.innerText.trim();
        coregAnswers[sponsorId].push(answerText);

        if (!button.classList.contains('sponsor-next')) return;

        let nextStepId = '';
        button.classList.forEach(cls => {
          if (cls.startsWith('next-step-')) {
            nextStepId = cls.replace('next-step-', '');
          }
        });

        section.style.display = 'none';

        if (nextStepId) {
          const nextSection = document.getElementById(nextStepId);
          if (nextSection) {
            nextSection.style.display = 'block';
          } else {
            handleGenericNextCoregSponsor(sponsorId, coregAnswerKey);
          }
        } else {
          handleGenericNextCoregSponsor(sponsorId, coregAnswerKey);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  });
}

function handleGenericNextCoregSponsor(sponsorId, coregAnswerKey) {
  const combinedAnswer = coregAnswers[sponsorId].join(' - ');
  localStorage.setItem(coregAnswerKey, combinedAnswer);

  const currentCoregSection = document.querySelector(`.coreg-section[style*="display: block"]`);
  const flowNextBtn = currentCoregSection?.querySelector('.flow-next');
  flowNextBtn?.click();

  setTimeout(checkIfLongFormShouldBeShown, 200);
}

function checkIfLongFormShouldBeShown() {
  const longFormSection = document.getElementById('long-form-section');
  const remainingCoregs = Array.from(document.querySelectorAll('.coreg-section'))
    .filter(s => window.getComputedStyle(s).display !== 'none');
  const alreadyHandled = longFormSection?.getAttribute('data-displayed') === 'true';

  if (remainingCoregs.length === 0 && longFormCampaigns.length > 0 && !alreadyHandled) {
    longFormSection.style.display = 'block';
    longFormSection.setAttribute('data-displayed', 'true');
    reloadImages(longFormSection);
  } else if (remainingCoregs.length === 0 && longFormCampaigns.length === 0) {
    const next = longFormSection?.nextElementSibling;
    if (next) {
      next.style.display = 'block';
      reloadImages(next);
    }
  }
}
