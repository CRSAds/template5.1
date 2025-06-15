// facebookpixel.js

console.log('✅ facebookpixel.js geladen');

// Deze functie vuurt het Facebook 'Lead' event alleen als de URL afkomstig is van een FB-campagne
export function fireFacebookLeadEventIfNeeded() {
  const url = window.location.href;

  // Check op typische Facebook tracking parameters
  const isFacebookTraffic = url.includes('utm_source=facebook') || url.includes('fbclid=');

  if (isFacebookTraffic) {
    console.log('📌 Facebook pixel triggeren → Lead');

    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
    } else {
      console.warn('⚠️ Facebook Pixel (fbq) is niet beschikbaar op deze pagina');
    }
  } else {
    console.log('ℹ️ Facebook pixel → niet getriggerd (geen Facebook-verwijzing)');
  }
}
