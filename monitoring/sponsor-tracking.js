import { trackFunnelStep, trackError } from './vercel-analytics';

// Sponsor flow tracking
export const trackSponsorFlow = (sponsorId, step, data = {}) => {
  try {
    trackFunnelStep(`Sponsor Flow - ${step}`, {
      sponsorId,
      ...data
    });
  } catch (error) {
    console.error('Error tracking sponsor flow:', error);
    trackError(error);
  }
};

// Sponsor conversion tracking
export const trackSponsorConversion = (sponsorId, conversionType, data = {}) => {
  try {
    trackFunnelStep(`Sponsor Conversion - ${conversionType}`, {
      sponsorId,
      ...data
    });
  } catch (error) {
    console.error('Error tracking sponsor conversion:', error);
    trackError(error);
  }
};
