// setupSovendus.js

export default function setupSovendus() {
  console.log('👉 setupSovendus gestart');

  // Sovendus params uit localStorage
  const t_id = localStorage.getItem('t_id') || '';
  const consumerSalutation = localStorage.getItem('gender') || ''; // jouw "gender" veld is Salutation
  const consumerFirstName = localStorage.getItem('firstname') || '';
  const consumerLastName = localStorage.getItem('lastname') || '';
  const consumerEmail = localStorage.getItem('email') || '';

  // Sovendus timestamp
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  // Sovendus flexiframe.js injecteren
  const flexIframeUrl = 'https://www.sovendus-connect.com/sovabo/common/js/flexibleIframe.js';

  const existingScript = document.querySelector(`script[src="${flexIframeUrl}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = flexIframeUrl;
    script.async = true;
    document.head.appendChild(script);
    console.log('👉 setupSovendus → flexibleIframe.js geladen');
  }

  // Sovendus iframe vullen
  const iframe = document.getElementById('sovendus-iframe');
  if (iframe) {
    const iframeSrc = `https://www.sovendus-connect.com/banner/api/banner` +
      `?trafficSourceNumber=5592` +
      `&trafficMediumNumber=1` +
      `&sessionId=${encodeURIComponent(t_id)}` +
      `&timestamp=${timestamp}` +
      `&consumerSalutation=${encodeURIComponent(consumerSalutation)}` +
      `&consumerFirstName=${encodeURIComponent(consumerFirstName)}` +
      `&consumerLastName=${encodeURIComponent(consumerLastName)}` +
      `&consumerEmail=${encodeURIComponent(consumerEmail)}` +
      `&consumerCountry=NL`;

    iframe.src = iframeSrc;
    console.log('👉 setupSovendus → iframe URL gezet:', iframeSrc);
  } else {
    console.warn('⚠️ setupSovendus → #sovendus-iframe niet gevonden!');
  }
}
