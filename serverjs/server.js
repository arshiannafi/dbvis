
var http = require('http');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var server = http.createServer(app);

app.use(express.static('../public'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

/****************************** Express Routes ********************************/
app.get('/', function (req, res) {
    res.end('Hello world');
});

app.get('/data', function (req, res) {
    res.end('{data: data}');
});

// Database Adapter
require('./MySQLDatabaseAdapter.js')(app);
require('./ProjectStoring.js')(app);
/******************************** Port assignment *****************************/
server.listen(3000, function () {
    console.log('Listening on port 3000');
});
