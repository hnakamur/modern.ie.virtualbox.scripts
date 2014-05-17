'use strict';

var http = require('http');
var https = require('https');
var stream = require('stream');
var util = require('util');

var Readable = stream.Readable;

util.inherits(HttpGetStream, Readable);

function HttpGetStream(url, options) {
  Readable.call(this, options);
  var self = this;
  var httpOrHttps = url.substring(0, 'https'.length) === 'https' ? https : http;
  httpOrHttps.get(url, function(res) {
    res.on('data', function(chunk) {
      self.push(chunk);
    }).on('end', function() {
      self.push(null);
    });
  });
}

HttpGetStream.prototype._read = function() {};

function createGetStream(url) {
  return new HttpGetStream(url);
}

module.exports = { createGetStream: createGetStream };
