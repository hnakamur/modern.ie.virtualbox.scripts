'use strcit';
var crypto = require('crypto');
var stream = require('stream');
var util = require('util');

var Transform = stream.Transform;

util.inherits(StreamMessageDigest, Transform);

function StreamMessageDigest(algorithm, options) {
  Transform.call(this, options);
  this._hash = crypto.createHash(algorithm);
  options = options || {};
  this._hashEncoding = options.hashEncoding || 'hex';
}

StreamMessageDigest.prototype._transform = function(chunk, encoding, done) {
  this._hash.update(chunk);
  done();
};

StreamMessageDigest.prototype._flush = function(done) {
  this.push(this._hash.digest(this._hashEncoding));
  done();
};

function createDigester(algorithm, options) {
  return new StreamMessageDigest(algorithm, options);
}

module.exports = { createDigester: createDigester };
