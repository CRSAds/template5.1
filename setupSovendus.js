// setupSovendus.js
export default function setupSovendus() {
  console.log('👉 setupSovendus gestart');

  // timestamp opbouwen (zoals in werkende flow)
  const d = new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  const timestampSovendus =
    d.getFullYear() +
    (month < 10 ? '0' : '') + month +
    (day < 10 ? '0' : '') + day +
    (hour < 10 ? '0' : '') + hour +
    (minutes < 10 ? '0' : '') + minutes +
    (seconds < 10 ? '0' : '') + seconds;

  // consumer data uit localStorage
  const salutation = localStorage.getItem('f_2_title') || '';
  const firstName = localStorage.getItem('f_3_firstname') || '';
  const lastName = localStorage.getItem('f_4_lastname') || '';
  const email = localStorage.getItem('f_1_email') || '';
  const t_id = localStorage.getItem('t_id') || '';

  // window.sovIframes vullen
  window.sovIframes = window.sovIframes || [];
  window.sovIframes.push({
    trafficSourceNumber : '5592',
    trafficMediumNumber : '1',
    sessionId : t_id,
    timestamp : timestampSovendus,
    orderId : '',
    orderValue : '',
    orderCurrency : '',
    usedCouponCode : '',
    iframeContainerId : 'sovendus-container-1'
  });

  // window.sovConsumer vullen
  window.sovConsumer = {
    consumerSalutation : salutation,
    consumerFirstName : firstName,
    consumerLastName : lastName,
    consumerEmail : email
  };

  // FlexibleIframe script injecteren
  const sovJsFile = 'https://www.sovendus-connect.com/sovabo/common/js/flexibleIframe.js';
  const script = document.createElement('script');
  script.async = true;
  script.src = sovJsFile;
  document.head.appendChild(script);

  console.log('👉 setupSovendus → flexibleIframe.js geladen');
}
