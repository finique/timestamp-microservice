const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// URL Shortener storage
const urlStore = [];
let urlCounter = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Header Parser Microservice
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  });
});

// URL Shortener Microservice
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      const short_url = urlCounter++;
      urlStore.push({ short_url, original_url: url });
      res.json({ original_url: url, short_url });
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short', (req, res) => {
  const short = parseInt(req.params.short);
  const entry = urlStore.find(u => u.short_url === short);
  if (!entry) {
    return res.json({ error: 'No short URL found' });
  }
  res.redirect(entry.original_url);
});

// Timestamp Microservice
app.get('/api/:date?', (req, res) => {
  const { date } = req.params;

  let dateObj;

  if (!date) {
    dateObj = new Date();
  } else if (/^\d+$/.test(date)) {
    dateObj = new Date(parseInt(date));
  } else {
    dateObj = new Date(date);
  }

  if (dateObj.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: dateObj.getTime(),
    utc: dateObj.toUTCString()
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Timestamp microservice listening on port ${port}`);
});
