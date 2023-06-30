require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory lookup table for original URLs and their corresponding short URLs
const urlLookupTable = {};
let nextShortUrlId = 1;

// Define a route to create short URLs
app.post('/api/shorturl', (req, res) => {
  console.log(req.body.url);
  const originalUrl = req.body.url;

  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'Invalid URL' });
  }

  // Generate the short URL
  const shortUrl = nextShortUrlId.toString();
  nextShortUrlId++;

  // Store the original URL and its corresponding short URL in the lookup table
  urlLookupTable[shortUrl] = originalUrl;

  // Return the JSON response with the short URL
  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// Define a route for URL redirection
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // Lookup the original URL associated with the short_url
  const originalUrl = urlLookupTable[shortUrl];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
