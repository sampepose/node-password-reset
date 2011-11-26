var mailer = require('mailer');
var url = require('url');

module.exports = function (opts) {
    if (!opts) opts = {};
    else if (typeof opts === 'string') {
        opts = { mount : opts };
    }
    if (!opts.mount) opts.mount = '/_password_reset';
    
    var reset = new Reset(opts);
    var self = function (req, email, cb) {
        var g = reset.generate(req, email, cb);
        if (!g) return;
        
        var body = opts.body
            ? opts.body(g.uri)
            : 'Please click this link to reset your password:\r\n' + g.uri
        ;
        
        var email = {
            host : opts.host || 'localhost',
            port : opts.port || 25,
            to : email,
            from : opts.from,
            subject : opts.subject || 'password reset confirmation',
            body : body,
        };
        
        mailer.send(email, function (err, res) {
            if (err) {
                cb(err);
                delete reset.sessions[g.id];
            }
        });
    };
    
    self.middleware = reset.middleware.bind(reset);
    return self;
};

function Reset (opts) {
    this.sessions = opts.sessions || {};
    this.mount = opts.mount;
}

Reset.prototype.generate = function (req, email, cb) {
    var host = req.headers.host;
    if (!host) {
        cb(new Error('no host header specified'));
        return;
    }
    
    var buf = new Buffer(256);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    var id = buf.toString('base64');
    
    this.sessions[id] = cb;
    return {
        uri : (req.socket.encrypted ? 'https' : 'http')
            + '://' + host + this.mount + '?' + id,
        id : id,
    };
};
    
Reset.prototype.middleware = function (req, res, next) {
    if (!next) next = function (err) {
        if (err) res.end(err)
    }
    
    var u = url.parse(req.url);
    var id = u.query;
    
    if (u.pathname !== this.mount) {
        next()
    }
    else if (!id) {
        res.statusCode = 400;
        next('No auth token specified.');
    }
    else if (!this.sessions[id]) {
        res.statusCode = 410;
        next('auth token expired');
    }
    else {
        this.sessions[id](null, req, res);
    }
};
