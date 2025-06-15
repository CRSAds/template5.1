export default function setupSovendus() {
  console.log("👉 setupSovendus gestart");

  // Stap 1: Check container
  const containerId = 'sovendus-container-1';
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`❌ Container #${containerId} niet gevonden`);
    return;
  }

  // Stap 2: Gegevens ophalen uit localStorage
  const t_id = localStorage.getItem('t_id') || crypto.randomUUID();
  const gender = localStorage.getItem('gender') || '';
  const firstname = localStorage.getItem('firstname') || '';
  const lastname = localStorage.getItem('lastname') || '';
  const email = localStorage.getItem('email') || '';

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  // Stap 3: Zet global consumer object
  window.sovConsumer = {
    consumerSalutation: gender,          // bijv. "De Heer" of "Mevrouw"
    consumerFirstName: firstname,
    consumerLastName: lastname,
    consumerEmail: email
  };

  // Stap 4: Zet global iframe configuratie
  window.sovIframes = window.sovIframes || [];
  window.sovIframes.push({
    trafficSourceNumber: '5592',
    trafficMediumNumber: '1',
    sessionId: t_id,
    timestamp: timestamp,
    orderId: '',
    orderValue: '',
    orderCurrency: '',
    usedCouponCode: '',
    iframeContainerId: containerId
  });

  // Stap 5: Laad flexibleIframe.js dynamisch
  const script = document.createElement('script');
  script.src = 'https://api.sovendus.com/sovabo/common/js/flexibleIframe.js';
  script.async = true;
  script.onload = () => {
    console.log('✅ Sovendus → flexibleIframe.js geladen');
  };
  script.onerror = () => {
    console.error('❌ Fout bij laden van flexibleIframe.js');
  };

  document.body.appendChild(script);
}
