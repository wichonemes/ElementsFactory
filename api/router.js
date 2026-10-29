import app from '../server/index.js';

export default function handler(req, res) {
  const url = req.url || '/api';
  const [pathname, search = ''] = url.split('?');
  const params = new URLSearchParams(search);
  params.delete('__path');
  const query = params.toString();
  req.url = pathname + (query ? `?${query}` : '');
  return app(req, res);
}
