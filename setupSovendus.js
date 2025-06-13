export default function setupSovendus() {
  console.log("👉 setupSovendus gestart");

  // URL waarden uit localStorage halen:
  const t_id = localStorage.getItem('t_id') || '';
  const consumerSalutation = localStorage.getItem('gender') || localStorage.getItem('title') || '';
  const consumerFirstName = localStorage.getItem('firstname') || '';
  const consumerLastName = localStorage.getItem('lastname') || '';
  const consumerEmail = localStorage.getItem('email') || '';
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  // Sovendus extra waarden → voor nu even statisch / dummy zetten
  const sovToken = localStorage.getItem('sovToken') || 'DUMMY_SOVTOKEN_HIER';
  const sessionUuid = localStorage.getItem('sessionUuid') || 'DUMMY_SESSIONUUID_HIER';
  const identifier = localStorage.getItem('identifier') || 'DUMMY_IDENTIFIER_HIER';

  // Sovendus URL opbouwen:
  const sovendusIframeUrl = `https://www.sovendus-connect.com/banner/api/banner?trafficSourceNumber=5592&trafficMediumNumber=1&sessionId=${t_id}&timestamp=${timestamp}&sovToken=${sovToken}&sessionUuid=${sessionUuid}&format=ssr&identifier=${identifier}&consumerSalutation=${encodeURIComponent(consumerSalutation)}&consumerFirstName=${encodeURIComponent(consumerFirstName)}&consumerLastName=${encodeURIComponent(consumerLastName)}&consumerEmail=${encodeURIComponent(consumerEmail)}&consumerCountry=NL`;

  console.log("👉 Sovendus iframe URL:", sovendusIframeUrl);

  // flexibleIframe.js dynamisch laden
  const script = document.createElement('script');
  script.src = 'https://www.sovendus-connect.com/sovabo/common/js/flexibleIframe.js';
  script.async = true;
  script.onload = () => {
    console.log("👉 setupSovendus → flexibleIframe.js geladen");
  };
  document.head.appendChild(script);

  // Iframe vullen
  const iframe = document.getElementById('sovendus-iframe');
  if (iframe) {
    iframe.src = sovendusIframeUrl;
  } else {
    console.warn("⚠️ sovendus-iframe niet gevonden in DOM!");
  }
}
