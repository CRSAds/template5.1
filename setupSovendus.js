export default function setupSovendus() {
  console.log("Sovendus setup → start");

  const t_id = localStorage.getItem('t_id') || '';
  const consumerSalutation = localStorage.getItem('f_2_title') || '';
  const consumerFirstName = localStorage.getItem('f_3_firstname') || '';
  const consumerLastName = localStorage.getItem('f_4_lastname') || '';
  const consumerEmail = localStorage.getItem('f_1_email') || '';
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  // Tracking pixel sturen
  const trackingUrl = `https://tracking.sovendus.com/ts?trafficSourceNumber=5592&trafficMediumNumber=1&sessionId=${t_id}&timestamp=${timestamp}&consumerSalutation=${encodeURIComponent(consumerSalutation)}&consumerFirstName=${encodeURIComponent(consumerFirstName)}&consumerLastName=${encodeURIComponent(consumerLastName)}&consumerEmail=${encodeURIComponent(consumerEmail)}`;

  const img = new Image();
  img.src = trackingUrl;
  console.log('Sovendus tracking URL:', trackingUrl);

  // Iframe src invullen
  const iframe = document.getElementById('sovendus-iframe');
  if (iframe) {
    const iframeUrl = `https://www.sovendus-connect.com/banner/api/banner?trafficSourceNumber=5592&trafficMediumNumber=1&sessionId=${t_id}&timestamp=${timestamp}&consumerSalutation=${encodeURIComponent(consumerSalutation)}&consumerFirstName=${encodeURIComponent(consumerFirstName)}&consumerLastName=${encodeURIComponent(consumerLastName)}&consumerEmail=${encodeURIComponent(consumerEmail)}&consumerCountry=NL`;

    iframe.src = iframeUrl;
    console.log('Sovendus iframe URL:', iframeUrl);
  } else {
    console.warn('Sovendus iframe niet gevonden!');
  }
}
