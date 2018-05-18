/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

/* istanbul ignore if */
if (!Array.prototype.includes) require('es7-array.prototype.includes');

var http = require('follow-redirects').http,
    https = require('follow-redirects').https,
    concat = require('concat-stream'),
    li = require('li'),
    cheerio = require('cheerio'),
    compact = require('lodash.compact'),
    url = require('url'),
    pkg = require('./package');

module.exports = function getWebmentionUrl(opts, cb) {
	var parsed;
	if (typeof opts === 'string') {
		parsed = url.parse(opts);
	} else if (opts.url) {
		parsed = url.parse(opts.url);
	} else {
		parsed = opts;
	}

	parsed.headers = {'user-agent': opts.ua || 'node.js/' + process.versions.node + ' get-webmention-url/' + pkg.version};

	var client = parsed.protocol === 'http:' ? http : /* istanbul ignore next */ https;

	var req = client.get(parsed, function(res) {
		if (res.statusCode < 200 || res.statusCode >= 300) {
			cb();
			return;
		}

		if (res.headers.link) {
			var links = li.parse(res.headers.link),
			    endpoint = links.webmention || links['http://webmention.org/'];

			if (endpoint) {
				cb(undefined, url.resolve(res.responseUrl, endpoint));
				return;
			}
		}

		var callbackFired = false;

		res.pipe(concat(function(buf) {
			var $ = cheerio.load(buf.toString());

			$('link, a').each(function(idx, el) {
				var rels = compact((el.attribs.rel || '').split(' ')),
				    match = false;

				rels.forEach(function(val) { if (/^http:\/\/webmention\.org/.test(val)) match = true; });

				if ((rels.includes('webmention') ||
				     match) &&
				     // We explicitly check for undefined because we want to catch empty strings, but those are falsy
				     typeof el.attribs.href !== 'undefined' &&
				     !callbackFired) {
					callbackFired = true;
					cb(undefined, url.resolve(res.responseUrl, el.attribs.href));
					return;
				}
			});

			if (!callbackFired) cb();
		}));
	});

	req.on('error', cb);
}
