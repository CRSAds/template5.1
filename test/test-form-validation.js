import { trackFunnelStep, trackError } from '../monitoring/vercel-analytics.js';

// Extend validateForm with analytics
const originalValidateForm = window.validateForm;
window.validateForm = function(form) {
  try {
    const isValid = originalValidateForm(form);
    
    // Track form validation
    trackFunnelStep('Form Validation', {
      formId: form.id,
      isValid,
      validationTime: Date.now()
    });

    return isValid;
  } catch (error) {
    console.error('Error in form validation:', error);
    trackError(error);
    return false;
  }
};
