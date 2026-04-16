const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

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
