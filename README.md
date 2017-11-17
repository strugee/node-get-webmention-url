# node-get-webmention-url

[![Build Status](https://travis-ci.org/strugee/node-get-webmention-url.svg?branch=master)](https://travis-ci.org/strugee/node-get-webmention-url)
[![Coverage Status](https://coveralls.io/repos/github/strugee/node-get-webmention-url/badge.svg?branch=master)](https://coveralls.io/github/strugee/node-get-webmention-url?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/strugee/node-get-webmention-url.svg)](https://greenkeeper.io/)

Retrieve a Webmention endpoint from a given URL.

Originally written because I kept finding bugs in [`lookup-webmention-server`][] but the implementation was waaaay overcomplicated and it took me forever to fix anything. Also it seemed unmaintained.

The tests and API were, however, stolen directly from that project. And for that, I am indebted to @connrs. So thank you!

## Install

```
npm install get-webmention-url
```

## Usage

```js
var lookup = require('get-webmention-url')
lookup('https://example.com/index.html', function(err, url) {
	if (err) throw err;
	console.log(url);
});
```

## Version support

Supports Node 4+.

## Author

AJ Jordan <alex@strugee.net>

## License

Lesser GPL 3.0+, except for the tests which were stolen from @connrs and so are BSD 3-clause

 [lookup-webmention-server]: https://github.com/connrs/node-lookup-webmention-server
