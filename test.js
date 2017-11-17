var test = require('tape');
var lookupWebmentionServer = require('./index.js');
var http = require('http');
var host = 'localhost';
var port = 3001;

test('no WebMention server is found', function (t) {
  var target = 'http://' + host + ':' + port + '/test2';
  var server = http.createServer(function (req, res) {
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.notOk(url);
    t.end();
  });
});

test('target server returns 4xx status code', function (t) {
  var target = 'http://' + host + ':' + port + '/bad_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 404;
    res.setHeader('Link', '<http://example.org/webmention>; rel="webmention"');
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.notOk(url);
    t.end();
  });
});

test('error looking up target server', function (t) {
  var target = 'http://' + host + ':' + port + '/bad_url';

  lookupWebmentionServer(target, function (err, url) {
    t.ok(err instanceof Error);
    t.notOk(url);
    t.end();
  });
});

test('successfully discovered WebMention server URL from Link header', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Link', '<http://example.org/webmention>; rel="webmention"');
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('successfully discovered WebMention server URL from relative Link header', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader('Link', '</webmention>; rel="webmention"');
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://' + host + ':' + port + '/webmention');
    t.end();
  });
});

test('discover relative WebMention server URL from Link header after redirection', function (t) {
  var target = 'http://' + host + ':' + port + '/subdir/redir_url';
  var server = http.createServer(function (req, res) {
    if (req.url === '/subdir/redir_url') {
      res.setHeader('Location', '/good_url');
      res.statusCode = 303;
    } else {
      res.statusCode = 200;
    }
    res.setHeader('Link', '<webmention>; rel="webmention"');
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://' + host + ':' + port + '/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML body', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><link rel="stylesheet" href="fail.css"><link rel="webmention" href="http://example.org/webmention"></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('discover relative WebMention server URL from HTML body', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><link rel="stylesheet" href="fail.css"><link rel="webmention" href="/webmention"></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://' + host + ':' + port + '/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML body with a legacy rel= attribute', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><link rel="stylesheet" href="fail.css"><link rel="http://webmention.org/" href="http://example.org/webmention"></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML <link> in body with multiple rel= values', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><link rel="alternate webmention canonical" href="http://example.org/webmention" /></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML <link> in body with an empty string href= value', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><link rel="webmention" href="" /></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, target);
    t.end();
  });
});

test('discover relative WebMention server URL from HTML <link> in body after redirection', function (t) {
  var target = 'http://' + host + ':' + port + '/subdir/redir_url';
  var server = http.createServer(function (req, res) {
    if (req.url === '/subdir/redir_url') {
      res.setHeader('Location', '/good_url');
      res.statusCode = 303;
    } else {
      res.statusCode = 200;
    }
    res.end('<html><head><link rel="webmention" href="webmention" /></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://' + host + ':' + port + '/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML <a> in body', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><a rel="webmention" href="http://example.org/webmention">Webmention endpoint</a></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('discover relative WebMention server URL from HTML <a> in body', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><a rel="webmention" href="/webmention">Webmention endpoint</a></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://' + host + ':' + port + '/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML <a> in body with multiple rel= values', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><a rel="alternate webmention canonical" href="http://example.org/webmention">Webmention endpoint</a></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, 'http://example.org/webmention');
    t.end();
  });
});

test('discover WebMention server URL from HTML <link> in body with an empty string href= value', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('<html><head><a rel="webmention" href="">Webmention endpoint</a></head><body></body></html>');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.equal(url, target);
    t.end();
  });
});

test('the text test as a HTML response triggers no error', function (t) {
  var target = 'http://' + host + ':' + port + '/good_url';
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    res.end('test');
  }).listen(port);

  lookupWebmentionServer(target, function (err, url) {
    server.close();
    t.error(err);
    t.end();
  });
});
