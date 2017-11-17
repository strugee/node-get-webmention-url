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

This module is a drop-in replacement for [`lookup-webmention-server`] except that if it encounters a relative URL in a Webmention `<link>` relation, it will resolve the URL to an absolute URL. Also it supports more discovery mechanisms.

Specifically, the module exports a single function. Said function takes two arguments, a URL (as a string) and a callback. If an error is encountered, the callback is invoked with it as the first parameter. Otherwise, the Webmention endpoint (if found) will be passed as the second parameter to the callback.

Only problems during HTTP requests are considered errors for the purposes of callback invocation. Failure to find a valid Webmention endpoint is _not_ considered an error - you'll just get `undefined` as the second callback parameter.

## Example

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

 [`lookup-webmention-server`]: https://github.com/connrs/node-lookup-webmention-server
