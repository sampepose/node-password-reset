var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname));
app.use(express.bodyParser());

var forgot = require('../../')();
app.use(forgot.middleware);

app.post('/forgot', function (req, res) {
    forgot(req, req.params.email, function (err, req_, res_) {
        if (err) {
            res.statusCode = 500;
            res.end(err);
        }
        else res_.end('password reset')
    });
    
    res.end('Check your inbox for a password reset message.');
});

app.listen(8080);
console.log('Listening on :8080');
