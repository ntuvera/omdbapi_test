var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, '/public')));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use('/', express.static(path.join(__dirname, 'public'));

app.get('/favorites', function(req, res) {
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.post('/favorites', function(req, res) {
  var data = JSON.parse(fs.readFileSync('data.json'));
  console.log(data);
  console.log('wtf');
  data.push(req.body);
  fs.writeFileSync('./data.json', JSON.stringify(data));
  res.send(data);
});

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
