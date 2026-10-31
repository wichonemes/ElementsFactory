import { db } from '../server/db.js';

export default function handler(req, res) {
  try {
    const settings = db.getSettings();
    const target = settings?.socialLinks?.facebook || 'https://www.facebook.com/ArtesanoDigitalvideojuegos';
    res.writeHead(302, { Location: target });
    res.end();
  } catch {
    res.writeHead(302, { Location: 'https://www.facebook.com/ArtesanoDigitalvideojuegos' });
    res.end();
  }
}
