var fs = require('fs');
var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname));
app.use(require('sesame')()); // for sessions

var forgot = require('../../')({
    uri : 'http://localhost:8080/password_reset',
    from : 'password-robot@localhost',
    host : 'localhost', port : 25,
});
app.use(forgot.middleware);
app.use(function (req, res, next) {
    console.dir(req.session.resetEmail);
    next();
});

app.post('/forgot', express.bodyParser(), function (req, res) {
    var email = req.body.email;
    var reset = forgot(email, function (err) {
        if (err) res.end('Error sending message: ' + err)
        else res.end('Check your inbox for a password reset message.')
    });
    
    reset.on('request', function (req_, res_) {
        req_.session.resetEmail = email;
        fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
    });
});

app.post('/reset', express.bodyParser(), function (req, res) {
    if (!req.session.resetEmail) return res.end('reset token not set');
    
    var password = req.body.password;
    var confirm = req.body.confirm;
    if (password !== confirm) return res.end('passwords do not match');
    
    // update the user db here
    
    delete req.session.resetEmail;
    res.end('password reset');
});

app.listen(8080);
console.log('Listening on :8080');
