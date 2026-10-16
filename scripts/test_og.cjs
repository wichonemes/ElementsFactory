const http = require('http');

http.get('http://localhost:5000/?prod=T29', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    const ogTitleMatch = data.match(/property="og:title"\s+content="(.*?)"/);
    const ogImageMatch = data.match(/property="og:image"\s+content="(.*?)"/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'none');
    console.log('OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'none');
    console.log('OG Image:', ogImageMatch ? ogImageMatch[1] : 'none');
  });
});
