const express = require('express');
const path = require('path');
const morgan =require('morgan')

const app = express();

app.use(morgan('combined'))

app.use(express.static(path.join(__dirname, 'build')));

app.get('/admin/ping', function (req, res) {
 return res.send('pong');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Applikasjonen er tilgjengelig på http://localhost:${port}`)
});