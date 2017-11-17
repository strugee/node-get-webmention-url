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

var http = require('follow-redirects').http,
    https = require('follow-redirects').https,
    concat = require('concat-stream'),
    li = require('li'),
    cheerio = require('cheerio'),
    compact = require('lodash.compact'),
    url = require('url');

module.exports = function getWebmentionUrl(sourceUrl, cb) {
	var parsed = url.parse(sourceUrl);

	var client = parsed.protocol === 'http:' ? http : https;

	var req = client.get(parsed, function(res) {
		if (res.statusCode < 200 || res.statusCode >= 300) {
			cb();
			return;
		}

		if (res.headers.link) {
			var links = li.parse(res.headers.link),
			    endpoint = links.webmention || links['http://webmention.org/'];

			if (endpoint) {
				cb(undefined, endpoint);
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
						cb(undefined, url.resolve(sourceUrl, el.attribs.href));
						return;
				}
			});

			if (!callbackFired) cb();
		}));
	});

	req.on('error', cb);
}
