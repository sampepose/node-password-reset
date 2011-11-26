password-reset
==============

middleware for managing password reset emails

example
-------

``` js
var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname));
app.use(express.bodyParser());

var forgot = require('password-reset')({
    uri : 'http://localhost:8080/_password_reset',
    host : 'localhost', // smtp server to use
    from : 'password-robot@localhost',
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
        res_.end('password reset');
    });
});

app.listen(8080);
console.log('Listening on :8080');
```

methods
=======

var forgot = require('password-reset')(opts)
--------------------------------------------

Create a new password reset session `forgot` with some options `opts`.

`opts.uri` must be the location of the password reset route, such as
`'http://localhost:8080/_password_reset'`. A query string is appended to
`opts.uri` with a unique one-time hash.

`opts.body(uri)` can be a function that takes the password reset link `uri` and
returns the email body as a string.

The rest of the options are passed directly to
the [smtpc module](https://github.com/dresende/node-smtp)
with reasonable defaults.

When the user clicks on the uri link `forgot` emits a `"request", req, res`
event.

forgot(email, cb)
-----------------

Send a password reset email to the `email` address.
`cb(err)` fires when the email has been sent.

forgot.middleware(req, res, next)
---------------------------------

Use this middleware function to intercept requests on the `opts.uri`.

events
======

'request', req, res
-------------------

Emitted when the user clicks on the password link from the email.

'failure', err
--------------

Emitted when an error occurs sending email. You can also listen for this event
in `forgot()`'s callback.

'success'
---------

Emitted when an email is successfully sent.

install
=======

With [npm](http://npmjs.org) do:

```
npm install password-reset
```

license
=======

MIT/X11
