export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      cid,
      sid,
      gender,
      firstname,
      lastname,
      f_5_dob,
      email,
      postcode,
      straat,
      huisnummer,
      woonplaats,
      telefoon,
      t_id,
      f_2014_coreg_answer,
      f_1453_campagne_url // ✅ campagne_url nu vanaf frontend (betrouwbaarder dan referer!)
    } = req.body;

    console.log('Ontvangen data van frontend:', req.body);

    if (!cid || !sid) {
      console.error('Verplichte campagnegegevens ontbreken');
      return res.status(400).json({ success: false, message: 'Campagnegegevens ontbreken' });
    }

    const dob = f_5_dob || ''; // ISO 8601 string direct uit payload
    const ipaddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const optindate = new Date().toISOString().split('.')[0] + '+0000';

    const params = new URLSearchParams({
      cid: String(cid),
      sid: String(sid),
      f_2_title: gender || '',
      f_3_firstname: firstname || '',
      f_4_lastname: lastname || '',
      f_1_email: email || '',
      f_5_dob: dob || '',
      f_11_postcode: postcode || '',
      f_6_address1: straat || '',
      f_7_address2: huisnummer || '',
      f_8_address3: '', // optioneel extra veld
      f_9_towncity: woonplaats || '',
      f_12_phone1: telefoon || '',
      f_17_ipaddress: ipaddress,
      f_55_optindate: optindate,
      f_1322_transaction_id: t_id || '',
      f_2014_coreg_answer: f_2014_coreg_answer || '',
      f_1453_campagne_url: f_1453_campagne_url || '',
      f_2047_EM_CO_sponsors: req.body.f_2047_EM_CO_sponsors || ''
    });

    const response = await fetch('https://crsadvertising.databowl.com/api/v1/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const result = await response.json();
    console.log('Databowl antwoord:', result);

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Fout bij verzenden naar Databowl:', error);
    return res.status(500).json({ success: false, message: 'Interne fout bij verzenden' });
  }
}
