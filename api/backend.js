export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', pesan: 'Metode Tidak Diizinkan' });
  }

  const referer = req.headers.referer || req.headers.origin || "";
  if (!referer.includes("vercel.app") && !referer.includes("localhost")) {
     return res.status(403).json({ status: 'error', pesan: 'AKSES ILEGAL! (CORS DITOLAK)' });
  }

  // --- INI YANG BERUBAH ---
  // Sekarang kita panggil dari brankas gaib (.env) milik Vercel
  const GOOGLE_SCRIPT_URL = process.env.URL_API_GOOGLE;
  const SECRET_KEY = process.env.KUNCI_RAHASIA_API;
  
  // Jika Vercel gagal membaca brankas, beri peringatan
  if (!GOOGLE_SCRIPT_URL || !SECRET_KEY) {
     return res.status(500).json({ status: 'error', pesan: 'Brankas .env Vercel belum disetting!' });
  }
  // ------------------------
  
  try {
    let payloadDariFrontend;
    if (typeof req.body === 'string') {
        payloadDariFrontend = JSON.parse(req.body);
    } else {
        payloadDariFrontend = req.body;
    }
    
    // Sisipkan Kunci Rahasia
    payloadDariFrontend.kunciRahasia = SECRET_KEY; 

    // Teruskan ke Google Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payloadDariFrontend)
    });

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal menghubungi database Google.' });
  }
}
