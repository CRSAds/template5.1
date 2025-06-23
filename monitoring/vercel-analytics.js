// Vercel Analytics Integration
import { Analytics } from '@vercel/analytics';

const analytics = new Analytics();

export const trackPageView = (path) => {
  analytics.pageview(path);
};

export const trackEvent = (eventName, properties = {}) => {
  analytics.track(eventName, properties);
};

export const trackError = (error) => {
  analytics.error(error);
};

// Conversion funnel tracking
export const trackFunnelStep = (stepName, data = {}) => {
  trackEvent('Funnel Step', {
    step: stepName,
    ...data
  });
};
