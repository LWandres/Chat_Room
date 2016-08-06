var express = require('express.io');
var app = express().http().io();
var path = require('path');

//for handling post data
app.use(express.bodyParser());
//for handling static files like jquery files, css etc
app.use(express.static(path.join(__dirname, 'public')));

//for session handling
app.use(express.cookieParser())
app.use(express.session({secret: 'icecream'}));

//express.io will look for your views folder
app.set('view engine', 'ejs');

var server = app.listen(8001, function() {
    console.log("GroupChat on port 8001");
});

var route = require('./routes/index.js')(app, server);
