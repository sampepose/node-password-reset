var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname));
app.use(express.bodyParser());

var forgot = require('../../')({
    uri : 'http://localhost:8080/_password_reset',
    from : 'password-robot@localhost',
    host : 'localhost', port : 25,
});
app.use(forgot.middleware);

app.post('/forgot', function (req, res) {
    var reset = forgot(req.body.email, function (err) {
        if (err) {
            res.statusCode = 500;
            res.end('Error sending message: ' + err);
        }
        else res.end('Check your inbox for a password reset message.')
    });
    
    reset.on('request', function (req_, res_) {
        res_.end('give the user some password boxes here');
    });
});

app.listen(8080);
console.log('Listening on :8080');
