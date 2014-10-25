#!/usr/bin/env node

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var service = require('./service');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

console.log("Service process %s started.\n", process.pid);

app.get('/index.html', function(req, res) {
    res.send('OK');
});

app.post('/register', function(req, res) {
    res.send('OK');
});

app.post('/login', function(req, res) {
    res.send('OK');
});

app.all('*', function(req, res, next) {
    var token = req.get('AUTH_TOKEN');
    service.validateAuthToken(token, function(err, result) {
        if (err) {
            console.log(err);
            res.status(400).send('{"reason":"' + err + '"}');
        } else {
            app.set("player", result);
            next();
        }
    });
});

app.get('/load', function(req, res) {
    var player = app.get("player");
    res.send(player);
});

app.post('/', function(req, res) {
    res.send('OK');
});

app.listen(port);