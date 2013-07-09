var fs = require('fs');

var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  fs.readFileSync('index.html', {encoding: 'utf-8'}, function (err, data) {
    if (err) {
      return console.log(err);
    }
    response.end(data);
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
