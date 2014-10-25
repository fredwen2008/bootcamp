#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

var service = require('./service');
var port = process.env.PORT || 3000;

console.log("Service process %s started.\n", process.pid);

app.get('/index.html', function(req, res) {
    res.send('OK');
});

// verify request body
app.post('*', function(req, res, next) {
    var type = req.get('Content-Type');
    var len = req.get('Content-Length');
    if (len > 0) {
        next();
        /*
        if (type && type.toLowerCase() == 'application/json') {
            try {
                JSON.parse(req.body);
                next();
            } catch (e) {
                console.log(req);
                res.status(400).send('{"reason":"invalid json content"}');
            }
        } else {
            res.status(400).send('{"reason":"invalid conntent type"}');
        }
        */
    } else {
        res.status(400).send('{"reason":"post conntent is empty"}');
    }
});

app.post('/register', function(req, res) {
    res.send('OK');
});

app.post('/login', function(req, res) {
    res.send('OK');
});

// verify authentication token

// app.all('*', function(req, res, next) {
//     var token = req.get('AUTH_TOKEN');
//     service.validateAuthToken(token, function(err, result) {
//         if (err) {
//             console.log(err);
//             res.status(400).send('{"reason":"' + err + '"}');
//         } else {
//             res.locals.player = result;
//             next();
//         }
//     });
// });

app.get('/load', function(req, res) {
    var player = res.locals.player;
    res.send(player);
});

app.post('/actions', function(req, res) {
    console.log(req.body);
    service.handleActions(req.body,  function(err, result) {
        if (err) {
            console.log(err);
            res.status(400).send('{"reason":"' + err + '"}');
        }
        res.send(result);
    });
});

app.post('/', function(req, res) {
    res.send('OK');
});

app.listen(port);
