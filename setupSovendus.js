// setupSovendus.js
export default function setupSovendus() {
  console.log("👉 setupSovendus gestart");

  const iframe = document.getElementById("sovendus-iframe");
  if (!iframe) {
    console.warn("❌ Geen #sovendus-iframe gevonden");
    return;
  }

  // Ophalen van lead data
  const t_id = localStorage.getItem("t_id") || "";
  const gender = localStorage.getItem("gender") || "";
  const firstname = localStorage.getItem("firstname") || "";
  const lastname = localStorage.getItem("lastname") || "";
  const email = localStorage.getItem("email") || "";

  // ✅ Sovendus tokens ophalen via proxy
  fetch("https://cdn.909support.com/NL/4.1/assets/php/sovendus_proxy.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      clickId: t_id,
      email: email
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Sovendus proxy response:", data);

      if (data.sovToken && data.sessionUuid && data.identifier) {
        const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

        const iframeUrl = `https://www.sovendus-connect.com/banner/api/banner` +
          `?timestamp=${timestamp}` +
          `&trafficMediumNumber=2` +
          `&trafficSourceNumber=5592` +
          `&sovToken=${encodeURIComponent(data.sovToken)}` +
          `&sessionUuid=${encodeURIComponent(data.sessionUuid)}` +
          `&format=ssr` +
          `&identifier=${encodeURIComponent(data.identifier)}` +
          `#consumerSalutation=${encodeURIComponent(gender)}` +
          `&consumerFirstName=${encodeURIComponent(firstname)}` +
          `&consumerLastName=${encodeURIComponent(lastname)}` +
          `&consumerEmail=${encodeURIComponent(email)}` +
          `&consumerCountry=NL`;

        iframe.src = iframeUrl;
        console.log("✅ Sovendus iframe geladen:", iframeUrl);
      } else {
        console.error("❌ Sovendus tokens niet volledig ontvangen → iframe niet geladen");
      }
    })
    .catch(err => {
      console.error("❌ Fout bij ophalen Sovendus tokens:", err);
    });
}
